<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class DoctorApiMiddleware
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
                'message' => 'يرجى تسجيل الدخول أولاً للوصول إلى بوابة الأطباء.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if (!$user->isDoctor()) {
            return response()->json([
                'success' => false,
                'code' => 'FORBIDDEN_ROLE',
                'message' => 'غير مصرح لك بالوصول إلى بوابة الأطباء.',
            ], 403);
        }

        if (!$user->isActiveAccount()) {
            return response()->json([
                'success' => false,
                'code' => 'ACCOUNT_INACTIVE',
                'message' => 'حساب الطبيب غير مفعل حالياً. يرجى التواصل مع إدارة المنصة.',
            ], 403);
        }

        $doctor = $user->doctor()->first();
        if (!$doctor) {
            return response()->json([
                'success' => false,
                'code' => 'DOCTOR_PROFILE_MISSING',
                'message' => 'لا يوجد ملف طبيب مرتبط بهذا الحساب.',
            ], 403);
        }

        if (!$doctor->isVerified()) {
            return response()->json([
                'success' => false,
                'code' => 'DOCTOR_PENDING_VERIFICATION',
                'message' => 'حسابك قيد المراجعة والتوثيق من قِبل الإدارة، سيتم تفعيل البوابة فور الاعتماد.',
            ], 403);
        }

        if (!$doctor->isActiveForBooking()) {
            return response()->json([
                'success' => false,
                'code' => 'DOCTOR_INACTIVE',
                'message' => 'ملف الطبيب موقوف مؤقتاً من قِبل الإدارة.',
            ], 403);
        }

        $request->attributes->set('current_doctor', $doctor);

        return $next($request);
    }
}
