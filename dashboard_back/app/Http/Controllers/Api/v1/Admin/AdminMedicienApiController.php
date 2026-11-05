<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMedicienApiController extends Controller
{
    /**
     * قائمة الأدوية مع الترقيم والبحث والتصفية
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);

        $medicines = Medicien::query()
            ->filter($request->only(['search', 'type']), searchByType: true)
            ->latest()
            ->paginate($perPage);

        return $this->paginatedResponse($medicines);
    }

    /**
     * تفاصيل صنف دواء
     */
    public function show($id): JsonResponse
    {
        $medicine = Medicien::findOrFail($id);

        return $this->successResponse([
            'data' => $medicine,
        ]);
    }

    /**
     * إضافة دواء جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'propose' => 'required|string|max:225',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:225',
            'count' => 'required|numeric|min:0',
        ]);

        $medicien = new Medicien(collect($validatedData)->except('image')->toArray());
        $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines');
        $medicien->save();

        return $this->successResponse([
            'message' => 'تم إضافة الدواء بنجاح',
            'data' => $medicien,
        ], 201);
    }

    /**
     * تحديث بيانات وصورة الدواء
     */
    public function update(Request $request, $id): JsonResponse
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

        $medicien->fill(collect($validatedData)->except('image')->toArray());

        if ($request->hasFile('image')) {
            $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines', $medicien->image);
        }

        $medicien->save();

        return $this->successResponse([
            'message' => 'تم تحديث بيانات الدواء بنجاح',
            'data' => $medicien,
        ]);
    }

    /**
     * تحديث سريع لكمية المخزون
     */
    public function updateStock(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'count' => 'required|numeric|min:0',
        ]);

        $medicien = Medicien::findOrFail($id);
        $medicien->count = $validated['count'];
        $medicien->save();

        return $this->successResponse([
            'message' => 'تم تحديث المخزون بنجاح',
            'data' => $medicien,
        ]);
    }

    /**
     * حذف صنف دواء
     */
    public function destroy($id): JsonResponse
    {
        $medicien = Medicien::findOrFail($id);
        $medicien->deleteStoredImage($medicien->image);
        $medicien->delete();

        return $this->successResponse([
            'message' => 'تم حذف الدواء بنجاح',
        ]);
    }
}
