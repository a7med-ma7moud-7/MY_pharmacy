<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use Illuminate\Http\Request;

class MedicienApiController extends Controller
{
    /**
     * قائمة الأدوية مع الفلترة والبحث
     */
    public function index(Request $request)
    {
        $query = Medicien::query();

        // البحث بالاسم أو الغرض الطبي
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('propose', 'like', '%' . $search . '%');
            });
        }

        // التصفية بالنوع / التصنيف
        if ($request->filled('type') && $request->type !== 'all' && $request->type !== 'الكل') {
            $query->where('type', $request->type);
        }

        $perPage = (int) $request->input('per_page', 8);
        $medicines = $query->paginate($perPage);

        // إضافة رابط الصورة وحالة التوفر
        $medicines->getCollection()->transform(function ($medicine) {
            $medicine->image_url = $this->resolveImageUrl($medicine->image);
            $medicine->is_in_stock = $medicine->count > 0;
            return $medicine;
        });

        // قائمة التصنيفات المتاحة
        $types = Medicien::distinct()->whereNotNull('type')->pluck('type');

        return response()->json([
            'success' => true,
            'data' => $medicines,
            'types' => $types,
        ]);
    }

    /**
     * تفاصيل دواء محدد
     */
    public function show($id)
    {
        $medicine = Medicien::findOrFail($id);
        $medicine->image_url = $this->resolveImageUrl($medicine->image);
        $medicine->is_in_stock = $medicine->count > 0;

        // أدوية مشابهة من نفس التصنيف
        $related = Medicien::where('type', $medicine->type)
            ->where('id', '!=', $medicine->id)
            ->limit(4)
            ->get()
            ->map(function ($item) {
                $item->image_url = $this->resolveImageUrl($item->image);
                return $item;
            });

        return response()->json([
            'success' => true,
            'data' => [
                'medicine' => $medicine,
                'related' => $related,
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
