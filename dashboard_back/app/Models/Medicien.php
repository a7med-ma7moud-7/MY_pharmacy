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

    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = trim((string) $value);
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

        if (!empty($filters['in_stock']) && filter_var($filters['in_stock'], FILTER_VALIDATE_BOOLEAN)) {
            $query->where('count', '>', 0);
        }

        if (!empty($filters['low_stock']) && filter_var($filters['low_stock'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereBetween('count', [1, 5]);
        }

        return $query;
    }

    /**
     * ترتيب الأدوية ديناميكياً حسب الخيار المطلوب
     */
    public function scopeSortBy(Builder $query, ?string $sort, bool $latestDefault = false): Builder
    {
        return match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'stock_desc' => $query->orderBy('count', 'desc'),
            'name' => $query->orderBy('name', 'asc'),
            'latest' => $query->latest(),
            default => $latestDefault ? $query->latest() : $query,
        };
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
