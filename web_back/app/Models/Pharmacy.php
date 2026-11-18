<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ResolvesImageUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Pharmacy extends Model
{
    use HasFactory, ResolvesImageUrl;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'image',
        'phone',
        'email',
        'city',
        'address',
        'latitude',
        'longitude',
        'working_hours',
        'license_number',
        'is_active',
        'created_by_admin_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $pharmacy) {
            if (empty($pharmacy->slug)) {
                $base = Str::slug($pharmacy->name) ?: 'pharmacy';
                $pharmacy->slug = $base . '-' . Str::lower(Str::random(6));
            }
        });
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = trim((string) $value);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function medicines(): HasMany
    {
        return $this->hasMany(Medicien::class, 'pharmacy_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'pharmacy_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'pharmacy_id');
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('license_number', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status']) && $filters['status'] !== '' && $filters['status'] !== 'all') {
            if ($filters['status'] === 'active') {
                $query->where('is_active', true);
            } elseif ($filters['status'] === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if (!empty($filters['city']) && $filters['city'] !== 'all') {
            $query->where('city', $filters['city']);
        }

        return $query;
    }

    public function toSummaryArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'phone' => $this->phone,
            'email' => $this->email,
            'city' => $this->city,
            'address' => $this->address,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'working_hours' => $this->working_hours,
            'license_number' => $this->license_number,
            'is_active' => (bool) $this->is_active,
            'image' => $this->image,
            'image_url' => $this->image ? $this->image_url : null,
        ];
    }
}
