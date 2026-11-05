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
     * إنشاء طلب جديد مع التحقق الذري المجمع (Batch Query + Bulk Insert) داخل Transaction
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

                $normalizedItems[] = [
                    'id' => $medicineId,
                    'quantity' => $quantity,
                    'price' => $item->price ?? null,
                    'total' => $item->total ?? null,
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

                $unitPrice = $entry['price'] !== null ? (float) $entry['price'] : (float) $medicine->price;
                $lineTotal = $entry['total'] !== null ? (float) $entry['total'] : ($unitPrice * $entry['quantity']);

                $preparedItems[] = [
                    'medicine' => $medicine,
                    'quantity' => $entry['quantity'],
                    'price' => $unitPrice,
                    'total' => $lineTotal,
                ];

                $totalPrice += $lineTotal;
            }

            $order = Order::create([
                'customer_name' => $customerData['customer_name'],
                'customer_phone' => $customerData['customer_phone'],
                'customer_email' => $customerData['customer_email'] ?? null,
                'address' => $customerData['address'],
                'delivery_method' => $customerData['delivery_method'],
                'notes' => $customerData['notes'] ?? null,
                'status' => 'pending',
                'total_price' => $totalPrice,
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

                $entry['medicine']->decrement('count', $entry['quantity']);
            }

            // إدراج مجمع (Bulk Insert) لعناصر الطلب في استعلام واحد
            OrderItem::insert($orderItemsRows);

            return $order;
        });

        User::notifyAdmins(new NewOrderNotification($order));

        return $order;
    }
}
