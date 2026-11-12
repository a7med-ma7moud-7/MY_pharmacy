<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardApiController extends Controller
{
    /**
     * إحصائيات ومعلومات لوحة التحكم الرئيسية بأقل عدد من الاستعلامات المجمعة
     */
    public function index(): JsonResponse
    {
        $orderAggregates = Order::query()
            ->selectRaw("COUNT(*) as total_orders, COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) as total_revenue")
            ->first();

        $medicineAggregates = Medicien::query()
            ->selectRaw("COUNT(*) as total_medicines, COALESCE(SUM(CASE WHEN count <= 5 THEN 1 ELSE 0 END), 0) as low_stock_count")
            ->first();

        $today = now()->toDateString();
        $appointmentAggregates = Appointment::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count, COALESCE(SUM(CASE WHEN DATE(appointment_date) = ? AND status != 'cancelled' THEN 1 ELSE 0 END), 0) as today_count", [$today])
            ->first();

        $recentDoctors = Doctor::latest()->take(5)->get()->each(function (Doctor $doc) {
            $doc->image_url = $doc->image_url;
        });

        $recentMedicines = Medicien::latest()->take(5)->get()->each(function (Medicien $med) {
            $med->image_url = $med->image_url;
            $med->is_in_stock = $med->is_in_stock;
        });

        return $this->successResponse([
            'stats' => [
                'total_doctors' => Doctor::count(),
                'total_medicines' => (int) ($medicineAggregates->total_medicines ?? 0),
                'low_stock_medicines' => (int) ($medicineAggregates->low_stock_count ?? 0),
                'total_users' => User::count(),
                'total_orders' => (int) ($orderAggregates->total_orders ?? 0),
                'pending_appointments' => (int) ($appointmentAggregates->pending_count ?? 0),
                'today_appointments' => (int) ($appointmentAggregates->today_count ?? 0),
                'total_revenue' => round((float) ($orderAggregates->total_revenue ?? 0), 2),
            ],
            'recent_doctors' => $recentDoctors,
            'recent_medicines' => $recentMedicines,
            'recent_appointments' => Appointment::with('doctor:id,name,specialty')->latest()->take(5)->get(),
            'recent_orders' => Order::latest()->take(5)->get(),
        ]);
    }
}
