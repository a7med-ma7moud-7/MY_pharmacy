<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\PhoneNormalizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'google_id',
        'facebook_id',
        'avatar',
        'social_token',
        'social_refresh_token',
        'role',
        'account_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'social_token',
        'social_refresh_token',
        'google_id',
        'facebook_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function setEmailAttribute($value): void
    {
        $this->attributes['email'] = strtolower(trim((string) $value));
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = trim((string) $value);
    }

    public function setPhoneAttribute($value): void
    {
        $normalized = PhoneNormalizer::normalize($value !== null ? (string) $value : null);
        $this->attributes['phone'] = $normalized;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isDoctor(): bool
    {
        return $this->role === 'doctor';
    }

    public function isUser(): bool
    {
        return ($this->role ?? 'user') === 'user';
    }

    public function isActiveAccount(): bool
    {
        return ($this->account_status ?? 'active') === 'active';
    }

    public function doctor(): HasOne
    {
        return $this->hasOne(Doctor::class, 'user_id');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'user_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'user_id');
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        return $query;
    }

    /**
     * توليد رمز المصادقة الموقّع (HMAC Token) مرتبط ببصمة بيانات الحساب وكلمة المرور المشفرة
     */
    public function generateAdminToken(): string
    {
        $signature = hash_hmac(
            'sha256',
            $this->id . '|' . $this->email . '|' . $this->password,
            (string) config('app.key')
        );

        return base64_encode($this->id . '|' . $signature);
    }

    public function generateAuthToken(): string
    {
        return $this->generateAdminToken();
    }

    /**
     * التحقق من رمز المصادقة واسترجاع المستخدم النشط بزمن ثابت مقاوم لهجمات التوقيت
     */
    public static function verifyAdminToken(?string $bearerToken): ?self
    {
        if (empty($bearerToken)) {
            return null;
        }

        $decoded = base64_decode($bearerToken, true);
        if (!$decoded || !str_contains($decoded, '|')) {
            return null;
        }

        [$userId, $providedHash] = explode('|', $decoded, 2);
        if (!ctype_digit((string) $userId)) {
            return null;
        }

        $user = self::find((int) $userId);
        if (!$user || !$user->isActiveAccount()) {
            return null;
        }

        $expectedHash = hash_hmac(
            'sha256',
            $user->id . '|' . $user->email . '|' . $user->password,
            (string) config('app.key')
        );

        return hash_equals($expectedHash, $providedHash) ? $user : null;
    }

    public static function verifyAuthToken(?string $bearerToken): ?self
    {
        return self::verifyAdminToken($bearerToken);
    }

    public function toPublicArray(bool $includeCreatedAt = false): array
    {
        $displayEmail = PhoneNormalizer::isSyntheticEmail($this->email) ? null : $this->email;

        $payload = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'display_email' => $displayEmail,
            'phone' => $this->phone,
            'role' => $this->role ?? 'user',
            'account_status' => $this->account_status ?? 'active',
            'avatar' => $this->avatar,
        ];

        if ($this->isDoctor()) {
            $doc = $this->relationLoaded('doctor') ? $this->doctor : $this->doctor()->first();
            $payload['doctor_id'] = $doc?->id;
            $payload['doctor_status'] = $doc?->status;
            $payload['doctor_verification_status'] = $doc?->verification_status;
            $payload['doctor_specialty'] = $doc?->specialty;
            $payload['doctor_image_url'] = $doc?->image_url;
        }

        if ($includeCreatedAt) {
            $payload['created_at'] = $this->created_at;
        }

        return $payload;
    }

    public static function notifyAdmins(object $notification): void
    {
        try {
            $admins = self::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify($notification);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed sending admin notification: ' . $e->getMessage());
        }
    }
}
