<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AdminAppointmentApiController extends Controller
{
    /**
     * استعراض قائمة الحجوزات مع التصفية والترقيم
     */
    public function index(Request $request)
    {
        $query = Appointment::with('doctor:id,name,specialty,price,location,number');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('doctor', function ($dq) use ($search) {
                      $dq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->integer('per_page', 10);
        $appointments = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $appointments->items(),
            'current_page' => $appointments->currentPage(),
            'last_page' => $appointments->lastPage(),
            'per_page' => $appointments->perPage(),
            'total' => $appointments->total(),
        ]);
    }

    /**
     * تفاصيل حجز محدد
     */
    public function show($id)
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $appointment,
        ]);
    }

    /**
     * تحديث حالة الحجز
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->status = $request->status;
        $appointment->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الحجز بنجاح',
            'data' => $appointment->load('doctor'),
        ]);
    }

    /**
     * حذف أو إلغاء الحجز
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الحجز بنجاح',
        ]);
    }
}
