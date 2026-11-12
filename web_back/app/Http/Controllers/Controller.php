<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * استخراج عدد عناصر الصفحة بأمان ضمن حدود دنيا وقصوى لمنع الاستعلامات الضخمة
     */
    protected function resolvePerPage(Request $request, int $default = 10, int $max = 100): int
    {
        $requested = (int) $request->input('per_page', $default);

        if ($requested < 1) {
            return $default;
        }

        return min($requested, $max);
    }

    /**
     * إرجاع استجابة JSON مرقمة قياسية للوحة التحكم
     */
    protected function paginatedResponse(LengthAwarePaginator $paginator, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'success' => true,
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ], $extra));
    }

    /**
     * إرجاع استجابة JSON ناجحة
     */
    protected function successResponse(array $payload = [], int $status = 200): JsonResponse
    {
        return response()->json(array_merge(['success' => true], $payload), $status);
    }

    /**
     * إرجاع استجابة JSON خطأ
     */
    protected function errorResponse(string $message, int $status = 400, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'success' => false,
            'message' => $message,
        ], $extra), $status);
    }
}
