<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Medicien;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\DashboardBackTestCase as TestCase;

class MultiPharmacyDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function createSuperAdmin(): array
    {
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin_' . uniqid() . '@saydalety.com',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
            'account_status' => 'active',
        ]);

        return [$admin, $admin->generateAdminToken()];
    }

    public function test_super_admin_creates_pharmacy_with_coordinates_and_pharmacy_logs_in(): void
    {
        [$admin, $adminToken] = $this->createSuperAdmin();

        // Missing coordinates -> 422
        $missingCoords = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/pharmacies', [
                'name' => 'صيدلية الشفاء',
                'email' => 'shifa@pharmacy.com',
                'phone' => '01011223344',
                'password' => 'pharmPass123',
            ]);
        $missingCoords->assertStatus(422)
            ->assertJsonValidationErrors(['latitude', 'longitude']);

        // Out-of-range coordinates -> 422
        $invalidCoords = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/pharmacies', [
                'name' => 'صيدلية الشفاء',
                'email' => 'shifa@pharmacy.com',
                'password' => 'pharmPass123',
                'latitude' => 125.5,
                'longitude' => 210.2,
            ]);
        $invalidCoords->assertStatus(422)
            ->assertJsonValidationErrors(['latitude', 'longitude']);

        // Valid creation with lat & long
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/pharmacies', [
                'name' => 'صيدلية الشفاء - المعادي',
                'email' => 'shifa@pharmacy.com',
                'phone' => '01011223344',
                'password' => 'pharmPass123',
                'city' => 'القاهرة',
                'address' => 'شارع 9، المعادي',
                'latitude' => 29.9602451,
                'longitude' => 31.2569134,
                'working_hours' => '24 ساعة',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'صيدلية الشفاء - المعادي');

        $pharmacyId = $createRes->json('data.id');
        $this->assertNotNull($pharmacyId);
        $this->assertEqualsWithDelta(29.9602451, (float) $createRes->json('data.latitude'), 0.0001);
        $this->assertEqualsWithDelta(31.2569134, (float) $createRes->json('data.longitude'), 0.0001);

        // Pharmacy logs into Dashboard via email
        $loginRes = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'shifa@pharmacy.com',
            'password' => 'pharmPass123',
        ]);

        $loginRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.role', 'pharmacy')
            ->assertJsonPath('user.pharmacy_id', $pharmacyId)
            ->assertJsonPath('user.pharmacy.name', 'صيدلية الشفاء - المعادي');

        $pharmacyToken = $loginRes->json('token');

        // /auth/me returns pharmacy profile & coordinates
        $meRes = $this->withHeader('Authorization', 'Bearer ' . $pharmacyToken)
            ->getJson('/api/v1/admin/auth/me');
        $meRes->assertStatus(200)
            ->assertJsonPath('user.role', 'pharmacy')
            ->assertJsonPath('user.pharmacy.id', $pharmacyId);
    }

    public function test_pharmacy_inventory_and_orders_are_strictly_isolated_and_super_admin_routes_blocked(): void
    {
        Storage::fake('public');
        [$admin, $adminToken] = $this->createSuperAdmin();

        // Create Pharmacy A & Pharmacy B via Super Admin
        $resA = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/pharmacies', [
                'name' => 'صيدلية ألفا',
                'email' => 'alpha@pharmacy.com',
                'phone' => '01010000001',
                'password' => 'alpha123',
                'lat' => 30.0444,
                'long' => 31.2357,
            ])->assertStatus(201);

        $resB = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/pharmacies', [
                'name' => 'صيدلية بيتا',
                'email' => 'beta@pharmacy.com',
                'phone' => '01010000002',
                'password' => 'beta123',
                'lat' => 30.0131,
                'long' => 31.2089,
            ])->assertStatus(201);

        $pharmAId = (int) $resA->json('data.id');
        $pharmBId = (int) $resB->json('data.id');

        $tokenA = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'alpha@pharmacy.com',
            'password' => 'alpha123',
        ])->json('token');

        $tokenB = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'beta@pharmacy.com',
            'password' => 'beta123',
        ])->json('token');

        // Pharmacy A adds its own medicine (even if trying to spoof pharmacy_id = B, backend forces A)
        $medARes = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->post('/api/v1/admin/medicines', [
                'pharmacy_id' => $pharmBId,
                'name' => 'Alpha Augmentin 1g',
                'propose' => 'Antibiotic',
                'price' => 115,
                'type' => 'أقراص',
                'count' => 40,
                'image' => UploadedFile::fake()->image('med_a.jpg'),
            ]);
        $medARes->assertStatus(201)
            ->assertJsonPath('data.pharmacy_id', $pharmAId);
        $medAId = (int) $medARes->json('data.id');

        // Pharmacy B adds its own medicine
        $medBRes = $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->post('/api/v1/admin/medicines', [
                'name' => 'Beta Panadol Advance',
                'propose' => 'Analgesic',
                'price' => 55,
                'type' => 'أقراص',
                'count' => 25,
                'image' => UploadedFile::fake()->image('med_b.jpg'),
            ]);
        $medBRes->assertStatus(201)
            ->assertJsonPath('data.pharmacy_id', $pharmBId);
        $medBId = (int) $medBRes->json('data.id');

        // Pharmacy A only sees its own medicine
        $listA = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->getJson('/api/v1/admin/medicines');
        $listA->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $medAId);

        // Pharmacy A CANNOT view, update stock, or delete Pharmacy B's medicine
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->getJson('/api/v1/admin/medicines/' . $medBId)
            ->assertStatus(404);

        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->patchJson('/api/v1/admin/medicines/' . $medBId . '/stock', ['count' => 999])
            ->assertStatus(404);

        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->deleteJson('/api/v1/admin/medicines/' . $medBId)
            ->assertStatus(404);

        // Pharmacy A CAN update its own stock
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->patchJson('/api/v1/admin/medicines/' . $medAId . '/stock', ['count' => 65])
            ->assertStatus(200)
            ->assertJsonPath('data.count', 65);

        // Orders isolation: Order 1 for Pharmacy A, Order 2 for Pharmacy B
        $orderA = Order::create([
            'pharmacy_id' => $pharmAId,
            'customer_name' => 'عميل صيدلية ألفا',
            'customer_phone' => '01112223334',
            'address' => 'المعادي',
            'delivery_method' => 'delivery',
            'status' => 'pending',
            'total_price' => 230,
        ]);
        OrderItem::create([
            'order_id' => $orderA->id,
            'medicine_id' => $medAId,
            'pharmacy_id' => $pharmAId,
            'quantity' => 2,
            'price' => 115,
            'total' => 230,
        ]);

        $orderB = Order::create([
            'pharmacy_id' => $pharmBId,
            'customer_name' => 'عميل صيدلية بيتا',
            'customer_phone' => '01223334445',
            'address' => 'الدقي',
            'delivery_method' => 'pickup',
            'status' => 'pending',
            'total_price' => 55,
        ]);
        OrderItem::create([
            'order_id' => $orderB->id,
            'medicine_id' => $medBId,
            'pharmacy_id' => $pharmBId,
            'quantity' => 1,
            'price' => 55,
            'total' => 55,
        ]);

        // Pharmacy A sees ONLY Order A
        $ordersA = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->getJson('/api/v1/admin/orders');
        $ordersA->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $orderA->id);

        // Pharmacy A updates Order A status -> processing, and CANNOT access Order B
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->patchJson('/api/v1/admin/orders/' . $orderA->id . '/status', ['status' => 'processing'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'processing');

        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->patchJson('/api/v1/admin/orders/' . $orderB->id . '/status', ['status' => 'completed'])
            ->assertStatus(404);

        // Pharmacy A is strictly blocked (403) from Super Admin endpoints
        foreach (['/dashboard', '/pharmacies', '/doctors', '/appointments', '/users', '/reports', '/ai/analytics'] as $superPath) {
            $this->withHeader('Authorization', 'Bearer ' . $tokenA)
                ->getJson('/api/v1/admin' . $superPath)
                ->assertStatus(403);
        }

        // Super Admin deactivates Pharmacy A -> token immediately loses access (403/401)
        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->patchJson('/api/v1/admin/pharmacies/' . $pharmAId . '/status', ['is_active' => false])
            ->assertStatus(200);

        $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'alpha@pharmacy.com',
            'password' => 'alpha123',
        ])->assertStatus(403);
    }
}
