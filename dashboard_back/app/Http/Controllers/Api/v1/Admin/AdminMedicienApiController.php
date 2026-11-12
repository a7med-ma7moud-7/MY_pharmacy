<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMedicienApiController extends Controller
{
    /**
     * قائمة الأدوية مع الترقيم والبحث والتصفية والترتيب
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 100);

        $medicines = Medicien::query()
            ->filter($request->only(['search', 'type', 'in_stock', 'low_stock']), searchByType: true)
            ->sortBy($request->query('sort'), latestDefault: true)
            ->paginate($perPage);

        $medicines->getCollection()->transform(function (Medicien $medicine) {
            $medicine->image_url = $medicine->image_url;
            $medicine->is_in_stock = $medicine->is_in_stock;
            return $medicine;
        });

        return $this->paginatedResponse($medicines);
    }

    /**
     * تفاصيل صنف دواء
     */
    public function show($id): JsonResponse
    {
        $medicine = Medicien::findOrFail($id);
        $medicine->image_url = $medicine->image_url;
        $medicine->is_in_stock = $medicine->is_in_stock;

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
            'count' => 'required|integer|min:0',
        ]);

        $medicien = new Medicien(collect($validatedData)->except('image')->toArray());
        $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines');
        $medicien->save();
        $medicien->image_url = $medicien->image_url;
        $medicien->is_in_stock = $medicien->is_in_stock;

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
            'count' => 'sometimes|required|integer|min:0',
        ]);

        $medicien->fill(collect($validatedData)->except('image')->toArray());

        if ($request->hasFile('image')) {
            $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines', $medicien->image);
        }

        $medicien->save();
        $medicien->image_url = $medicien->image_url;
        $medicien->is_in_stock = $medicien->is_in_stock;

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
            'count' => 'required|integer|min:0',
        ]);

        $medicien = Medicien::findOrFail($id);
        $medicien->count = $validated['count'];
        $medicien->save();
        $medicien->image_url = $medicien->image_url;
        $medicien->is_in_stock = $medicien->is_in_stock;

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
