<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminAuthApiController extends Controller
{
    /**
     * تسجيل دخول الإدارة وإصدار رمز المصادقة (يدعم البريد الإلكتروني أو رقم الهاتف)
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'password' => 'required|string',
        ]);

        $rawIdentifier = trim((string) ($request->input('email') ?? $request->input('phone') ?? ''));
        if ($rawIdentifier === '') {
            return $this->errorResponse('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور.', 422);
        }

        $user = str_contains($rawIdentifier, '@')
            ? User::where('email', strtolower($rawIdentifier))->first()
            : User::whereIn('phone', PhoneNormalizer::variants($rawIdentifier))->first();

        if ($user && Hash::check((string) $request->input('password'), $user->password)) {
            if (!$user->isAdmin()) {
                return $this->errorResponse(
                    'غير مصرح لك بالدخول إلى لوحة التحكم الإدارية. الحساب ليس مسؤولاً.',
                    403
                );
            }

            if (!$user->isActiveAccount()) {
                return $this->errorResponse('حساب المسؤول غير مفعل حالياً.', 403);
            }

            Auth::login($user, $request->boolean('remember'));

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
