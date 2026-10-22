<?php

namespace App\Http\Controllers;

use App\Models\Medicien;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function index()
    {
        // Get visitor statistics (using the sessions table)
        $visitorStats = DB::table('sessions')
            ->select(DB::raw('DATE(last_activity) as date'), DB::raw('COUNT(*) as visitors'))
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        // Get medicine sales statistics
        $medicineSales = Medicien::select(
            'mediciens.name',
            DB::raw('COUNT(*) as total_sales'),
            DB::raw('SUM(order_items.price) as total_revenue')
        )
        ->join('order_items', 'mediciens.id', '=', 'order_items.medicine_id')
        ->groupBy('mediciens.id', 'mediciens.name')
        ->orderBy('total_sales', 'desc')
        ->limit(10)
        ->get();

        // Get appointment statistics
        $appointmentStats = Appointment::select(
            DB::raw('DATE(appointment_date) as date'),
            DB::raw('COUNT(*) as total_appointments'),
            'status'
        )
        ->groupBy('date', 'status')
        ->orderBy('date', 'desc')
        ->limit(30)
        ->get();

        // Get doctor-wise appointment statistics
        $doctorStats = DB::table('users')
            ->join('appointments', 'users.id', '=', 'appointments.doctor_id')
            ->select('users.name', DB::raw('COUNT(appointments.id) as appointments_count'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('appointments_count', 'desc')
            ->limit(10)
            ->get();

        return view('reports.index', compact(
            'visitorStats',
            'medicineSales',
            'appointmentStats',
            'doctorStats'
        ));
    }
} 