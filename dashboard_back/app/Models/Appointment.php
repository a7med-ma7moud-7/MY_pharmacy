<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;

class Appointment extends Model
{
    use HasFactory, Notifiable;

    /**
     * الحقول القابلة للتعديل الجماعي
     */
    protected $fillable = [
        'patient_name',
        'email',
        'phone',
        'doctor_id',
        'appointment_date',
        'appointment_time',
        'notes',
        'status',
    ];

    /**
     * التحويلات التلقائية
     */
    protected $casts = [
        'appointment_date' => 'date',
    ];

    /**
     * العلاقة مع الطبيب
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * التحقق من عدم وجود حجز لنفس الطبيب في نفس اليوم والوقت
     */
    public static function isSlotTaken(int|string $doctorId, string $appointmentDate, string $appointmentTime): bool
    {
        return self::where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $appointmentDate)
            ->where('appointment_time', $appointmentTime)
            ->where('status', '!=', 'cancelled')
            ->exists();
    }

    /**
     * تصفية وبحث الحجوزات
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['doctor_id'])) {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if (!empty($filters['date'])) {
            $query->whereDate('appointment_date', $filters['date']);
        }

        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('doctor', function (Builder $dq) use ($search) {
                      $dq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        return $query;
    }
}
