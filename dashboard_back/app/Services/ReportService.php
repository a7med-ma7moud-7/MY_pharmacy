<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReportService
{
    /**
     * جمع كافة تقارير وإحصائيات النظام بشكل متوافق مع SQLite و MySQL
     */
    public function getAnalyticsData(): array
    {
        return [
            'visitor_stats' => $this->getVisitorStats(),
            'medicine_sales' => $this->getMedicineSales(),
            'appointment_stats' => $this->getAppointmentStats(),
            'doctor_stats' => $this->getDoctorStats(),
            'monthly_revenue' => $this->getMonthlyRevenue(),
        ];
    }

    public function getVisitorStats()
    {
        if (!Schema::hasTable('sessions')) {
            return [];
        }

        try {
            return DB::table('sessions')
                ->select(DB::raw('DATE(datetime(last_activity, "unixepoch")) as date'), DB::raw('COUNT(*) as visitors'))
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get();
        } catch (\Throwable $e) {
            try {
                return DB::table('sessions')
                    ->select(DB::raw('DATE(last_activity) as date'), DB::raw('COUNT(*) as visitors'))
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->limit(30)
                    ->get();
            } catch (\Throwable $e2) {
                return [];
            }
        }
    }

    public function getMedicineSales()
    {
        return Medicien::select(
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
    }

    public function getAppointmentStats()
    {
        return Appointment::select(
            DB::raw('DATE(appointment_date) as date'),
            DB::raw('COUNT(*) as total_appointments'),
            'status'
        )
            ->groupBy('date', 'status')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();
    }

    public function getDoctorStats()
    {
        try {
            return Doctor::select(
                'doctors.id',
                'doctors.name',
                'doctors.specialty',
                DB::raw('COUNT(appointments.id) as appointments_count')
            )
                ->join('appointments', 'doctors.id', '=', 'appointments.doctor_id')
                ->groupBy('doctors.id', 'doctors.name', 'doctors.specialty')
                ->orderBy('appointments_count', 'desc')
                ->limit(10)
                ->get();
        } catch (\Throwable $e) {
            return [];
        }
    }

    public function getMonthlyRevenue()
    {
        try {
            return Order::select(
                DB::raw('strftime("%Y-%m", created_at) as month'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_price) as revenue')
            )
                ->where('status', '!=', 'cancelled')
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get();
        } catch (\Throwable $e) {
            return [];
        }
    }
}

