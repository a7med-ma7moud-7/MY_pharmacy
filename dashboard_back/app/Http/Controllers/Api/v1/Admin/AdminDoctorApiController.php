<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalAuditLog;
use App\Models\User;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AdminDoctorApiController extends Controller
{
    private const ALLOWED_STATUSES = 'active,inactive,متاح,نشط,غير متاح';
    private const ALLOWED_SUBSCRIPTIONS = 'subscribed,not_subscribed,سنوي,شهري,مشترك,غير مشترك';

    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 10, max: 100);

        $doctors = Doctor::query()
            ->filter(
                $request->only(['search', 'specialty', 'status', 'location', 'verification_status', 'creation_method']),
                includeContactInSearch: true
            )
            ->with('user:id,name,email,phone,role,account_status,created_at')
            ->withAvg(['visibleRatings as ratings_avg'], 'rating')
            ->withCount([
                'visibleRatings as ratings_count',
                'treatedCases as treated_cases_count',
                'appointments as appointments_count',
                'prescriptions as prescriptions_count',
            ])
            ->sortBy($request->query('sort'), defaultColumn: 'created_at', defaultDirection: 'desc')
            ->paginate($perPage);

        // Precompute distinct patient counts per doctor on current page
        $docIds = $doctors->getCollection()->pluck('id')->all();
        $patientsCountByDoctor = [];
        if ($docIds !== []) {
            $appts = Appointment::whereIn('doctor_id', $docIds)->get(['id', 'doctor_id', 'user_id', 'phone']);
            $grouped = [];
            foreach ($appts as $a) {
                $k = $a->user_id ? ('u_' . $a->user_id) : ('p_' . (PhoneNormalizer::normalize($a->phone) ?: $a->id));
                $grouped[$a->doctor_id][$k] = true;
            }
            foreach ($grouped as $did => $keys) {
                $patientsCountByDoctor[$did] = count($keys);
            }
        }

        $doctors->getCollection()->transform(function (Doctor $doctor) use ($patientsCountByDoctor) {
            $rCount = (int) ($doctor->ratings_count ?? 0);
            $doctor->average_rating = $rCount > 0 ? round((float) $doctor->ratings_avg, 1) : 0.0;
            $doctor->ratings_count = $rCount;
            $doctor->patients_count = $patientsCountByDoctor[$doctor->id] ?? 0;
            $doctor->has_login_account = (bool) $doctor->user_id;
            $doctor->account_status = $doctor->user?->account_status ?? ($doctor->status === 'active' ? 'active' : 'inactive');
            $doctor->appendResolvedImages();
            return $doctor;
        });

        $pendingVerificationsCount = Doctor::where('verification_status', 'pending_verification')->count();

        return $this->paginatedResponse($doctors, [
            'meta' => [
                'pending_verifications_count' => $pendingVerificationsCount,
            ],
        ]);
    }

    public function show($id): JsonResponse
    {
        $doctor = Doctor::with('user:id,name,email,phone,role,account_status,created_at')->findOrFail($id);
        $ratings = $doctor->ratings()
            ->with(['user:id,name,email', 'appointment:id,appointment_date'])
            ->latest()
            ->get();

        $visibleRatings = $ratings->filter(fn ($r) => ($r->status ?? 'visible') === 'visible');
        $ratingsCount = $visibleRatings->count();
        $averageRating = $ratingsCount > 0 ? round((float) $visibleRatings->avg('rating'), 1) : 0.0;

        $appts = Appointment::where('doctor_id', $doctor->id)->get(['id', 'user_id', 'phone', 'status']);
        $patientKeys = [];
        $completedAppointments = 0;
        foreach ($appts as $a) {
            $k = $a->user_id ? ('u_' . $a->user_id) : ('p_' . (PhoneNormalizer::normalize($a->phone) ?: $a->id));
            $patientKeys[$k] = true;
            if ($a->status === 'completed') {
                $completedAppointments++;
            }
        }

        $treatedCases = $doctor->treatedCases()->orderByDesc('published_at')->limit(10)->get();
        $prescriptionsCount = $doctor->prescriptions()->count();
        $followUpsCount = $doctor->followUps()->count();

        $doctor->appendResolvedImages();

        return $this->successResponse([
            'data' => array_merge($doctor->toArray(), [
                'has_login_account' => (bool) $doctor->user_id,
                'account_status' => $doctor->user?->account_status ?? ($doctor->status === 'active' ? 'active' : 'inactive'),
                'average_rating' => $averageRating,
                'ratings_count' => $ratingsCount,
                'ratings' => $ratings,
                'treated_cases' => $treatedCases,
                'activity_overview' => [
                    'total_treated_cases' => $doctor->treatedCases()->count(),
                    'total_patients' => count($patientKeys),
                    'total_appointments' => $appts->count(),
                    'completed_appointments' => $completedAppointments,
                    'average_rating' => $averageRating,
                    'total_reviews' => $ratingsCount,
                    'total_prescriptions' => $prescriptionsCount,
                    'total_follow_ups' => $followUpsCount,
                    'activity_status' => $doctor->isEligibleForPortal() ? 'active' : 'restricted',
                ],
            ]),
        ]);
    }

    /**
     * إنشاء حساب طبيب وملفه المهني يدوياً بواسطة المسؤول (Admin Created)
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
            'specialty' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0|max:50000',
            'number' => 'required|string|max:25',
            'password' => 'nullable|string|min:6|max:128',
            'email' => 'nullable|email|max:255|unique:users,email',
            'location' => 'nullable|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'clinic_name' => 'nullable|string|max:255',
            'working_hours' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0|max:70',
            'qualifications' => 'nullable|string|max:3000',
            'bio' => 'nullable|string|max:3000',
            'status' => 'nullable|in:' . self::ALLOWED_STATUSES,
            'subscription' => 'nullable|in:' . self::ALLOWED_SUBSCRIPTIONS,
        ];

        for ($i = 1; $i <= 5; $i++) {
            $rules["image-{$i}"] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072';
        }

        $validatedData = $request->validate($rules);

        $normalizedPhone = PhoneNormalizer::normalize((string) $validatedData['number']);
        if (!$normalizedPhone || !PhoneNormalizer::isValid($normalizedPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'صيغة رقم الهاتف غير صحيحة.',
                'errors' => ['number' => ['يرجى إدخال رقم هاتف صحيح (مثال: 01012345678).']],
            ], 422);
        }

        if (PhoneNormalizer::isTaken($normalizedPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'رقم الهاتف مسجل بالفعل لحساب آخر ولا يمكن تكراره.',
                'errors' => ['number' => ['رقم الهاتف مسجل بالفعل لحساب آخر.']],
            ], 422);
        }

        $status = $validatedData['status'] ?? 'active';
        $isActive = in_array($status, ['active', 'متاح', 'نشط'], true);
        $rawPassword = !empty($validatedData['password'])
            ? (string) $validatedData['password']
            : Str::random(16);

        $email = !empty($validatedData['email'])
            ? strtolower(trim((string) $validatedData['email']))
            : PhoneNormalizer::syntheticEmailForPhone($normalizedPhone);

        $doctor = DB::transaction(function () use ($validatedData, $normalizedPhone, $status, $isActive, $rawPassword, $email, $request) {
            $doctorUser = User::create([
                'name' => $validatedData['name'],
                'email' => $email,
                'phone' => $normalizedPhone,
                'password' => Hash::make($rawPassword),
                'role' => 'doctor',
                'account_status' => $isActive ? 'active' : 'inactive',
            ]);

            $fillableOnly = collect($validatedData)
                ->except(['image', 'image-1', 'image-2', 'image-3', 'image-4', 'image-5', 'password', 'email'])
                ->toArray();

            $doctor = new Doctor(array_merge([
                'image' => 'doctors/default-doctor.png',
                'price' => 250,
                'location' => 'القاهرة',
                'subscription' => 'subscribed',
            ], $fillableOnly, [
                'user_id' => $doctorUser->id,
                'number' => $normalizedPhone,
                'status' => $status,
                'verification_status' => 'verified',
                'creation_method' => 'admin_created',
            ]));

            $doctor->syncUploadedImages($request);
            $doctor->save();

            MedicalAuditLog::record(
                action: 'admin.doctor_created',
                targetType: 'doctor',
                targetId: $doctor->id,
                doctorId: $doctor->id,
                metadata: [
                    'creation_method' => 'admin_created',
                    'status' => $status,
                ],
                request: $request
            );

            return $doctor;
        });

        $doctor->load('user:id,name,email,phone,role,account_status,created_at');
        $doctor->appendResolvedImages();

        return $this->successResponse([
            'message' => 'تم إنشاء حساب الطبيب وملفه المهني بنجاح.',
            'data' => $doctor,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
            'specialty' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0|max:50000',
            'number' => 'sometimes|required|string|max:25',
            'location' => 'sometimes|required|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'clinic_name' => 'nullable|string|max:255',
            'working_hours' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0|max:70',
            'qualifications' => 'nullable|string|max:3000',
            'bio' => 'nullable|string|max:3000',
            'status' => 'sometimes|required|in:' . self::ALLOWED_STATUSES,
            'subscription' => 'sometimes|required|in:' . self::ALLOWED_SUBSCRIPTIONS,
            'verification_status' => 'nullable|in:verified,pending_verification,rejected',
        ];

        for ($i = 1; $i <= 5; $i++) {
            $rules["image-{$i}"] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072';
        }

        $validatedData = $request->validate($rules);

        $normalizedPhone = null;
        if (array_key_exists('number', $validatedData)) {
            $normalizedPhone = PhoneNormalizer::normalize((string) $validatedData['number']);
            if (!$normalizedPhone || !PhoneNormalizer::isValid($normalizedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'صيغة رقم الهاتف غير صحيحة.',
                    'errors' => ['number' => ['صيغة رقم الهاتف غير صحيحة.']],
                ], 422);
            }

            if (PhoneNormalizer::isTaken($normalizedPhone, ignoreUserId: $doctor->user_id, ignoreDoctorId: $doctor->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'رقم الهاتف مستخدم بالفعل لحساب آخر.',
                    'errors' => ['number' => ['رقم الهاتف مستخدم بالفعل لحساب آخر.']],
                ], 422);
            }
            $validatedData['number'] = $normalizedPhone;
        }

        DB::transaction(function () use ($doctor, $validatedData, $normalizedPhone, $request) {
            $fillableOnly = collect($validatedData)
                ->except(['image', 'image-1', 'image-2', 'image-3', 'image-4', 'image-5'])
                ->toArray();

            $doctor->fill($fillableOnly);
            $doctor->syncUploadedImages($request);
            $doctor->save();

            if ($doctor->user) {
                if (isset($validatedData['name'])) {
                    $doctor->user->name = $validatedData['name'];
                }
                if ($normalizedPhone !== null) {
                    $doctor->user->phone = $normalizedPhone;
                }
                if (isset($validatedData['status'])) {
                    $isActive = in_array($validatedData['status'], ['active', 'متاح', 'نشط'], true)
                        && $doctor->verification_status === 'verified';
                    $doctor->user->account_status = $isActive ? 'active' : 'inactive';
                }
                $doctor->user->save();
            }

            MedicalAuditLog::record(
                action: 'admin.doctor_updated',
                targetType: 'doctor',
                targetId: $doctor->id,
                doctorId: $doctor->id,
                request: $request
            );
        });

        $doctor->refresh()->load('user:id,name,email,phone,role,account_status,created_at');
        $doctor->appendResolvedImages();

        return $this->successResponse([
            'message' => 'تم تحديث بيانات الطبيب بنجاح.',
            'data' => $doctor,
        ]);
    }

    /**
     * تفعيل أو تعطيل حساب الطبيب
     */
    public function updateAccountStatus(Request $request, $id): JsonResponse
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $activate = $validated['status'] === 'active';

        DB::transaction(function () use ($doctor, $activate, $request) {
            $doctor->status = $activate ? 'active' : 'inactive';
            if ($activate && $doctor->verification_status === 'pending_verification') {
                $doctor->verification_status = 'verified';
            }
            $doctor->save();

            if ($doctor->user) {
                $doctor->user->account_status = $activate ? 'active' : 'inactive';
                $doctor->user->save();
            }

            MedicalAuditLog::record(
                action: $activate ? 'admin.doctor_activated' : 'admin.doctor_deactivated',
                targetType: 'doctor',
                targetId: $doctor->id,
                doctorId: $doctor->id,
                request: $request
            );
        });

        return $this->successResponse([
            'message' => $activate ? 'تم تفعيل حساب الطبيب بنجاح.' : 'تم تعطيل حساب الطبيب وإيقاف صلاحية دخوله فوراً.',
            'data' => $doctor->fresh()->load('user:id,name,email,phone,role,account_status,created_at'),
        ]);
    }

    /**
     * مراجعة وتوثيق طلبات تسجيل الأطباء الذاتية (Self-Registered)
     */
    public function verifyDoctor(Request $request, $id): JsonResponse
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        $validated = $request->validate([
            'verification_status' => 'required|in:verified,rejected,pending_verification',
        ]);

        $newVerification = $validated['verification_status'];

        DB::transaction(function () use ($doctor, $newVerification, $request) {
            $doctor->verification_status = $newVerification;

            if ($newVerification === 'verified') {
                $doctor->status = 'active';
                if ($doctor->user) {
                    $doctor->user->account_status = 'active';
                    $doctor->user->save();
                }
            } else {
                $doctor->status = 'inactive';
                if ($doctor->user) {
                    $doctor->user->account_status = $newVerification === 'pending_verification' ? 'pending' : 'inactive';
                    $doctor->user->save();
                }
            }

            $doctor->save();

            MedicalAuditLog::record(
                action: 'admin.doctor_verification_updated',
                targetType: 'doctor',
                targetId: $doctor->id,
                doctorId: $doctor->id,
                metadata: ['verification_status' => $newVerification],
                request: $request
            );
        });

        $msg = match ($newVerification) {
            'verified' => 'تم توثيق وتفعيل حساب الطبيب بنجاح! يمكنه الآن الدخول إلى بوابة الأطباء.',
            'rejected' => 'تم رفض توثيق الحساب وإيقاف تفعيله.',
            default => 'تمت إعادة حالة الحساب إلى قيد المراجعة.',
        };

        return $this->successResponse([
            'message' => $msg,
            'data' => $doctor->fresh()->load('user:id,name,email,phone,role,account_status,created_at'),
        ]);
    }

    /**
     * إعادة تعيين كلمة مرور الطبيب بشكل آمن (تشفير كامل دون عرض كلمات المرور نهائياً)
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $normalizedPhone = PhoneNormalizer::normalize((string) $doctor->number);
        if (!$normalizedPhone || !PhoneNormalizer::isValid($normalizedPhone)) {
            return $this->errorResponse('يجب أن يحتوي ملف الطبيب على رقم هاتف صالح قبل تفعيل بيانات الدخول.', 422);
        }

        DB::transaction(function () use ($doctor, $validated, $normalizedPhone, $request) {
            if ($doctor->user) {
                $doctor->user->phone = $normalizedPhone;
                $doctor->user->password = Hash::make($validated['password']);
                if ($doctor->status === 'active' && $doctor->isVerified()) {
                    $doctor->user->account_status = 'active';
                }
                $doctor->user->save();
            } else {
                // Create & link authentication account for legacy seeded doctor record
                if (PhoneNormalizer::isTaken($normalizedPhone, ignoreDoctorId: $doctor->id)) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'رقم هاتف هذا الطبيب مرتبط بحساب مستخدم آخر بالفعل.',
                    ], 422));
                }

                $user = User::create([
                    'name' => $doctor->name,
                    'email' => PhoneNormalizer::syntheticEmailForPhone($normalizedPhone),
                    'phone' => $normalizedPhone,
                    'password' => Hash::make($validated['password']),
                    'role' => 'doctor',
                    'account_status' => ($doctor->status === 'active' && $doctor->isVerified()) ? 'active' : 'inactive',
                ]);

                $doctor->number = $normalizedPhone;
                $doctor->user_id = $user->id;
                $doctor->save();
            }

            MedicalAuditLog::record(
                action: 'admin.doctor_password_reset',
                targetType: 'doctor',
                targetId: $doctor->id,
                doctorId: $doctor->id,
                request: $request
            );
        });

        return $this->successResponse([
            'message' => 'تم إعادة تعيين كلمة مرور الطبيب بأمان وتحديث بيانات المصادقة.',
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        DB::transaction(function () use ($doctor) {
            $linkedUser = $doctor->user;
            $doctorId = $doctor->id;
            $doctor->deleteAllStoredImages();
            $doctor->delete();

            if ($linkedUser && $linkedUser->role === 'doctor') {
                $linkedUser->delete();
            }

            MedicalAuditLog::record(
                action: 'admin.doctor_deleted',
                targetType: 'doctor',
                targetId: $doctorId,
                doctorId: $doctorId
            );
        });

        return $this->successResponse([
            'message' => 'تم حذف الطبيب وحسابه المرتبط بنجاح.',
        ]);
    }
}
