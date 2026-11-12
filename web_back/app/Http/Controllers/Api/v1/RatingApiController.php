<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingApiController extends Controller
{
    /**
     * حفظ أو تحديث تقييم طبيب بأمان دون تعارض مفاتيح خارجية
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'user_id' => 'nullable|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $authenticatedUserId = Auth::id();
        $resolvedUserId = $authenticatedUserId ?? $validated['user_id'] ?? User::query()->value('id');

        if (!$resolvedUserId) {
            return $this->errorResponse('يرجى تسجيل الدخول أولاً لإضافة تقييم.', 401);
        }

        if ($authenticatedUserId) {
            $rating = Rating::updateOrCreate(
                [
                    'doctor_id' => $validated['doctor_id'],
                    'user_id' => $authenticatedUserId,
                ],
                [
                    'rating' => $validated['rating'],
                    'comment' => $validated['comment'] ?? null,
                ]
            );
        } else {
            $rating = Rating::create([
                'doctor_id' => $validated['doctor_id'],
                'user_id' => $resolvedUserId,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);
        }

        return $this->successResponse([
            'message' => 'تم إضافة التقييم بنجاح! شكراً لمشاركتنا رأيك.',
            'data' => $rating,
        ], 201);
    }
}
