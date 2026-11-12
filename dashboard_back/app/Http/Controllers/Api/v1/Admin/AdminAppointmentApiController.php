<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAppointmentApiController extends Controller
{
    /**
     * استعراض قائمة الحجوزات مع التصفية والترقيم الآمن
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 100);

        $appointments = Appointment::with('doctor:id,name,specialty,price,location,number')
            ->filter($request->only(['status', 'doctor_id', 'date', 'search']))
            ->latest()
            ->paginate($perPage);

        return $this->paginatedResponse($appointments);
    }

    /**
     * تفاصيل حجز محدد
     */
    public function show($id): JsonResponse
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);

        return $this->successResponse([
            'data' => $appointment,
        ]);
    }

    /**
     * تحديث حالة الحجز مع التحقق من عدم تضارب الموعد عند إعادة تفعيل حجز ملغي
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $appointment = Appointment::findOrFail($id);
        $newStatus = $validated['status'];

        if (
            $appointment->status === 'cancelled' &&
            $newStatus !== 'cancelled' &&
            $appointment->doctor_id &&
            $appointment->appointment_date &&
            $appointment->appointment_time
        ) {
            $dateStr = $appointment->appointment_date->format('Y-m-d');
            $conflict = Appointment::where('doctor_id', $appointment->doctor_id)
                ->whereDate('appointment_date', $dateStr)
                ->where('appointment_time', $appointment->appointment_time)
                ->where('status', '!=', 'cancelled')
                ->where('id', '!=', $appointment->id)
                ->exists();

            if ($conflict) {
                return $this->errorResponse('لا يمكن إعادة تفعيل هذا الحجز لأن الموعد محجوز لمريض آخر حالياً.', 422);
            }
        }

        $appointment->status = $newStatus;
        $appointment->save();

        return $this->successResponse([
            'message' => 'تم تحديث حالة الحجز بنجاح',
            'data' => $appointment->load('doctor'),
        ]);
    }

    /**
     * حذف أو إلغاء الحجز
     */
    public function destroy($id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return $this->successResponse([
            'message' => 'تم حذف الحجز بنجاح',
        ]);
    }
}
