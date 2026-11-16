<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\MedicalAuditLog;
use App\Models\TreatedCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorTreatedCaseController extends DoctorPortalBaseController
{
    public function index(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $perPage = $this->resolvePerPage($request, default: 10, max: 50);

        $query = TreatedCase::query()->where('doctor_id', $doctor->id);

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        $cases = $query
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        return $this->paginatedResponse($cases);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $case = TreatedCase::where('doctor_id', $doctor->id)->findOrFail($id);

        return $this->successResponse(['data' => $case]);
    }

    public function store(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'description' => 'required|string|max:4000',
            'initial_condition' => 'required|string|max:4000',
            'treatment_summary' => 'required|string|max:4000',
            'outcome' => 'required|string|max:4000',
            'published_at' => 'nullable|date',
            'patient_consent_confirmed' => 'required|accepted',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:4096',
        ], [
            'patient_consent_confirmed.accepted' => 'يجب الإقرار بحذف بيانات هوية المريض والحصول على الموافقة المهنية قبل النشر.',
        ]);

        if ($this->containsPatientIdentifierLeak($validated)) {
            return $this->errorResponse(
                'حفاظاً على سرية بيانات المرضى، يُمنع تضمين أرقام الهواتف أو الأرقام القومية الشخصية داخل الحالات المنشورة للجمهور.',
                422
            );
        }

        $case = new TreatedCase([
            'doctor_id' => $doctor->id,
            'title' => trim($validated['title']),
            'specialty' => !empty($validated['specialty']) ? trim($validated['specialty']) : $doctor->specialty,
            'description' => trim($validated['description']),
            'initial_condition' => trim($validated['initial_condition']),
            'treatment_summary' => trim($validated['treatment_summary']),
            'outcome' => trim($validated['outcome']),
            'patient_consent_confirmed' => true,
            // Direct publishing without mandatory admin pre-approval
            'status' => 'published',
            'published_at' => $validated['published_at'] ?? now()->toDateString(),
        ]);

        if ($request->hasFile('image')) {
            $case->image = $case->storeUploadedImage($request, 'image', 'treated_cases');
        }

        if ($request->hasFile('attachment')) {
            $case->attachment_path = $case->storeUploadedImage($request, 'attachment', 'treated_cases');
        }

        $case->save();

        MedicalAuditLog::record(
            action: 'doctor.case_published',
            targetType: 'treated_case',
            targetId: $case->id,
            doctorId: $doctor->id,
            metadata: ['title' => $case->title, 'status' => 'published'],
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم نشر الحالة العلاجية فوراً على ملفك العام بنجاح!',
            'data' => $case->fresh(),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $case = TreatedCase::where('doctor_id', $doctor->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'description' => 'sometimes|required|string|max:4000',
            'initial_condition' => 'sometimes|required|string|max:4000',
            'treatment_summary' => 'sometimes|required|string|max:4000',
            'outcome' => 'sometimes|required|string|max:4000',
            'published_at' => 'nullable|date',
            'patient_consent_confirmed' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:4096',
        ]);

        if ($this->containsPatientIdentifierLeak($validated)) {
            return $this->errorResponse(
                'حفاظاً على سرية بيانات المرضى، يُمنع تضمين أرقام الهواتف أو الأرقام القومية الشخصية داخل الحالات المنشورة.',
                422
            );
        }

        $case->fill(collect($validated)->only([
            'title',
            'specialty',
            'description',
            'initial_condition',
            'treatment_summary',
            'outcome',
            'published_at',
        ])->toArray());

        if ($request->hasFile('image')) {
            $case->image = $case->storeUploadedImage($request, 'image', 'treated_cases', $case->image);
        }

        if ($request->hasFile('attachment')) {
            $case->attachment_path = $case->storeUploadedImage($request, 'attachment', 'treated_cases', $case->attachment_path);
        }

        $case->save();

        MedicalAuditLog::record(
            action: 'doctor.case_updated',
            targetType: 'treated_case',
            targetId: $case->id,
            doctorId: $doctor->id,
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم تحديث بيانات الحالة العلاجية بنجاح.',
            'data' => $case->fresh(),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $case = TreatedCase::where('doctor_id', $doctor->id)->findOrFail($id);

        $case->deleteStoredImage($case->image);
        $case->deleteStoredImage($case->attachment_path);
        $caseId = $case->id;
        $case->delete();

        MedicalAuditLog::record(
            action: 'doctor.case_deleted',
            targetType: 'treated_case',
            targetId: $caseId,
            doctorId: $doctor->id,
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم حذف الحالة العلاجية بنجاح.',
        ]);
    }

    /**
     * Safeguard against accidental patient phone / national ID exposure in public clinical descriptions.
     */
    private function containsPatientIdentifierLeak(array $data): bool
    {
        $combined = implode(' ', array_filter([
            $data['title'] ?? null,
            $data['description'] ?? null,
            $data['initial_condition'] ?? null,
            $data['treatment_summary'] ?? null,
            $data['outcome'] ?? null,
        ]));

        // Block Egyptian mobile numbers (010/011/012/015 + 8 digits) or 14-digit national IDs
        if (preg_match('/\b01[0125]\d{8}\b/', $combined) || preg_match('/\b[23]\d{13}\b/', $combined)) {
            return true;
        }

        return false;
    }
}
