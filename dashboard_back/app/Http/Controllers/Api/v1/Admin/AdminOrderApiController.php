<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AdminOrderApiController extends Controller
{
    /**
     * استعراض قائمة الطلبات مع الترقيم والبحث والتصفية
     */
    public function index(Request $request)
    {
        $query = Order::with('items.medicine');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $perPage = $request->integer('per_page', 10);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
            'per_page' => $orders->perPage(),
            'total' => $orders->total(),
        ]);
    }

    /**
     * تفاصيل طلب محدد مع محتوياته
     */
    public function show($id)
    {
        $order = Order::with('items.medicine')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * تحديث حالة الطلب
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
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
