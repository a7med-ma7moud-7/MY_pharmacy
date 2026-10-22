<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
class Appointment extends Model
{
    use HasFactory , Notifiable;

    /**
     * الحقول القابلة للتعديل الجماعي
     */
    protected $fillable = [
        'patient_name',    // اسم المريض
        'email',           // البريد الإلكتروني للمريض
        'phone',           // رقم هاتف المريض
        'doctor_id',       // رقم الطبيب
        'appointment_date', // تاريخ الموعد
        'appointment_time', // وقت الموعد
        'notes',           // ملاحظات إضافية
        'status',          // حالة الحجز (pending, confirmed, cancelled, completed)
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
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
} 