<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\DoctorPatientConversation;
use App\Models\DoctorPatientMessage;
use App\Models\User;
use App\Services\DoctorPatientAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DoctorChatController extends DoctorPortalBaseController
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $conversations = DoctorPatientConversation::query()
            ->where('doctor_id', $doctor->id)
            ->with([
                'patient:id,name,phone,email,avatar',
                'latestAppointment:id,appointment_date,appointment_time,status',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (DoctorPatientConversation $c) => [
                'id' => $c->id,
                'doctor_id' => $c->doctor_id,
                'patient_user_id' => $c->patient_user_id,
                'patient_key' => 'u_' . $c->patient_user_id,
                'patient_name' => $c->patient?->name ?? 'مريض',
                'patient_phone' => $c->patient?->phone,
                'latest_appointment' => $c->latestAppointment,
                'last_message_preview' => $c->last_message_preview,
                'last_message_at' => $c->last_message_at?->toISOString(),
                'unread_count' => $c->doctor_unread_count,
            ]);

        return $this->successResponse([
            'data' => $conversations,
        ]);
    }

    /**
     * فتح أو إنشاء محادثة مع مريض مؤهل حجز موعداً مع الطبيب
     */
    public function startWithPatient(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $validated = $request->validate([
            'patient_user_id' => 'required|integer|exists:users,id',
        ]);

        $patient = User::findOrFail((int) $validated['patient_user_id']);

        if (!$this->accessService->canPatientChatWithDoctor($patient, (int) $doctor->id)) {
            return $this->errorResponse(
                'لا يمكن بدء محادثة مع هذا المستخدم لعدم وجود موعد محجوز ومفعل بينكما.',
                403,
                ['code' => 'CHAT_NOT_ELIGIBLE']
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
            'data' => $conversation->load('patient:id,name,phone,avatar'),
        ]);
    }

    public function show(Request $request, $conversationId): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $conversation = DoctorPatientConversation::query()
            ->where('doctor_id', $doctor->id)
            ->with([
                'patient:id,name,phone,avatar',
                'latestAppointment:id,appointment_date,appointment_time,status',
            ])
            ->findOrFail($conversationId);

        // Verify patient relationship remains valid
        if (!$conversation->patient || !$this->accessService->canPatientChatWithDoctor($conversation->patient, (int) $doctor->id)) {
            return $this->errorResponse('المحادثة غير متاحة لعدم وجود حجز نشط لهذا المريض.', 403);
        }

        // Mark patient messages as read
        DoctorPatientMessage::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_role', 'user')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        if ($conversation->doctor_unread_count > 0) {
            $conversation->doctor_unread_count = 0;
            $conversation->saveQuietly();
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
        $doctor = $this->currentDoctor($request);
        /** @var User $doctorUser */
        $doctorUser = Auth::user();

        $conversation = DoctorPatientConversation::query()
            ->where('doctor_id', $doctor->id)
            ->with('patient')
            ->findOrFail($conversationId);

        if (!$conversation->patient || !$this->accessService->canPatientChatWithDoctor($conversation->patient, (int) $doctor->id)) {
            return $this->errorResponse('غير مصرح بإرسال رسائل في هذه المحادثة.', 403);
        }

        $validated = $request->validate([
            'body' => 'nullable|string|max:3000',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:4096',
        ]);

        $body = trim((string) ($validated['body'] ?? ''));
        if ($body === '' && !$request->hasFile('attachment')) {
            return $this->errorResponse('يرجى كتابة رسالة أو إرفاق ملف.', 422);
        }

        $message = DB::transaction(function () use ($conversation, $doctorUser, $body, $request) {
            $msg = new DoctorPatientMessage([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $doctorUser->id,
                'sender_role' => 'doctor',
                'body' => $body !== '' ? $body : null,
                'is_read' => false,
            ]);

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $msg->attachment_path = $msg->storeUploadedImage($request, 'attachment', 'chat_attachments');
                $msg->attachment_name = $file?->getClientOriginalName();
            }

            $msg->save();

            $preview = $body !== '' ? mb_substr($body, 0, 120, 'UTF-8') : '📎 مرفق طبي';
            $conversation->last_message_at = now();
            $conversation->last_message_preview = $preview;
            $conversation->patient_unread_count = (int) $conversation->patient_unread_count + 1;
            $conversation->save();

            return $msg;
        });

        return $this->successResponse([
            'message' => 'تم إرسال الرسالة بنجاح.',
            'data' => $message,
        ], 201);
    }
}
