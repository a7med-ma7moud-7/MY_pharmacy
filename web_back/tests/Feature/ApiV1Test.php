<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\WebBackTestCase as TestCase;

class ApiV1Test extends TestCase
{
    use RefreshDatabase;

    public function test_api_health_check_returns_status_200(): void
    {
        $response = $this->getJson('/api/v1/health');
        $response->assertStatus(200);
    }

    public function test_doctors_api_returns_success_and_filter_structure(): void
    {
        $doctor = Doctor::create([
            'name' => 'Dr. Ahmed Mahmoud',
            'image' => 'doctor1.png',
            'specialty' => 'Cardiology',
            'price' => 350,
            'number' => 123456789,
            'location' => 'Cairo',
            'tow_location' => 'Nasr City',
            'subscription' => 'subscribed',
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/doctors');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'data' => [
                             '*' => ['id', 'name', 'specialty', 'price', 'location', 'average_rating', 'image_url']
                         ]
                     ],
                     'filters' => ['specialties', 'locations', 'cities']
                 ]);
    }

    public function test_doctor_show_api_returns_doctor_details(): void
    {
        $doctor = Doctor::create([
            'name' => 'Dr. Sara Ali',
            'image' => 'doctor2.png',
            'specialty' => 'Pediatrics',
            'price' => 300,
            'number' => 987654321,
            'location' => 'Giza',
            'tow_location' => 'Dokki',
            'subscription' => 'subscribed',
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/doctors/' . $doctor->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'doctor' => [
                             'id' => $doctor->id,
                             'name' => 'Dr. Sara Ali',
                             'specialty' => 'Pediatrics',
                         ]
                     ]
                 ]);
    }

    public function test_medicines_api_returns_list_and_categories(): void
    {
        $medicine = Medicien::create([
            'name' => 'Panadol Extra',
            'type' => 'Painkiller',
            'price' => 50,
            'count' => 20,
            'description' => 'Effective pain relief',
            'propose' => 'Headache and fever',
            'image' => 'panadol.png',
        ]);

        $response = $this->getJson('/api/v1/medicines');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'data' => [
                             '*' => ['id', 'name', 'price', 'type', 'is_in_stock', 'image_url']
                         ]
                     ],
                     'types'
                 ]);
    }

    public function test_order_creation_decreases_stock_and_creates_order(): void
    {
        $medicine = Medicien::create([
            'name' => 'C-Vitam 1000',
            'type' => 'Vitamins',
            'price' => 75,
            'count' => 15,
            'description' => 'Vitamin C tablets',
            'propose' => 'Immunity support',
            'image' => 'cvitam.png',
        ]);

        $payload = [
            'cart_items' => [
                [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'price' => 75,
                    'quantity' => 2,
                    'total' => 150,
                ]
            ],
            'customer_name' => 'Mohamed Youssef',
            'customer_phone' => '01012345678',
            'customer_email' => 'mohamed@example.com',
            'address' => 'Maadi, Cairo, Egypt',
            'delivery_method' => 'delivery',
            'notes' => 'Call upon arrival',
        ];

        $response = $this->postJson('/api/v1/orders', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'تم استلام طلبك بنجاح',
                 ]);

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Mohamed Youssef',
            'customer_phone' => '01012345678',
            'total_price' => 150,
        ]);

        // تأكد من خصم المخزون من 15 إلى 13
        $this->assertEquals(13, $medicine->fresh()->count);
    }

    public function test_appointment_booking_stores_and_returns_confirmation(): void
    {
        $doctor = Doctor::create([
            'name' => 'Dr. Tarek Omar',
            'image' => 'doctor3.png',
            'specialty' => 'Orthopedics',
            'price' => 400,
            'number' => 1122334455,
            'location' => 'Alexandria',
            'tow_location' => 'Smouha',
            'subscription' => 'subscribed',
            'status' => 'active',
        ]);

        $payload = [
            'patient_name' => 'Karim Adel',
            'email' => 'karim@example.com',
            'phone' => '01234567890',
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDays(2)->format('Y-m-d'),
            'appointment_time' => '06:00 PM',
            'notes' => 'Knee pain consultation',
        ];

        $response = $this->postJson('/api/v1/appointments', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                 ]);

        $this->assertDatabaseHas('appointments', [
            'patient_name' => 'Karim Adel',
            'doctor_id' => $doctor->id,
            'appointment_time' => '06:00 PM',
        ]);
    }

    public function test_ai_chat_endpoint_returns_json_answer(): void
    {
        $response = $this->postJson('/api/v1/ask-ai', [
            'question' => 'ما هي أسباب الصداع وكيف أعالجه؟'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'answer'
                 ]);
    }

    public function test_auth_login_with_invalid_credentials_returns_401(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                 ]);
    }
}
