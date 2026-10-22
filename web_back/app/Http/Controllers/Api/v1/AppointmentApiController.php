<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Mail\AppointmentConfirmationMail;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use App\Notifications\NewAppointmentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AppointmentApiController extends Controller
{
    /**
     * حفظ حجز موعد جديد
     */
    public function store(Request $request)
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
        $exists = Appointment::where('doctor_id', $request->doctor_id)
            ->whereDate('appointment_date', $request->appointment_date)
            ->where('appointment_time', $request->appointment_time)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الموعد محجوز بالفعل لهذا الطبيب. اختر وقتًا آخر.',
            ], 422);
        }

        // إنشاء الحجز
        $appointment = Appointment::create([
            'patient_name' => $request->patient_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'doctor_id' => $request->doctor_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        // إرسال إشعار للإدارة
        try {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new NewAppointmentNotification($appointment));
            }
        } catch (\Exception $e) {
            \Log::warning('Failed sending appointment notification: ' . $e->getMessage());
        }

        // إرسال بريد التأكيد للمريض
        if ($request->filled('email')) {
            try {
                Mail::to($request->email)->send(new AppointmentConfirmationMail($appointment));
            } catch (\Exception $e) {
                \Log::warning('Failed sending confirmation email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
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
    public function show($id)
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $appointment,
        ]);
    }
}
