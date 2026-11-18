<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        private readonly ?int $pharmacyId = null
    ) {}

    public function query()
    {
        return Order::with('pharmacy:id,name')
            ->withCount('items')
            ->when($this->pharmacyId !== null, fn ($q) => $q->forPharmacy($this->pharmacyId))
            ->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'رقم الطلب',
            'الصيدلية',
            'اسم العميل',
            'رقم الهاتف',
            'البريد الإلكتروني',
            'طريقة التوصيل',
            'العنوان',
            'عدد الأصناف',
            'المبلغ الإجمالي (ج.م)',
            'الحالة',
            'تاريخ الطلب',
        ];
    }

    public function map($order): array
    {
        return [
            $order->id,
            $order->pharmacy?->name ?? 'المنصة الرئيسية',
            $order->customer_name,
            $order->customer_phone,
            $order->customer_email ?? '—',
            $order->delivery_method === 'delivery' ? 'توصيل للمنزل' : 'استلام من الصيدلية',
            $order->address,
            (int) ($order->items_count ?? 0),
            (float) $order->total_price,
            $order->status_label,
            $order->created_at?->format('Y-m-d H:i') ?? '—',
        ];
    }
}
