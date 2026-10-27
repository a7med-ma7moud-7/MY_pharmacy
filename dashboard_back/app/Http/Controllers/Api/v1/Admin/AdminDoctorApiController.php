<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class AdminDoctorApiController extends Controller
{
    /**
     * استعراض قائمة الأطباء مع الترقيم والبحث
     */
    public function index(Request $request)
    {
        $query = Doctor::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('specialty', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('tow_location', 'like', "%{$search}%")
                  ->orWhere('number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('specialty')) {
            $query->where('specialty', $request->specialty);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->integer('per_page', 10);
        $doctors = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $doctors->items(),
            'current_page' => $doctors->currentPage(),
            'last_page' => $doctors->lastPage(),
            'per_page' => $doctors->perPage(),
            'total' => $doctors->total(),
        ]);
    }

    /**
     * تفاصيل طبيب محدد مع تقييماته
     */
    public function show($id)
    {
        $doctor = Doctor::findOrFail($id);
        $ratings = $doctor->ratings()->with('user:id,name,email')->latest()->get();
        $averageRating = round($ratings->avg('rating') ?? 0, 1);
        $ratingsCount = $ratings->count();

        return response()->json([
            'success' => true,
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
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'specialty' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'number' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
            'subscription' => 'required|in:subscribed,not_subscribed',
        ]);

        $doctor = new Doctor($validatedData);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('doctors', 'public');
            $doctor->image = $imagePath;
        }

        for ($i = 1; $i <= 5; $i++) {
            $imageField = "image-$i";
            if ($request->hasFile($imageField) && Schema::hasColumn('doctors', $imageField)) {
                $imagePath = $request->file($imageField)->store('doctors', 'public');
                $doctor->{$imageField} = $imagePath;
            }
        }

        $doctor->save();

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الطبيب بنجاح',
            'data' => $doctor,
        ], 201);
    }

    /**
     * تحديث بيانات وصور الطبيب
     */
    public function update(Request $request, $id)
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
            'status' => 'sometimes|required|in:active,inactive',
            'subscription' => 'sometimes|required|in:subscribed,not_subscribed',
        ]);

        $doctor->fill($request->except(['image', 'image-1', 'image-2', 'image-3', 'image-4', 'image-5']));

        if ($request->hasFile('image')) {
            if ($doctor->image && Storage::disk('public')->exists($doctor->image)) {
                Storage::disk('public')->delete($doctor->image);
            }
            $imagePath = $request->file('image')->store('doctors', 'public');
            $doctor->image = $imagePath;
        }

        for ($i = 1; $i <= 5; $i++) {
            $imageField = "image-$i";
            if ($request->hasFile($imageField) && Schema::hasColumn('doctors', $imageField)) {
                if ($doctor->{$imageField} && Storage::disk('public')->exists($doctor->{$imageField})) {
                    Storage::disk('public')->delete($doctor->{$imageField});
                }
                $imagePath = $request->file($imageField)->store('doctors', 'public');
                $doctor->{$imageField} = $imagePath;
            }
        }

        $doctor->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الطبيب بنجاح',
            'data' => $doctor,
        ]);
    }

    /**
     * حذف طبيب وصوره
     */
    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);

        if ($doctor->image && Storage::disk('public')->exists($doctor->image)) {
            Storage::disk('public')->delete($doctor->image);
        }

        for ($i = 1; $i <= 5; $i++) {
            $imageField = "image-$i";
            if (Schema::hasColumn('doctors', $imageField) && $doctor->{$imageField} && Storage::disk('public')->exists($doctor->{$imageField})) {
                Storage::disk('public')->delete($doctor->{$imageField});
            }
        }

        $doctor->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الطبيب بنجاح',
        ]);
    }
}
