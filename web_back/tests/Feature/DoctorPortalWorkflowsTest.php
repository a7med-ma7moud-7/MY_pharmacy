<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalAuditLog;
use App\Models\Medicien;
use App\Models\PatientFollowUp;
use App\Models\Prescription;
use App\Models\TreatedCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\WebBackTestCase as TestCase;

class DoctorPortalWorkflowsTest extends TestCase
{
    use RefreshDatabase;

    private function createVerifiedDoctor(string $name, string $phone, string $specialty = 'باطنة'): array
    {
        $user = User::create([
            'name' => $name,
            'email' => 'doc_' . preg_replace('/\D+/', '', $phone) . '@example.com',
            'phone' => $phone,
            'password' => Hash::make('DoctorPass123!'),
            'role' => 'doctor',
            'account_status' => 'active',
        ]);

        $doctor = Doctor::create([
            'user_id' => $user->id,
            'name' => $name,
            'image' => 'doctors/default.png',
            'specialty' => $specialty,
            'price' => 350,
            'number' => $phone,
            'location' => 'القاهرة',
            'status' => 'active',
            'subscription' => 'subscribed',
            'verification_status' => 'verified',
            'creation_method' => 'admin_created',
        ]);

        $token = $user->generateAuthToken();

        return [$user, $doctor, $token];
    }

    private function createPatient(string $name, string $phone): array
    {
        $user = User::create([
            'name' => $name,
            'email' => 'pat_' . preg_replace('/\D+/', '', $phone) . '@example.com',
            'phone' => $phone,
            'password' => Hash::make('PatientPass123!'),
            'role' => 'user',
            'account_status' => 'active',
        ]);

        return [$user, $user->generateAuthToken()];
    }

