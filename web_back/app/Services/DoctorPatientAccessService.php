<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use App\Support\PhoneNormalizer;
use Illuminate\Database\Eloquent\Builder;

class DoctorPatientAccessService
{
    /**
     * Link any unlinked appointments matching this user's verified phone or real email.
     */
    public function syncUserAppointments(User $user): void
    {
        $phoneVariants = $user->phone ? PhoneNormalizer::variants($user->phone) : [];
        $hasRealEmail = !empty($user->email) && !PhoneNormalizer::isSyntheticEmail($user->email);

        if ($phoneVariants === [] && !$hasRealEmail) {
            return;
        }

        Appointment::query()
            ->whereNull('user_id')
            ->where(function (Builder $q) use ($phoneVariants, $hasRealEmail, $user) {
                if ($phoneVariants !== []) {
                    $q->orWhereIn('phone', $phoneVariants);
                }
                if ($hasRealEmail) {
                    $q->orWhereRaw('LOWER(email) = ?', [strtolower($user->email)]);
                }
            })
            ->update(['user_id' => $user->id]);
    }

    /**
     * Query appointments strictly between a specific User (patient) and a specific Doctor.
     */
    public function appointmentsBetweenUserAndDoctor(User $patient, int $doctorId): Builder
    {
        $this->syncUserAppointments($patient);
        $phoneVariants = $patient->phone ? PhoneNormalizer::variants($patient->phone) : [];
        $hasRealEmail = !empty($patient->email) && !PhoneNormalizer::isSyntheticEmail($patient->email);

        return Appointment::query()
            ->where('doctor_id', $doctorId)
            ->where(function (Builder $q) use ($patient, $phoneVariants, $hasRealEmail) {
                $q->where('user_id', $patient->id);
                if ($phoneVariants !== []) {
                    $q->orWhereIn('phone', $phoneVariants);
                }
                if ($hasRealEmail) {
                    $q->orWhereRaw('LOWER(email) = ?', [strtolower($patient->email)]);
                }
            });
    }

    /**
     * Check if a registered patient has booked an eligible (non-cancelled) appointment with this doctor for chat.
     */
    public function canPatientChatWithDoctor(User $patient, int $doctorId): bool
    {
        if (!$patient->isActiveAccount()) {
            return false;
        }

        return $this->appointmentsBetweenUserAndDoctor($patient, $doctorId)
            ->where('status', '!=', 'cancelled')
            ->exists();
    }

    /**
     * Resolve a patient_key ("u_{userId}" or "p_{phone}" or numeric userId) strictly scoped to $doctor.
     * Returns null if NO appointment relationship exists between $doctor and this patient!
     *
     * @return array{
     *   patient_key: string,
     *   patient_user: ?User,
     *   patient_user_id: ?int,
     *   patient_name: string,
     *   patient_phone: ?string,
     *   patient_email: ?string,
     *   phone_variants: list<string>
     * }|null
     */
    public function resolveAuthorizedPatientForDoctor(Doctor $doctor, string|int $patientIdentifier): ?array
    {
        $rawKey = trim((string) $patientIdentifier);

        // Case 1: Explicit user key "u_123" or plain numeric user ID
        if (str_starts_with($rawKey, 'u_') || ctype_digit($rawKey)) {
            $uid = (int) (str_starts_with($rawKey, 'u_') ? substr($rawKey, 2) : $rawKey);
            $user = User::find($uid);
            if ($user) {
                $appointments = $this->appointmentsBetweenUserAndDoctor($user, (int) $doctor->id)
                    ->orderByDesc('appointment_date')
                    ->get();

                if ($appointments->isNotEmpty()) {
                    $latest = $appointments->first();
                    $displayEmail = PhoneNormalizer::isSyntheticEmail($user->email)
                        ? ($latest->email ?: null)
                        : $user->email;
                    $phone = $user->phone ?: PhoneNormalizer::normalize($latest->phone);

                    return [
                        'patient_key' => 'u_' . $user->id,
                        'patient_user' => $user,
                        'patient_user_id' => $user->id,
                        'patient_name' => $user->name ?: $latest->patient_name,
                        'patient_phone' => $phone,
                        'patient_email' => $displayEmail,
                        'phone_variants' => $phone ? PhoneNormalizer::variants($phone) : [],
                    ];
                }
            }

            // If plain digits didn't match a user with appointments, check if it's a phone number
            if (!ctype_digit($rawKey) || strlen($rawKey) < 8) {
                return null;
            }
        }

        // Case 2: Phone key "p_010..." or raw phone string
        $rawPhone = str_starts_with($rawKey, 'p_') ? substr($rawKey, 2) : $rawKey;
        $normPhone = PhoneNormalizer::normalize($rawPhone);
        if (!$normPhone) {
            return null;
        }

        $variants = PhoneNormalizer::variants($normPhone);
        $matchingUser = User::whereIn('phone', $variants)->first();
        if ($matchingUser) {
            $this->syncUserAppointments($matchingUser);
        }

        $appointments = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->where(function (Builder $q) use ($variants, $matchingUser) {
                $q->whereIn('phone', $variants);
                if ($matchingUser) {
                    $q->orWhere('user_id', $matchingUser->id);
                }
            })
            ->orderByDesc('appointment_date')
            ->get();

        if ($appointments->isEmpty()) {
            return null;
        }

        $latest = $appointments->first();

        return [
            'patient_key' => $matchingUser ? ('u_' . $matchingUser->id) : ('p_' . $normPhone),
            'patient_user' => $matchingUser,
            'patient_user_id' => $matchingUser?->id,
            'patient_name' => $matchingUser?->name ?: $latest->patient_name,
            'patient_phone' => $normPhone,
            'patient_email' => $matchingUser && !PhoneNormalizer::isSyntheticEmail($matchingUser->email)
                ? $matchingUser->email
                : ($latest->email ?: null),
            'phone_variants' => $variants,
        ];
    }
}
