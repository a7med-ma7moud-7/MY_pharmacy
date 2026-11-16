<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ResolveApiTokenUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $bearer = $request->bearerToken();
        if ($bearer) {
            $tokenUser = User::verifyAuthToken($bearer);
            if ($tokenUser) {
                Auth::setUser($tokenUser);
            }
        } elseif (Auth::check()) {
            /** @var User $sessionUser */
            $sessionUser = Auth::user();
            if (!$sessionUser->isActiveAccount()) {
                Auth::logout();
            }
        }

        return $next($request);
    }
}
