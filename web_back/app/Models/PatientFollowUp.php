<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientFollowUp extends Model
{
    protected $table = 'patient_follow_ups';

    protected $fillable = [
        'doctor_id',
        'patient_user_id',
        'appointment_id',
        'patient_name',
        'patient_phone',
        'followup_date',
        'consultation_notes',
        'treatment_updates',
        'next_followup_date',
        'status',
    ];

    protected $casts = [
        'followup_date' => 'date:Y-m-d',
        'next_followup_date' => 'date:Y-m-d',
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
}
