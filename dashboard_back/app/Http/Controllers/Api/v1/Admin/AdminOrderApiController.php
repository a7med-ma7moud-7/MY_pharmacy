<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class AdminOrderApiController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

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

    private function scopeOrderPayload(Order $order, ?int $scopedPharmacyId): Order
    {
        if ($order->relationLoaded('items')) {
            if ($scopedPharmacyId !== null) {
                $filtered = $order->items->filter(static function ($item) use ($scopedPharmacyId) {
                    $itemPid = $item->pharmacy_id ?? $item->medicine?->pharmacy_id;
                    return (int) $itemPid === $scopedPharmacyId;
                })->values();

                // If order was directly assigned to pharmacy_id without item-level pharmacy_id
                if ($filtered->isEmpty() && (int) $order->pharmacy_id === $scopedPharmacyId) {
                    $filtered = $order->items;
                }

                $order->setRelation('items', $filtered);
                $scopedTotal = round((float) $filtered->sum(static fn ($i) => (float) ($i->total ?: ($i->price * $i->quantity))), 2);
                if ($scopedTotal > 0) {
                    $order->total_price = $scopedTotal;
                }
            }

            $order->items->each(static function ($item) {
                if ($item->medicine) {
                    $item->medicine->image_url = $item->medicine->image_url;
                }
            });
        }

        // Resolve display pharmacy if not directly set on order header
        if (!$order->pharmacy && $order->relationLoaded('items')) {
            $firstPharm = $order->items->map(static fn ($i) => $i->medicine?->pharmacy)->filter()->first();
            if ($firstPharm) {
                $order->setRelation('pharmacy', $firstPharm);
            }
        }

        return $order;
    }

    /**
     * استعراض قائمة الطلبات مع الترقيم والبحث والتصفية (معزولة لكل صيدلية)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 100);
        $scopedPharmacyId = $this->currentPharmacyId();

        $filters = $request->only(['status', 'search', 'delivery_method', 'from_date', 'to_date', 'pharmacy_id']);
        if ($scopedPharmacyId !== null) {
            unset($filters['pharmacy_id']);
        }

        $query = Order::with(['pharmacy:id,name,city', 'items.medicine.pharmacy:id,name']);
        if ($scopedPharmacyId !== null) {
            $query->forPharmacy($scopedPharmacyId);
        }

        $orders = $query
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $orders->getCollection()->transform(fn (Order $o) => $this->scopeOrderPayload($o, $scopedPharmacyId));

        $metaQuery = Order::query();
        if ($scopedPharmacyId !== null) {
            $metaQuery->forPharmacy($scopedPharmacyId);
        } elseif (!empty($filters['pharmacy_id']) && !in_array((string) $filters['pharmacy_id'], ['all', 'الكل'], true)) {
            $metaQuery->forPharmacy((int) $filters['pharmacy_id']);
        }

        $summary = $metaQuery->selectRaw("
            COUNT(*) as total_orders,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_orders,
            COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as processing_orders,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_orders,
            COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_orders
        ")->first();

        return $this->paginatedResponse($orders, [
            'meta' => [
                'scoped_pharmacy_id' => $scopedPharmacyId,
                'total_orders' => (int) ($summary->total_orders ?? 0),
                'pending_orders' => (int) ($summary->pending_orders ?? 0),
                'processing_orders' => (int) ($summary->processing_orders ?? 0),
                'completed_orders' => (int) ($summary->completed_orders ?? 0),
                'cancelled_orders' => (int) ($summary->cancelled_orders ?? 0),
            ],
        ]);
    }

    /**
     * تفاصيل طلب محدد (معزول للصيدلية المالكة فقط)
     */
    public function show($id): JsonResponse
    {
        $scopedPharmacyId = $this->currentPharmacyId();

        $order = Order::with(['pharmacy:id,name,city,address,phone', 'items.medicine.pharmacy:id,name'])
            ->when($scopedPharmacyId !== null, static fn ($q) => $q->forPharmacy($scopedPharmacyId))
            ->findOrFail($id);

        $this->scopeOrderPayload($order, $scopedPharmacyId);

        return $this->successResponse([
            'data' => $order,
        ]);
    }

    /**
     * تحديث حالة الطلب مع المزامنة الذرية التلقائية للمخزون
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $scopedPharmacyId = $this->currentPharmacyId();

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order = Order::query()
            ->when($scopedPharmacyId !== null, static fn ($q) => $q->forPharmacy($scopedPharmacyId))
            ->findOrFail($id);

        try {
            $updatedOrder = $this->orderService->updateOrderStatusWithStockSync(
                $order,
                $validated['status'],
                $scopedPharmacyId
            );
            $updatedOrder->loadMissing(['pharmacy:id,name,city', 'items.medicine.pharmacy:id,name']);
            $this->scopeOrderPayload($updatedOrder, $scopedPharmacyId);

            return $this->successResponse([
                'message' => 'تم تحديث حالة الطلب بنجاح',
                'data' => $updatedOrder,
            ]);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * تصدير قائمة الطلبات إلى ملف Excel (معزولة للصيدلية عند التصدير من حساب الصيدلية)
     */
    public function export()
    {
        $scopedPharmacyId = $this->currentPharmacyId();

        return Excel::download(new OrdersExport($scopedPharmacyId), 'orders.xlsx');
    }
}
