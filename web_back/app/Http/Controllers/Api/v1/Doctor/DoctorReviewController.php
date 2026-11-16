<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\MedicalAuditLog;
use App\Models\Rating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorReviewController extends DoctorPortalBaseController
{
    public function index(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $perPage = $this->resolvePerPage($request, default: 12, max: 50);

        $visibleBase = Rating::query()
            ->where('doctor_id', $doctor->id)
            ->visible();

        $totalReviews = (clone $visibleBase)->count();
        $averageRating = $totalReviews > 0
            ? round((float) (clone $visibleBase)->avg('rating'), 1)
            : 0.0;

        // Rating distribution (5 down to 1)
        $countsByStar = (clone $visibleBase)
            ->selectRaw('rating, COUNT(*) as cnt')
            ->groupBy('rating')
            ->pluck('cnt', 'rating');

        $distribution = [];
        for ($star = 5; $star >= 1; $star--) {
            $cnt = (int) ($countsByStar[$star] ?? 0);
            $distribution[] = [
                'star' => $star,
                'count' => $cnt,
                'percent' => $totalReviews > 0 ? (int) round(($cnt / $totalReviews) * 100) : 0,
            ];
        }

        $reviewsQuery = Rating::query()
            ->where('doctor_id', $doctor->id)
            ->visible()
            ->with([
                'user:id,name,avatar',
                'appointment:id,appointment_date,appointment_time,status',
            ]);

        if ($request->filled('rating')) {
            $reviewsQuery->where('rating', (int) $request->query('rating'));
        }

        $reviews = $reviewsQuery->latest()->paginate($perPage);

        return $this->paginatedResponse($reviews, [
            'summary' => [
                'average_rating' => $averageRating,
                'total_reviews' => $totalReviews,
                'distribution' => $distribution,
            ],
        ]);
    }

    /**
     * Doctors cannot alter or delete patient ratings, but can flag abusive comments for Admin review.
     */
    public function report(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $rating = Rating::where('doctor_id', $doctor->id)->findOrFail($id);

        $validated = $request->validate([
            'report_reason' => 'required|string|max:500',
        ]);

        $rating->report_reason = trim($validated['report_reason']);
        $rating->save();

        MedicalAuditLog::record(
            action: 'doctor.review_reported',
            targetType: 'rating',
            targetId: $rating->id,
            doctorId: $doctor->id,
            metadata: ['reason' => $rating->report_reason],
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم إرسال البلاغ للإدارة لمراجعة التقييم وفق سياسة المنصة.',
            'data' => $rating,
        ]);
    }
}
