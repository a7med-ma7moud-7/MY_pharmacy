<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AdminOrderApiController extends Controller
{
    /**
     * استعراض قائمة الطلبات مع الترقيم والبحث والتصفية
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);

        $orders = Order::with('items.medicine')
            ->filter($request->only(['status', 'search']))
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return $this->paginatedResponse($orders);
    }

    /**
     * تفاصيل طلب محدد مع محتوياته
     */
    public function show($id): JsonResponse
    {
        $order = Order::with('items.medicine')->findOrFail($id);

        return $this->successResponse([
            'data' => $order,
        ]);
    }

    /**
     * تحديث حالة الطلب
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $validated['status'];
        $order->save();

        return $this->successResponse([
            'message' => 'تم تحديث حالة الطلب بنجاح',
            'data' => $order->load('items.medicine'),
        ]);
    }

    /**
     * تصدير قائمة الطلبات إلى ملف Excel
     */
    public function export()
    {
        return Excel::download(new OrdersExport, 'orders.xlsx');
    }
}
