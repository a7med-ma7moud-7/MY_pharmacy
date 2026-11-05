<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class AdminReportsApiController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService
    ) {}

    /**
     * استرجاع كافة الإحصائيات والبيانات التحليلية للوحة التحكم
     */
    public function index(): JsonResponse
    {
        return $this->successResponse([
            'data' => $this->reportService->getAnalyticsData(),
        ]);
    }
}
