<?php

declare(strict_types=1);

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
            'order_status_stats' => $this->getOrderStatusStats(),
            'low_stock_medicines' => $this->getLowStockMedicines(),
        ];
    }

    public function getVisitorStats()
    {
        if (!Schema::hasTable('sessions')) {
            return [];
        }

        $isSqlite = DB::getDriverName() === 'sqlite';

        try {
            $dateExpr = $isSqlite
                ? 'DATE(datetime(last_activity, "unixepoch"))'
                : 'DATE(FROM_UNIXTIME(last_activity))';

            return DB::table('sessions')
                ->select(DB::raw("{$dateExpr} as date"), DB::raw('COUNT(*) as visitors'))
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get();
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * حساب مبيعات وعوائد الأدوية الفعلية (مع استبعاد الطلبات الملغاة وحساب مجموع العبوات الفعلي)
     */
    public function getMedicineSales()
    {
        return Medicien::select(
            'mediciens.id',
            'mediciens.name',
            DB::raw('COALESCE(SUM(order_items.quantity), COUNT(order_items.id), 0) as total_sales'),
            DB::raw('COALESCE(SUM(order_items.total), SUM(order_items.price * order_items.quantity), 0) as total_revenue')
        )
            ->join('order_items', 'mediciens.id', '=', 'order_items.medicine_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('mediciens.id', 'mediciens.name')
            ->orderByDesc('total_sales')
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
                ->where('appointments.status', '!=', 'cancelled')
                ->groupBy('doctors.id', 'doctors.name', 'doctors.specialty')
                ->orderByDesc('appointments_count')
                ->limit(10)
                ->get();
        } catch (\Throwable) {
            return [];
        }
    }

    public function getMonthlyRevenue()
    {
        try {
            $monthExpr = DB::getDriverName() === 'sqlite'
                ? 'strftime("%Y-%m", created_at)'
                : 'DATE_FORMAT(created_at, "%Y-%m")';

            return Order::select(
                DB::raw("{$monthExpr} as month"),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('COALESCE(SUM(total_price), 0) as revenue')
            )
                ->where('status', '!=', 'cancelled')
                ->groupBy('month')
                ->orderByDesc('month')
                ->limit(12)
                ->get();
        } catch (\Throwable) {
            return [];
        }
    }

    public function getOrderStatusStats()
    {
        try {
            return Order::select(
                'status',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(total_price), 0) as total_amount')
            )
                ->groupBy('status')
                ->get();
        } catch (\Throwable) {
            return [];
        }
    }

    public function getLowStockMedicines()
    {
        try {
            return Medicien::select('id', 'name', 'type', 'count', 'price')
                ->where('count', '<=', 5)
                ->orderBy('count', 'asc')
                ->limit(10)
                ->get();
        } catch (\Throwable) {
            return [];
        }
    }
}
