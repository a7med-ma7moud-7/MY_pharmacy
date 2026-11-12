<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'facebook_id',
        'avatar',
        'social_token',
        'social_refresh_token',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'social_token',
        'social_refresh_token',
        'google_id',
        'facebook_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Normalize email before saving.
     */
    public function setEmailAttribute($value): void
    {
        $this->attributes['email'] = strtolower(trim((string) $value));
    }

    /**
     * Normalize user name before saving.
     */
    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = trim((string) $value);
    }

    /**
     * التحقق من أن المستخدم مدير
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * التحقق من أن المستخدم مستخدم عادي
     */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'user_id');
    }

    /**
     * تصفية وبحث المستخدمين
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        return $query;
    }

    /**
     * توليد رمز المصادقة الإداري (HMAC Token) مرتبط ببصمة بيانات الحساب
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

    /**
     * التحقق من رمز المصادقة الإداري واسترجاع المستخدم بزمن ثابت مقاوم لهجمات التوقيت
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
        if (!$user) {
            return null;
        }

        $expectedHash = hash_hmac(
            'sha256',
            $user->id . '|' . $user->email . '|' . $user->password,
            (string) config('app.key')
        );

        return hash_equals($expectedHash, $providedHash) ? $user : null;
    }

    /**
     * تنسيق بيانات المستخدم العامة للاستجابات
     */
    public function toPublicArray(bool $includeCreatedAt = false): array
    {
        $payload = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role ?? 'user',
            'avatar' => $this->avatar,
        ];

        if ($includeCreatedAt) {
            $payload['created_at'] = $this->created_at;
        }

        return $payload;
    }

    /**
     * إرسال إشعار لجميع المسؤولين بأمان
     */
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
