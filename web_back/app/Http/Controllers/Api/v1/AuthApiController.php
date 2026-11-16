<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\MedicalAuditLog;
use App\Models\User;
use App\Services\DoctorPatientAccessService;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthApiController extends Controller
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    /**
     * تسجيل حساب جديد (مريض / مستخدم عادي أو طبيب خاضع لسياسة التوثيق والتفعيل)
     */
    public function register(Request $request): JsonResponse
    {
        $accountType = strtolower(trim((string) $request->input('account_type', 'user')));
        if (!in_array($accountType, ['user', 'doctor'], true)) {
            return $this->errorResponse('نوع الحساب المختار غير صالح.', 422);
        }

        if ($accountType === 'doctor') {
            return $this->registerDoctor($request);
        }

        return $this->registerUser($request);
    }

    private function registerUser(Request $request): JsonResponse
    {
        if ($request->filled('email')) {
            $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        }

        $rawPhone = $request->input('phone');
        $normalizedPhone = $rawPhone !== null && trim((string) $rawPhone) !== ''
            ? PhoneNormalizer::normalize((string) $rawPhone)
            : null;

        if ($normalizedPhone !== null) {
            if (!PhoneNormalizer::isValid($normalizedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'صيغة رقم الهاتف غير صحيحة.',
                    'errors' => ['phone' => ['صيغة رقم الهاتف غير صحيحة (مثال: 01012345678).']],
                ], 422);
            }

            if (PhoneNormalizer::isTaken($normalizedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'رقم الهاتف مسجل بالفعل لحساب آخر.',
                    'errors' => ['phone' => ['رقم الهاتف مسجل بالفعل لحساب آخر.']],
                ], 422);
            }
        }

        $rules = [
            'name' => 'required|string|max:255',
            'email' => $normalizedPhone === null
                ? 'required|string|email|max:255|unique:users,email'
                : 'nullable|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
        ];

        $validated = $request->validate($rules);

        $email = !empty($validated['email'])
            ? $validated['email']
            : PhoneNormalizer::syntheticEmailForPhone((string) $normalizedPhone);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'phone' => $normalizedPhone,
            'password' => Hash::make($validated['password']),
            'role' => 'user',
            'account_status' => 'active',
        ]);

        $this->accessService->syncUserAppointments($user);

        Auth::login($user);

        return $this->successResponse([
            'message' => 'تم إنشاء الحساب بنجاح',
            'token' => $user->generateAuthToken(),
            'redirect_to' => '/',
            'user' => $user->toPublicArray(),
        ], 201);
    }

    private function registerDoctor(Request $request): JsonResponse
    {
        if ($request->filled('email')) {
            $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        }

        $rawPhone = (string) $request->input('phone', '');
        $normalizedPhone = PhoneNormalizer::normalize($rawPhone);

        if ($normalizedPhone === null || !PhoneNormalizer::isValid($normalizedPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'يرجى إدخال رقم هاتف صحيح للتسجيل كطبيب.',
                'errors' => ['phone' => ['يرجى إدخال رقم هاتف صحيح (مثال: 01012345678).']],
            ], 422);
        }

        if (PhoneNormalizer::isTaken($normalizedPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'رقم الهاتف مسجل مسبقاً في المنصة.',
                'errors' => ['phone' => ['رقم الهاتف مسجل مسبقاً في المنصة ولا يمكن تكراره.']],
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'specialty' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0|max:50000',
            'location' => 'nullable|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'clinic_name' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0|max:70',
            'qualifications' => 'nullable|string|max:2000',
            'bio' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
        ]);

        $email = !empty($validated['email'])
            ? $validated['email']
            : PhoneNormalizer::syntheticEmailForPhone($normalizedPhone);

        [$user, $doctor] = DB::transaction(function () use ($validated, $normalizedPhone, $email, $request) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $email,
                'phone' => $normalizedPhone,
                'password' => Hash::make($validated['password']),
                'role' => 'doctor',
                'account_status' => 'pending',
            ]);

            $doctor = new Doctor([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'image' => 'doctors/default-doctor.png',
                'specialty' => $validated['specialty'],
                'price' => (int) ($validated['price'] ?? 250),
                'number' => $normalizedPhone,
                'location' => $validated['location'] ?? 'القاهرة',
                'tow_location' => $validated['tow_location'] ?? null,
                'clinic_name' => $validated['clinic_name'] ?? null,
                'experience_years' => isset($validated['experience_years']) ? (int) $validated['experience_years'] : null,
                'qualifications' => $validated['qualifications'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'status' => 'inactive',
                'subscription' => 'subscribed',
                'verification_status' => 'pending_verification',
                'creation_method' => 'self_registered',
            ]);

            if ($request->hasFile('image')) {
                $doctor->syncUploadedImages($request);
            }

            $doctor->save();

            MedicalAuditLog::record(
                action: 'doctor.self_registered',
                targetType: 'doctor',
                targetId: $doctor->id,
                doctorId: $doctor->id,
                metadata: [
                    'specialty' => $doctor->specialty,
                    'creation_method' => 'self_registered',
                    'verification_status' => 'pending_verification',
                ],
                request: $request,
                actor: $user
            );

            return [$user, $doctor];
        });

        return $this->successResponse([
            'message' => 'تم استلام طلب تسجيل حساب الطبيب بنجاح! حسابك الآن قيد المراجعة والتوثيق من قِبل الإدارة، وسيمكنك تسجيل الدخول لبوابة الأطباء فور تفعيله.',
            'pending_verification' => true,
            'account_type' => 'doctor',
            'doctor_summary' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'specialty' => $doctor->specialty,
                'verification_status' => $doctor->verification_status,
            ],
            'user' => null,
        ], 201);
    }

    /**
     * تسجيل الدخول الموحد (برقم الهاتف أو البريد الإلكتروني) مع التوجيه والتحقق الصارم حسب الدور
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|string|max:255',
            'identifier' => 'nullable|string|max:255',
            'login_as' => 'nullable|string|in:user,doctor',
        ]);

        $rawIdentifier = trim((string) ($request->input('phone') ?? $request->input('identifier') ?? $request->input('email') ?? ''));
        if ($rawIdentifier === '') {
            return $this->errorResponse('يرجى إدخال رقم الهاتف وكلمة المرور.', 422);
        }

        $password = (string) $request->input('password');
        $loginAs = $request->input('login_as');

        $user = $this->findUserByIdentifier($rawIdentifier);

        if (!$user || !Hash::check($password, $user->password)) {
            return $this->errorResponse('بيانات الدخول غير صحيحة. تحقق من رقم الهاتف وكلمة المرور.', 401);
        }

        // Enforce portal selection guard if user explicitly chose Doctor login tab with a patient account
        if ($loginAs === 'doctor' && !$user->isDoctor() && !$user->isAdmin()) {
            return $this->errorResponse(
                'هذا الحساب مسجل كمستخدم عادي وليس حساب طبيب. يرجى استخدام تبويب دخول المستخدمين.',
                403,
                ['code' => 'ROLE_MISMATCH']
            );
        }

        // Strict verification & activation checks for Doctor accounts
        if ($user->isDoctor()) {
            $doctor = $user->doctor()->first();
            if (!$doctor) {
                return $this->errorResponse(
                    'لا يوجد ملف طبيب مرتبط بهذا الحساب. يرجى مراجعة الإدارة.',
                    403,
                    ['code' => 'DOCTOR_PROFILE_MISSING']
                );
            }

            if ($doctor->verification_status === 'pending_verification') {
                return $this->errorResponse(
                    'حساب الطبيب الخاص بك قيد المراجعة والتوثيق من قِبل الإدارة حالياً. سيتم تفعيل الدخول لبوابة الأطباء فور اعتماد الحساب.',
                    403,
                    ['code' => 'DOCTOR_PENDING_VERIFICATION']
                );
            }

            if ($doctor->verification_status === 'rejected') {
                return $this->errorResponse(
                    'تعذر تفعيل حساب الطبيب لعدم استيفاء متطلبات التوثيق المهني. يرجى التواصل مع إدارة المنصة.',
                    403,
                    ['code' => 'DOCTOR_VERIFICATION_REJECTED']
                );
            }

            if (!$user->isActiveAccount() || !$doctor->isActiveForBooking()) {
                return $this->errorResponse(
                    'حساب الطبيب غير نشط حالياً. يرجى التواصل مع إدارة المنصة لإعادة التفعيل.',
                    403,
                    ['code' => 'ACCOUNT_INACTIVE']
                );
            }
        } elseif (!$user->isActiveAccount()) {
            return $this->errorResponse(
                'هذا الحساب موقوف حالياً. يرجى التواصل مع خدمة العملاء.',
                403,
                ['code' => 'ACCOUNT_INACTIVE']
            );
        }

        Auth::login($user, $request->boolean('remember'));
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        if ($user->isUser()) {
            $this->accessService->syncUserAppointments($user);
        }

        if ($user->isDoctor() || $user->isAdmin()) {
            MedicalAuditLog::record(
                action: 'auth.login',
                targetType: 'user',
                targetId: $user->id,
                doctorId: $user->doctor?->id,
                request: $request,
                actor: $user
            );
        }

        $redirectTo = match (true) {
            $user->isDoctor() => '/doctor/dashboard',
            $user->isAdmin() => 'admin_dashboard',
            default => '/',
        };

        return $this->successResponse([
            'message' => 'تم تسجيل الدخول بنجاح',
            'token' => $user->generateAuthToken(),
            'redirect_to' => $redirectTo,
            'user' => $user->toPublicArray(),
        ]);
    }

    private function findUserByIdentifier(string $identifier): ?User
    {
        if (str_contains($identifier, '@')) {
            return User::where('email', strtolower($identifier))->first();
        }

        $variants = PhoneNormalizer::variants($identifier);
        if ($variants === []) {
            return null;
        }

        $user = User::whereIn('phone', $variants)->first();
        if ($user) {
            return $user;
        }

        // Also check if a Doctor record has this phone and is linked to a User
        $doctor = Doctor::whereIn('number', $variants)->whereNotNull('user_id')->first();
        return $doctor?->user;
    }

    /**
     * استرجاع بيانات المستخدم الحالي وفحص أهليته
     */
    public function user(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user || !$user->isActiveAccount()) {
            return response()->json([
                'authenticated' => false,
                'user' => null,
            ]);
        }

        if ($user->isDoctor()) {
            $doctor = $user->doctor()->first();
            if (!$doctor || !$doctor->isEligibleForPortal()) {
                return response()->json([
                    'authenticated' => false,
                    'user' => null,
                    'code' => 'DOCTOR_INELIGIBLE',
                ]);
            }
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
