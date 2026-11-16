<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\Appointment;
use App\Models\MedicalAuditLog;
use App\Models\PatientFollowUp;
use App\Services\DoctorPatientAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorFollowUpController extends DoctorPortalBaseController
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $perPage = $this->resolvePerPage($request, default: 12, max: 50);

        $query = PatientFollowUp::query()
            ->where('doctor_id', $doctor->id)
            ->with('appointment:id,appointment_date,appointment_time,status');

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('consultation_notes', 'like', "%{$search}%")
                  ->orWhere('treatment_updates', 'like', "%{$search}%");
            });
        }

        $followUps = $query
            ->orderByDesc('followup_date')
            ->orderByDesc('id')
            ->paginate($perPage);

        return $this->paginatedResponse($followUps);
    }

    public function store(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $validated = $request->validate([
            'patient_key' => 'required|string|max:60',
            'appointment_id' => 'nullable|integer',
            'followup_date' => 'required|date',
            'consultation_notes' => 'required|string|max:4000',
            'treatment_updates' => 'nullable|string|max:4000',
            'next_followup_date' => 'nullable|date|after_or_equal:followup_date',
            'status' => 'nullable|string|in:recorded,scheduled,completed',
        ]);

        $authorizedPatient = $this->accessService->resolveAuthorizedPatientForDoctor($doctor, $validated['patient_key']);
        if (!$authorizedPatient) {
            return $this->errorResponse(
                'غير مصرح بإضافة متابعة لمريض ليس لديه علاقة حجز معك.',
                403,
                ['code' => 'PATIENT_RELATIONSHIP_REQUIRED']
            );
        }

        $appointmentId = null;
        if (!empty($validated['appointment_id'])) {
            $appt = Appointment::where('doctor_id', $doctor->id)->find($validated['appointment_id']);
            if (!$appt) {
                return $this->errorResponse('الموعد المرتبط غير صالح أو لا يخص عيادتك.', 422);
            }
            $appointmentId = $appt->id;
        }

        $followUp = PatientFollowUp::create([
            'doctor_id' => $doctor->id,
            'patient_user_id' => $authorizedPatient['patient_user_id'],
            'appointment_id' => $appointmentId,
            'patient_name' => $authorizedPatient['patient_name'],
            'patient_phone' => $authorizedPatient['patient_phone'],
            'followup_date' => $validated['followup_date'],
            'consultation_notes' => trim($validated['consultation_notes']),
            'treatment_updates' => isset($validated['treatment_updates']) ? trim($validated['treatment_updates']) : null,
            'next_followup_date' => $validated['next_followup_date'] ?? null,
            'status' => $validated['status'] ?? 'recorded',
        ]);

        MedicalAuditLog::record(
            action: 'doctor.followup_added',
            targetType: 'followup',
            targetId: $followUp->id,
            doctorId: $doctor->id,
            metadata: ['patient_key' => $authorizedPatient['patient_key']],
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم تسجيل ملاحظة المتابعة الطبية بنجاح.',
            'data' => $followUp->load('appointment:id,appointment_date,appointment_time,status'),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $followUp = PatientFollowUp::where('doctor_id', $doctor->id)->findOrFail($id);

        $validated = $request->validate([
            'followup_date' => 'sometimes|required|date',
            'consultation_notes' => 'sometimes|required|string|max:4000',
            'treatment_updates' => 'nullable|string|max:4000',
            'next_followup_date' => 'nullable|date',
            'status' => 'nullable|string|in:recorded,scheduled,completed',
        ]);

        $followUp->fill($validated);
        $followUp->save();

        MedicalAuditLog::record(
            action: 'doctor.followup_updated',
            targetType: 'followup',
            targetId: $followUp->id,
            doctorId: $doctor->id,
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم تحديث سجل المتابعة بنجاح.',
            'data' => $followUp->load('appointment:id,appointment_date,appointment_time,status'),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $followUp = PatientFollowUp::where('doctor_id', $doctor->id)->findOrFail($id);
        $fuId = $followUp->id;
        $followUp->delete();

        MedicalAuditLog::record(
            action: 'doctor.followup_deleted',
            targetType: 'followup',
            targetId: $fuId,
            doctorId: $doctor->id,
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم حذف سجل المتابعة بنجاح.',
        ]);
    }
}
