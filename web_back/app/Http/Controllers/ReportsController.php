<?php

namespace App\Http\Controllers;

use App\Services\ReportService;

class ReportsController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService
    ) {}

    public function index()
    {
        $analytics = $this->reportService->getAnalyticsData();

        return view('reports.index', [
            'visitorStats' => $analytics['visitor_stats'],
            'medicineSales' => $analytics['medicine_sales'],
            'appointmentStats' => $analytics['appointment_stats'],
            'doctorStats' => $analytics['doctor_stats'],
        ]);
    }
}
