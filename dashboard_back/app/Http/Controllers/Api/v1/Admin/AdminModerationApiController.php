<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\MedicalAuditLog;
use App\Models\Rating;
use App\Models\TreatedCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminModerationApiController extends Controller
{
    /**
     * استعراض الحالات العلاجية المنشورة (إشراف لاحق فقط دون موافقة مسبقة إلزامية)
     */
    public function treatedCases(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 50);

        $query = TreatedCase::query()->with('doctor:id,name,specialty,image');

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', (int) $request->query('doctor_id'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('doctor', fn ($dq) => $dq->where('name', 'like', "%{$search}%"));
            });
        }

        $cases = $query->orderByDesc('published_at')->orderByDesc('id')->paginate($perPage);

        return $this->paginatedResponse($cases);
    }

    public function moderateTreatedCase(Request $request, $id): JsonResponse
    {
        $case = TreatedCase::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:published,hidden_by_admin',
            'moderation_note' => 'nullable|string|max:500',
        ]);

        $case->status = $validated['status'];
        $case->moderation_note = $validated['moderation_note'] ?? null;
        $case->save();

        MedicalAuditLog::record(
            action: 'admin.treated_case_moderated',
            targetType: 'treated_case',
            targetId: $case->id,
            doctorId: $case->doctor_id,
            metadata: ['status' => $case->status],
            request: $request
        );

        return $this->successResponse([
            'message' => $case->status === 'published'
                ? 'تم إعادة إظهار الحالة العلاجية على الملف العام للطبيب.'
                : 'تم إخفاء الحالة العلاجية لمخالفة سياسة الخصوصية أو المحتوى.',
            'data' => $case->load('doctor:id,name,specialty'),
        ]);
    }

    public function deleteTreatedCase(Request $request, $id): JsonResponse
    {
        $case = TreatedCase::findOrFail($id);
        $case->deleteStoredImage($case->image);
        $case->deleteStoredImage($case->attachment_path);
        $docId = $case->doctor_id;
        $caseId = $case->id;
        $case->delete();

        MedicalAuditLog::record(
            action: 'admin.treated_case_deleted',
            targetType: 'treated_case',
            targetId: $caseId,
            doctorId: $docId,
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم حذف الحالة العلاجية نهائياً.',
        ]);
    }

    /**
     * إدارة التقييمات والمراجعات المُبلّغ عنها أو المخالفة
     */
    public function reviews(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 12, max: 50);

        $query = Rating::query()->with([
            'doctor:id,name,specialty',
            'user:id,name,email,phone',
            'appointment:id,appointment_date,status',
        ]);

        if (filter_var($request->query('reported_only'), FILTER_VALIDATE_BOOLEAN)) {
            $query->whereNotNull('report_reason')->where('report_reason', '!=', '');
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', (int) $request->query('doctor_id'));
        }

        $reviews = $query->latest()->paginate($perPage);

        $reportedCount = Rating::whereNotNull('report_reason')->where('report_reason', '!=', '')->count();

        return $this->paginatedResponse($reviews, [
            'meta' => [
                'reported_count' => $reportedCount,
            ],
        ]);
    }

    public function moderateReview(Request $request, $id): JsonResponse
    {
        $review = Rating::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:visible,hidden',
            'clear_report' => 'nullable|boolean',
        ]);

        $review->status = $validated['status'];
        if (!empty($validated['clear_report']) || $validated['status'] === 'hidden') {
            $review->report_reason = null;
        }
        $review->save();

        MedicalAuditLog::record(
            action: 'admin.review_moderated',
            targetType: 'rating',
            targetId: $review->id,
            doctorId: $review->doctor_id,
            metadata: ['status' => $review->status],
            request: $request
        );

        return $this->successResponse([
            'message' => $review->status === 'visible'
                ? 'تم اعتماد ظهور التقييم وإغلاق البلاغ.'
                : 'تم إخفاء التقييم المخالف من الملف العام.',
            'data' => $review->load(['doctor:id,name,specialty', 'user:id,name']),
        ]);
    }

    public function deleteReview(Request $request, $id): JsonResponse
    {
        $review = Rating::findOrFail($id);
        $docId = $review->doctor_id;
        $revId = $review->id;
        $review->delete();

        MedicalAuditLog::record(
            action: 'admin.review_deleted',
            targetType: 'rating',
            targetId: $revId,
            doctorId: $docId,
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم حذف التقييم المخالف بنجاح.',
        ]);
    }
}
