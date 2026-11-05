<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AppointmentConfirmationMail;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use App\Notifications\NewAppointmentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    /**
     * عرض نموذج الحجز
     */
    public function create($doctor_id = null)
    {
        $doctors = Doctor::all();
        $selectedDoctor = $doctor_id ? Doctor::findOrFail($doctor_id) : null;

        return view('appointments.create', [
            'doctors' => $doctors,
            'selectedDoctor' => $selectedDoctor,
        ]);
    }

    /**
     * حفظ الحجز الجديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'notes' => 'nullable|string',
        ]);

        // التحقق من عدم وجود حجز لنفس الطبيب في نفس اليوم والوقت
        if (Appointment::isSlotTaken($validated['doctor_id'], $validated['appointment_date'], $validated['appointment_time'])) {
            $message = 'هذا الموعد محجوز بالفعل لهذا الطبيب. اختر وقتًا آخر.';
            if ($request->ajax()) {
                return response()->json(['message' => $message], 422);
            }
            return back()->withErrors(['appointment_time' => $message])->withInput();
        }

        // إنشاء الحجز الجديد
        $appointment = Appointment::create(array_merge($validated, [
            'status' => 'pending',
        ]));

        // إرسال الإشعار للإدارة
        User::notifyAdmins(new NewAppointmentNotification($appointment));

        // إرسال بريد التأكيد
        if (!empty($validated['email'])) {
            try {
                Mail::to($validated['email'])->send(new AppointmentConfirmationMail($appointment));
            } catch (\Throwable $e) {
                Log::warning('Failed sending appointment confirmation email: ' . $e->getMessage());
            }
        }

        if ($request->ajax() || $request->wantsJson() || $request->isJson() || $request->header('Accept') === 'application/json') {
            return $this->successResponse([
                'message' => 'تم الحجز بنجاح!',
                'appointment_id' => $appointment->id,
            ]);
        }

        return redirect()->route('appointments.success', $appointment->id)
            ->with('success', 'تم حجز موعدك بنجاح، سيتم التواصل معك لتأكيد الحجز.');
    }

    /**
     * عرض صفحة نجاح الحجز
     */
    public function success($id)
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);
        return view('appointments.success', compact('appointment'));
    }

    /**
     * عرض قائمة الحجوزات (للإدارة فقط)
     */
    public function index()
    {
        $appointments = Appointment::with('doctor')->latest()->paginate(10);
        return view('admin.appointments.index', compact('appointments'));
    }

    /**
     * عرض تفاصيل الحجز (للإدارة فقط)
     */
    public function show($id)
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);
        return view('admin.appointments.show', compact('appointment'));
    }

    /**
     * تحديث حالة الحجز (للإدارة فقط)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->status = $validated['status'];
        $appointment->save();

        return redirect()->route('admin.appointments.index')
            ->with('success', 'تم تحديث حالة الحجز بنجاح.');
    }
}
