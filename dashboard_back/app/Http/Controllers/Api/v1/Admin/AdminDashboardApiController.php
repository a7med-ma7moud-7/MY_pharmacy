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
     * إحصائيات ومعلومات لوحة التحكم الرئيسية بأقل عدد من الاستعلامات
     */
    public function index(): JsonResponse
    {
        $orderAggregates = Order::query()
            ->selectRaw("COUNT(*) as total_orders, COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) as total_revenue")
            ->first();

        return $this->successResponse([
            'stats' => [
                'total_doctors' => Doctor::count(),
                'total_medicines' => Medicien::count(),
                'total_users' => User::count(),
                'total_orders' => (int) ($orderAggregates->total_orders ?? 0),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
                'total_revenue' => (float) ($orderAggregates->total_revenue ?? 0),
            ],
            'recent_doctors' => Doctor::latest()->take(5)->get(),
            'recent_medicines' => Medicien::latest()->take(5)->get(),
            'recent_appointments' => Appointment::with('doctor:id,name,specialty')->latest()->take(5)->get(),
            'recent_orders' => Order::latest()->take(5)->get(),
        ]);
    }
}
