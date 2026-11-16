<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticatedApiMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $bearer = $request->bearerToken();
        if ($bearer) {
            $tokenUser = User::verifyAuthToken($bearer);
            if ($tokenUser) {
                Auth::setUser($tokenUser);
            }
        }

        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'code' => 'UNAUTHENTICATED',
                'message' => 'يرجى تسجيل الدخول أولاً للمتابعة.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        if (!$user->isActiveAccount()) {
            return response()->json([
                'success' => false,
                'code' => 'ACCOUNT_INACTIVE',
                'message' => 'هذا الحساب غير مفعل حالياً.',
            ], 403);
        }

        return $next($request);
    }
}
