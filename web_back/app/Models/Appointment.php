<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;

class Appointment extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'user_id',
        'patient_name',
        'email',
        'phone',
        'doctor_id',
        'appointment_date',
        'appointment_time',
        'notes',
        'status',
    ];

    protected $casts = [
        'appointment_date' => 'date:Y-m-d',
    ];

    public function setPatientNameAttribute($value): void
    {
        $this->attributes['patient_name'] = trim((string) $value);
    }

    public function setAppointmentTimeAttribute($value): void
    {
        $this->attributes['appointment_time'] = trim((string) $value);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class, 'appointment_id');
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(PatientFollowUp::class, 'appointment_id');
    }

    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class, 'appointment_id');
    }

    public static function isSlotTaken(
        int|string $doctorId,
        string $appointmentDate,
        string $appointmentTime,
        bool $lockRows = false
    ): bool {
        $query = self::where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $appointmentDate)
            ->where('appointment_time', trim($appointmentTime))
            ->where('status', '!=', 'cancelled');

        if ($lockRows) {
            $query->lockForUpdate();
        }

        return $query->exists();
    }

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
