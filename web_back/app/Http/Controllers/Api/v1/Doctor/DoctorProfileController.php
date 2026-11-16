<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Models\MedicalAuditLog;
use App\Models\User;
use App\Support\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class DoctorProfileController extends DoctorPortalBaseController
{
    public function show(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        $doctor->appendResolvedImages();
        /** @var User $user */
        $user = Auth::user();

        return $this->successResponse([
            'data' => [
                'doctor' => $doctor,
                'account' => $user->toPublicArray(includeCreatedAt: true),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $doctor = $this->currentDoctor($request);
        /** @var User $user */
        $user = Auth::user();

        $rules = [
            'name' => 'sometimes|required|string|max:255',
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
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
            'current_password' => 'nullable|required_with:new_password|string',
            'new_password' => ['nullable', 'confirmed', Password::defaults()],
        ];

        for ($i = 1; $i <= 5; $i++) {
            $rules["image-{$i}"] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072';
        }

        $validated = $request->validate($rules);

        $normalizedPhone = null;
        if (array_key_exists('number', $validated)) {
            $normalizedPhone = PhoneNormalizer::normalize((string) $validated['number']);
            if (!$normalizedPhone || !PhoneNormalizer::isValid($normalizedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'صيغة رقم الهاتف غير صحيحة.',
                    'errors' => ['number' => ['يرجى إدخال رقم هاتف صحيح (مثال: 01012345678).']],
                ], 422);
            }

            if (PhoneNormalizer::isTaken($normalizedPhone, ignoreUserId: $user->id, ignoreDoctorId: $doctor->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'رقم الهاتف مستخدم بالفعل لحساب آخر.',
                    'errors' => ['number' => ['رقم الهاتف مستخدم بالفعل لحساب آخر.']],
                ], 422);
            }
        }

        if (!empty($validated['new_password'])) {
            if (!Hash::check((string) ($validated['current_password'] ?? ''), $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'كلمة المرور الحالية غير صحيحة.',
                    'errors' => ['current_password' => ['كلمة المرور الحالية غير صحيحة.']],
                ], 422);
            }
        }

        $newToken = null;

        DB::transaction(function () use ($doctor, $user, $validated, $normalizedPhone, $request, &$newToken) {
            $doctorFields = collect($validated)->only([
                'name',
                'specialty',
                'price',
                'location',
                'tow_location',
                'clinic_name',
                'working_hours',
                'experience_years',
                'qualifications',
                'bio',
            ])->toArray();

            if ($normalizedPhone !== null) {
                $doctorFields['number'] = $normalizedPhone;
                $user->phone = $normalizedPhone;
            }

            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }

            if (!empty($validated['email'])) {
                $user->email = strtolower(trim((string) $validated['email']));
            }

            if (!empty($validated['new_password'])) {
                $user->password = Hash::make((string) $validated['new_password']);
            }

            $doctor->fill($doctorFields);
            $doctor->syncUploadedImages($request);
            $doctor->save();

            $user->save();

            if (!empty($validated['new_password']) || !empty($validated['email'])) {
                $newToken = $user->fresh()->generateAuthToken();
            }

            MedicalAuditLog::record(
                action: 'doctor.profile_updated',
                targetType: 'doctor',
                targetId: $doctor->id,
                doctorId: $doctor->id,
                request: $request,
                actor: $user
            );
        });

        $doctor->refresh()->appendResolvedImages();
        $user->refresh();

        $payload = [
            'message' => 'تم تحديث ملفك المهني بنجاح وانعكست التغييرات على صفحتك العامة.',
            'data' => [
                'doctor' => $doctor,
                'account' => $user->toPublicArray(includeCreatedAt: true),
            ],
        ];

        if ($newToken !== null) {
            $payload['token'] = $newToken;
        }

        return $this->successResponse($payload);
    }
}
