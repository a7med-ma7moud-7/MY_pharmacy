<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\DashboardBackTestCase as TestCase;

/**
 * Phase 5: Dashboard API & Authentication End-to-End Integration Tests
 * 
 * Verifies complete administrative workflows, shared database persistence,
 * role-based security, and cross-application state consistency.
 */
class DashboardIntegrationJourneyTest extends TestCase
{
    use RefreshDatabase;

    protected function setupAdminUser(string $email = 'superadmin@mypharmacy.test'): array
    {
        $admin = User::create([
            'name' => 'Super Administrator',
            'email' => $email,
            'password' => Hash::make('AdminPass#2026'),
            'role' => 'admin',
        ]);

        $token = base64_encode($admin->id . '|' . hash_hmac('sha256', $admin->id . '|' . $admin->email . '|' . $admin->password, config('app.key')));

        return [$admin, $token];
    }

    protected function setupClientUser(string $email = 'patient@mypharmacy.test'): array
    {
        $user = User::create([
            'name' => 'Regular Patient',
            'email' => $email,
            'password' => Hash::make('UserPass#2026'),
            'role' => 'user',
        ]);

        $token = base64_encode($user->id . '|' . hash_hmac('sha256', $user->id . '|' . $user->email . '|' . $user->password, config('app.key')));

        return [$user, $token];
    }

