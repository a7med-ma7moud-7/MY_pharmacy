<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class DashboardStaffApiMiddleware
{
    /**
     * Allows authenticated Super Admins (role=admin) or Active Pharmacies (role=pharmacy)
     * to access shared scoped dashboard endpoints (/auth/me, /auth/logout, /medicines, /orders).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tokenUser = User::verifyAdminToken($request->bearerToken());
        if ($tokenUser) {
            Auth::setUser($tokenUser);
        }

        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح. يرجى تسجيل الدخول أولاً.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if (!$user->isActiveAccount()) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الحساب معطل حالياً. يرجى التواصل مع الإدارة العليا.',
            ], 403);
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        if ($user->isPharmacy()) {
            $pharmacy = $user->relationLoaded('pharmacy') ? $user->pharmacy : $user->pharmacy()->first();
            if (!$pharmacy || !$pharmacy->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'حساب الصيدلية موقوف أو غير مفعل حالياً. يرجى التواصل مع الإدارة العليا.',
                ], 403);
            }

            $user->setRelation('pharmacy', $pharmacy);

            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'ليس لديك صلاحية الوصول إلى لوحة التحكم.',
        ], 403);
    }
}
