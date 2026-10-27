<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class AdminApiMiddleware
{
    /**
     * Handle an incoming API request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check Bearer Token if present
        $bearerToken = $request->bearerToken();
        if ($bearerToken) {
            $decoded = base64_decode($bearerToken, true);
            if ($decoded && str_contains($decoded, '|')) {
                [$userId, $providedHash] = explode('|', $decoded, 2);
                $user = User::find($userId);
                if ($user) {
                    $expectedHash = hash_hmac('sha256', $user->id . '|' . $user->email . '|' . $user->password, config('app.key'));
                    if (hash_equals($expectedHash, $providedHash)) {
                        Auth::setUser($user);
                    }
                }
            }
        }

        // 2. Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح. يرجى تسجيل الدخول أولاً كمسؤول نظام.',
            ], 401);
        }

        // 3. Check if user has admin role
        $user = Auth::user();
        if (($user->role ?? null) !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'ليس لديك صلاحية الوصول إلى لوحة التحكم الإدارية.',
            ], 403);
        }

        return $next($request);
    }
}
