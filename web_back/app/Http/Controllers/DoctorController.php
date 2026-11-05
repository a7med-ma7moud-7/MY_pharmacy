<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = Doctor::paginate(10);
        return view('doctor.index', compact('doctors'));
    }

    public function create()
    {
        return view('doctor.create');
    }

    public function store(StoreDoctorRequest $request)
    {
        $validatedData = $request->validated();

        $doctor = new Doctor(collect($validatedData)->except('image')->toArray());
        $doctor->syncUploadedImages($request);
        $doctor->save();

        return redirect()->route('doctor.index')->with('success', 'تم إضافة الطبيب بنجاح');
    }

    public function edit(string $id)
    {
        $doctor = Doctor::findOrFail($id);
        return view('doctor.edit', compact('doctor'));
    }

    public function update(Request $request, string $id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->fill($request->except(['image', 'image-1', 'image-2', 'image-3', 'image-4', 'image-5']));
        $doctor->syncUploadedImages($request);
        $doctor->save();

        return redirect()->route('doctor.index')->with('success', 'تم تحديث بيانات الطبيب بنجاح');
    }

    public function destroy(string $id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->deleteAllStoredImages();
        $doctor->delete();

        return redirect()->route('doctor.index')->with('success', 'تم حذف الطبيب بنجاح');
    }

    public function show(string $id)
    {
        $doctor = Doctor::findOrFail($id);
        $ratings = $doctor->ratings()->with('user')->latest()->get();
        $averageRating = $ratings->avg('rating');
        $ratingsCount = $ratings->count();

        return view('doctor.show', compact('doctor', 'ratings', 'averageRating', 'ratingsCount'));
    }
}
