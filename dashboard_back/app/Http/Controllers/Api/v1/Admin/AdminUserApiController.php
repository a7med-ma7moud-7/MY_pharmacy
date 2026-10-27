<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserApiController extends Controller
{
    /**
     * استعراض قائمة المستخدمين والعملاء
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $perPage = $request->integer('per_page', 10);
        $users = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
            'total' => $users->total(),
        ]);
    }

    /**
     * تفاصيل مستخدم محدد
     */
    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * إضافة مستخدم أو مدير جديد
     */
    public function store(Request $request)
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

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المستخدم بنجاح',
            'data' => $user,
        ], 201);
    }

    /**
     * تعديل بيانات المستخدم وصلاحياته
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|required|in:admin,user',
        ]);

        $user->fill($request->only(['name', 'email', 'role']));

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المستخدم بنجاح',
            'data' => $user,
        ]);
    }

    /**
     * حذف مستخدم (مع منع حذف النفس)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if (Auth::id() === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكنك حذف حسابك الشخصي المسجل به حالياً.',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المستخدم بنجاح',
        ]);
    }
}
