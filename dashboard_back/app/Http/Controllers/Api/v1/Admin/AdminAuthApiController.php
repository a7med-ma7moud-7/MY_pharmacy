<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminAuthApiController extends Controller
{
    /**
     * تسجيل دخول الإدارة وإصدار رمز المصادقة
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();

            if (($user->role ?? null) !== 'admin') {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بالدخول إلى لوحة التحكم الإدارية. الحساب ليس مسؤولاً.',
                ], 403);
            }

            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            $token = base64_encode($user->id . '|' . hash_hmac('sha256', $user->id . '|' . $user->email . '|' . $user->password, config('app.key')));

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل دخول المسؤول بنجاح',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'بيانات الاعتماد غير متطابقة مع سجلاتنا.',
        ], 401);
    }

    /**
     * فحص واسترجاع بيانات المسؤول الحالي
     */
    public function me(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل الدخول',
            ], 401);
        }

        $unreadNotifications = $user->unreadNotifications ? $user->unreadNotifications->count() : 0;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'unread_notifications_count' => $unreadNotifications,
            ],
        ]);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request)
    {
        Auth::logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }
}
