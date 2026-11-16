<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Rating;
use App\Models\User;
use App\Services\DoctorPatientAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingApiController extends Controller
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    /**
     * حفظ تقييم طبيب من مريض مؤهل فقط (بعد إتمام موعد كشف فعلي مع منع تكرار التقييم لنفس الموعد)
     */
    public function store(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return $this->errorResponse('يرجى تسجيل الدخول بحساب مريض أولاً لإضافة تقييم.', 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if ($user->isDoctor()) {
            return $this->errorResponse('التقييم متاح لحسابات المرضى الذين تلقوا الخدمة الطبية فقط.', 403);
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_id' => 'nullable|integer|exists:appointments,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:600',
        ]);

        $doctor = Doctor::findOrFail((int) $validated['doctor_id']);

        // Find eligible completed appointments between this patient and this doctor
        $completedAppointments = $this->accessService
            ->appointmentsBetweenUserAndDoctor($user, (int) $doctor->id)
            ->where('status', 'completed')
            ->orderByDesc('appointment_date')
            ->get();

        if ($completedAppointments->isEmpty()) {
            $hasAnyAppt = $this->accessService
                ->appointmentsBetweenUserAndDoctor($user, (int) $doctor->id)
                ->where('status', '!=', 'cancelled')
                ->exists();

            if ($hasAnyAppt) {
                return $this->errorResponse(
                    'يمكنك إضافة تقييمك فور اكتمال موعد الكشف الخاص بك لدى الطبيب.',
                    403,
                    ['code' => 'APPOINTMENT_NOT_COMPLETED_YET']
                );
            }

            return $this->errorResponse(
                'التقييم متاح فقط للمرضى الذين حجزوا وأتمّوا موعد كشف فعلي مع هذا الطبيب.',
                403,
                ['code' => 'ELIGIBLE_APPOINTMENT_REQUIRED']
            );
        }

        $targetAppointment = !empty($validated['appointment_id'])
            ? $completedAppointments->firstWhere('id', (int) $validated['appointment_id'])
            : null;

        if (!empty($validated['appointment_id']) && !$targetAppointment) {
            return $this->errorResponse('الموعد المحدد غير صالح أو غير مكتمل لتقديم التقييم.', 422);
        }

        // Pick the latest completed appointment that hasn't been reviewed yet
        if (!$targetAppointment) {
            $reviewedIds = Rating::query()
                ->where('doctor_id', $doctor->id)
                ->where('user_id', $user->id)
                ->whereNotNull('appointment_id')
                ->pluck('appointment_id')
                ->all();

            $targetAppointment = $completedAppointments->first(fn ($a) => !in_array($a->id, $reviewedIds, true));
        }

        if (!$targetAppointment) {
            return $this->errorResponse(
                'لقد قمت بتقييم موعدك المكتمل مع هذا الطبيب مسبقاً. شكراً لمشاركتك!',
                422,
                ['code' => 'DUPLICATE_APPOINTMENT_REVIEW']
            );
        }

        if (Rating::where('appointment_id', $targetAppointment->id)->exists()) {
            return $this->errorResponse('تم إرسال تقييم لهذا الموعد بالفعل.', 422);
        }

        $rating = Rating::create([
            'doctor_id' => $doctor->id,
            'user_id' => $user->id,
            'appointment_id' => $targetAppointment->id,
            'rating' => (int) $validated['rating'],
            'comment' => isset($validated['comment']) ? trim($validated['comment']) : null,
            'status' => 'visible',
        ]);

        return $this->successResponse([
            'message' => 'تم إضافة تقييمك بنجاح! شكراً لمشاركتنا تجربتك.',
            'data' => $rating->load('user:id,name,avatar'),
        ], 201);
    }
}
