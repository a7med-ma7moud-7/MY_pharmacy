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

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): array
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_' . uniqid() . '@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
        ]);

        $token = base64_encode($admin->id . '|' . hash_hmac('sha256', $admin->id . '|' . $admin->email . '|' . $admin->password, config('app.key')));

        return [$admin, $token];
    }

    protected function createClientUser(): array
    {
        $user = User::create([
            'name' => 'Client User',
            'email' => 'client_' . uniqid() . '@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'user',
        ]);

        $token = base64_encode($user->id . '|' . hash_hmac('sha256', $user->id . '|' . $user->email . '|' . $user->password, config('app.key')));

        return [$user, $token];
    }

    public function test_health_check_returns_status_200(): void
    {
        $response = $this->getJson('/api/v1/admin/health');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'healthy']);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/v1/admin/dashboard');
        $response->assertStatus(401)
                 ->assertJson(['success' => false]);
    }

    public function test_non_admin_token_returns_403(): void
    {
        [$client, $token] = $this->createClientUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403)
                 ->assertJson(['success' => false]);
    }

    public function test_admin_login_success(): void
    {
        [$admin] = $this->createAdmin();

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $admin->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure(['token', 'user']);
    }

    public function test_admin_login_invalid_password_returns_401(): void
    {
        [$admin] = $this->createAdmin();

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $admin->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['success' => false]);
    }

    public function test_client_login_to_admin_returns_403(): void
    {
        [$client] = $this->createClientUser();

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $client->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(403)
                 ->assertJson(['success' => false]);
    }

    public function test_admin_auth_me_returns_profile(): void
    {
        [$admin, $token] = $this->createAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/v1/admin/auth/me');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'user' => [
                         'id' => $admin->id,
                         'email' => $admin->email,
                         'role' => 'admin',
                     ],
                 ]);
    }

    public function test_admin_dashboard_metrics(): void
    {
        [$admin, $token] = $this->createAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure([
                     'stats' => ['total_doctors', 'total_medicines', 'total_users', 'total_orders', 'pending_appointments', 'total_revenue'],
                     'recent_doctors',
                     'recent_medicines',
                     'recent_appointments',
                     'recent_orders',
                 ]);
    }

    public function test_doctors_crud_flow(): void
    {
        Storage::fake('public');
        [$admin, $token] = $this->createAdmin();

        // 1. Create Doctor
        $image = UploadedFile::fake()->image('doctor.jpg');
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->post('/api/v1/admin/doctors', [
                             'name' => 'Dr. Sameh Mostafa',
                             'specialty' => 'Neurology',
                             'price' => 450,
                             'number' => '01012345678',
                             'location' => 'Cairo',
                             'tow_location' => 'Zamalek',
                             'status' => 'active',
                             'subscription' => 'subscribed',
                             'image' => $image,
                         ]);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);

        $doctorId = $response->json('data.id');
        $this->assertNotNull($doctorId);

        // 2. Index Doctors
        $indexResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->getJson('/api/v1/admin/doctors?search=Sameh');
        $indexResponse->assertStatus(200)
                      ->assertJson(['success' => true]);

        // 3. Show Doctor
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                             ->getJson('/api/v1/admin/doctors/' . $doctorId);
        $showResponse->assertStatus(200)
                     ->assertJson(['success' => true, 'data' => ['name' => 'Dr. Sameh Mostafa']]);

        // 4. Update Doctor
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->putJson('/api/v1/admin/doctors/' . $doctorId, [
                                   'name' => 'Dr. Sameh Mostafa Updated',
                                   'price' => 500,
                               ]);
        $updateResponse->assertStatus(200)
                       ->assertJson(['success' => true]);

        // 5. Delete Doctor
        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->deleteJson('/api/v1/admin/doctors/' . $doctorId);
        $deleteResponse->assertStatus(200)
                       ->assertJson(['success' => true]);
    }

    public function test_medicines_crud_flow(): void
    {
        Storage::fake('public');
        [$admin, $token] = $this->createAdmin();

        // 1. Create Medicine
        $image = UploadedFile::fake()->image('panadol.jpg');
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->post('/api/v1/admin/medicines', [
                             'name' => 'Panadol Extra 500mg',
                             'propose' => 'Pain relief and fever reducer',
                             'price' => 45.0,
                             'type' => 'Tablets',
                             'count' => 150,
                             'image' => $image,
                         ]);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);

        $medId = $response->json('data.id');

        // 2. Index Medicines
        $indexResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->getJson('/api/v1/admin/medicines?search=Panadol');
        $indexResponse->assertStatus(200);

        // 3. Update Stock
        $stockResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->patchJson('/api/v1/admin/medicines/' . $medId . '/stock', [
                                  'count' => 200,
                              ]);
        $stockResponse->assertStatus(200)
                      ->assertJson(['data' => ['count' => 200]]);

        // 4. Delete Medicine
        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->deleteJson('/api/v1/admin/medicines/' . $medId);
        $deleteResponse->assertStatus(200)
                       ->assertJson(['success' => true]);
    }

    public function test_appointments_flow(): void
    {
        [$admin, $token] = $this->createAdmin();

        $doctor = Doctor::create([
            'name' => 'Dr. Kareem Tarek',
            'image' => 'doc_k.jpg',
            'specialty' => 'Orthopedics',
            'price' => 300,
            'number' => '01234567890',
            'location' => 'Alexandria',
            'status' => 'active',
            'subscription' => 'subscribed',
        ]);

        $appointment = Appointment::create([
            'patient_name' => 'Ali Mohamed',
            'email' => 'ali@example.com',
            'phone' => '01122334455',
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDays(2)->format('Y-m-d'),
            'appointment_time' => '14:00',
            'status' => 'pending',
        ]);

        // 1. Index Appointments
        $indexResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->getJson('/api/v1/admin/appointments');
        $indexResponse->assertStatus(200)
                      ->assertJson(['success' => true]);

        // 2. Show Appointment
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                             ->getJson('/api/v1/admin/appointments/' . $appointment->id);
        $showResponse->assertStatus(200)
                     ->assertJson(['data' => ['patient_name' => 'Ali Mohamed']]);

        // 3. Update Status
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->patchJson('/api/v1/admin/appointments/' . $appointment->id . '/status', [
                                   'status' => 'confirmed',
                               ]);
        $updateResponse->assertStatus(200)
                       ->assertJson(['data' => ['status' => 'confirmed']]);
    }

    public function test_orders_flow(): void
    {
        [$admin, $token] = $this->createAdmin();

        $order = Order::create([
            'customer_name' => 'Hassan Omar',
            'customer_phone' => '01099887766',
            'customer_email' => 'hassan@example.com',
            'delivery_method' => 'delivery',
            'address' => 'Nasr City, Cairo',
            'total_price' => 120.0,
            'status' => 'pending',
        ]);

        // 1. Index Orders
        $indexResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->getJson('/api/v1/admin/orders');
        $indexResponse->assertStatus(200);

        // 2. Show Order
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                             ->getJson('/api/v1/admin/orders/' . $order->id);
        $showResponse->assertStatus(200)
                     ->assertJson(['data' => ['customer_name' => 'Hassan Omar']]);

        // 3. Update Status
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->patchJson('/api/v1/admin/orders/' . $order->id . '/status', [
                                   'status' => 'completed',
                               ]);
        $updateResponse->assertStatus(200)
                       ->assertJson(['data' => ['status' => 'completed']]);

        // 4. Export Orders to Excel
        $exportResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->get('/api/v1/admin/orders-export');
        $exportResponse->assertStatus(200);
    }

    public function test_reports_endpoint(): void
    {
        [$admin, $token] = $this->createAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/v1/admin/reports');

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure(['data' => ['visitor_stats', 'medicine_sales', 'appointment_stats', 'doctor_stats', 'monthly_revenue']]);
    }

    public function test_users_crud_flow(): void
    {
        [$admin, $token] = $this->createAdmin();

        // 1. Index Users
        $indexResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->getJson('/api/v1/admin/users');
        $indexResponse->assertStatus(200);

        // 2. Store User
        $storeResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                              ->postJson('/api/v1/admin/users', [
                                  'name' => 'New Pharmacist',
                                  'email' => 'pharmacist_' . uniqid() . '@example.com',
                                  'password' => 'password123',
                                  'role' => 'admin',
                              ]);
        $storeResponse->assertStatus(201);
        $newUserId = $storeResponse->json('data.id');

        // 3. Update User
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->putJson('/api/v1/admin/users/' . $newUserId, [
                                   'name' => 'Senior Pharmacist',
                               ]);
        $updateResponse->assertStatus(200)
                       ->assertJson(['data' => ['name' => 'Senior Pharmacist']]);

        // 4. Delete User
        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                               ->deleteJson('/api/v1/admin/users/' . $newUserId);
        $deleteResponse->assertStatus(200);

        // 5. Deleting Self Should Return 400
        $deleteSelfResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
                                   ->deleteJson('/api/v1/admin/users/' . $admin->id);
        $deleteSelfResponse->assertStatus(400);
    }

    public function test_admin_logout(): void
    {
        [$admin, $token] = $this->createAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/v1/admin/auth/logout');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }
}
