<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMedicienApiController extends Controller
{
    private function currentPharmacyId(): ?int
    {
        /** @var User|null $user */
        $user = Auth::user();
        if ($user && $user->isPharmacy()) {
            $pharm = $user->relationLoaded('pharmacy') ? $user->pharmacy : $user->pharmacy()->first();
            return $pharm ? (int) $pharm->id : -1;
        }

        return null;
    }

    /**
     * قائمة الأدوية مع الترقيم والبحث والتصفية والترتيب (معزولة لكل صيدلية عند دخول حساب صيدلية)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 100);
        $scopedPharmacyId = $this->currentPharmacyId();

        $filters = $request->only(['search', 'type', 'in_stock', 'low_stock', 'pharmacy_id']);
        if ($scopedPharmacyId !== null) {
            $filters['pharmacy_id'] = $scopedPharmacyId;
        }

        $medicines = Medicien::query()
            ->with('pharmacy:id,name,city,latitude,longitude,is_active')
            ->filter($filters, searchByType: true)
            ->sortBy($request->query('sort'), latestDefault: true)
            ->paginate($perPage);

        $medicines->getCollection()->transform(function (Medicien $medicine) {
            $medicine->image_url = $medicine->image_url;
            $medicine->is_in_stock = $medicine->is_in_stock;
            return $medicine;
        });

        // Summary metrics scoped to active pharmacy (or selected pharmacy filter)
        $statsBase = Medicien::query();
        if (!empty($filters['pharmacy_id']) && !in_array((string) $filters['pharmacy_id'], ['all', 'الكل'], true)) {
            $statsBase->where('pharmacy_id', (int) $filters['pharmacy_id']);
        }
        $agg = $statsBase->selectRaw('
            COUNT(*) as total_medicines,
            COALESCE(SUM(count), 0) as total_units,
            COALESCE(SUM(CASE WHEN count > 5 THEN 1 ELSE 0 END), 0) as healthy_stock_count,
            COALESCE(SUM(CASE WHEN count BETWEEN 1 AND 5 THEN 1 ELSE 0 END), 0) as low_stock_count,
            COALESCE(SUM(CASE WHEN count <= 0 THEN 1 ELSE 0 END), 0) as out_of_stock_count
        ')->first();

        return $this->paginatedResponse($medicines, [
            'meta' => [
                'scoped_pharmacy_id' => $scopedPharmacyId,
                'total_medicines' => (int) ($agg->total_medicines ?? 0),
                'total_units' => (int) ($agg->total_units ?? 0),
                'healthy_stock_count' => (int) ($agg->healthy_stock_count ?? 0),
                'low_stock_count' => (int) ($agg->low_stock_count ?? 0),
                'out_of_stock_count' => (int) ($agg->out_of_stock_count ?? 0),
            ],
        ]);
    }

    /**
     * تفاصيل صنف دواء (معزول للصيدلية المالكة)
     */
    public function show($id): JsonResponse
    {
        $scopedPharmacyId = $this->currentPharmacyId();

        $medicine = Medicien::with('pharmacy:id,name,city,latitude,longitude,is_active')
            ->when($scopedPharmacyId !== null, static fn ($q) => $q->where('pharmacy_id', $scopedPharmacyId))
            ->findOrFail($id);

        $medicine->image_url = $medicine->image_url;
        $medicine->is_in_stock = $medicine->is_in_stock;

        return $this->successResponse([
            'data' => $medicine,
        ]);
    }

    /**
     * إضافة دواء جديد (يُربط تلقائياً بالصيدلية المسجلة، أو يحدد السوبر أدمن الصيدلية)
     */
    public function store(Request $request): JsonResponse
    {
        $scopedPharmacyId = $this->currentPharmacyId();

        $validatedData = $request->validate([
            'pharmacy_id' => 'nullable|integer|exists:pharmacies,id',
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'propose' => 'required|string|max:225',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:225',
            'count' => 'required|integer|min:0',
        ]);

        $payload = collect($validatedData)->except(['image', 'pharmacy_id'])->toArray();
        $payload['pharmacy_id'] = $scopedPharmacyId !== null
            ? $scopedPharmacyId
            : ($validatedData['pharmacy_id'] ?? null);

        $medicien = new Medicien($payload);
        $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines');
        $medicien->save();
        $medicien->load('pharmacy:id,name,city,latitude,longitude,is_active');
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
        $scopedPharmacyId = $this->currentPharmacyId();

        $medicien = Medicien::query()
            ->when($scopedPharmacyId !== null, static fn ($q) => $q->where('pharmacy_id', $scopedPharmacyId))
            ->findOrFail($id);

        $validatedData = $request->validate([
            'pharmacy_id' => 'nullable|integer|exists:pharmacies,id',
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'propose' => 'sometimes|required|string|max:225',
            'price' => 'sometimes|required|numeric|min:0',
            'type' => 'sometimes|required|string|max:225',
            'count' => 'sometimes|required|integer|min:0',
        ]);

        $payload = collect($validatedData)->except(['image', 'pharmacy_id'])->toArray();
        if ($scopedPharmacyId === null && $request->has('pharmacy_id')) {
            $payload['pharmacy_id'] = $validatedData['pharmacy_id'] ?? null;
        }

        $medicien->fill($payload);

        if ($request->hasFile('image')) {
            $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines', $medicien->image);
        }

        $medicien->save();
        $medicien->load('pharmacy:id,name,city,latitude,longitude,is_active');
        $medicien->image_url = $medicien->image_url;
        $medicien->is_in_stock = $medicien->is_in_stock;

        return $this->successResponse([
            'message' => 'تم تحديث بيانات الدواء بنجاح',
            'data' => $medicien,
        ]);
    }

    /**
     * تحديث سريع لكمية المخزون الخاص بالصيدلية
     */
    public function updateStock(Request $request, $id): JsonResponse
    {
        $scopedPharmacyId = $this->currentPharmacyId();

        $validated = $request->validate([
            'count' => 'required|integer|min:0',
        ]);

        $medicien = Medicien::query()
            ->when($scopedPharmacyId !== null, static fn ($q) => $q->where('pharmacy_id', $scopedPharmacyId))
            ->findOrFail($id);

        $medicien->count = $validated['count'];
        $medicien->save();
        $medicien->load('pharmacy:id,name,city,latitude,longitude,is_active');
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
        $scopedPharmacyId = $this->currentPharmacyId();

        $medicien = Medicien::query()
            ->when($scopedPharmacyId !== null, static fn ($q) => $q->where('pharmacy_id', $scopedPharmacyId))
            ->findOrFail($id);

        $medicien->deleteStoredImage($medicien->image);
        $medicien->delete();

        return $this->successResponse([
            'message' => 'تم حذف الدواء بنجاح',
        ]);
    }
}
