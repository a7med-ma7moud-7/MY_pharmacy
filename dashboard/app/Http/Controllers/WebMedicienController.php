<?php

namespace App\Http\Controllers;

use App\Models\Medicien;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use App\Notifications\NewOrderNotification;
use App\Models\Admin;
use App\Models\User;

class WebMedicienController extends BaseController
{
    use AuthorizesRequests, ValidatesRequests, DispatchesJobs;
    
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
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeOrder(Request $request)
    {
        // التحقق من البيانات المدخلة
        $validated = $request->validate([
            'cart_items' => 'required|string',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'delivery_method' => 'required|in:delivery,pickup',
            'notes' => 'nullable|string',
        ]);
        
        // تحويل البيانات إلى كائن
        $cartItems = json_decode($request->cart_items);
        
        // إنشاء طلب جديد
        $order = Order::create([
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'customer_email' => $request->customer_email,
            'address' => $request->address,
            'delivery_method' => $request->delivery_method,
            'notes' => $request->notes,
            'status' => 'pending',
            'total_price' => 0, // سيتم تحديثه لاحقًا
        ]);
        // حساب المجموع الكلي وإضافة العناصر
        $totalPrice = 0;
        foreach ($cartItems as $item) {
            // التحقق من وجود كمية كافية
            $medicine = Medicien::find($item->id);
            if (!$medicine || $medicine->count < $item->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'الكمية المطلوبة غير متوفرة للدواء: ' . ($medicine ? $medicine->name : 'غير معروف'),
                ], 400);
            }
            
            // إنشاء سجل لعنصر الطلب
            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'medicine_id' => $item->id,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'total' => $item->total,
            ]);
            
            // تحديث كمية المنتج بعد عملية الشراء
            $medicine->decrement('count', $item->quantity);
            
            $totalPrice += $item->total;
        }
        
        // تحديث إجمالي الطلب
        $order->total_price = $totalPrice;
        $order->save();
        
        // إرسال الإشعار
        foreach (User::where('role', 'admin')->get() as $user) {
            $user->notify(new NewOrderNotification($order));
        }
        
        // إرجاع الاستجابة
        return response()->json([
            'success' => true,
            'message' => 'تم استلام طلبك بنجاح',
            'order' => [
                'id' => $order->id,
                'total' => $order->total_price,
            ],
        ]);
    }

    /**
     * البحث عن الأدوية
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $type = $request->input('type', 'all');
        $types = Medicien::distinct('type')->pluck('type')->toArray();
        $mediciens = Medicien::when($query, function($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%')
                  ->orWhere('propose', 'like', '%' . $query . '%');
            })
            ->when($type != 'all', function($q) use ($type) {
                $q->where('type', $type);
            })
            ->paginate(6);
        return view('webmedicien.index', compact('mediciens', 'types'));
    }

    /**
     * عرض صفحة حالة الطلب
     *
     * @return \Illuminate\View\View
     */
    public function orderStatus()
    {
        return view('webmedicien.order-status');
    }

    /**
     * التحقق من حالة الطلب
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function checkOrder(Request $request)
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
            return back()->with('error', 'لم يتم العثور على الطلب. يرجى التأكد من رقم الطلب ورقم الهاتف.');
        }

        return view('webmedicien.order-details', compact('order'));
    }
}

