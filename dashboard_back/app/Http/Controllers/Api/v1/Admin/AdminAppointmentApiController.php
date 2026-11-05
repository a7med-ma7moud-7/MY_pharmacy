<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAppointmentApiController extends Controller
{
    /**
     * استعراض قائمة الحجوزات مع التصفية والترقيم
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);

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
     * تحديث حالة الحجز
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->status = $validated['status'];
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
