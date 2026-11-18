<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicien;
use App\Models\Order;
use App\Models\Pharmacy;
use App\Models\User;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminPharmacyApiController extends Controller
{
    /**
     * استعراض الصيدليات (للسوبر أدمن فقط) مع إحصائيات مخزون وطلبات كل صيدلية
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all')) {
            $list = Pharmacy::query()
                ->orderBy('name')
                ->get(['id', 'name', 'city', 'address', 'latitude', 'longitude', 'is_active'])
                ->map(static fn (Pharmacy $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'city' => $p->city,
                    'address' => $p->address,
                    'latitude' => (float) $p->latitude,
                    'longitude' => (float) $p->longitude,
                    'is_active' => (bool) $p->is_active,
                ]);

            return $this->successResponse([
                'data' => $list,
            ]);
        }

        $perPage = $this->resolvePerPage($request, default: 10, max: 100);

        $pharmacies = Pharmacy::query()
            ->filter($request->only(['search', 'status', 'city']))
            ->with('user:id,name,email,phone,role,account_status,created_at')
            ->withCount('medicines')
            ->withSum('medicines as total_stock', 'count')
            ->latest()
            ->paginate($perPage);

        // Compute distinct orders count per pharmacy on current page
        $pharmacyIds = $pharmacies->getCollection()->pluck('id')->all();
        $ordersCountByPharmacy = [];
        foreach ($pharmacyIds as $pid) {
            $ordersCountByPharmacy[$pid] = Order::forPharmacy((int) $pid)->count();
        }

        $pharmacies->getCollection()->transform(function (Pharmacy $pharmacy) use ($ordersCountByPharmacy) {
            $pharmacy->image_url = $pharmacy->image ? $pharmacy->image_url : null;
            $pharmacy->total_stock = (int) ($pharmacy->total_stock ?? 0);
            $pharmacy->orders_count = (int) ($ordersCountByPharmacy[$pharmacy->id] ?? 0);
            $pharmacy->login_email = PhoneNormalizer::isSyntheticEmail($pharmacy->user?->email ?? '')
                ? $pharmacy->email
                : ($pharmacy->user?->email ?? $pharmacy->email);
            $pharmacy->login_phone = $pharmacy->user?->phone ?? $pharmacy->phone;
            return $pharmacy;
        });

        return $this->paginatedResponse($pharmacies, [
            'meta' => [
                'total_pharmacies' => Pharmacy::count(),
                'active_pharmacies' => Pharmacy::where('is_active', true)->count(),
                'inactive_pharmacies' => Pharmacy::where('is_active', false)->count(),
                'total_assigned_medicines' => Medicien::whereNotNull('pharmacy_id')->count(),
            ],
        ]);
    }

    /**
     * عرض تفاصيل صيدلية محددة مع إحداثياتها ومؤشراتها
     */
    public function show($id): JsonResponse
    {
        $pharmacy = Pharmacy::with('user:id,name,email,phone,role,account_status,created_at')
            ->withCount('medicines')
            ->withSum('medicines as total_stock', 'count')
            ->findOrFail($id);

        $lowStockCount = Medicien::where('pharmacy_id', $pharmacy->id)->where('count', '<=', 5)->count();
        $ordersQuery = Order::forPharmacy((int) $pharmacy->id);
        $totalOrders = (clone $ordersQuery)->count();
        $completedOrders = (clone $ordersQuery)->where('status', 'completed')->count();

        $pharmacy->image_url = $pharmacy->image ? $pharmacy->image_url : null;

        return $this->successResponse([
            'data' => array_merge($pharmacy->toArray(), [
                'total_stock' => (int) ($pharmacy->total_stock ?? 0),
                'low_stock_count' => $lowStockCount,
                'orders_count' => $totalOrders,
                'completed_orders_count' => $completedOrders,
                'login_email' => PhoneNormalizer::isSyntheticEmail($pharmacy->user?->email ?? '')
                    ? $pharmacy->email
                    : ($pharmacy->user?->email ?? $pharmacy->email),
                'login_phone' => $pharmacy->user?->phone ?? $pharmacy->phone,
            ]),
        ]);
    }

    /**
     * إنشاء صيدلية جديدة وحساب الدخول الخاص بها بواسطة السوبر أدمن حصراً (مع الإحداثيات lat & long)
     */
    public function store(Request $request): JsonResponse
    {
        // Support lat / lng / long aliases cleanly alongside latitude / longitude
        if (!$request->filled('latitude') && $request->filled('lat')) {
            $request->merge(['latitude' => $request->input('lat')]);
        }
        if (!$request->filled('longitude')) {
            if ($request->filled('long')) {
                $request->merge(['longitude' => $request->input('long')]);
            } elseif ($request->filled('lng')) {
                $request->merge(['longitude' => $request->input('lng')]);
            }
        }
        if ($request->filled('email')) {
            $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:30',
            'password' => 'required|string|min:6|max:128',
            'city' => 'nullable|string|max:120',
            'address' => 'nullable|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'working_hours' => 'nullable|string|max:180',
            'license_number' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ]);

        $normalizedPhone = null;
        if (!empty($validated['phone'])) {
            $normalizedPhone = PhoneNormalizer::normalize((string) $validated['phone']);
            if (!$normalizedPhone || !PhoneNormalizer::isValid($normalizedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'صيغة رقم الهاتف غير صحيحة.',
                    'errors' => ['phone' => ['يرجى إدخال رقم هاتف صحيح (مثال: 01012345678).']],
                ], 422);
            }
            if (PhoneNormalizer::isTaken($normalizedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'رقم الهاتف مسجل بالفعل لحساب آخر.',
                    'errors' => ['phone' => ['رقم الهاتف مستخدم بالفعل في حساب آخر.']],
                ], 422);
            }
        }

        $isActive = $request->has('is_active')
            ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
            : true;

        $pharmacy = DB::transaction(function () use ($request, $validated, $normalizedPhone, $isActive) {
            $pharmacyUser = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $normalizedPhone,
                'password' => Hash::make((string) $validated['password']),
                'role' => 'pharmacy',
                'account_status' => $isActive ? 'active' : 'inactive',
            ]);

            $pharmacyModel = new Pharmacy([
                'user_id' => $pharmacyUser->id,
                'name' => $validated['name'],
                'phone' => $normalizedPhone,
                'email' => $validated['email'],
                'city' => $validated['city'] ?? null,
                'address' => $validated['address'] ?? null,
                'latitude' => round((float) $validated['latitude'], 7),
                'longitude' => round((float) $validated['longitude'], 7),
                'working_hours' => $validated['working_hours'] ?? null,
                'license_number' => $validated['license_number'] ?? null,
                'is_active' => $isActive,
                'created_by_admin_id' => Auth::id(),
            ]);

            if ($request->hasFile('image')) {
                $pharmacyModel->image = $pharmacyModel->storeUploadedImage($request, 'image', 'pharmacies');
            }

            $pharmacyModel->save();
            $pharmacyModel->setRelation('user', $pharmacyUser);

            return $pharmacyModel;
        });

        $pharmacy->image_url = $pharmacy->image ? $pharmacy->image_url : null;
        $pharmacy->medicines_count = 0;
        $pharmacy->total_stock = 0;
        $pharmacy->orders_count = 0;

        return $this->successResponse([
            'message' => 'تم إضافة الصيدلية وإنشاء حساب الدخول الخاص بها بنجاح',
            'data' => $pharmacy,
        ], 201);
    }

    /**
     * تحديث بيانات الصيدلية وإحداثياتها وبيانات الدخول الخاصة بها
     */
    public function update(Request $request, $id): JsonResponse
    {
        /** @var Pharmacy $pharmacy */
        $pharmacy = Pharmacy::with('user')->findOrFail($id);

        if (!$request->filled('latitude') && $request->filled('lat')) {
            $request->merge(['latitude' => $request->input('lat')]);
        }
        if (!$request->filled('longitude')) {
            if ($request->filled('long')) {
                $request->merge(['longitude' => $request->input('long')]);
            } elseif ($request->filled('lng')) {
                $request->merge(['longitude' => $request->input('lng')]);
            }
        }
        if ($request->filled('email')) {
            $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        }

        $linkedUserId = $pharmacy->user_id;

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . ($linkedUserId ?: 'NULL') . ',id',
            'phone' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:6|max:128',
            'city' => 'nullable|string|max:120',
            'address' => 'nullable|string|max:500',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'working_hours' => 'nullable|string|max:180',
            'license_number' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ]);

        $normalizedPhone = $pharmacy->phone;
        if ($request->has('phone')) {
            $rawPhone = trim((string) $request->input('phone', ''));
            if ($rawPhone === '') {
                $normalizedPhone = null;
            } else {
                $normalizedPhone = PhoneNormalizer::normalize($rawPhone);
                if (!$normalizedPhone || !PhoneNormalizer::isValid($normalizedPhone)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'صيغة رقم الهاتف غير صحيحة.',
                        'errors' => ['phone' => ['يرجى إدخال رقم هاتف صحيح (مثال: 01012345678).']],
                    ], 422);
                }
                if (PhoneNormalizer::isTaken($normalizedPhone, $linkedUserId)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'رقم الهاتف مسجل بالفعل لحساب آخر.',
                        'errors' => ['phone' => ['رقم الهاتف مستخدم بالفعل في حساب آخر.']],
                    ], 422);
                }
            }
        }

        DB::transaction(function () use ($request, $pharmacy, $validated, $normalizedPhone) {
            $isActive = $request->has('is_active')
                ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
                : (bool) $pharmacy->is_active;

            $pharmacy->fill([
                'name' => $validated['name'] ?? $pharmacy->name,
                'email' => $validated['email'] ?? $pharmacy->email,
                'phone' => $normalizedPhone,
                'city' => array_key_exists('city', $validated) ? $validated['city'] : $pharmacy->city,
                'address' => array_key_exists('address', $validated) ? $validated['address'] : $pharmacy->address,
                'latitude' => isset($validated['latitude']) ? round((float) $validated['latitude'], 7) : $pharmacy->latitude,
                'longitude' => isset($validated['longitude']) ? round((float) $validated['longitude'], 7) : $pharmacy->longitude,
                'working_hours' => array_key_exists('working_hours', $validated) ? $validated['working_hours'] : $pharmacy->working_hours,
                'license_number' => array_key_exists('license_number', $validated) ? $validated['license_number'] : $pharmacy->license_number,
                'is_active' => $isActive,
            ]);

            if ($request->hasFile('image')) {
                $pharmacy->image = $pharmacy->storeUploadedImage($request, 'image', 'pharmacies', $pharmacy->image);
            }

            $pharmacy->save();

            if ($pharmacy->user) {
                $userUpdates = [
                    'name' => $pharmacy->name,
                    'email' => $pharmacy->email ?: $pharmacy->user->email,
                    'phone' => $normalizedPhone,
                    'role' => 'pharmacy',
                    'account_status' => $isActive ? 'active' : 'inactive',
                ];
                if (!empty($validated['password'])) {
                    $userUpdates['password'] = Hash::make((string) $validated['password']);
                }
                $pharmacy->user->update($userUpdates);
            } elseif (!empty($validated['email']) && !empty($validated['password'])) {
                $newUser = User::create([
                    'name' => $pharmacy->name,
                    'email' => $validated['email'],
                    'phone' => $normalizedPhone,
                    'password' => Hash::make((string) $validated['password']),
                    'role' => 'pharmacy',
                    'account_status' => $isActive ? 'active' : 'inactive',
                ]);
                $pharmacy->user_id = $newUser->id;
                $pharmacy->save();
            }
        });

        $pharmacy->load('user:id,name,email,phone,role,account_status');
        $pharmacy->image_url = $pharmacy->image ? $pharmacy->image_url : null;

        return $this->successResponse([
            'message' => 'تم تحديث بيانات الصيدلية بنجاح',
            'data' => $pharmacy,
        ]);
    }

    /**
     * تفعيل أو إيقاف حساب الصيدلية
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $pharmacy = Pharmacy::with('user')->findOrFail($id);

        $nextActive = $request->has('is_active')
            ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
            : !$pharmacy->is_active;

        DB::transaction(function () use ($pharmacy, $nextActive) {
            $pharmacy->is_active = $nextActive;
            $pharmacy->save();

            if ($pharmacy->user) {
                $pharmacy->user->update([
                    'account_status' => $nextActive ? 'active' : 'inactive',
                ]);
            }
        });

        return $this->successResponse([
            'message' => $nextActive ? 'تم تفعيل حساب الصيدلية بنجاح' : 'تم إيقاف حساب الصيدلية بنجاح',
            'data' => $pharmacy,
        ]);
    }

    /**
     * حذف الصيدلية وحساب الدخول المرتبط بها
     */
    public function destroy($id): JsonResponse
    {
        $pharmacy = Pharmacy::with('user')->findOrFail($id);

        DB::transaction(function () use ($pharmacy) {
            $pharmacy->deleteStoredImage($pharmacy->image);
            Medicien::where('pharmacy_id', $pharmacy->id)->delete();
            Order::where('pharmacy_id', $pharmacy->id)->update(['pharmacy_id' => null]);
            $linkedUser = $pharmacy->user;
            $pharmacy->delete();

            if ($linkedUser && $linkedUser->role === 'pharmacy') {
                $linkedUser->delete();
            }
        });

        return $this->successResponse([
            'message' => 'تم حذف الصيدلية وحسابها بنجاح',
        ]);
    }
}
