<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prescription extends Model
{
    protected $fillable = [
        'prescription_number',
        'doctor_id',
        'patient_user_id',
        'appointment_id',
        'patient_name',
        'patient_phone',
        'diagnosis',
        'notes',
        'status',
        'prescribed_date',
    ];

    protected $casts = [
        'prescribed_date' => 'date:Y-m-d',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_user_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class, 'prescription_id');
    }

    public static function generatePrescriptionNumber(): string
    {
        $prefix = 'RX-' . now()->format('Ymd') . '-';
        $nextSeq = (int) self::whereDate('created_at', now()->toDateString())->count() + 1;
        do {
            $candidate = $prefix . str_pad((string) $nextSeq, 4, '0', STR_PAD_LEFT);
            $nextSeq++;
        } while (self::where('prescription_number', $candidate)->exists());

        return $candidate;
    }
}
