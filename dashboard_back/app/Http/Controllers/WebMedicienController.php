<?php

namespace App\Http\Controllers;

use App\Models\Medicien;
use App\Models\Order;
use App\Services\OrderService;
use DomainException;
use Illuminate\Http\Request;

class WebMedicienController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    /**
     * عرض قائمة الأدوية للزوار
     */
    public function index()
    {
        $mediciens = Medicien::paginate(6);
        $types = Medicien::distinct('type')->pluck('type')->toArray();

        return view('webmedicien.index', compact('mediciens', 'types'));
    }

    /**
     * عرض تفاصيل دواء محدد
     */
    public function show($id)
    {
        $medicien = Medicien::findOrFail($id);
        return view('webmedicien.show', compact('medicien'));
    }

    /**
     * حفظ طلب شراء أدوية جديد
     */
    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'cart_items' => 'required|string',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'delivery_method' => 'required|in:delivery,pickup',
            'notes' => 'nullable|string',
        ]);

        $cartItems = $this->orderService->parseCartItems($validated['cart_items']);

        try {
            $order = $this->orderService->createOrder($validated, $cartItems);

            return $this->successResponse([
                'message' => 'تم استلام طلبك بنجاح',
                'order' => [
                    'id' => $order->id,
                    'total' => $order->total_price,
                ],
            ]);
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * البحث عن الأدوية
     */
    public function search(Request $request)
    {
        $types = Medicien::distinct('type')->pluck('type')->toArray();
        $mediciens = Medicien::query()
            ->filter([
                'search' => $request->input('query'),
                'type' => $request->input('type', 'all'),
            ])
            ->paginate(6);

        return view('webmedicien.index', compact('mediciens', 'types'));
    }

    /**
     * عرض صفحة حالة الطلب
     */
    public function orderStatus()
    {
        return view('webmedicien.order-status');
    }

    /**
     * التحقق من حالة الطلب
     */
    public function checkOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'phone' => 'required|string',
        ]);

        $order = Order::with('items.medicine')
            ->where('id', $validated['order_id'])
            ->where('customer_phone', $validated['phone'])
            ->first();

        if (!$order) {
            return back()->with('error', 'لم يتم العثور على الطلب. يرجى التأكد من رقم الطلب ورقم الهاتف.');
        }

        return view('webmedicien.order-details', compact('order'));
    }
}
