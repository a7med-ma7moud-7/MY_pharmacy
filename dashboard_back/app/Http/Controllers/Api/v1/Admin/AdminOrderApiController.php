<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AdminOrderApiController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    /**
     * استعراض قائمة الطلبات مع الترقيم والبحث والتصفية
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 100);

        $orders = Order::with('items.medicine')
            ->filter($request->only(['status', 'search', 'delivery_method', 'from_date', 'to_date']))
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return $this->paginatedResponse($orders);
    }

    /**
     * تفاصيل طلب محدد مع محتوياته وروابط صور الأدوية
     */
    public function show($id): JsonResponse
    {
        $order = Order::with('items.medicine')->findOrFail($id);

        $order->items->each(function ($item) {
            if ($item->medicine) {
                $item->medicine->image_url = $item->medicine->image_url;
            }
        });

        return $this->successResponse([
            'data' => $order,
        ]);
    }

    /**
     * تحديث حالة الطلب مع المزامنة الذرية التلقائية للمخزون عند الإلغاء أو إعادة التفعيل
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);

        try {
            $updatedOrder = $this->orderService->updateOrderStatusWithStockSync($order, $validated['status']);

            return $this->successResponse([
                'message' => 'تم تحديث حالة الطلب بنجاح',
                'data' => $updatedOrder,
            ]);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * تصدير قائمة الطلبات إلى ملف Excel
     */
    public function export()
    {
        return Excel::download(new OrdersExport, 'orders.xlsx');
    }
}
