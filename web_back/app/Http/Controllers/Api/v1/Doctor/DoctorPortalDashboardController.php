<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\Appointment;
use App\Models\DoctorPatientConversation;
use App\Models\MedicalAuditLog;
use App\Models\PatientFollowUp;
use App\Models\Prescription;
use App\Models\Rating;
use App\Models\TreatedCase;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorPortalDashboardController extends DoctorPortalBaseController
{
    public function index(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $today = now()->toDateString();

        // Distinct patients who booked appointments with THIS doctor
        $allDocAppointments = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->get(['id', 'user_id', 'phone', 'status', 'appointment_date']);

        $uniquePatientKeys = [];
        $upcomingCount = 0;
        $completedCount = 0;

        foreach ($allDocAppointments as $appt) {
            $normPhone = PhoneNormalizer::normalize($appt->phone) ?: ('appt_' . $appt->id);
            $key = $appt->user_id ? ('u_' . $appt->user_id) : ('p_' . $normPhone);
            $uniquePatientKeys[$key] = true;

            $dateStr = $appt->appointment_date ? $appt->appointment_date->format('Y-m-d') : '';
            if ($appt->status === 'completed') {
                $completedCount++;
            } elseif (in_array($appt->status, ['pending', 'confirmed'], true) && $dateStr >= $today) {
                $upcomingCount++;
            }
        }

        $visibleRatingsQuery = Rating::query()
            ->where('doctor_id', $doctor->id)
            ->visible();

        $totalReviews = (clone $visibleRatingsQuery)->count();
        $averageRating = $totalReviews > 0
            ? round((float) (clone $visibleRatingsQuery)->avg('rating'), 1)
            : 0.0;

        $totalCases = TreatedCase::where('doctor_id', $doctor->id)->count();
        $unreadMessages = (int) DoctorPatientConversation::where('doctor_id', $doctor->id)
            ->sum('doctor_unread_count');
        $totalPrescriptions = Prescription::where('doctor_id', $doctor->id)->count();
        $totalFollowUps = PatientFollowUp::where('doctor_id', $doctor->id)->count();

        $upcomingAppointments = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereDate('appointment_date', '>=', $today)
            ->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->limit(6)
            ->get()
            ->map(function (Appointment $a) {
                $normPhone = PhoneNormalizer::normalize($a->phone);
                return [
                    'id' => $a->id,
                    'patient_key' => $a->user_id ? ('u_' . $a->user_id) : ('p_' . ($normPhone ?: $a->id)),
                    'patient_name' => $a->patient_name,
                    'phone' => $a->phone,
                    'appointment_date' => $a->appointment_date?->format('Y-m-d'),
                    'appointment_time' => $a->appointment_time,
                    'status' => $a->status,
                    'notes' => $a->notes,
                ];
            });

        $recentConversations = DoctorPatientConversation::query()
            ->where('doctor_id', $doctor->id)
            ->with('patient:id,name,phone,avatar')
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(fn (DoctorPatientConversation $c) => [
                'id' => $c->id,
                'patient_user_id' => $c->patient_user_id,
                'patient_key' => 'u_' . $c->patient_user_id,
                'patient_name' => $c->patient?->name ?? 'مريض',
                'patient_phone' => $c->patient?->phone,
                'last_message_preview' => $c->last_message_preview,
                'last_message_at' => $c->last_message_at?->toISOString(),
                'unread_count' => $c->doctor_unread_count,
            ]);

        $recentCases = TreatedCase::query()
            ->where('doctor_id', $doctor->id)
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit(4)
            ->get();

        $recentReviews = Rating::query()
            ->where('doctor_id', $doctor->id)
            ->visible()
            ->with(['user:id,name,avatar', 'appointment:id,appointment_date'])
            ->latest()
            ->limit(4)
            ->get();

        $doctor->appendResolvedImages();

        return $this->successResponse([
            'doctor' => $doctor,
            'stats' => [
                'total_patients' => count($uniquePatientKeys),
                'upcoming_appointments' => $upcomingCount,
                'completed_appointments' => $completedCount,
                'total_appointments' => $allDocAppointments->count(),
                'total_treated_cases' => $totalCases,
                'total_reviews' => $totalReviews,
                'average_rating' => $averageRating,
                'unread_messages' => $unreadMessages,
                'total_prescriptions' => $totalPrescriptions,
                'total_follow_ups' => $totalFollowUps,
            ],
            'upcoming_appointments' => $upcomingAppointments,
            'recent_conversations' => $recentConversations,
            'recent_treated_cases' => $recentCases,
            'recent_reviews' => $recentReviews,
        ]);
    }

    public function updateAppointmentStatus(Request $request, $id): JsonResponse
    {
        $doctor = $this->currentDoctor($request);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,completed,cancelled',
        ]);

        $appointment = Appointment::where('doctor_id', $doctor->id)->findOrFail($id);
        $oldStatus = $appointment->status;
        $appointment->status = $validated['status'];
        $appointment->save();

        MedicalAuditLog::record(
            action: 'doctor.appointment_status_updated',
            targetType: 'appointment',
            targetId: $appointment->id,
            doctorId: $doctor->id,
            metadata: ['from' => $oldStatus, 'to' => $validated['status']],
            request: $request
        );

        return $this->successResponse([
            'message' => 'تم تحديث حالة الموعد بنجاح.',
            'data' => $appointment,
        ]);
    }
}
