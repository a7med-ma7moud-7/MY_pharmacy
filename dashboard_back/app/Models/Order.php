<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Order extends Model
{
    use HasFactory, Notifiable;

    public const STATUS_LABELS = [
        'pending' => 'قيد الانتظار',
        'processing' => 'قيد التجهيز والشحن',
        'completed' => 'مكتمل',
        'cancelled' => 'ملغي',
    ];

    protected $fillable = [
        'pharmacy_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'address',
        'delivery_method',
        'notes',
        'status',
        'total_price',
    ];

    protected $casts = [
        'total_price' => 'float',
    ];

    /**
     * علاقة الطلب بالصيدلية المستقبلة
     */
    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }

    /**
     * علاقة الطلب بعناصره
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * حصر الطلبات الخاصة بصيدلية محددة فقط
     */
    public function scopeForPharmacy(Builder $query, int $pharmacyId): Builder
    {
        return $query->where(function (Builder $q) use ($pharmacyId) {
            $q->where('pharmacy_id', $pharmacyId)
              ->orWhereHas('items', static function (Builder $iq) use ($pharmacyId) {
                  $iq->where('pharmacy_id', $pharmacyId)
                     ->orWhereHas('medicine', static fn (Builder $mq) => $mq->where('pharmacy_id', $pharmacyId));
              });
        });
    }

    /**
     * الوصف العربي لحالة الطلب
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? (string) $this->status;
    }

    /**
     * تصفية وبحث الطلبات
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['pharmacy_id']) && !in_array((string) $filters['pharmacy_id'], ['all', 'الكل'], true)) {
            $query->forPharmacy((int) $filters['pharmacy_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['delivery_method'])) {
            $query->where('delivery_method', $filters['delivery_method']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        $search = $filters['search'] ?? $filters['keyword'] ?? null;
        if (!empty($search)) {
            $search = trim((string) $search);
            $cleanId = ltrim($search, '#');
            $query->where(function (Builder $q) use ($search, $cleanId) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$cleanId}%");
            });
        }

        return $query;
    }
}
