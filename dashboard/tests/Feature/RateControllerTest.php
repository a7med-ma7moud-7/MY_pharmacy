<?php

namespace Tests\Feature;

use App\Models\doctor;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_submit_a_rating(): void
    {
        $doctor = doctor::create([
            'name' => 'Dr. Guest',
            'image' => 'doctor.png',
            'specialty' => 'Cardiology',
            'price' => 250,
            'number' => 123456,
            'location' => 'Cairo',
            'tow_location' => 'Nasr City',
            'subscription' => 'subscribed',
            'status' => 'active',
        ]);

        $response = $this->post(route('rate.store'), [
            'doctor_id' => $doctor->id,
            'user_id' => 1,
            'rating' => 5,
            'comment' => 'Great service',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('ratings', 0);
    }

    public function test_authenticated_user_can_submit_a_rating(): void
    {
        $user = User::factory()->create();

        $doctor = doctor::create([
            'name' => 'Dr. Rated',
            'image' => 'doctor.png',
            'specialty' => 'Dermatology',
            'price' => 300,
            'number' => 654321,
            'location' => 'Alexandria',
            'tow_location' => null,
            'subscription' => 'subscribed',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->post(route('rate.store'), [
            'doctor_id' => $doctor->id,
            'user_id' => $user->id,
            'rating' => 4,
            'comment' => 'Helpful consultation',
        ]);

        $response->assertRedirect(route('webdoctor.show', $doctor->id));
        $response->assertSessionHas('success', 'تم إضافة التقييم بنجاح');

        $this->assertDatabaseHas('ratings', [
            'doctor_id' => $doctor->id,
            'user_id' => $user->id,
            'rating' => 4,
            'comment' => 'Helpful consultation',
        ]);

        $this->assertSame(1, Rating::count());
    }
}
