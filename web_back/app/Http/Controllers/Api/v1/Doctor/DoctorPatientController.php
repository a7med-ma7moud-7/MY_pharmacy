<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\Appointment;
use App\Models\DoctorPatientConversation;
use App\Models\MedicalAuditLog;
use App\Models\PatientFollowUp;
use App\Models\Prescription;
use App\Models\User;
use App\Services\DoctorPatientAccessService;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorPatientController extends DoctorPortalBaseController
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    /**
     * قائمة مرضى الطبيب الحالي فقط (الذين لديهم حجوزات مع هذا الطبيب حصراً)
     */
    public function index(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $search = trim((string) $request->query('search', ''));
        $statusFilter = trim((string) $request->query('status', ''));

        $appointments = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->with('patientUser:id,name,phone,email,avatar')
            ->orderByDesc('appointment_date')
            ->orderByDesc('id')
            ->get();

        // Group strictly by patient identity within THIS doctor's appointments
        $patientsMap = [];

        foreach ($appointments as $appt) {
            $normPhone = PhoneNormalizer::normalize($appt->phone);
            $matchedUser = $appt->patientUser;
            if (!$matchedUser && $normPhone) {
                $matchedUser = User::whereIn('phone', PhoneNormalizer::variants($normPhone))->first();
                if ($matchedUser && !$appt->user_id) {
                    $appt->user_id = $matchedUser->id;
                    $appt->saveQuietly();
                }
            }

            $key = $matchedUser
                ? ('u_' . $matchedUser->id)
                : ('p_' . ($normPhone ?: ('appt_' . $appt->id)));

            if (!isset($patientsMap[$key])) {
                $displayName = $matchedUser?->name ?: $appt->patient_name;
                $displayPhone = $matchedUser?->phone ?: ($normPhone ?: $appt->phone);

                $patientsMap[$key] = [
                    'patient_key' => $key,
                    'patient_id_display' => $matchedUser ? ('PT-' . str_pad((string) $matchedUser->id, 4, '0', STR_PAD_LEFT)) : ('GUEST-' . substr(md5($key), 0, 5)),
                    'patient_user_id' => $matchedUser?->id,
                    'patient_name' => $displayName,
                    'phone' => $displayPhone,
                    'is_registered_user' => (bool) $matchedUser,
                    'can_chat' => false,
                    'appointments_count' => 0,
                    'completed_appointments_count' => 0,
                    'last_appointment_id' => $appt->id,
                    'last_appointment_date' => $appt->appointment_date?->format('Y-m-d'),
                    'last_appointment_time' => $appt->appointment_time,
                    'last_appointment_status' => $appt->status,
                    'last_interaction_at' => $appt->updated_at?->toISOString() ?? $appt->created_at?->toISOString(),
                    'prescriptions_count' => 0,
                    'follow_ups_count' => 0,
                    'unread_messages' => 0,
                ];
            }

            $patientsMap[$key]['appointments_count']++;
            if ($appt->status === 'completed') {
                $patientsMap[$key]['completed_appointments_count']++;
            }
            if ($matchedUser && $appt->status !== 'cancelled') {
                $patientsMap[$key]['can_chat'] = true;
            }
        }

        if ($patientsMap === []) {
            return $this->successResponse([
                'data' => [],
                'total' => 0,
            ]);
        }

        // Enrich with THIS doctor's prescriptions, follow-ups, and chat timestamps
        $prescriptions = Prescription::where('doctor_id', $doctor->id)->get(['patient_user_id', 'patient_phone', 'updated_at']);
        foreach ($prescriptions as $rx) {
            $k = $rx->patient_user_id
                ? ('u_' . $rx->patient_user_id)
                : ('p_' . (PhoneNormalizer::normalize($rx->patient_phone) ?: ''));
            if (isset($patientsMap[$k])) {
                $patientsMap[$k]['prescriptions_count']++;
                $ts = $rx->updated_at?->toISOString();
                if ($ts && $ts > ($patientsMap[$k]['last_interaction_at'] ?? '')) {
                    $patientsMap[$k]['last_interaction_at'] = $ts;
                }
            }
        }

        $followUps = PatientFollowUp::where('doctor_id', $doctor->id)->get(['patient_user_id', 'patient_phone', 'updated_at']);
        foreach ($followUps as $fu) {
            $k = $fu->patient_user_id
                ? ('u_' . $fu->patient_user_id)
                : ('p_' . (PhoneNormalizer::normalize($fu->patient_phone) ?: ''));
            if (isset($patientsMap[$k])) {
                $patientsMap[$k]['follow_ups_count']++;
                $ts = $fu->updated_at?->toISOString();
                if ($ts && $ts > ($patientsMap[$k]['last_interaction_at'] ?? '')) {
                    $patientsMap[$k]['last_interaction_at'] = $ts;
                }
            }
        }

        $conversations = DoctorPatientConversation::where('doctor_id', $doctor->id)->get(['patient_user_id', 'doctor_unread_count', 'last_message_at']);
        foreach ($conversations as $conv) {
            $k = 'u_' . $conv->patient_user_id;
            if (isset($patientsMap[$k])) {
                $patientsMap[$k]['unread_messages'] = (int) $conv->doctor_unread_count;
                $ts = $conv->last_message_at?->toISOString();
                if ($ts && $ts > ($patientsMap[$k]['last_interaction_at'] ?? '')) {
                    $patientsMap[$k]['last_interaction_at'] = $ts;
                }
            }
        }

        $patientsList = array_values($patientsMap);

        // Apply search & status filter
        if ($search !== '') {
            $needle = mb_strtolower($search, 'UTF-8');
            $patientsList = array_values(array_filter($patientsList, function (array $p) use ($needle) {
                return str_contains(mb_strtolower((string) $p['patient_name'], 'UTF-8'), $needle)
                    || str_contains(mb_strtolower((string) ($p['phone'] ?? ''), 'UTF-8'), $needle)
                    || str_contains(mb_strtolower((string) $p['patient_id_display'], 'UTF-8'), $needle);
            }));
        }

        if ($statusFilter !== '' && $statusFilter !== 'all') {
            $patientsList = array_values(array_filter(
                $patientsList,
                fn (array $p) => $p['last_appointment_status'] === $statusFilter
            ));
        }

        return $this->successResponse([
            'data' => $patientsList,
            'total' => count($patientsList),
        ]);
    }

    /**
     * السجل الطبي الخاص بتعاملات هذا الطبيب فقط مع المريض المحدد (عزل صارم بين الأطباء)
     */
    public function records(Request $request, string $patientKey): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $authorizedPatient = $this->accessService->resolveAuthorizedPatientForDoctor($doctor, $patientKey);
        if (!$authorizedPatient) {
            return $this->errorResponse(
                'غير مصرح بالوصول إلى بيانات هذا المريض لعدم وجود علاقة علاجية أو موعد مسجل معك.',
                403,
                ['code' => 'PATIENT_RELATIONSHIP_REQUIRED']
            );
        }

        $patientUserId = $authorizedPatient['patient_user_id'];
        $phoneVariants = $authorizedPatient['phone_variants'];

        // Strictly filter EVERY entity by doctor_id === $doctor->id!
        $appointments = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->where(function ($q) use ($patientUserId, $phoneVariants) {
                if ($patientUserId) {
                    $q->orWhere('user_id', $patientUserId);
                }
                if ($phoneVariants !== []) {
                    $q->orWhereIn('phone', $phoneVariants);
                }
            })
            ->orderByDesc('appointment_date')
            ->orderByDesc('id')
            ->get();

        $prescriptions = Prescription::query()
            ->where('doctor_id', $doctor->id)
            ->where(function ($q) use ($patientUserId, $phoneVariants) {
                if ($patientUserId) {
                    $q->orWhere('patient_user_id', $patientUserId);
                }
                if ($phoneVariants !== []) {
                    $q->orWhereIn('patient_phone', $phoneVariants);
                }
            })
            ->with('items')
            ->orderByDesc('prescribed_date')
            ->orderByDesc('id')
            ->get();

        $followUps = PatientFollowUp::query()
            ->where('doctor_id', $doctor->id)
            ->where(function ($q) use ($patientUserId, $phoneVariants) {
                if ($patientUserId) {
                    $q->orWhere('patient_user_id', $patientUserId);
                }
                if ($phoneVariants !== []) {
                    $q->orWhereIn('patient_phone', $phoneVariants);
                }
            })
            ->with('appointment:id,appointment_date,appointment_time,status')
            ->orderByDesc('followup_date')
            ->orderByDesc('id')
            ->get();

        $conversation = null;
        $recentMessages = [];
        if ($patientUserId) {
            $conversation = DoctorPatientConversation::query()
                ->where('doctor_id', $doctor->id)
                ->where('patient_user_id', $patientUserId)
                ->first();

            if ($conversation) {
                $recentMessages = $conversation->messages()
                    ->orderByDesc('id')
                    ->limit(20)
                    ->get()
                    ->reverse()
                    ->values();
            }
        }

        MedicalAuditLog::record(
            action: 'doctor.patient_record_viewed',
            targetType: 'patient',
            targetId: $patientUserId,
            doctorId: $doctor->id,
            metadata: ['patient_key' => $authorizedPatient['patient_key']],
            request: $request
        );

        return $this->successResponse([
            'data' => [
                'patient' => [
                    'patient_key' => $authorizedPatient['patient_key'],
                    'patient_id_display' => $patientUserId
                        ? ('PT-' . str_pad((string) $patientUserId, 4, '0', STR_PAD_LEFT))
                        : ('GUEST-' . substr(md5($authorizedPatient['patient_key']), 0, 5)),
                    'patient_user_id' => $patientUserId,
                    'name' => $authorizedPatient['patient_name'],
                    'phone' => $authorizedPatient['patient_phone'],
                    'email' => $authorizedPatient['patient_email'],
                    'can_chat' => $patientUserId
                        ? $this->accessService->canPatientChatWithDoctor($authorizedPatient['patient_user'], (int) $doctor->id)
                        : false,
                ],
                'scope_notice' => 'يعرض هذا الملف المعلومات الطبية الناتجة عن تعاملاتك المباشرة فقط مع هذا المريض.',
                'appointments' => $appointments,
                'prescriptions' => $prescriptions,
                'follow_ups' => $followUps,
                'conversation_id' => $conversation?->id,
                'chat_history' => $recentMessages,
            ],
        ]);
    }
}
