<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DoctorPatientConversation extends Model
{
    protected $fillable = [
        'doctor_id',
        'patient_user_id',
        'latest_appointment_id',
        'last_message_at',
        'last_message_preview',
        'doctor_unread_count',
        'patient_unread_count',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'doctor_unread_count' => 'integer',
        'patient_unread_count' => 'integer',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_user_id');
    }

    public function latestAppointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'latest_appointment_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DoctorPatientMessage::class, 'conversation_id');
    }
}
