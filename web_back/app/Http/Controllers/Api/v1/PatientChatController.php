<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorPatientConversation;
use App\Models\DoctorPatientMessage;
use App\Models\Prescription;
use App\Models\User;
use App\Services\DoctorPatientAccessService;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PatientChatController extends Controller
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $patient */
        $patient = Auth::user();
        $this->accessService->syncUserAppointments($patient);

        $conversations = DoctorPatientConversation::query()
            ->where('patient_user_id', $patient->id)
            ->with([
                'doctor:id,name,specialty,image,location,tow_location',
                'latestAppointment:id,appointment_date,appointment_time,status',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (DoctorPatientConversation $c) {
                $doc = $c->doctor;
                return [
                    'id' => $c->id,
                    'doctor_id' => $c->doctor_id,
                    'doctor_name' => $doc?->name ?? 'طبيب',
                    'doctor_specialty' => $doc?->specialty,
                    'doctor_image_url' => $doc?->image_url,
                    'latest_appointment' => $c->latestAppointment,
                    'last_message_preview' => $c->last_message_preview,
                    'last_message_at' => $c->last_message_at?->toISOString(),
                    'unread_count' => $c->patient_unread_count,
                ];
            });

        // Also return eligible doctors with whom the patient booked an appointment (so they can start a chat easily)
        $eligibleDoctorIds = Appointment::query()
            ->where('user_id', $patient->id)
            ->where('status', '!=', 'cancelled')
            ->distinct()
            ->pluck('doctor_id');

        $eligibleDoctors = Doctor::query()
            ->whereIn('id', $eligibleDoctorIds)
            ->activeAndSubscribed()
            ->get(['id', 'name', 'specialty', 'image', 'location'])
            ->each(fn (Doctor $d) => $d->image_url = $d->image_url);

        return $this->successResponse([
            'data' => $conversations,
            'eligible_doctors' => $eligibleDoctors,
        ]);
    }

    public function startWithDoctor(Request $request): JsonResponse
    {
        /** @var User $patient */
        $patient = Auth::user();

        $validated = $request->validate([
            'doctor_id' => 'required|integer|exists:doctors,id',
        ]);

        $doctor = Doctor::findOrFail((int) $validated['doctor_id']);

        if (!$this->accessService->canPatientChatWithDoctor($patient, (int) $doctor->id)) {
            return $this->errorResponse(
                'المحادثة الطبية متاحة فقط للمرضى الذين قاموا بحجز موعد فعلي مع هذا الطبيب.',
                403,
                ['code' => 'APPOINTMENT_REQUIRED_FOR_CHAT']
            );
        }

        $latestAppt = $this->accessService
            ->appointmentsBetweenUserAndDoctor($patient, (int) $doctor->id)
            ->where('status', '!=', 'cancelled')
            ->orderByDesc('appointment_date')
            ->first();

        $conversation = DoctorPatientConversation::firstOrCreate(
            [
                'doctor_id' => $doctor->id,
                'patient_user_id' => $patient->id,
            ],
            [
                'latest_appointment_id' => $latestAppt?->id,
                'last_message_at' => now(),
            ]
        );

        return $this->successResponse([
            'data' => $conversation->load('doctor:id,name,specialty,image'),
        ]);
    }

    public function show(Request $request, $conversationId): JsonResponse
    {
        /** @var User $patient */
        $patient = Auth::user();

        $conversation = DoctorPatientConversation::query()
            ->where('patient_user_id', $patient->id)
            ->with([
                'doctor:id,name,specialty,image,location,tow_location',
                'latestAppointment:id,appointment_date,appointment_time,status',
            ])
            ->findOrFail($conversationId);

        if (!$this->accessService->canPatientChatWithDoctor($patient, (int) $conversation->doctor_id)) {
            return $this->errorResponse('غير مصرح بالوصول لهذه المحادثة.', 403);
        }

        DoctorPatientMessage::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_role', 'doctor')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        if ($conversation->patient_unread_count > 0) {
            $conversation->patient_unread_count = 0;
            $conversation->saveQuietly();
        }

        if ($conversation->doctor) {
            $conversation->doctor->image_url = $conversation->doctor->image_url;
        }

        $messages = $conversation->messages()
            ->orderBy('id', 'asc')
            ->limit(200)
            ->get();

        return $this->successResponse([
            'data' => [
                'conversation' => $conversation,
                'messages' => $messages,
            ],
        ]);
    }

    public function sendMessage(Request $request, $conversationId): JsonResponse
    {
        /** @var User $patient */
        $patient = Auth::user();

        $conversation = DoctorPatientConversation::query()
            ->where('patient_user_id', $patient->id)
            ->findOrFail($conversationId);

        if (!$this->accessService->canPatientChatWithDoctor($patient, (int) $conversation->doctor_id)) {
            return $this->errorResponse(
                'المحادثة متاحة فقط للمرضى الذين لديهم حجز موعد ساري مع هذا الطبيب.',
                403
            );
        }

        $validated = $request->validate([
            'body' => 'nullable|string|max:3000',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:4096',
        ]);

        $body = trim((string) ($validated['body'] ?? ''));
        if ($body === '' && !$request->hasFile('attachment')) {
            return $this->errorResponse('يرجى كتابة نص الرسالة أو إرفاق ملف.', 422);
        }

        $message = DB::transaction(function () use ($conversation, $patient, $body, $request) {
            $msg = new DoctorPatientMessage([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $patient->id,
                'sender_role' => 'user',
                'body' => $body !== '' ? $body : null,
                'is_read' => false,
            ]);

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $msg->attachment_path = $msg->storeUploadedImage($request, 'attachment', 'chat_attachments');
                $msg->attachment_name = $file?->getClientOriginalName();
            }

            $msg->save();

            $preview = $body !== '' ? mb_substr($body, 0, 120, 'UTF-8') : '📎 مرفق من المريض';
            $conversation->last_message_at = now();
            $conversation->last_message_preview = $preview;
            $conversation->doctor_unread_count = (int) $conversation->doctor_unread_count + 1;
            $conversation->save();

            return $msg;
        });

        return $this->successResponse([
            'message' => 'تم إرسال رسالتك إلى الطبيب بنجاح.',
            'data' => $message,
        ], 201);
    }

    /**
     * استرجاع حجوزات وروشتات المريض المسجل حالياً
     */
    public function myOverview(Request $request): JsonResponse
    {
        /** @var User $patient */
        $patient = Auth::user();
        $this->accessService->syncUserAppointments($patient);

        $phoneVariants = $patient->phone ? PhoneNormalizer::variants($patient->phone) : [];

        $appointments = Appointment::query()
            ->where('user_id', $patient->id)
            ->with(['doctor:id,name,specialty,image,location', 'rating'])
            ->orderByDesc('appointment_date')
            ->limit(30)
            ->get();

        $prescriptions = Prescription::query()
            ->where(function ($q) use ($patient, $phoneVariants) {
                $q->where('patient_user_id', $patient->id);
                if ($phoneVariants !== []) {
                    $q->orWhereIn('patient_phone', $phoneVariants);
                }
            })
            ->with(['doctor:id,name,specialty', 'items'])
            ->orderByDesc('prescribed_date')
            ->limit(20)
            ->get();

        return $this->successResponse([
            'data' => [
                'appointments' => $appointments,
                'prescriptions' => $prescriptions,
            ],
        ]);
    }
}
