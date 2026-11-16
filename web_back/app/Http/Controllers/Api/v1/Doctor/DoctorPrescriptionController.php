<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\Appointment;
use App\Models\MedicalAuditLog;
use App\Models\Medicien;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Services\DoctorPatientAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorPrescriptionController extends DoctorPortalBaseController
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $perPage = $this->resolvePerPage($request, default: 10, max: 50);

        $query = Prescription::query()
            ->where('doctor_id', $doctor->id)
            ->with(['items', 'appointment:id,appointment_date,appointment_time,status']);

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('prescription_number', 'like', "%{$search}%")
                  ->orWhere('patient_name', 'like', "%{$search}%")
                  ->orWhere('diagnosis', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $prescriptions = $query
            ->orderByDesc('prescribed_date')
            ->orderByDesc('id')
            ->paginate($perPage);

        return $this->paginatedResponse($prescriptions);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $prescription = Prescription::query()
            ->where('doctor_id', $doctor->id)
            ->with(['items.medicine:id,name,price,type,count', 'appointment'])
            ->findOrFail($id);

        return $this->successResponse(['data' => $prescription]);
    }

    public function store(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $validated = $request->validate([
            'patient_key' => 'required|string|max:60',
            'appointment_id' => 'nullable|integer',
            'diagnosis' => 'required|string|max:2000',
            'notes' => 'nullable|string|max:2000',
            'prescribed_date' => 'nullable|date',
            'status' => 'nullable|string|in:active,completed,cancelled',
            'items' => 'required|array|min:1|max:20',
            'items.*.medicine_id' => 'nullable|integer|exists:mediciens,id',
            'items.*.medicine_name' => 'required|string|max:255',
            'items.*.dosage' => 'required|string|max:255',
            'items.*.duration' => 'nullable|string|max:255',
            'items.*.instructions' => 'nullable|string|max:500',
        ]);

        // Verify doctor-patient relationship
        $authorizedPatient = $this->accessService->resolveAuthorizedPatientForDoctor($doctor, $validated['patient_key']);
        if (!$authorizedPatient) {
            return $this->errorResponse(
                'لا يمكن إصدار روشتة لمريض ليس لديه سجل حجز معك.',
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

        $prescription = DB::transaction(function () use ($doctor, $authorizedPatient, $validated, $appointmentId, $request) {
            $rx = Prescription::create([
                'prescription_number' => Prescription::generatePrescriptionNumber(),
                'doctor_id' => $doctor->id,
                'patient_user_id' => $authorizedPatient['patient_user_id'],
                'appointment_id' => $appointmentId,
                'patient_name' => $authorizedPatient['patient_name'],
                'patient_phone' => $authorizedPatient['patient_phone'],
                'diagnosis' => trim($validated['diagnosis']),
                'notes' => isset($validated['notes']) ? trim($validated['notes']) : null,
                'status' => $validated['status'] ?? 'active',
                'prescribed_date' => $validated['prescribed_date'] ?? now()->toDateString(),
            ]);

            foreach ($validated['items'] as $item) {
                PrescriptionItem::create([
                    'prescription_id' => $rx->id,
                    'medicine_id' => $item['medicine_id'] ?? null,
                    'medicine_name' => trim($item['medicine_name']),
                    'dosage' => trim($item['dosage']),
                    'duration' => isset($item['duration']) ? trim((string) $item['duration']) : null,
                    'instructions' => isset($item['instructions']) ? trim((string) $item['instructions']) : null,
                ]);
            }

            MedicalAuditLog::record(
                action: 'doctor.prescription_created',
                targetType: 'prescription',
                targetId: $rx->id,
                doctorId: $doctor->id,
                metadata: [
                    'prescription_number' => $rx->prescription_number,
                    'patient_key' => $authorizedPatient['patient_key'],
                ],
                request: $request
            );

            return $rx->load(['items', 'appointment:id,appointment_date,appointment_time']);
        });

        return $this->successResponse([
            'message' => 'تم إصدار الروشتة الطبية بنجاح.',
            'data' => $prescription,
        ], 201);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $prescription = Prescription::where('doctor_id', $doctor->id)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:active,completed,cancelled',
        ]);

        $prescription->status = $validated['status'];
        $prescription->save();

        return $this->successResponse([
            'message' => 'تم تحديث حالة الروشتة بنجاح.',
            'data' => $prescription->load('items'),
        ]);
    }

    /**
     * البحث في كتالوج أدوية المنصة الحالي لإضافتها للروشتة دون تكرار سجلات الأدوية
     */
    public function medicinesCatalog(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $medicines = Medicien::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('propose', 'like', "%{$search}%");
            })
            ->orderByDesc('count')
            ->limit(25)
            ->get(['id', 'name', 'type', 'price', 'count', 'propose']);

        return $this->successResponse(['data' => $medicines]);
    }
}
