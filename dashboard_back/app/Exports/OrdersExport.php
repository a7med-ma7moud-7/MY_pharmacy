<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromQuery, WithHeadings, WithMapping
{
    public function query()
    {
        return Order::with('items')->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'رقم الطلب',
            'اسم العميل',
            'رقم الهاتف',
            'البريد الإلكتروني',
            'طريقة التوصيل',
            'العنوان',
            'المبلغ الإجمالي',
            'الحالة',
            'تاريخ الطلب'
        ];
    }

    public function map($order): array
    {
        return [
            $order->id,
            $order->customer_name,
            $order->customer_phone,
            $order->customer_email,
            $order->delivery_method == 'delivery' ? 'توصيل للمنزل' : 'استلام من الصيدلية',
            $order->address,
            $order->total_price,
            $order->status,
            $order->created_at->format('Y-m-d H:i')
        ];
    }
}
