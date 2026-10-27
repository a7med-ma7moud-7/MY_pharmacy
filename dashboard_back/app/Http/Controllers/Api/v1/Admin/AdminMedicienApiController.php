<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminMedicienApiController extends Controller
{
    /**
     * قائمة الأدوية مع الترقيم والبحث والتصفية
     */
    public function index(Request $request)
    {
        $query = Medicien::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('propose', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->integer('per_page', 10);
        $medicines = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $medicines->items(),
            'current_page' => $medicines->currentPage(),
            'last_page' => $medicines->lastPage(),
            'per_page' => $medicines->perPage(),
            'total' => $medicines->total(),
        ]);
    }

    /**
     * تفاصيل صنف دواء
     */
    public function show($id)
    {
        $medicine = Medicien::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $medicine,
        ]);
    }

    /**
     * إضافة دواء جديد
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'propose' => 'required|string|max:225',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:225',
            'count' => 'required|numeric|min:0',
        ]);

        $medicien = new Medicien($validatedData);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('medicines', 'public');
            $medicien->image = $imagePath;
        }

        $medicien->save();

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الدواء بنجاح',
            'data' => $medicien,
        ], 201);
    }

    /**
     * تحديث بيانات وصورة الدواء
     */
    public function update(Request $request, $id)
    {
        $medicien = Medicien::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'propose' => 'sometimes|required|string|max:225',
            'price' => 'sometimes|required|numeric|min:0',
            'type' => 'sometimes|required|string|max:225',
            'count' => 'sometimes|required|numeric|min:0',
        ]);

        $medicien->fill($request->except('image'));

        if ($request->hasFile('image')) {
            if ($medicien->image && Storage::disk('public')->exists($medicien->image)) {
                Storage::disk('public')->delete($medicien->image);
            }
            $imagePath = $request->file('image')->store('medicines', 'public');
            $medicien->image = $imagePath;
        }

        $medicien->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الدواء بنجاح',
            'data' => $medicien,
        ]);
    }

    /**
     * تحديث سريع لكمية المخزون
     */
    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'count' => 'required|numeric|min:0',
        ]);

        $medicien = Medicien::findOrFail($id);
        $medicien->count = $request->count;
        $medicien->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المخزون بنجاح',
            'data' => $medicien,
        ]);
    }

    /**
     * حذف صنف دواء
     */
    public function destroy($id)
    {
        $medicien = Medicien::findOrFail($id);

        if ($medicien->image && Storage::disk('public')->exists($medicien->image)) {
            Storage::disk('public')->delete($medicien->image);
        }

        $medicien->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الدواء بنجاح',
        ]);
    }
}