    public function test_workflow_a_doctor_self_registration_requires_verification_before_portal_access(): void
    {
        // 1. Self-register as Doctor
        $regResponse = $this->postJson('/api/v1/auth/register', [
            'account_type' => 'doctor',
            'name' => 'د. كريم سامي',
            'phone' => '01098765432',
            'password' => 'StrongDoc123!',
            'password_confirmation' => 'StrongDoc123!',
            'specialty' => 'قلب وأوعية دموية',
            'price' => 400,
            'location' => 'القاهرة',
        ]);

        $regResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'pending_verification' => true,
            ]);

        // 2. Duplicate phone registration is blocked
        $dupResponse = $this->postJson('/api/v1/auth/register', [
            'account_type' => 'user',
            'name' => 'مستخدم مكرر',
            'phone' => '01098765432',
            'password' => 'StrongDoc123!',
            'password_confirmation' => 'StrongDoc123!',
        ]);
        $dupResponse->assertStatus(422);

        // 3. Unverified doctor cannot log in yet
        $blockedLogin = $this->postJson('/api/v1/auth/login', [
            'phone' => '01098765432',
            'password' => 'StrongDoc123!',
            'login_as' => 'doctor',
        ]);
        $blockedLogin->assertStatus(403)
            ->assertJson(['code' => 'DOCTOR_PENDING_VERIFICATION']);

        // 4. Unverified doctor is hidden from public directory
        $publicList = $this->getJson('/api/v1/doctors');
        $publicList->assertStatus(200);
        $this->assertEmpty($publicList->json('data.data'));

        // 5. Simulate Admin verification & activation
        $doctor = Doctor::where('number', '01098765432')->firstOrFail();
        $doctor->update(['verification_status' => 'verified', 'status' => 'active']);
        $doctor->user()->update(['account_status' => 'active']);

        // 6. Verified doctor logs in with phone + password and redirects to Doctor Portal
        $okLogin = $this->postJson('/api/v1/auth/login', [
            'phone' => '01098765432',
            'password' => 'StrongDoc123!',
            'login_as' => 'doctor',
        ]);
        $okLogin->assertStatus(200)
            ->assertJson([
                'success' => true,
                'redirect_to' => '/doctor/dashboard',
            ]);

        $token = $okLogin->json('token');
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/doctor/dashboard')
            ->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_unauthorized_patient_cannot_access_doctor_portal_routes(): void
    {
        [$patient, $patientToken] = $this->createPatient('أحمد سعيد', '01112223334');

        // Patient trying to log in on Doctor tab gets 403 ROLE_MISMATCH
        $this->postJson('/api/v1/auth/login', [
            'phone' => '01112223334',
            'password' => 'PatientPass123!',
            'login_as' => 'doctor',
        ])->assertStatus(403);

        // Patient trying to call Doctor Portal endpoints directly gets 403
        $this->withHeader('Authorization', 'Bearer ' . $patientToken)
            ->getJson('/api/v1/doctor/dashboard')
            ->assertStatus(403);

        $this->withHeader('Authorization', 'Bearer ' . $patientToken)
            ->getJson('/api/v1/doctor/patients')
            ->assertStatus(403);
    }

    public function test_workflow_c_treated_cases_publish_immediately_enforce_privacy_and_ownership(): void
    {
        Storage::fake('public');
        [$docUserA, $docA, $tokenA] = $this->createVerifiedDoctor('د. منى عادل', '01011112222', 'جلدية');
        [$docUserB, $docB, $tokenB] = $this->createVerifiedDoctor('د. طارق حسن', '01033334444', 'عظام');

        // Rejects case containing patient phone number PII leak
        $piiAttempt = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/doctor/cases', [
                'title' => 'حالة مريض برقم 01055556666',
                'description' => 'وصف الحالة',
                'initial_condition' => 'حالة أولية',
                'treatment_summary' => 'علاج',
                'outcome' => 'شفاء',
                'patient_consent_confirmed' => true,
            ]);
        $piiAttempt->assertStatus(422);

        // Valid case publishes immediately without admin approval
        $caseImg = UploadedFile::fake()->image('case1.jpg');
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->post('/api/v1/doctor/cases', [
                'title' => 'علاج الأكزيما المزمنة خلال 4 أسابيع',
                'description' => 'تحسن ملحوظ لحالة التهاب جلدي مزمن.',
                'initial_condition' => 'احمرار وجفاف شديد بالجلد.',
                'treatment_summary' => 'جلسات ترطيب علاجي مع بروتوكول موضعي متدرج.',
                'outcome' => 'اختفاء الأعراض بنسبة 95% واستقرار الجلد.',
                'patient_consent_confirmed' => '1',
                'image' => $caseImg,
            ]);

        $createRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => ['status' => 'published'],
            ]);

        $caseId = $createRes->json('data.id');

        // Immediately visible on public doctor profile
        $publicProfile = $this->getJson('/api/v1/doctors/' . $docA->id);
        $publicProfile->assertStatus(200);
        $this->assertCount(1, $publicProfile->json('data.treated_cases'));
        $this->assertEquals('علاج الأكزيما المزمنة خلال 4 أسابيع', $publicProfile->json('data.treated_cases.0.title'));

        // Doctor B CANNOT edit or delete Doctor A's case
        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->deleteJson('/api/v1/doctor/cases/' . $caseId)
            ->assertStatus(404);

        // Doctor A CAN update and delete their own case
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->putJson('/api/v1/doctor/cases/' . $caseId, [
                'title' => 'علاج الأكزيما المزمنة - محدث',
            ])
            ->assertStatus(200);

        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->deleteJson('/api/v1/doctor/cases/' . $caseId)
            ->assertStatus(200);

        $this->assertEquals(0, TreatedCase::count());
    }

    public function test_workflows_d_e_f_chat_eligibility_strict_record_isolation_and_review_rules(): void
    {
        [$docUserA, $docA, $tokenA] = $this->createVerifiedDoctor('د. حسام نبيل', '01211112222', 'باطنة');
        [$docUserB, $docB, $tokenB] = $this->createVerifiedDoctor('د. سلمى فؤاد', '01233334444', 'قلب');
        [$patientX, $tokenPatientX] = $this->createPatient('محمود جمال', '01511112222');
        [$patientY, $tokenPatientY] = $this->createPatient('ندى عصام', '01533334444');

        $med = Medicien::create([
            'name' => 'أنتودين 40 ملجم',
            'type' => 'أقراص',
            'propose' => 'علاج الحموضة',
            'price' => 60,
            'count' => 30,
            'image' => 'med.png',
        ]);

        // 1. Before booking: Patient X CANNOT chat with Doctor A
        $this->withHeader('Authorization', 'Bearer ' . $tokenPatientX)
            ->postJson('/api/v1/patient/chats/start', ['doctor_id' => $docA->id])
            ->assertStatus(403)
            ->assertJson(['code' => 'APPOINTMENT_REQUIRED_FOR_CHAT']);

        // 2. Patient X books with Doctor A AND Doctor B; Patient Y books ONLY with Doctor B
        $apptXA = Appointment::create([
            'user_id' => $patientX->id,
            'patient_name' => $patientX->name,
            'phone' => $patientX->phone,
            'doctor_id' => $docA->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '18:00',
            'status' => 'confirmed',
        ]);

        $apptXB = Appointment::create([
            'user_id' => $patientX->id,
            'patient_name' => $patientX->name,
            'phone' => $patientX->phone,
            'doctor_id' => $docB->id,
            'appointment_date' => now()->addDays(2)->format('Y-m-d'),
            'appointment_time' => '19:00',
            'status' => 'confirmed',
        ]);

        Appointment::create([
            'user_id' => $patientY->id,
            'patient_name' => $patientY->name,
            'phone' => $patientY->phone,
            'doctor_id' => $docB->id,
            'appointment_date' => now()->addDays(2)->format('Y-m-d'),
            'appointment_time' => '20:00',
            'status' => 'confirmed',
        ]);

        // 3. Workflow D: Patient X can now start chat with Doctor A & exchange messages
        $startChat = $this->withHeader('Authorization', 'Bearer ' . $tokenPatientX)
            ->postJson('/api/v1/patient/chats/start', ['doctor_id' => $docA->id]);
        $startChat->assertStatus(200);
        $convId = $startChat->json('data.id');

        $this->withHeader('Authorization', 'Bearer ' . $tokenPatientX)
            ->postJson("/api/v1/patient/chats/{$convId}/messages", [
                'body' => 'مساء الخير يا دكتور، هل أتناول الدواء قبل الأكل؟',
            ])
            ->assertStatus(201);

        // Doctor B CANNOT read Doctor A's conversation
        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->getJson("/api/v1/doctor/chats/{$convId}")
            ->assertStatus(404);

        // Doctor A sees unread message and replies
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson("/api/v1/doctor/chats/{$convId}/messages", [
                'body' => 'نعم بنصف ساعة قبل الوجبة الرئيسية.',
            ])
            ->assertStatus(201);

        // 4. Workflow E: Both Doctor A and Doctor B issue prescriptions & follow-ups for Patient X
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/doctor/prescriptions', [
                'patient_key' => 'u_' . $patientX->id,
                'appointment_id' => $apptXA->id,
                'diagnosis' => 'التهاب جدار المعدة (خاص بدكتور حسام)',
                'items' => [[
                    'medicine_id' => $med->id,
                    'medicine_name' => $med->name,
                    'dosage' => 'قرص مساءً',
                    'duration' => '14 يوماً',
                ]],
            ])
            ->assertStatus(201);

        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/doctor/prescriptions', [
                'patient_key' => 'u_' . $patientX->id,
                'appointment_id' => $apptXB->id,
                'diagnosis' => 'متابعة ضغط الدم (خاص بدكتورة سلمى)',
                'items' => [[
                    'medicine_name' => 'كونكور 5 ملجم',
                    'dosage' => 'قرص صباحاً',
                ]],
            ])
            ->assertStatus(201);

        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/doctor/follow-ups', [
                'patient_key' => 'u_' . $patientX->id,
                'followup_date' => now()->toDateString(),
                'consultation_notes' => 'ملاحظة متابعة خاصة بدكتور حسام فقط',
            ])
            ->assertStatus(201);

        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/doctor/follow-ups', [
                'patient_key' => 'u_' . $patientX->id,
                'followup_date' => now()->toDateString(),
                'consultation_notes' => 'ملاحظة قلب خاصة بدكتورة سلمى فقط',
            ])
            ->assertStatus(201);

        // Doctor A CANNOT access Patient Y (who never booked with Doctor A!)
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->getJson('/api/v1/doctor/patients/u_' . $patientY->id . '/records')
            ->assertStatus(403);

        // Doctor A viewing Patient X's records ONLY sees Doctor A's records, NEVER Doctor B's!
        $recordsA = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->getJson('/api/v1/doctor/patients/u_' . $patientX->id . '/records');
        $recordsA->assertStatus(200);

        $this->assertCount(1, $recordsA->json('data.appointments'));
        $this->assertCount(1, $recordsA->json('data.prescriptions'));
        $this->assertEquals(
            'التهاب جدار المعدة (خاص بدكتور حسام)',
            $recordsA->json('data.prescriptions.0.diagnosis')
        );
        $this->assertCount(1, $recordsA->json('data.follow_ups'));
        $this->assertEquals(
            'ملاحظة متابعة خاصة بدكتور حسام فقط',
            $recordsA->json('data.follow_ups.0.consultation_notes')
        );

        // Verify audit log recorded sensitive access
        $this->assertTrue(
            MedicalAuditLog::where('action', 'doctor.patient_record_viewed')
                ->where('doctor_id', $docA->id)
                ->exists()
        );

        // 5. Workflow F: Review requires completed appointment & prevents duplicates
        $this->withHeader('Authorization', 'Bearer ' . $tokenPatientX)
            ->postJson('/api/v1/ratings', [
                'doctor_id' => $docA->id,
                'rating' => 5,
                'comment' => 'محاولة قبل إتمام الكشف',
            ])
            ->assertStatus(403);

        // Complete the appointment
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->patchJson('/api/v1/doctor/appointments/' . $apptXA->id . '/status', [
                'status' => 'completed',
            ])
            ->assertStatus(200);

        // Now review succeeds!
        $this->withHeader('Authorization', 'Bearer ' . $tokenPatientX)
            ->postJson('/api/v1/ratings', [
                'doctor_id' => $docA->id,
                'rating' => 5,
                'comment' => 'طبيب ممتاز وتشخيص دقيق جداً',
            ])
            ->assertStatus(201);

        // Duplicate review for the same completed appointment is blocked
        $this->withHeader('Authorization', 'Bearer ' . $tokenPatientX)
            ->postJson('/api/v1/ratings', [
                'doctor_id' => $docA->id,
                'rating' => 4,
                'comment' => 'تقييم مكرر',
            ])
            ->assertStatus(422);

        // Doctor sees actual 5.0 rating in My Reviews
        $docReviews = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->getJson('/api/v1/doctor/reviews');
        $docReviews->assertStatus(200)
            ->assertJsonPath('summary.average_rating', 5)
            ->assertJsonPath('summary.total_reviews', 1);

        $this->assertEquals(2, Prescription::count());
        $this->assertEquals(2, PatientFollowUp::count());
    }
}
