<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Models\Appointment;
use App\Models\DoctorPatientConversation;
use App\Models\Order;
use App\Models\PatientFollowUp;
use App\Models\Prescription;
use App\Models\User;
use App\Services\DoctorPatientAccessService;
use App\Support\PhoneNormalizer;

class AuthorizedPatientDataService
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    /**
     * استرجاع السجلات الشخصية المصرح بها للمستخدم المسجل فقط وفق مبدأ تقليل البيانات (Data Minimization)
     * لا يتم استدعاء أي استعلام قاعدة بيانات أبداً للزوار (Guests)
     *
     * @param list<string> $scopes
     * @return array{
     *   authorized: bool,
     *   reason: string|null,
     *   has_any_data: bool,
     *   records: array<string, mixed>,
     *   missing_scopes: list<string>,
     *   extracted_medications: list<string>,
     *   summary_ar: string,
     *   summary_en: string
     * }
     */
    public function retrieve(?User $user, array $scopes): array
    {
        if ($user === null) {
            return [
                'authorized' => false,
                'reason' => 'guest_login_required',
                'has_any_data' => false,
                'records' => [],
                'missing_scopes' => $scopes,
                'extracted_medications' => [],
                'summary_ar' => '',
                'summary_en' => '',
            ];
        }

        if (!$user->isActiveAccount()) {
            return [
                'authorized' => false,
                'reason' => 'inactive_account',
                'has_any_data' => false,
                'records' => [],
                'missing_scopes' => $scopes,
                'extracted_medications' => [],
                'summary_ar' => '',
                'summary_en' => '',
            ];
        }

        $this->accessService->syncUserAppointments($user);

        $phoneVariants = $user->phone ? PhoneNormalizer::variants($user->phone) : [];
        $records = [];
        $missingScopes = [];
        $extractedMedications = [];
        $arLines = [];
        $enLines = [];

        if (in_array('profile', $scopes, true)) {
            $displayEmail = PhoneNormalizer::isSyntheticEmail((string) $user->email) ? null : $user->email;
            $records['profile'] = [
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $displayEmail,
                'role' => $user->role ?? 'user',
            ];
            $arLines[] = '• **بيانات الحساب:** الاسم: `' . $user->name . '`'
                . ($user->phone ? ' | الهاتف: `' . $user->phone . '`' : '')
                . ($displayEmail ? ' | البريد: `' . $displayEmail . '`' : '');
            $enLines[] = '• **Account Profile:** Name: `' . $user->name . '`'
                . ($user->phone ? ' | Phone: `' . $user->phone . '`' : '')
                . ($displayEmail ? ' | Email: `' . $displayEmail . '`' : '');
        }

        if (in_array('prescriptions', $scopes, true)) {
            $prescriptions = Prescription::query()
                ->where(function ($q) use ($user, $phoneVariants) {
                    $q->where('patient_user_id', $user->id);
                    if ($phoneVariants !== []) {
                        $q->orWhereIn('patient_phone', $phoneVariants);
                    }
                })
                ->with(['doctor:id,name,specialty', 'items'])
                ->orderByDesc('prescribed_date')
                ->orderByDesc('id')
                ->limit(10)
                ->get();

            if ($prescriptions->isEmpty()) {
                $missingScopes[] = 'prescriptions';
                $arLines[] = '• **الروشتات الطبية:** لا توجد روشتات طبية مسجلة في حسابك حالياً.';
                $enLines[] = '• **Prescriptions:** No prescriptions are currently recorded in your account.';
            } else {
                $records['prescriptions'] = $prescriptions->map(function (Prescription $rx) use (&$extractedMedications) {
                    $items = $rx->items->map(function ($item) use (&$extractedMedications) {
                        $extractedMedications[] = (string) $item->medicine_name;
                        return [
                            'medicine_name' => $item->medicine_name,
                            'dosage' => $item->dosage,
                            'duration' => $item->duration,
                            'instructions' => $item->instructions,
                        ];
                    })->values()->all();

                    return [
                        'id' => $rx->id,
                        'prescription_number' => $rx->prescription_number,
                        'prescribed_date' => $rx->prescribed_date?->format('Y-m-d') ?? (string) $rx->prescribed_date,
                        'status' => $rx->status,
                        'diagnosis' => $rx->diagnosis,
                        'notes' => $rx->notes,
                        'doctor_name' => $rx->doctor?->name,
                        'doctor_specialty' => $rx->doctor?->specialty,
                        'items' => $items,
                    ];
                })->values()->all();

                $arLines[] = '**الروشتات والأدوية الموصوفة في حسابك:**';
                $enLines[] = '**Prescriptions & Recorded Medications in Your Account:**';

                foreach ($records['prescriptions'] as $rxData) {
                    $docAr = $rxData['doctor_name'] ? "د. {$rxData['doctor_name']} ({$rxData['doctor_specialty']})" : 'طبيب معالج';
                    $docEn = $rxData['doctor_name'] ? "Dr. {$rxData['doctor_name']} ({$rxData['doctor_specialty']})" : 'Treating Doctor';
                    $arLines[] = "• روشتة رقم `{$rxData['prescription_number']}` بتاريخ `{$rxData['prescribed_date']}` — {$docAr} — التشخيص المسجل: **{$rxData['diagnosis']}** (الحالة: {$rxData['status']}):";
                    $enLines[] = "• Prescription `{$rxData['prescription_number']}` on `{$rxData['prescribed_date']}` — {$docEn} — Recorded diagnosis: **{$rxData['diagnosis']}** (Status: {$rxData['status']}):";

                    foreach ($rxData['items'] as $item) {
                        $durAr = !empty($item['duration']) ? " — المدة: {$item['duration']}" : '';
                        $instAr = !empty($item['instructions']) ? " ({$item['instructions']})" : '';
                        $arLines[] = "  - **{$item['medicine_name']}**: الجرعة المسجلة `{$item['dosage']}`{$durAr}{$instAr}";

                        $durEn = !empty($item['duration']) ? " — Duration: {$item['duration']}" : '';
                        $instEn = !empty($item['instructions']) ? " ({$item['instructions']})" : '';
                        $enLines[] = "  - **{$item['medicine_name']}**: Recorded dosage `{$item['dosage']}`{$durEn}{$instEn}";
                    }
                }
            }
        }

        if (in_array('appointments', $scopes, true)) {
            $appointments = Appointment::query()
                ->where('user_id', $user->id)
                ->with('doctor:id,name,specialty,location,tow_location')
                ->orderByDesc('appointment_date')
                ->limit(10)
                ->get();

            if ($appointments->isEmpty()) {
                $missingScopes[] = 'appointments';
                $arLines[] = '• **المواعيد الطبية:** لا توجد مواعيد طبية محجوزة في حسابك حالياً.';
                $enLines[] = '• **Appointments:** You do not have any medical appointments recorded in your account.';
            } else {
                $today = now()->toDateString();
                $upcoming = $appointments->filter(
                    fn ($a) => ((string) ($a->appointment_date?->format('Y-m-d') ?? $a->appointment_date)) >= $today && $a->status !== 'cancelled'
                )->sortBy('appointment_date')->values();

                $records['appointments'] = $appointments->map(fn (Appointment $a) => [
                    'id' => $a->id,
                    'date' => $a->appointment_date?->format('Y-m-d') ?? (string) $a->appointment_date,
                    'time' => $a->appointment_time,
                    'status' => $a->status,
                    'doctor_name' => $a->doctor?->name,
                    'doctor_specialty' => $a->doctor?->specialty,
                    'location' => $a->doctor?->location,
                ])->values()->all();

                if ($upcoming->isNotEmpty()) {
                    $next = $upcoming->first();
                    $nextDate = $next->appointment_date?->format('Y-m-d') ?? (string) $next->appointment_date;
                    $arLines[] = "• **موعدك القادم:** مع **د. {$next->doctor?->name}** (تخصص {$next->doctor?->specialty}) يوم `{$nextDate}` الساعة `{$next->appointment_time}` — الحالة: **{$next->status}**.";
                    $enLines[] = "• **Your Next Upcoming Appointment:** With **Dr. {$next->doctor?->name}** ({$next->doctor?->specialty}) on `{$nextDate}` at `{$next->appointment_time}` — Status: **{$next->status}**.";
                } else {
                    $arLines[] = '• **المواعيد القادمة:** لا توجد مواعيد قادمة مجدولة حالياً.';
                    $enLines[] = '• **Upcoming Appointments:** You have no upcoming scheduled appointments right now.';
                }

                $arLines[] = '**آخر المواعيد المسجلة في حسابك:**';
                $enLines[] = '**Recent Appointments in Your Account:**';
                foreach (array_slice($records['appointments'], 0, 5) as $appt) {
                    $arLines[] = "  - د. {$appt['doctor_name']} ({$appt['doctor_specialty']}) — `{$appt['date']}` الساعة `{$appt['time']}` ({$appt['status']})";
                    $enLines[] = "  - Dr. {$appt['doctor_name']} ({$appt['doctor_specialty']}) — `{$appt['date']}` at `{$appt['time']}` ({$appt['status']})";
                }
            }
        }

        if (in_array('follow_ups', $scopes, true) || in_array('consultations', $scopes, true)) {
            $followUps = PatientFollowUp::query()
                ->where(function ($q) use ($user, $phoneVariants) {
                    $q->where('patient_user_id', $user->id);
                    if ($phoneVariants !== []) {
                        $q->orWhereIn('patient_phone', $phoneVariants);
                    }
                })
                ->with('doctor:id,name,specialty')
                ->orderByDesc('followup_date')
                ->limit(10)
                ->get();

            $conversations = DoctorPatientConversation::query()
                ->where('patient_user_id', $user->id)
                ->with('doctor:id,name,specialty')
                ->orderByDesc('last_message_at')
                ->limit(5)
                ->get();

            if ($followUps->isEmpty() && $conversations->isEmpty()) {
                $missingScopes[] = 'follow_ups';
                $arLines[] = '• **سجل المتابعات والاستشارات السابقة:** لا توجد متابعات طبية أو استشارات مسجلة في حسابك حالياً.';
                $enLines[] = '• **Follow-ups & Previous Consultations:** No follow-up records or consultations are currently stored in your account.';
            } else {
                if ($followUps->isNotEmpty()) {
                    $records['follow_ups'] = $followUps->map(fn (PatientFollowUp $f) => [
                        'id' => $f->id,
                        'followup_date' => $f->followup_date?->format('Y-m-d') ?? (string) $f->followup_date,
                        'next_followup_date' => $f->next_followup_date?->format('Y-m-d'),
                        'consultation_notes' => $f->consultation_notes,
                        'treatment_updates' => $f->treatment_updates,
                        'doctor_name' => $f->doctor?->name,
                        'doctor_specialty' => $f->doctor?->specialty,
                    ])->values()->all();

                    $arLines[] = '**سجلات المتابعة والاستشارات الطبية المسجلة:**';
                    $enLines[] = '**Recorded Medical Follow-ups & Consultation Notes:**';
                    foreach ($records['follow_ups'] as $fu) {
                        $nextAr = $fu['next_followup_date'] ? " | المتابعة القادمة: `{$fu['next_followup_date']}`" : '';
                        $nextEn = $fu['next_followup_date'] ? " | Next follow-up: `{$fu['next_followup_date']}`" : '';
                        $arLines[] = "  - بتاريخ `{$fu['followup_date']}` مع د. {$fu['doctor_name']}: {$fu['consultation_notes']}"
                            . ($fu['treatment_updates'] ? " — تحديث العلاج: {$fu['treatment_updates']}" : '') . $nextAr;
                        $enLines[] = "  - On `{$fu['followup_date']}` with Dr. {$fu['doctor_name']}: {$fu['consultation_notes']}"
                            . ($fu['treatment_updates'] ? " — Treatment update: {$fu['treatment_updates']}" : '') . $nextEn;
                    }
                }

                if ($conversations->isNotEmpty()) {
                    $records['consultations'] = $conversations->map(fn (DoctorPatientConversation $c) => [
                        'id' => $c->id,
                        'doctor_name' => $c->doctor?->name,
                        'doctor_specialty' => $c->doctor?->specialty,
                        'last_message_at' => $c->last_message_at?->format('Y-m-d H:i'),
                    ])->values()->all();
                }
            }
        }

        if (in_array('orders', $scopes, true)) {
            $userEmail = strtolower((string) $user->email);
            $hasRealEmail = !PhoneNormalizer::isSyntheticEmail($userEmail) && $userEmail !== '';

            $orders = ($hasRealEmail || $phoneVariants !== [])
                ? Order::query()
                    ->where(function ($q) use ($hasRealEmail, $userEmail, $phoneVariants) {
                        if ($hasRealEmail) {
                            $q->whereRaw('LOWER(customer_email) = ?', [$userEmail]);
                        }
                        if ($phoneVariants !== []) {
                            $q->orWhereIn('customer_phone', $phoneVariants);
                        }
                    })
                    ->with('items')
                    ->orderByDesc('created_at')
                    ->limit(8)
                    ->get()
                : collect();

            if ($orders->isEmpty()) {
                $missingScopes[] = 'orders';
                $arLines[] = '• **طلبات الأدوية:** لا توجد طلبات شراء أدوية مسجلة في حسابك حالياً.';
                $enLines[] = '• **Medicine Orders:** No medicine orders are currently recorded under your account.';
            } else {
                $records['orders'] = $orders->map(function (Order $order) use (&$extractedMedications) {
                    $items = $order->items->map(function ($it) use (&$extractedMedications) {
                        if (!empty($it->medicine_name)) {
                            $extractedMedications[] = (string) $it->medicine_name;
                        }
                        return [
                            'name' => $it->medicine_name ?? ('صنف #' . $it->medicine_id),
                            'quantity' => $it->quantity,
                        ];
                    })->values()->all();

                    return [
                        'id' => $order->id,
                        'status' => $order->status,
                        'status_label' => $order->status_label,
                        'total_price' => $order->total_price,
                        'created_at' => $order->created_at?->format('Y-m-d'),
                        'items' => $items,
                    ];
                })->values()->all();

                $arLines[] = '**طلبات الأدوية المرتبطة بحسابك:**';
                $enLines[] = '**Medicine Orders Linked to Your Account:**';
                foreach ($records['orders'] as $ord) {
                    $itemNames = implode('، ', array_map(fn ($i) => "{$i['name']} (×{$i['quantity']})", $ord['items']));
                    $arLines[] = "  - طلب رقم `#{$ord['id']}` بتاريخ `{$ord['created_at']}` — الحالة: **{$ord['status_label']}** — الإجمالي: `{$ord['total_price']} ج.م`"
                        . ($itemNames !== '' ? " — الأصناف: {$itemNames}" : '');
                    $enLines[] = "  - Order `#{$ord['id']}` on `{$ord['created_at']}` — Status: **{$ord['status']}** — Total: `{$ord['total_price']} EGP`"
                        . ($itemNames !== '' ? " — Items: {$itemNames}" : '');
                }
            }
        }

        $extractedMedications = array_values(array_unique(array_filter($extractedMedications)));

        return [
            'authorized' => true,
            'reason' => null,
            'has_any_data' => $records !== [],
            'records' => $records,
            'missing_scopes' => array_values(array_unique($missingScopes)),
            'extracted_medications' => $extractedMedications,
            'summary_ar' => implode("\n", $arLines),
            'summary_en' => implode("\n", $enLines),
        ];
    }
}
