<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Mail\AppointmentConfirmationMail;
use App\Models\Appointment;
use App\Models\User;
use App\Notifications\NewAppointmentNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppointmentApiController extends Controller
{
    /**
     * حفظ حجز موعد جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // التحقق من عدم وجود حجز لنفس الطبيب في نفس اليوم والوقت
        if (Appointment::isSlotTaken($validated['doctor_id'], $validated['appointment_date'], $validated['appointment_time'])) {
            return $this->errorResponse('هذا الموعد محجوز بالفعل لهذا الطبيب. اختر وقتًا آخر.', 422);
        }

        // إنشاء الحجز
        $appointment = Appointment::create(array_merge($validated, [
            'status' => 'pending',
        ]));

        // إرسال إشعار للإدارة
        User::notifyAdmins(new NewAppointmentNotification($appointment));

        // إرسال بريد التأكيد للمريض
        if (!empty($validated['email'])) {
            try {
                Mail::to($validated['email'])->send(new AppointmentConfirmationMail($appointment));
            } catch (\Throwable $e) {
                Log::warning('Failed sending confirmation email: ' . $e->getMessage());
            }
        }

        return $this->successResponse([
            'message' => 'تم حجز موعدك بنجاح! سيتم التواصل معك لتأكيد الموعد.',
            'data' => [
                'appointment_id' => $appointment->id,
                'patient_name' => $appointment->patient_name,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'status' => $appointment->status,
            ],
        ], 201);
    }

    /**
     * استرجاع تفاصيل حجز موعد (لصفحة التأكيد)
     */
    public function show($id): JsonResponse
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);

        return $this->successResponse([
            'data' => $appointment,
        ]);
    }
}
