<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ResolvesImageUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Doctor extends Model
{
    use HasFactory, ResolvesImageUrl;

    public const FILTER_CACHE_KEY = 'doctors:filter_options';

    /**
     * Memoized schema column checks to avoid repeated PRAGMA table_info queries.
     *
     * @var array<string, bool>
     */
    private static array $columnExistsCache = [];

    protected $fillable = [
        'name',
        'image',
        'specialty',
        'price',
        'number',
        'location',
        'tow_location',
        'status',
        'subscription',
    ];

    protected static function booted(): void
    {
        $flushCache = static fn () => Cache::forget(self::FILTER_CACHE_KEY);

        static::saved($flushCache);
        static::deleted($flushCache);
    }

    public static function hasDoctorColumn(string $column): bool
    {
        return self::$columnExistsCache[$column] ??= Schema::hasColumn('doctors', $column);
    }

    public static function getSpecialties(): array
    {
        return self::getFilterOptions()['specialties']->all();
    }

    /**
     * استرجاع قوائم الفلاتر (التخصصات، المحافظات، المدن) مع التخزين المؤقت الذكي
     */
    public static function getFilterOptions(): array
    {
        return Cache::remember(self::FILTER_CACHE_KEY, 300, static function (): array {
            return [
                'specialties' => self::distinct()->whereNotNull('specialty')->pluck('specialty'),
                'locations' => self::distinct()->whereNotNull('location')->pluck('location'),
                'cities' => self::distinct()->whereNotNull('tow_location')->pluck('tow_location'),
            ];
        });
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = trim((string) $value);
    }

    /**
     * تعديل قيمة التخصص قبل الحفظ
     */
    public function setSpecialtyAttribute($value): void
    {
        $this->attributes['specialty'] = trim((string) $value);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'doctor_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    /**
     * التحقق من جاهزية الطبيب لاستقبال حجوزات جديدة
     */
    public function isActiveForBooking(): bool
    {
        $activeStatuses = ['active', 'متاح', 'نشط', null, ''];
        return in_array($this->status, $activeStatuses, true);
    }

    /**
     * استرجاع روابط صور معرض العيادة الإضافية بعد معالجتها
     *
     * @return list<string>
     */
    public function getGalleryUrls(): array
    {
        $urls = [];
        for ($i = 1; $i <= 5; $i++) {
            $raw = $this->getAttribute("image-{$i}");
            if (!empty($raw)) {
                $urls[] = self::resolveStorageImageUrl((string) $raw);
            }
        }
        return array_values(array_unique($urls));
    }

    /**
     * إرفاق روابط الصور الرئيسية وصور المعرض للكائن قبل تحويله إلى JSON
     */
    public function appendResolvedImages(): self
    {
        $this->image_url = $this->image_url;

        for ($i = 1; $i <= 5; $i++) {
            $raw = $this->getAttribute("image-{$i}");
            if (!empty($raw)) {
                $this->setAttribute("image_{$i}_url", self::resolveStorageImageUrl((string) $raw));
            }
        }

        $this->setAttribute('gallery_urls', $this->getGalleryUrls());

        return $this;
    }

    /**
     * تصفية الأطباء النشطين والمشتركين (دعم القيم العربية والإنجليزية)
     */
    public function scopeActiveAndSubscribed(Builder $query): Builder
    {
        if (self::hasDoctorColumn('status')) {
            $query->where(function (Builder $q) {
                $q->whereIn('status', ['active', 'متاح', 'نشط'])->orWhereNull('status');
            });
        }

        if (self::hasDoctorColumn('subscription')) {
            $query->where(function (Builder $q) {
                $q->whereIn('subscription', ['subscribed', 'سنوي', 'شهري', 'مشترك'])->orWhereNull('subscription');
            });
        }

        return $query;
    }

    /**
     * البحث والتصفية المرنة للأطباء
     */
    public function scopeFilter(Builder $query, array $filters, bool $includeContactInSearch = false): Builder
    {
        if (!empty($filters['search'])) {
            $searchTerm = trim((string) $filters['search']);
            $query->where(function (Builder $q) use ($searchTerm, $includeContactInSearch) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('specialty', 'like', "%{$searchTerm}%");

                if ($includeContactInSearch) {
                    $q->orWhere('location', 'like', "%{$searchTerm}%")
                      ->orWhere('tow_location', 'like', "%{$searchTerm}%")
                      ->orWhere('number', 'like', "%{$searchTerm}%");
                }

                foreach (explode(' ', $searchTerm) as $part) {
                    if (strlen($part) > 2) {
                        $q->orWhere('name', 'like', "%{$part}%");
                    }
                }
            });
        }

        if (!empty($filters['specialty']) && !in_array($filters['specialty'], ['all', 'كل التخصصات'], true)) {
            $query->where('specialty', $filters['specialty']);
        }

        if (!empty($filters['location'])) {
            $query->where('location', $filters['location']);
        }

        if (!empty($filters['tow_location'])) {
            $query->where('tow_location', $filters['tow_location']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query;
    }

    /**
     * ترتيب الأطباء ديناميكياً حسب الخيار المطلوب
     */
    public function scopeSortBy(Builder $query, ?string $sort, string $defaultColumn = 'name', string $defaultDirection = 'asc'): Builder
    {
        return match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'rating' => $query->orderByDesc('ratings_avg')->orderBy('name', 'asc'),
            'latest' => $query->latest(),
            default => $query->orderBy($defaultColumn, $defaultDirection),
        };
    }

    /**
     * حفظ الصورة الأساسية والصور الإضافية للطبيب
     */
    public function syncUploadedImages(Request $request): void
    {
        if ($request->hasFile('image')) {
            $this->image = $this->storeUploadedImage($request, 'image', 'doctors', $this->image);
        }

        for ($i = 1; $i <= 5; $i++) {
            $imageField = "image-{$i}";
            if ($request->hasFile($imageField) && self::hasDoctorColumn($imageField)) {
                $this->{$imageField} = $this->storeUploadedImage(
                    $request,
                    $imageField,
                    'doctors',
                    $this->{$imageField} ?? null
                );
            }
        }
    }

    /**
     * حذف كافة صور الطبيب المخزنة
     */
    public function deleteAllStoredImages(): void
    {
        $this->deleteStoredImage($this->image);

        for ($i = 1; $i <= 5; $i++) {
            $imageField = "image-{$i}";
            if (self::hasDoctorColumn($imageField) && !empty($this->{$imageField})) {
                $this->deleteStoredImage($this->{$imageField});
            }
        }
    }
}
