<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderApiController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    /**
     * حفظ طلب شراء أدوية جديد
     */
    public function store(Request $request): JsonResponse
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

        $cartItems = $this->orderService->parseCartItems($validated['cart_items']);

        if (empty($cartItems)) {
            return $this->errorResponse('السلة فارغة. يرجى إضافة عناصر أولاً.', 422);
        }

        try {
            $order = $this->orderService->createOrder($validated, $cartItems);

            return $this->successResponse([
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
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        } catch (\Throwable $e) {
            return $this->errorResponse('حدث خطأ أثناء حفظ الطلب: ' . $e->getMessage(), 500);
        }
    }

    /**
     * فحص وتتبع حالة الطلب
     */
    public function check(Request $request): JsonResponse
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
            return $this->errorResponse(
                'لم يتم العثور على الطلب. يرجى التأكد من رقم الطلب ورقم الهاتف.',
                404
            );
        }

        return $this->successResponse([
            'order' => $order,
        ]);
    }
}
