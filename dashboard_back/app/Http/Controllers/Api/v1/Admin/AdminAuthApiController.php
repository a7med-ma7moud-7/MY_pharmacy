<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthApiController extends Controller
{
    /**
     * تسجيل دخول الإدارة وإصدار رمز المصادقة
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            /** @var User $user */
            $user = Auth::user();

            if (!$user->isAdmin()) {
                Auth::logout();
                return $this->errorResponse(
                    'غير مصرح لك بالدخول إلى لوحة التحكم الإدارية. الحساب ليس مسؤولاً.',
                    403
                );
            }

            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            return $this->successResponse([
                'message' => 'تم تسجيل دخول المسؤول بنجاح',
                'token' => $user->generateAdminToken(),
                'user' => $user->toPublicArray(includeCreatedAt: true),
            ]);
        }

        return $this->errorResponse('بيانات الاعتماد غير متطابقة مع سجلاتنا.', 401);
    }

    /**
     * فحص واسترجاع بيانات المسؤول الحالي
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user) {
            return $this->errorResponse('غير مسجل الدخول', 401);
        }

        $unreadNotifications = $user->unreadNotifications ? $user->unreadNotifications->count() : 0;

        return $this->successResponse([
            'user' => array_merge($user->toPublicArray(), [
                'unread_notifications_count' => $unreadNotifications,
            ]),
        ]);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return $this->successResponse([
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }
}
