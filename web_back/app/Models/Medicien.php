<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ResolvesImageUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class Medicien extends Model
{
    use HasFactory, Notifiable, ResolvesImageUrl;

    public const TYPES_CACHE_KEY = 'medicines:available_types';

    protected $fillable = [
        'name',
        'image',
        'propose',
        'price',
        'type',
        'count',
    ];

    protected static function booted(): void
    {
        $flushCache = static fn () => Cache::forget(self::TYPES_CACHE_KEY);

        static::saved($flushCache);
        static::deleted($flushCache);
    }

    /**
     * استرجاع قائمة تصنيفات الأدوية مع التخزين المؤقت الذكي
     */
    public static function getAvailableTypes(): Collection
    {
        return Cache::remember(
            self::TYPES_CACHE_KEY,
            300,
            static fn () => self::distinct()->whereNotNull('type')->pluck('type')
        );
    }

    /**
     * علاقة الدواء بعناصر الطلبات
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'medicine_id');
    }

    /**
     * تصفية وبحث الأدوية
     */
    public function scopeFilter(Builder $query, array $filters, bool $searchByType = false): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $q) use ($search, $searchByType) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('propose', 'like', "%{$search}%");

                if ($searchByType) {
                    $q->orWhere('type', 'like', "%{$search}%");
                }
            });
        }

        if (!empty($filters['type']) && !in_array($filters['type'], ['all', 'الكل'], true)) {
            $query->where('type', $filters['type']);
        }

        return $query;
    }

    /**
     * حالة التوفر في المخزون
     */
    public function getIsInStockAttribute(): bool
    {
        return (int) $this->count > 0;
    }

    /**
     * الحصول على صورة الدواء بمسار كامل
     */
    public function getImagePathAttribute(): string
    {
        if (empty($this->image)) {
            return 'images/no-image.jpg';
        }

        return 'storage/' . $this->image;
    }

    /**
     * الحصول على سعر الدواء منسق
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format((float) $this->price, 2) . ' ج.م';
    }
}
