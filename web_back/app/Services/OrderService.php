<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Medicien;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use DomainException;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * تحويل عناصر السلة من JSON أو مصفوفة إلى مصفوفة كائنات موحدة
     */
    public function parseCartItems(mixed $rawCartItems): array
    {
        $decoded = is_string($rawCartItems)
            ? json_decode($rawCartItems)
            : json_decode(json_encode($rawCartItems));

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * إنشاء طلب جديد مع التحقق الذري المجمع وحساب الأسعار حصرياً من قاعدة البيانات لمنع التلاعب
     *
     * @throws DomainException في حال عدم توفر الكمية المطلوبة لأي دواء
     */
    public function createOrder(array $customerData, array $cartItems): Order
    {
        $order = DB::transaction(function () use ($customerData, $cartItems) {
            $normalizedItems = [];
            $requiredQuantities = [];

            foreach ($cartItems as $rawItem) {
                $item = (object) $rawItem;
                $medicineId = isset($item->id) ? (int) $item->id : 0;
                $quantity = max(1, (int) ($item->quantity ?? 1));

                if ($medicineId <= 0) {
                    throw new DomainException('بيانات أحد الأدوية في السلة غير صالحة.');
                }

                $normalizedItems[] = [
                    'id' => $medicineId,
                    'quantity' => $quantity,
                ];

                $requiredQuantities[$medicineId] = ($requiredQuantities[$medicineId] ?? 0) + $quantity;
            }

            // استعلام واحد مجمع مع قفل الصفوف لمنع N+1 والـ Race Conditions
            $medicines = Medicien::whereIn('id', array_keys($requiredQuantities))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $preparedItems = [];
            $totalPrice = 0.0;

            foreach ($normalizedItems as $entry) {
                /** @var Medicien|null $medicine */
                $medicine = $medicines->get($entry['id']);
                $totalRequestedForMedicine = $requiredQuantities[$entry['id']] ?? $entry['quantity'];

                if (!$medicine || (int) $medicine->count < $totalRequestedForMedicine) {
                    throw new DomainException(
                        'الكمية المطلوبة غير متوفرة للدواء: ' . ($medicine ? $medicine->name : 'غير معروف')
                    );
                }

                // الاعتماد الحصري على سعر قاعدة البيانات لمنع أي تلاعب من جهة العميل
                $unitPrice = (float) $medicine->price;
                $lineTotal = round($unitPrice * $entry['quantity'], 2);

                $preparedItems[] = [
                    'medicine' => $medicine,
                    'quantity' => $entry['quantity'],
                    'price' => $unitPrice,
                    'total' => $lineTotal,
                ];

                $totalPrice += $lineTotal;
            }

            $order = Order::create([
                'customer_name' => trim((string) $customerData['customer_name']),
                'customer_phone' => trim((string) $customerData['customer_phone']),
                'customer_email' => !empty($customerData['customer_email'])
                    ? strtolower(trim((string) $customerData['customer_email']))
                    : null,
                'address' => trim((string) $customerData['address']),
                'delivery_method' => $customerData['delivery_method'],
                'notes' => $customerData['notes'] ?? null,
                'status' => 'pending',
                'total_price' => round($totalPrice, 2),
            ]);

            $now = now();
            $orderItemsRows = [];

            foreach ($preparedItems as $entry) {
                $orderItemsRows[] = [
                    'order_id' => $order->id,
                    'medicine_id' => $entry['medicine']->id,
                    'quantity' => $entry['quantity'],
                    'price' => $entry['price'],
                    'total' => $entry['total'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            foreach ($requiredQuantities as $medicineId => $qtyToDeduct) {
                $medicines->get($medicineId)?->decrement('count', $qtyToDeduct);
            }

            // إدراج مجمع (Bulk Insert) لعناصر الطلب في استعلام واحد
            OrderItem::insert($orderItemsRows);

            return $order;
        });

        User::notifyAdmins(new NewOrderNotification($order));

        return $order;
    }

    /**
     * تحديث حالة الطلب مع مزامنة المخزون تلقائياً عند الإلغاء أو إعادة التفعيل
     *
     * @throws DomainException في حال عدم كفاية المخزون عند إعادة تفعيل طلب ملغي
     */
    public function updateOrderStatusWithStockSync(Order $order, string $newStatus): Order
    {
        return DB::transaction(function () use ($order, $newStatus) {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::with('items')->lockForUpdate()->findOrFail($order->id);
            $previousStatus = (string) $lockedOrder->status;

            if ($previousStatus === $newStatus) {
                return $lockedOrder->load('items.medicine');
            }

            $medicineQuantities = [];
            foreach ($lockedOrder->items as $item) {
                if ($item->medicine_id) {
                    $medicineQuantities[(int) $item->medicine_id] =
                        ($medicineQuantities[(int) $item->medicine_id] ?? 0) + (int) $item->quantity;
                }
            }

            if (!empty($medicineQuantities)) {
                $medicines = Medicien::whereIn('id', array_keys($medicineQuantities))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                // إذا تم إلغاء طلب نشط -> إرجاع الكميات إلى المخزون
                if ($previousStatus !== 'cancelled' && $newStatus === 'cancelled') {
                    foreach ($medicineQuantities as $medId => $qty) {
                        $medicines->get($medId)?->increment('count', $qty);
                    }
                }

                // إذا أُعيد تفعيل طلب كان ملغياً -> التحقق من توفر الكميات وخصمها مجدداً
                if ($previousStatus === 'cancelled' && $newStatus !== 'cancelled') {
                    foreach ($medicineQuantities as $medId => $qty) {
                        $medicine = $medicines->get($medId);
                        if (!$medicine || (int) $medicine->count < $qty) {
                            throw new DomainException(
                                'لا يمكن إعادة تفعيل الطلب لعدم كفاية مخزون الدواء: ' . ($medicine ? $medicine->name : "#{$medId}")
                            );
                        }
                    }

                    foreach ($medicineQuantities as $medId => $qty) {
                        $medicines->get($medId)?->decrement('count', $qty);
                    }
                }
            }

            $lockedOrder->status = $newStatus;
            $lockedOrder->save();

            return $lockedOrder->load('items.medicine');
        });
    }
}
