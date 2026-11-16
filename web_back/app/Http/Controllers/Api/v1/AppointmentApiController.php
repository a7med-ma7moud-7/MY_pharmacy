<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Mail\AppointmentConfirmationMail;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use App\Notifications\NewAppointmentNotification;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppointmentApiController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:25',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string|max:30',
            'notes' => 'nullable|string|max:1000',
        ]);

        $normalizedPhone = PhoneNormalizer::normalize($validated['phone']);
        if (!$normalizedPhone || !PhoneNormalizer::isValid($normalizedPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'يرجى إدخال رقم هاتف صحيح للتواصل.',
                'errors' => ['phone' => ['صيغة رقم الهاتف غير صحيحة.']],
            ], 422);
        }
        $validated['phone'] = $normalizedPhone;

        $doctor = Doctor::findOrFail($validated['doctor_id']);
        if (!$doctor->isActiveForBooking()) {
            return $this->errorResponse('عذراً، هذا الطبيب غير متاح لاستقبال حجوزات جديدة حالياً.', 422);
        }

        // Link appointment to authenticated patient (or matching registered user by phone/email)
        $resolvedUserId = Auth::id();
        if (!$resolvedUserId) {
            $phoneVariants = PhoneNormalizer::variants($normalizedPhone);
            $matchedUser = User::whereIn('phone', $phoneVariants)->first();
            if (!$matchedUser && !empty($validated['email'])) {
                $matchedUser = User::where('email', strtolower($validated['email']))->first();
            }
            $resolvedUserId = $matchedUser?->id;
        }

        $appointment = DB::transaction(function () use ($validated, $resolvedUserId) {
            if (Appointment::isSlotTaken(
                $validated['doctor_id'],
                $validated['appointment_date'],
                $validated['appointment_time'],
                lockRows: true
            )) {
                return null;
            }

            return Appointment::create(array_merge($validated, [
                'user_id' => $resolvedUserId,
                'status' => 'pending',
            ]));
        });

        if (!$appointment) {
            return $this->errorResponse('هذا الموعد محجوز بالفعل لهذا الطبيب. اختر وقتًا آخر.', 422);
        }

        User::notifyAdmins(new NewAppointmentNotification($appointment));

        if (!empty($validated['email'])) {
            try {
                Mail::to($validated['email'])->send(new AppointmentConfirmationMail($appointment));
            } catch (\Throwable $e) {
                Log::warning('Failed sending confirmation email: ' . $e->getMessage());
            }
        }

        return $this->successResponse([
            'message' => 'تم حجز موعدك بنجاح! يمكنك الآن التواصل مع الطبيب ومتابعة موعدك.',
            'data' => [
                'appointment_id' => $appointment->id,
                'doctor_id' => $doctor->id,
                'patient_name' => $appointment->patient_name,
                'appointment_date' => $appointment->appointment_date?->format('Y-m-d') ?? $validated['appointment_date'],
                'appointment_time' => $appointment->appointment_time,
                'doctor_name' => $doctor->name,
                'status' => $appointment->status,
                'can_chat' => Auth::check(),
            ],
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);

        return $this->successResponse([
            'data' => $appointment,
        ]);
    }
}
