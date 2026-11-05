<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorApiController extends Controller
{
    /**
     * قائمة الأطباء مع الفلترة والبحث وحساب التقييمات على مستوى SQL
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 9);

        $doctors = Doctor::query()
            ->activeAndSubscribed()
            ->filter($request->only(['search', 'specialty', 'location', 'tow_location']))
            ->withAvg('ratings as ratings_avg', 'rating')
            ->withCount('ratings')
            ->orderBy('name', 'asc')
            ->paginate($perPage);

        // إضافة بيانات التقييم ورابط الصورة لكل طبيب بدون استعلامات إضافية
        $doctors->getCollection()->transform(function (Doctor $doctor) {
            $doctor->average_rating = round((float) ($doctor->ratings_avg ?: 5.0), 1);
            $doctor->ratings_count = (int) ($doctor->ratings_count ?? 0);
            $doctor->image_url = $doctor->image_url;
            return $doctor;
        });

        return $this->successResponse([
            'data' => $doctors,
            'filters' => Doctor::getFilterOptions(),
        ]);
    }

    /**
     * تفاصيل طبيب محدد مع تقييماته في استعلام واحد دون تكرار
     */
    public function show($id): JsonResponse
    {
        $doctor = Doctor::findOrFail($id);

        $ratings = $doctor->ratings()
            ->with('user:id,name,email,avatar')
            ->latest()
            ->get();

        $averageRating = round((float) ($ratings->avg('rating') ?: 5.0), 1);
        $ratingsCount = $ratings->count();

        $doctor->setRelation('ratings', $ratings);
        $doctor->average_rating = $averageRating;
        $doctor->ratings_count = $ratingsCount;
        $doctor->image_url = $doctor->image_url;

        return $this->successResponse([
            'data' => [
                'doctor' => $doctor,
                'ratings' => $ratings,
                'average_rating' => $averageRating,
                'ratings_count' => $ratingsCount,
            ],
        ]);
    }
}
