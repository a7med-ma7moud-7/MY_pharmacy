<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderApiController extends Controller
{
    /**
     * حفظ طلب شراء أدوية جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cart_items' => 'required',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'delivery_method' => 'required|in:delivery,pickup',
            'notes' => 'nullable|string',
        ]);

        // دعم استقبال cart_items كسلسلة JSON أو كمصفوفة مباشرة من Axios
        $rawCartItems = $request->cart_items;
        $cartItems = is_string($rawCartItems) ? json_decode($rawCartItems) : json_decode(json_encode($rawCartItems));

        if (!is_array($cartItems) || empty($cartItems)) {
            return response()->json([
                'success' => false,
                'message' => 'السلة فارغة. يرجى إضافة عناصر أولاً.',
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $cartItems) {
                // إنشاء الطلب
                $order = Order::create([
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->customer_phone,
                    'customer_email' => $request->customer_email,
                    'address' => $request->address,
                    'delivery_method' => $request->delivery_method,
                    'notes' => $request->notes,
                    'status' => 'pending',
                    'total_price' => 0,
                ]);

                $totalPrice = 0;

                foreach ($cartItems as $item) {
                    $item = (object) $item;
                    $medicine = Medicien::find($item->id);

                    if (!$medicine || $medicine->count < $item->quantity) {
                        return response()->json([
                            'success' => false,
                            'message' => 'الكمية المطلوبة غير متوفرة للدواء: ' . ($medicine ? $medicine->name : 'غير معروف'),
                        ], 400);
                    }

                    OrderItem::create([
                        'order_id' => $order->id,
                        'medicine_id' => $item->id,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'total' => $item->total ?? ($item->price * $item->quantity),
                    ]);

                    // خصم الكمية من المخزون
                    $medicine->decrement('count', $item->quantity);
                    $totalPrice += ($item->total ?? ($item->price * $item->quantity));
                }

                $order->total_price = $totalPrice;
                $order->save();

                // إرسال إشعار للإدارة
                try {
                    $admins = User::where('role', 'admin')->get();
                    foreach ($admins as $admin) {
                        $admin->notify(new NewOrderNotification($order));
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed sending order notification: ' . $e->getMessage());
                }

                return response()->json([
                    'success' => true,
                    'message' => 'تم استلام طلبك بنجاح',
                    'order' => [
                        'id' => $order->id,
                        'customer_name' => $order->customer_name,
                        'customer_phone' => $order->customer_phone,
                        'total' => $order->total_price,
                        'status' => $order->status,
                        'created_at' => $order->created_at->format('Y-m-d H:i'),
                    ],
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حفظ الطلب: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * فحص وتتبع حالة الطلب
     */
    public function check(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'phone' => 'required|string',
        ]);

        $order = Order::with('items.medicine')
            ->where('id', $request->order_id)
            ->where('customer_phone', $request->phone)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على الطلب. يرجى التأكد من رقم الطلب ورقم الهاتف.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }
}
