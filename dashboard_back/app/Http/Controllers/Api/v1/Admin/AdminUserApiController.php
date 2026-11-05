<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserApiController extends Controller
{
    /**
     * استعراض قائمة المستخدمين والعملاء
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);

        $users = User::query()
            ->filter($request->only(['search', 'role']))
            ->latest()
            ->paginate($perPage);

        return $this->paginatedResponse($users);
    }

    /**
     * تفاصيل مستخدم محدد
     */
    public function show($id): JsonResponse
    {
        $user = User::findOrFail($id);

        return $this->successResponse([
            'data' => $user->toPublicArray(includeCreatedAt: true),
        ]);
    }

    /**
     * إضافة مستخدم أو مدير جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,user',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role' => $validatedData['role'],
        ]);

        return $this->successResponse([
            'message' => 'تم إنشاء المستخدم بنجاح',
            'data' => $user,
        ], 201);
    }

    /**
     * تعديل بيانات المستخدم وصلاحياته
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|required|in:admin,user',
        ]);

        $user->fill(collect($validatedData)->only(['name', 'email', 'role'])->toArray());

        if (!empty($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
        }

        $user->save();

        return $this->successResponse([
            'message' => 'تم تحديث بيانات المستخدم بنجاح',
            'data' => $user,
        ]);
    }

    /**
     * حذف مستخدم (مع منع حذف النفس)
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);

        if (Auth::id() === $user->id) {
            return $this->errorResponse('لا يمكنك حذف حسابك الشخصي المسجل به حالياً.', 400);
        }

        $user->delete();

        return $this->successResponse([
            'message' => 'تم حذف المستخدم بنجاح',
        ]);
    }
}
