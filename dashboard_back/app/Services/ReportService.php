<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\Order;
use App\Models\PatientFollowUp;
use App\Models\Prescription;
use App\Models\Rating;
use App\Models\TreatedCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReportService
{
    public function getAnalyticsData(): array
    {
        return [
            'visitor_stats' => $this->getVisitorStats(),
            'medicine_sales' => $this->getMedicineSales(),
            'appointment_stats' => $this->getAppointmentStats(),
            'doctor_stats' => $this->getDoctorStats(),
            'doctor_portal_summary' => $this->getDoctorPortalSummary(),
            'monthly_revenue' => $this->getMonthlyRevenue(),
            'order_status_stats' => $this->getOrderStatusStats(),
            'low_stock_medicines' => $this->getLowStockMedicines(),
        ];
    }

    public function getDoctorPortalSummary(): array
    {
        try {
            return [
                'verified_doctors' => Doctor::where('verification_status', 'verified')->count(),
                'pending_verifications' => Doctor::where('verification_status', 'pending_verification')->count(),
                'self_registered_doctors' => Doctor::where('creation_method', 'self_registered')->count(),
                'admin_created_doctors' => Doctor::where('creation_method', 'admin_created')->count(),
                'published_treated_cases' => TreatedCase::where('status', 'published')->count(),
                'total_prescriptions' => Prescription::count(),
                'total_follow_ups' => PatientFollowUp::count(),
                'total_reviews' => Rating::visible()->count(),
            ];
        } catch (\Throwable) {
            return [];
        }
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
            return Doctor::query()
                ->withCount([
                    'appointments as appointments_count' => fn ($q) => $q->where('status', '!=', 'cancelled'),
                    'publishedTreatedCases as treated_cases_count',
                    'visibleRatings as ratings_count',
                    'prescriptions as prescriptions_count',
                ])
                ->withAvg(['visibleRatings as ratings_avg'], 'rating')
                ->orderByDesc('appointments_count')
                ->limit(10)
                ->get(['id', 'name', 'specialty', 'status', 'verification_status', 'creation_method'])
                ->map(function (Doctor $d) {
                    $rCount = (int) ($d->ratings_count ?? 0);
                    $d->average_rating = $rCount > 0 ? round((float) $d->ratings_avg, 1) : 0.0;
                    return $d;
                });
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
