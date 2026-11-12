<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicienApiController extends Controller
{
    /**
     * قائمة الأدوية مع الفلترة والبحث والترتيب الآمن
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 8, max: 100);

        $medicines = Medicien::query()
            ->filter($request->only(['search', 'type', 'in_stock', 'low_stock']))
            ->sortBy($request->query('sort'))
            ->paginate($perPage);

        // إضافة رابط الصورة وحالة التوفر
        $medicines->getCollection()->transform(function (Medicien $medicine) {
            $medicine->image_url = $medicine->image_url;
            $medicine->is_in_stock = $medicine->is_in_stock;
            return $medicine;
        });

        return $this->successResponse([
            'data' => $medicines,
            'types' => Medicien::getAvailableTypes(),
        ]);
    }

    /**
     * تفاصيل دواء محدد مع أصناف مقترحة من نفس الفئة
     */
    public function show($id): JsonResponse
    {
        $medicine = Medicien::findOrFail($id);
        $medicine->image_url = $medicine->image_url;
        $medicine->is_in_stock = $medicine->is_in_stock;

        // أدوية مشابهة من نفس التصنيف
        $related = Medicien::where('type', $medicine->type)
            ->where('id', '!=', $medicine->id)
            ->orderByDesc('count')
            ->limit(4)
            ->get()
            ->map(function (Medicien $item) {
                $item->image_url = $item->image_url;
                $item->is_in_stock = $item->is_in_stock;
                return $item;
            });

        return $this->successResponse([
            'data' => [
                'medicine' => $medicine,
                'related' => $related,
            ],
        ]);
    }
}
