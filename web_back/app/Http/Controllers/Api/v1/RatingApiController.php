<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingApiController extends Controller
{
    /**
     * حفظ تقييم طبيب جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'user_id' => 'nullable|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $rating = Rating::create([
            'doctor_id' => $validated['doctor_id'],
            'user_id' => Auth::id() ?? $validated['user_id'] ?? 1,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return $this->successResponse([
            'message' => 'تم إضافة التقييم بنجاح! شكراً لمشاركتنا رأيك.',
            'data' => $rating,
        ], 201);
    }
}
