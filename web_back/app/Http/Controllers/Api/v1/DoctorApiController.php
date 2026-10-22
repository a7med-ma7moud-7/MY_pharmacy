<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorApiController extends Controller
{
    /**
     * قائمة الأطباء مع الفلترة والبحث
     */
    public function index(Request $request)
    {
        $query = Doctor::query();

        // تصفية بالأطباء النشطين والمشتركين (دعم القيم العربية والإنجليزية)
        if (\Schema::hasColumn('doctors', 'status')) {
            $query->where(function ($q) {
                $q->whereIn('status', ['active', 'متاح', 'نشط'])->orWhereNull('status');
            });
        }
        if (\Schema::hasColumn('doctors', 'subscription')) {
            $query->where(function ($q) {
                $q->whereIn('subscription', ['subscribed', 'سنوي', 'شهري', 'مشترك'])->orWhereNull('subscription');
            });
        }

        // البحث بالاسم أو التخصص
        if ($request->filled('search')) {
            $searchTerm = trim($request->search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('specialty', 'like', '%' . $searchTerm . '%');

                $nameParts = explode(' ', $searchTerm);
                foreach ($nameParts as $part) {
                    if (strlen($part) > 2) {
                        $q->orWhere('name', 'like', '%' . $part . '%');
                    }
                }
            });
        }

        // التصفية بالتخصص
        if ($request->filled('specialty') && $request->specialty !== 'all' && $request->specialty !== 'كل التخصصات') {
            $query->where('specialty', $request->specialty);
        }

        // التصفية بالمحافظة
        if ($request->filled('location')) {
            $query->where('location', $request->location);
        }

        // التصفية بالمدينة
        if ($request->filled('tow_location')) {
            $query->where('tow_location', $request->tow_location);
        }

        // الترتيب
        $query->orderBy('name', 'asc');

        $perPage = (int) $request->input('per_page', 9);
        $doctors = $query->with('ratings')->paginate($perPage);

        // إضافة بيانات التقييم ورابط الصورة لكل طبيب
        $doctors->getCollection()->transform(function ($doctor) {
            $ratings = $doctor->ratings;
            $doctor->average_rating = round($ratings->avg('rating') ?: 5.0, 1);
            $doctor->ratings_count = $ratings->count();
            $doctor->image_url = $this->resolveImageUrl($doctor->image);
            return $doctor;
        });

        // قوائم الفلترة
        $specialties = Doctor::distinct()->whereNotNull('specialty')->pluck('specialty');
        $locations = Doctor::distinct()->whereNotNull('location')->pluck('location');
        $cities = Doctor::distinct()->whereNotNull('tow_location')->pluck('tow_location');

        return response()->json([
            'success' => true,
            'data' => $doctors,
            'filters' => [
                'specialties' => $specialties,
                'locations' => $locations,
                'cities' => $cities,
            ],
        ]);
    }

    /**
     * تفاصيل طبيب محدد مع تقييماته
     */
    public function show($id)
    {
        $doctor = Doctor::with(['ratings.user'])->findOrFail($id);

        $ratings = $doctor->ratings()->with('user')->latest()->get();
        $averageRating = round($ratings->avg('rating') ?: 5.0, 1);
        $ratingsCount = $ratings->count();

        $doctor->average_rating = $averageRating;
        $doctor->ratings_count = $ratingsCount;
        $doctor->image_url = $this->resolveImageUrl($doctor->image);

        return response()->json([
            'success' => true,
            'data' => [
                'doctor' => $doctor,
                'ratings' => $ratings,
                'average_rating' => $averageRating,
                'ratings_count' => $ratingsCount,
            ],
        ]);
    }

    /**
     * حل رابط الصورة
     */
    private function resolveImageUrl(?string $image): string
    {
        if (empty($image)) {
            return asset('asset/1.png');
        }
        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }
        if (file_exists(public_path('storage/' . $image))) {
            return asset('storage/' . $image);
        }
        if (file_exists(public_path('asset/' . $image))) {
            return asset('asset/' . $image);
        }
        return asset('storage/' . $image);
    }
}
