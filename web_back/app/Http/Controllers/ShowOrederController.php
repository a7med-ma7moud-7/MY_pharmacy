<?php

namespace App\Http\Controllers;

use App\Exports\OrdersExport;
use App\Models\Order;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ShowOrederController extends Controller
{
    /**
     * عرض قائمة الطلبات في لوحة التحكم
     */
    public function index()
    {
        $orders = Order::orderBy('created_at', 'desc')->paginate(10);
        return view('admin.orders.index', compact('orders'));
    }

    /**
     * عرض تفاصيل طلب محدد
     */
    public function show($id)
    {
        $order = Order::with('items.medicine')->findOrFail($id);
        return view('admin.orders.show', compact('order'));
    }

    /**
     * تغيير حالة الطلب
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $validated['status'];
        $order->save();

        return redirect()->back()->with('success', 'تم تحديث حالة الطلب بنجاح');
    }

    /**
     * تصدير قائمة الطلبات إلى ملف Excel
     */
    public function export()
    {
        return Excel::download(new OrdersExport, 'orders.xlsx');
    }

    /**
     * البحث في الطلبات
     */
    public function search(Request $request)
    {
        $keyword = $request->get('keyword');

        $orders = Order::query()
            ->filter(['keyword' => $keyword])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('admin.orders.index', compact('orders', 'keyword'));
    }
}
