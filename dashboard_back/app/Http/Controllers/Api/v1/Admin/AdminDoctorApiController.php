<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDoctorApiController extends Controller
{
    private const ALLOWED_STATUSES = 'active,inactive,متاح,نشط,غير متاح';
    private const ALLOWED_SUBSCRIPTIONS = 'subscribed,not_subscribed,سنوي,شهري,مشترك,غير مشترك';

    /**
     * استعراض قائمة الأطباء مع الترقيم والبحث
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);

        $doctors = Doctor::query()
            ->filter($request->only(['search', 'specialty', 'status']), includeContactInSearch: true)
            ->latest()
            ->paginate($perPage);

        return $this->paginatedResponse($doctors);
    }

    /**
     * تفاصيل طبيب محدد مع تقييماته
     */
    public function show($id): JsonResponse
    {
        $doctor = Doctor::findOrFail($id);
        $ratings = $doctor->ratings()->with('user:id,name,email')->latest()->get();
        $averageRating = round($ratings->avg('rating') ?? 0, 1);
        $ratingsCount = $ratings->count();

        return $this->successResponse([
            'data' => array_merge($doctor->toArray(), [
                'average_rating' => $averageRating,
                'ratings_count' => $ratingsCount,
                'ratings' => $ratings,
            ]),
        ]);
    }

    /**
     * إضافة طبيب جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'specialty' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'number' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'status' => 'required|in:' . self::ALLOWED_STATUSES,
            'subscription' => 'required|in:' . self::ALLOWED_SUBSCRIPTIONS,
        ]);

        $doctor = new Doctor(collect($validatedData)->except('image')->toArray());
        $doctor->syncUploadedImages($request);
        $doctor->save();

        return $this->successResponse([
            'message' => 'تم إضافة الطبيب بنجاح',
            'data' => $doctor,
        ], 201);
    }

    /**
     * تحديث بيانات وصور الطبيب
     */
    public function update(Request $request, $id): JsonResponse
    {
        $doctor = Doctor::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'specialty' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'number' => 'sometimes|required|string|max:20',
            'location' => 'sometimes|required|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:' . self::ALLOWED_STATUSES,
            'subscription' => 'sometimes|required|in:' . self::ALLOWED_SUBSCRIPTIONS,
        ]);

        $doctor->fill(collect($validatedData)->except('image')->toArray());
        $doctor->syncUploadedImages($request);
        $doctor->save();

        return $this->successResponse([
            'message' => 'تم تحديث بيانات الطبيب بنجاح',
            'data' => $doctor,
        ]);
    }

    /**
     * حذف طبيب وصوره
     */
    public function destroy($id): JsonResponse
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->deleteAllStoredImages();
        $doctor->delete();

        return $this->successResponse([
            'message' => 'تم حذف الطبيب بنجاح',
        ]);
    }
}