    /**
     * Journey 1: Authentication, Session, and Role Authorization Gates
     */
    public function test_authentication_and_role_security_gates(): void
    {
        [$admin] = $this->setupAdminUser();
        [$client, $clientToken] = $this->setupClientUser();

        // 1. Unauthenticated request to protected endpoint -> 401
        $unauthResp = $this->getJson('/api/v1/admin/dashboard');
        $unauthResp->assertStatus(401)
                   ->assertJson(['success' => false]);

        // 2. Client role attempting admin login -> 403 Forbidden
        $clientLoginResp = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $client->email,
            'password' => 'UserPass#2026',
        ]);
        $clientLoginResp->assertStatus(403)
                        ->assertJson(['success' => false]);

        // 3. Client Bearer token sent to protected admin endpoint -> 403 Forbidden
        $clientAccessResp = $this->withHeader('Authorization', 'Bearer ' . $clientToken)
                                 ->getJson('/api/v1/admin/dashboard');
        $clientAccessResp->assertStatus(403);

        // 4. Invalid credentials for admin login -> 401 Unauthorized
        $badPassResp = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $admin->email,
            'password' => 'WrongPassword!',
        ]);
        $badPassResp->assertStatus(401)
                    ->assertJson(['success' => false]);

        // 5. Valid admin login -> 200 with Bearer Token and User Profile
        $loginResp = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $admin->email,
            'password' => 'AdminPass#2026',
        ]);
        $loginResp->assertStatus(200)
                  ->assertJson(['success' => true])
                  ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $receivedToken = $loginResp->json('token');
        $this->assertNotEmpty($receivedToken);

        // 6. Verify /auth/me with received token
        $meResp = $this->withHeader('Authorization', 'Bearer ' . $receivedToken)
                       ->getJson('/api/v1/admin/auth/me');
        $meResp->assertStatus(200)
               ->assertJson([
                   'success' => true,
                   'user' => [
                       'id' => $admin->id,
                       'email' => $admin->email,
                       'role' => 'admin',
                   ],
               ]);

        // 7. Logout invalidates session
        $logoutResp = $this->withHeader('Authorization', 'Bearer ' . $receivedToken)
                           ->postJson('/api/v1/admin/auth/logout');
        $logoutResp->assertStatus(200)
                   ->assertJson(['success' => true]);
    }

    /**
     * Journey 2: Medicine Inventory, Stock Adjustment, and Order Fulfillment
     */
    public function test_inventory_and_order_fulfillment_journey(): void
    {
        Storage::fake('public');
        [$admin, $token] = $this->setupAdminUser();

        // 1. Admin creates a new medicine with image
        $image = UploadedFile::fake()->image('congestal.jpg');
        $createMedResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->post('/api/v1/admin/medicines', [
                                  'name' => 'Congestal Tablets',
                                  'propose' => 'Cold, flu, and fever relief',
                                  'price' => 38.50,
                                  'type' => 'أقراص',
                                  'count' => 100,
                                  'image' => $image,
                              ]);
        $createMedResp->assertStatus(201)
                      ->assertJson(['success' => true]);

        $medId = $createMedResp->json('data.id');
        $this->assertDatabaseHas('mediciens', ['id' => $medId, 'count' => 100]);

        // 2. Customer places an order for 5 units
        $order = Order::create([
            'customer_name' => 'Tariq Al-Mansoor',
            'customer_phone' => '0551234567',
            'customer_email' => 'tariq@example.com',
            'address' => 'Riyadh, Al-Olaya St',
            'delivery_method' => 'delivery',
            'notes' => 'Deliver before 5 PM please',
            'status' => 'pending',
            'total_price' => 192.50,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'medicine_id' => $medId,
            'quantity' => 5,
            'price' => 38.50,
            'total' => 192.50,
        ]);

        // Simulate stock deduction
        $medicine = Medicien::find($medId);
        $medicine->decrement('count', 5);
        $this->assertEquals(95, $medicine->fresh()->count);

        // 3. Admin views orders list and finds the new order
        $ordersListResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->getJson('/api/v1/admin/orders?search=Tariq');
        $ordersListResp->assertStatus(200)
                       ->assertJson(['success' => true]);
        $this->assertCount(1, $ordersListResp->json('data'));

        // 4. Admin opens order detail modal
        $orderDetailResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                                ->getJson('/api/v1/admin/orders/' . $order->id);
        $orderDetailResp->assertStatus(200)
                        ->assertJson([
                            'success' => true,
                            'data' => [
                                'customer_name' => 'Tariq Al-Mansoor',
                                'total_price' => 192.50,
                            ],
                        ]);

        // 5. Admin updates order status to processing then completed
        $updateStatusResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                                 ->patchJson('/api/v1/admin/orders/' . $order->id . '/status', [
                                     'status' => 'completed',
                                 ]);
        $updateStatusResp->assertStatus(200)
                         ->assertJson(['success' => true, 'data' => ['status' => 'completed']]);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'completed']);

        // 6. Admin performs Quick Stock Adjustment to restock 50 more units
        $stockResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                          ->patchJson('/api/v1/admin/medicines/' . $medId . '/stock', [
                              'count' => 145,
                          ]);
        $stockResp->assertStatus(200)
                  ->assertJson(['success' => true, 'data' => ['count' => 145]]);
        $this->assertDatabaseHas('mediciens', ['id' => $medId, 'count' => 145]);

        // 7. Admin exports orders to Excel
        $exportResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                           ->get('/api/v1/admin/orders-export');
        $exportResp->assertStatus(200);
    }

    /**
     * Journey 3: Doctor Clinic Management and Patient Appointments
     */
    public function test_doctor_and_appointment_workflow_journey(): void
    {
        Storage::fake('public');
        [$admin, $token] = $this->setupAdminUser();

        // 1. Admin creates a Doctor with multi-image gallery
        $mainImage = UploadedFile::fake()->image('doctor_main.jpg');
        $clinicImg1 = UploadedFile::fake()->image('clinic_1.jpg');
        $clinicImg2 = UploadedFile::fake()->image('clinic_2.jpg');

        $docResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->post('/api/v1/admin/doctors', [
                            'name' => 'Dr. Mona Al-Zahrani',
                            'specialty' => 'Pediatrics and Neonatology',
                            'price' => 250.0,
                            'number' => '0544332211',
                            'location' => 'Jeddah Medical Center',
                            'tow_location' => 'Building A, Suite 304',
                            'status' => 'active',
                            'subscription' => 'subscribed',
                            'image' => $mainImage,
                            'image-1' => $clinicImg1,
                            'image-2' => $clinicImg2,
                        ]);
        $docResp->assertStatus(201)
                ->assertJson(['success' => true]);

        $doctorId = $docResp->json('data.id');
        $this->assertDatabaseHas('doctors', ['id' => $doctorId, 'name' => 'Dr. Mona Al-Zahrani']);

        // 2. Patient books an appointment with this doctor
        $appointment = Appointment::create([
            'patient_name' => 'Sara Khaled',
            'email' => 'sara@example.com',
            'phone' => '0566778899',
            'doctor_id' => $doctorId,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '10:30',
            'notes' => 'Child has seasonal allergy symptoms',
            'status' => 'pending',
        ]);

        // 3. Admin searches for appointment
        $appIndexResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                             ->getJson('/api/v1/admin/appointments?search=Sara');
        $appIndexResp->assertStatus(200)
                     ->assertJson(['success' => true]);
        $this->assertCount(1, $appIndexResp->json('data'));

        // 4. Admin opens appointment detail
        $appDetailResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->getJson('/api/v1/admin/appointments/' . $appointment->id);
        $appDetailResp->assertStatus(200)
                      ->assertJson([
                          'success' => true,
                          'data' => [
                              'patient_name' => 'Sara Khaled',
                              'notes' => 'Child has seasonal allergy symptoms',
                          ],
                      ]);

        // 5. Admin confirms appointment
        $confirmResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                            ->patchJson('/api/v1/admin/appointments/' . $appointment->id . '/status', [
                                'status' => 'confirmed',
                            ]);
        $confirmResp->assertStatus(200)
                    ->assertJson(['success' => true, 'data' => ['status' => 'confirmed']]);
        $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'confirmed']);
    }

    /**
     * Journey 4: Analytics Aggregation and User Permissions Guardrails
     */
    public function test_reports_analytics_and_user_guardrails(): void
    {
        [$admin, $token] = $this->setupAdminUser('headadmin@mypharmacy.test');

        // 1. Create a secondary admin and a regular user
        $newAdminResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                             ->postJson('/api/v1/admin/users', [
                                 'name' => 'Assistant Manager',
                                 'email' => 'assistant@mypharmacy.test',
                                 'password' => 'SecurePass#999',
                                 'role' => 'admin',
                             ]);
        $newAdminResp->assertStatus(201);
        $assistantId = $newAdminResp->json('data.id');

        // 2. Fetch reports dashboard
        $reportsResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                            ->getJson('/api/v1/admin/reports');
        $reportsResp->assertStatus(200)
                    ->assertJson(['success' => true])
                    ->assertJsonStructure([
                        'data' => [
                            'visitor_stats',
                            'medicine_sales',
                            'appointment_stats',
                            'doctor_stats',
                            'monthly_revenue',
                        ],
                    ]);

        // 3. Safeguard: Admin cannot delete their own account
        $deleteSelfResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->deleteJson('/api/v1/admin/users/' . $admin->id);
        $deleteSelfResp->assertStatus(400)
                       ->assertJson(['success' => false]);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);

        // 4. Admin CAN delete the assistant admin account
        $deleteAssistantResp = $this->withHeader('Authorization', 'Bearer ' . $token)
                                    ->deleteJson('/api/v1/admin/users/' . $assistantId);
        $deleteAssistantResp->assertStatus(200)
                            ->assertJson(['success' => true]);
        $this->assertDatabaseMissing('users', ['id' => $assistantId]);
    }
}
