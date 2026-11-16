<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Rating;
use App\Models\TreatedCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\DashboardBackTestCase as TestCase;

class AdminDoctorPortalTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): array
    {
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin_portal@example.com',
            'password' => Hash::make('AdminSecret123!'),
            'role' => 'admin',
            'account_status' => 'active',
        ]);

        return [$admin, $admin->generateAdminToken()];
    }

    public function test_workflow_b_admin_creates_doctor_account_prevents_duplicate_phone_and_manages_lifecycle(): void
    {
        [$admin, $adminToken] = $this->createAdmin();

        // 1. Admin creates Doctor account with phone + password
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/doctors', [
                'name' => 'د. وليد الشافعي',
                'number' => '01066778899',
                'password' => 'DocInitialPass123',
                'specialty' => 'مخ وأعصاب',
                'price' => 450,
                'location' => 'الإسكندرية',
                'status' => 'active',
                'subscription' => 'subscribed',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.creation_method', 'admin_created')
            ->assertJsonPath('data.verification_status', 'verified');

        $doctorId = $createRes->json('data.id');
        $doctor = Doctor::with('user')->findOrFail($doctorId);
        $this->assertNotNull($doctor->user);
        $this->assertEquals('doctor', $doctor->user->role);
        $this->assertTrue(Hash::check('DocInitialPass123', $doctor->user->password));
        $this->assertArrayNotHasKey('password', $createRes->json('data.user') ?? []);

        // 2. Duplicate phone number is rejected
        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/doctors', [
                'name' => 'د. مكرر',
                'number' => '+201066778899',
                'password' => 'DocInitialPass123',
                'specialty' => 'عيون',
            ])
            ->assertStatus(422);

        // 3. Deactivate doctor account -> invalidates doctor's auth token immediately
        $oldDoctorToken = $doctor->user->generateAuthToken();
        $this->assertNotNull(User::verifyAuthToken($oldDoctorToken));

        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->patchJson("/api/v1/admin/doctors/{$doctorId}/account-status", [
                'status' => 'inactive',
            ])
            ->assertStatus(200);

        $this->assertNull(User::verifyAuthToken($oldDoctorToken));

        // Reactivate doctor account
        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->patchJson("/api/v1/admin/doctors/{$doctorId}/account-status", [
                'status' => 'active',
            ])
            ->assertStatus(200);

        // 4. Secure password reset invalidates previous token and updates hash without exposing plaintext
        $activeTokenBeforeReset = $doctor->fresh()->user->generateAuthToken();
        $resetRes = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson("/api/v1/admin/doctors/{$doctorId}/reset-password", [
                'password' => 'NewSecurePass999!',
                'password_confirmation' => 'NewSecurePass999!',
            ]);
        $resetRes->assertStatus(200);
        $this->assertStringNotContainsString('NewSecurePass999!', $resetRes->getContent());
        $this->assertNull(User::verifyAuthToken($activeTokenBeforeReset));
        $this->assertTrue(Hash::check('NewSecurePass999!', $doctor->fresh()->user->password));

        // 5. Admin moderates published treated case & reported review
        $case = TreatedCase::create([
            'doctor_id' => $doctorId,
            'title' => 'حالة التهاب العصب السابع',
            'specialty' => 'مخ وأعصاب',
            'description' => 'ملخص',
            'initial_condition' => 'بداية',
            'treatment_summary' => 'خطة',
            'outcome' => 'تعافي تام',
            'status' => 'published',
            'published_at' => now()->toDateString(),
        ]);

        $patient = User::create([
            'name' => 'مريض تجريبي',
            'email' => 'pat_mod@example.com',
            'phone' => '01155443322',
            'password' => Hash::make('pass12345'),
            'role' => 'user',
        ]);

        $review = Rating::create([
            'doctor_id' => $doctorId,
            'user_id' => $patient->id,
            'rating' => 1,
            'comment' => 'تعليق مسيء',
            'status' => 'visible',
            'report_reason' => 'ألفاظ غير لائقة',
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->patchJson("/api/v1/admin/treated-cases/{$case->id}/moderation", [
                'status' => 'hidden_by_admin',
            ])
            ->assertStatus(200);
        $this->assertEquals('hidden_by_admin', $case->fresh()->status);

        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->patchJson("/api/v1/admin/reviews/{$review->id}/status", [
                'status' => 'hidden',
            ])
            ->assertStatus(200);
        $this->assertEquals('hidden', $review->fresh()->status);

        // 6. Verify Doctor Activity Overview in show endpoint
        $showRes = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson("/api/v1/admin/doctors/{$doctorId}");
        $showRes->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'activity_overview' => [
                        'total_treated_cases',
                        'total_patients',
                        'total_appointments',
                        'average_rating',
                        'total_reviews',
                    ],
                ],
            ]);
    }
}
