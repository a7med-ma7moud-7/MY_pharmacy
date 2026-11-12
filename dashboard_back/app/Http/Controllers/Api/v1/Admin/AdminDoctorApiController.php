<?php

declare(strict_types=1);

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
     * استعراض قائمة الأطباء مع الترقيم والبحث وحساب التقييمات دون N+1
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 100);

        $doctors = Doctor::query()
            ->filter($request->only(['search', 'specialty', 'status', 'location']), includeContactInSearch: true)
            ->withAvg('ratings as ratings_avg', 'rating')
            ->withCount('ratings')
            ->sortBy($request->query('sort'), defaultColumn: 'created_at', defaultDirection: 'desc')
            ->paginate($perPage);

        $doctors->getCollection()->transform(function (Doctor $doctor) {
            $doctor->average_rating = round((float) ($doctor->ratings_avg ?: 0), 1);
            $doctor->ratings_count = (int) ($doctor->ratings_count ?? 0);
            $doctor->appendResolvedImages();
            return $doctor;
        });

        return $this->paginatedResponse($doctors);
    }

    /**
     * تفاصيل طبيب محدد مع تقييماته ومعرض صور العيادة
     */
    public function show($id): JsonResponse
    {
        $doctor = Doctor::findOrFail($id);
        $ratings = $doctor->ratings()->with('user:id,name,email')->latest()->get();
        $averageRating = round((float) ($ratings->avg('rating') ?? 0), 1);
        $ratingsCount = $ratings->count();

        $doctor->appendResolvedImages();

        return $this->successResponse([
            'data' => array_merge($doctor->toArray(), [
                'average_rating' => $averageRating,
                'ratings_count' => $ratingsCount,
                'ratings' => $ratings,
            ]),
        ]);
    }

    /**
     * إضافة طبيب جديد مع التحقق من الصورة الرئيسية وصور المعرض
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'specialty' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'number' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'status' => 'required|in:' . self::ALLOWED_STATUSES,
            'subscription' => 'required|in:' . self::ALLOWED_SUBSCRIPTIONS,
        ];

        for ($i = 1; $i <= 5; $i++) {
            $rules["image-{$i}"] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        }

        $validatedData = $request->validate($rules);

        $fillableOnly = collect($validatedData)
            ->except(['image', 'image-1', 'image-2', 'image-3', 'image-4', 'image-5'])
            ->toArray();

        $doctor = new Doctor($fillableOnly);
        $doctor->syncUploadedImages($request);
        $doctor->save();
        $doctor->appendResolvedImages();

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

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'specialty' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'number' => 'sometimes|required|string|max:20',
            'location' => 'sometimes|required|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:' . self::ALLOWED_STATUSES,
            'subscription' => 'sometimes|required|in:' . self::ALLOWED_SUBSCRIPTIONS,
        ];

        for ($i = 1; $i <= 5; $i++) {
            $rules["image-{$i}"] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        }

        $validatedData = $request->validate($rules);

        $fillableOnly = collect($validatedData)
            ->except(['image', 'image-1', 'image-2', 'image-3', 'image-4', 'image-5'])
            ->toArray();

        $doctor->fill($fillableOnly);
        $doctor->syncUploadedImages($request);
        $doctor->save();
        $doctor->appendResolvedImages();

        return $this->successResponse([
            'message' => 'تم تحديث بيانات الطبيب بنجاح',
            'data' => $doctor,
        ]);
    }

    /**
     * حذف طبيب وصوره المخزنة
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
