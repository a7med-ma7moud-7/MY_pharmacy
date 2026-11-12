<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthApiController extends Controller
{
    /**
     * تسجيل مستخدم جديد
     */
    public function register(Request $request): JsonResponse
    {
        if ($request->has('email')) {
            $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
        ]);

        Auth::login($user);

        return $this->successResponse([
            'message' => 'تم إنشاء الحساب بنجاح',
            'user' => $user->toPublicArray(),
        ], 201);
    }

    /**
     * تسجيل الدخول
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials['email'] = strtolower(trim($credentials['email']));

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            /** @var User $user */
            $user = Auth::user();

            return $this->successResponse([
                'message' => 'تم تسجيل الدخول بنجاح',
                'user' => $user->toPublicArray(),
            ]);
        }

        return $this->errorResponse('بيانات الاعتماد غير متطابقة مع سجلاتنا.', 401);
    }

    /**
     * استرجاع بيانات المستخدم الحالي
     */
    public function user(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'authenticated' => false,
                'user' => null,
            ]);
        }

        return response()->json([
            'authenticated' => true,
            'user' => $user->toPublicArray(),
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
