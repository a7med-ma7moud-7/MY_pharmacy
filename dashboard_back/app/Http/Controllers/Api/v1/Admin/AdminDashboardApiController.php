<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardApiController extends Controller
{
    /**
     * إحصائيات ومعلومات لوحة التحكم الرئيسية
     */
    public function index()
    {
        $totalDoctors = Doctor::count();
        $totalMedicines = Medicien::count();
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $pendingAppointments = Appointment::where('status', 'pending')->count();
        $totalRevenue = (float) Order::where('status', '!=', 'cancelled')->sum('total_price');

        $recentDoctors = Doctor::latest()->take(5)->get();
        $recentMedicines = Medicien::latest()->take(5)->get();
        $recentAppointments = Appointment::with('doctor')->latest()->take(5)->get();
        $recentOrders = Order::latest()->take(5)->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_doctors' => $totalDoctors,
                'total_medicines' => $totalMedicines,
                'total_users' => $totalUsers,
                'total_orders' => $totalOrders,
                'pending_appointments' => $pendingAppointments,
                'total_revenue' => $totalRevenue,
            ],
            'recent_doctors' => $recentDoctors,
            'recent_medicines' => $recentMedicines,
            'recent_appointments' => $recentAppointments,
            'recent_orders' => $recentOrders,
        ]);
    }
}
