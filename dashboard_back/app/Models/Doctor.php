<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ResolvesImageUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Doctor extends Model
{
    use HasFactory, ResolvesImageUrl;

    public const FILTER_CACHE_KEY = 'doctors:filter_options';

    /**
     * @var array<string, bool>
     */
    private static array $columnExistsCache = [];

    protected $fillable = [
        'user_id',
        'name',
        'image',
        'specialty',
        'price',
        'number',
        'location',
        'tow_location',
        'bio',
        'qualifications',
        'experience_years',
        'clinic_name',
        'working_hours',
        'status',
        'subscription',
        'verification_status',
        'creation_method',
    ];

    protected $casts = [
        'experience_years' => 'integer',
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

    public static function getFilterOptions(): array
    {
        return Cache::remember(self::FILTER_CACHE_KEY, 300, static function (): array {
            return [
                'specialties' => self::query()->activeAndSubscribed()->distinct()->whereNotNull('specialty')->pluck('specialty'),
                'locations' => self::query()->activeAndSubscribed()->distinct()->whereNotNull('location')->pluck('location'),
                'cities' => self::query()->activeAndSubscribed()->distinct()->whereNotNull('tow_location')->pluck('tow_location'),
            ];
        });
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = trim((string) $value);
    }

    public function setSpecialtyAttribute($value): void
    {
        $this->attributes['specialty'] = trim((string) $value);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'doctor_id');
    }

    public function visibleRatings(): HasMany
    {
        return $this->hasMany(Rating::class, 'doctor_id')
            ->where(function (Builder $q) {
                $q->where('status', 'visible')->orWhereNull('status');
            });
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    public function treatedCases(): HasMany
    {
        return $this->hasMany(TreatedCase::class, 'doctor_id');
    }

    public function publishedTreatedCases(): HasMany
    {
        return $this->hasMany(TreatedCase::class, 'doctor_id')->where('status', 'published');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(DoctorPatientConversation::class, 'doctor_id');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class, 'doctor_id');
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(PatientFollowUp::class, 'doctor_id');
    }

    public function isVerified(): bool
    {
        return in_array($this->verification_status, ['verified', null, ''], true);
    }

    public function isActiveForBooking(): bool
    {
        $activeStatuses = ['active', 'متاح', 'نشط', null, ''];
        if (!in_array($this->status, $activeStatuses, true)) {
            return false;
        }

        if (self::hasDoctorColumn('verification_status') && !$this->isVerified()) {
            return false;
        }

        if ($this->user_id && $this->user && !$this->user->isActiveAccount()) {
            return false;
        }

        return true;
    }

    public function isEligibleForPortal(): bool
    {
        return $this->isVerified() && $this->isActiveForBooking();
    }

    /**
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

        if (self::hasDoctorColumn('verification_status')) {
            $query->where(function (Builder $q) {
                $q->where('verification_status', 'verified')->orWhereNull('verification_status');
            });
        }

        return $query;
    }

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

        if (!empty($filters['verification_status']) && self::hasDoctorColumn('verification_status')) {
            $query->where('verification_status', $filters['verification_status']);
        }

        if (!empty($filters['creation_method']) && self::hasDoctorColumn('creation_method')) {
            $query->where('creation_method', $filters['creation_method']);
        }

        return $query;
    }

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
