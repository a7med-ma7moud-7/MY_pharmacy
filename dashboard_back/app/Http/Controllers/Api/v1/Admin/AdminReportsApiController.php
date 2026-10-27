<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminReportsApiController extends Controller
{
    /**
     * استرجاع كافة الإحصائيات والبيانات التحليلية للوحة التحكم
     */
    public function index()
    {
        // 1. إحصائيات زوار الجلسات (في حال وجود جدول sessions)
        $visitorStats = [];
        if (Schema::hasTable('sessions')) {
            try {
                $visitorStats = DB::table('sessions')
                    ->select(DB::raw('DATE(datetime(last_activity, "unixepoch")) as date'), DB::raw('COUNT(*) as visitors'))
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->limit(30)
                    ->get();
            } catch (\Throwable $e) {
                // Fallback for different SQL engines
                try {
                    $visitorStats = DB::table('sessions')
                        ->select(DB::raw('DATE(last_activity) as date'), DB::raw('COUNT(*) as visitors'))
                        ->groupBy('date')
                        ->orderBy('date', 'desc')
                        ->limit(30)
                        ->get();
                } catch (\Throwable $e2) {
                    $visitorStats = [];
                }
            }
        }

        // 2. مبيعات الأدوية والأكثر طلباً وإيراداً
        $medicineSales = Medicien::select(
            'mediciens.id',
            'mediciens.name',
            DB::raw('COUNT(order_items.id) as total_sales'),
            DB::raw('COALESCE(SUM(order_items.price * order_items.quantity), SUM(order_items.price), 0) as total_revenue')
        )
        ->join('order_items', 'mediciens.id', '=', 'order_items.medicine_id')
        ->groupBy('mediciens.id', 'mediciens.name')
        ->orderBy('total_sales', 'desc')
        ->limit(10)
        ->get();

        // 3. إحصائيات الحجوزات الطبية حسب التاريخ والحالة
        $appointmentStats = Appointment::select(
            DB::raw('DATE(appointment_date) as date'),
            DB::raw('COUNT(*) as total_appointments'),
            'status'
        )
        ->groupBy('date', 'status')
        ->orderBy('date', 'desc')
        ->limit(30)
        ->get();

        // 4. إحصائيات نشاط الأطباء حسب الحجوزات
        $doctorStats = [];
        try {
            $doctorStats = Doctor::select('doctors.id', 'doctors.name', 'doctors.specialty', DB::raw('COUNT(appointments.id) as appointments_count'))
                ->join('appointments', 'doctors.id', '=', 'appointments.doctor_id')
                ->groupBy('doctors.id', 'doctors.name', 'doctors.specialty')
                ->orderBy('appointments_count', 'desc')
                ->limit(10)
                ->get();
        } catch (\Throwable $e) {
            $doctorStats = [];
        }

        // 5. إجمالي المبيعات والإيرادات الشهرية
        $monthlyRevenue = Order::select(
            DB::raw('strftime("%Y-%m", created_at) as month'),
            DB::raw('COUNT(*) as total_orders'),
            DB::raw('SUM(total_price) as revenue')
        )
        ->where('status', '!=', 'cancelled')
        ->groupBy('month')
        ->orderBy('month', 'desc')
        ->limit(12)
        ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'visitor_stats' => $visitorStats,
                'medicine_sales' => $medicineSales,
                'appointment_stats' => $appointmentStats,
                'doctor_stats' => $doctorStats,
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }
}
