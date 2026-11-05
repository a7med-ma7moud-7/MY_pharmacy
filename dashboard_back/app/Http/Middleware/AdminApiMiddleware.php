<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminApiMiddleware
{
    /**
     * Handle an incoming API request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check Bearer Token if present
        $tokenUser = User::verifyAdminToken($request->bearerToken());
        if ($tokenUser) {
            Auth::setUser($tokenUser);
        }

        // 2. Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح. يرجى تسجيل الدخول أولاً كمسؤول نظام.',
            ], 401);
        }

        // 3. Check if user has admin role
        /** @var User $user */
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'ليس لديك صلاحية الوصول إلى لوحة التحكم الإدارية.',
            ], 403);
        }

        return $next($request);
    }
}
