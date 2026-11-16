<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend users table with phone and account_status
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 30)->nullable()->unique();
            }
            if (!Schema::hasColumn('users', 'account_status')) {
                $table->string('account_status', 30)->default('active')->index();
            }
        });

        // 2. Extend doctors table with user linkage, professional profile fields, verification & creation metadata
        Schema::table('doctors', function (Blueprint $table) {
            if (!Schema::hasColumn('doctors', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->unique();
            }
            if (!Schema::hasColumn('doctors', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('doctors', 'qualifications')) {
                $table->text('qualifications')->nullable();
            }
            if (!Schema::hasColumn('doctors', 'experience_years')) {
                $table->unsignedInteger('experience_years')->nullable();
            }
            if (!Schema::hasColumn('doctors', 'clinic_name')) {
                $table->string('clinic_name')->nullable();
            }
            if (!Schema::hasColumn('doctors', 'working_hours')) {
                $table->string('working_hours')->nullable();
            }
            if (!Schema::hasColumn('doctors', 'verification_status')) {
                $table->string('verification_status', 40)->default('verified')->index();
            }
            if (!Schema::hasColumn('doctors', 'creation_method')) {
                $table->string('creation_method', 40)->default('admin_created')->index();
            }
            for ($i = 1; $i <= 5; $i++) {
                if (!Schema::hasColumn('doctors', "image-{$i}")) {
                    $table->string("image-{$i}")->nullable();
                }
            }
        });

        // 3. Extend appointments table to link authenticated patients directly
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->index();
            }
        });

        // 4. Extend ratings table for appointment linkage and moderation
        Schema::table('ratings', function (Blueprint $table) {
            if (!Schema::hasColumn('ratings', 'appointment_id')) {
                $table->unsignedBigInteger('appointment_id')->nullable()->index();
            }
            if (!Schema::hasColumn('ratings', 'status')) {
                $table->string('status', 30)->default('visible')->index();
            }
            if (!Schema::hasColumn('ratings', 'report_reason')) {
                $table->string('report_reason', 500)->nullable();
            }
        });

        // 5. Treated Cases table (Direct doctor publication, zero patient PII)
        if (!Schema::hasTable('treated_cases')) {
            Schema::create('treated_cases', function (Blueprint $table) {
                $table->id();
                $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
                $table->string('title');
                $table->string('specialty');
                $table->text('description');
                $table->text('initial_condition');
                $table->text('treatment_summary');
                $table->text('outcome');
                $table->string('image')->nullable();
                $table->string('attachment_path')->nullable();
                $table->boolean('patient_consent_confirmed')->default(true);
                $table->string('status', 30)->default('published')->index();
                $table->string('moderation_note', 500)->nullable();
                $table->date('published_at')->nullable()->index();
                $table->timestamps();
            });
        }

        // 6. Doctor-Patient Conversations & Messages (Appointment-gated private clinical chat)
        if (!Schema::hasTable('doctor_patient_conversations')) {
            Schema::create('doctor_patient_conversations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
                $table->foreignId('patient_user_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedBigInteger('latest_appointment_id')->nullable();
                $table->timestamp('last_message_at')->nullable()->index();
                $table->string('last_message_preview', 255)->nullable();
                $table->unsignedInteger('doctor_unread_count')->default(0);
                $table->unsignedInteger('patient_unread_count')->default(0);
                $table->timestamps();

                $table->unique(['doctor_id', 'patient_user_id'], 'doc_patient_conv_unique');
            });
        }

        if (!Schema::hasTable('doctor_patient_messages')) {
            Schema::create('doctor_patient_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('conversation_id')
                    ->constrained('doctor_patient_conversations')
                    ->cascadeOnDelete();
                $table->foreignId('sender_user_id')->constrained('users')->cascadeOnDelete();
                $table->string('sender_role', 20);
                $table->text('body')->nullable();
                $table->string('attachment_path')->nullable();
                $table->string('attachment_name')->nullable();
                $table->boolean('is_read')->default(false)->index();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }

        // 7. Prescriptions & Prescription Items (Integrated with existing mediciens catalog)
        if (!Schema::hasTable('prescriptions')) {
            Schema::create('prescriptions', function (Blueprint $table) {
                $table->id();
                $table->string('prescription_number', 40)->unique();
                $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
                $table->unsignedBigInteger('patient_user_id')->nullable()->index();
                $table->unsignedBigInteger('appointment_id')->nullable()->index();
                $table->string('patient_name');
                $table->string('patient_phone', 30)->nullable()->index();
                $table->text('diagnosis');
                $table->text('notes')->nullable();
                $table->string('status', 30)->default('active')->index();
                $table->date('prescribed_date')->index();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('prescription_items')) {
            Schema::create('prescription_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();
                $table->unsignedBigInteger('medicine_id')->nullable()->index();
                $table->string('medicine_name');
                $table->string('dosage');
                $table->string('duration')->nullable();
                $table->string('instructions')->nullable();
                $table->timestamps();
            });
        }

        // 8. Patient Follow-ups (Strictly scoped per doctor-patient interaction)
        if (!Schema::hasTable('patient_follow_ups')) {
            Schema::create('patient_follow_ups', function (Blueprint $table) {
                $table->id();
                $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
                $table->unsignedBigInteger('patient_user_id')->nullable()->index();
                $table->unsignedBigInteger('appointment_id')->nullable()->index();
                $table->string('patient_name');
                $table->string('patient_phone', 30)->nullable()->index();
                $table->date('followup_date')->index();
                $table->text('consultation_notes');
                $table->text('treatment_updates')->nullable();
                $table->date('next_followup_date')->nullable()->index();
                $table->string('status', 30)->default('recorded');
                $table->timestamps();
            });
        }

        // 9. Medical Audit Logs (Security & sensitive record access tracking)
        if (!Schema::hasTable('medical_audit_logs')) {
            Schema::create('medical_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('actor_user_id')->nullable()->index();
                $table->string('actor_role', 30);
                $table->string('action', 100)->index();
                $table->string('target_type', 60)->nullable();
                $table->unsignedBigInteger('target_id')->nullable();
                $table->unsignedBigInteger('doctor_id')->nullable()->index();
                $table->text('metadata')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // Backfill existing appointments user_id where email matches a registered user
        try {
            DB::statement("
                UPDATE appointments
                SET user_id = (
                    SELECT users.id FROM users
                    WHERE LOWER(users.email) = LOWER(appointments.email)
                    LIMIT 1
                )
                WHERE user_id IS NULL AND email IS NOT NULL AND email != ''
            ");
        } catch (\Throwable) {
            // Safe no-op if tables are empty during fresh test migrations
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_audit_logs');
        Schema::dropIfExists('patient_follow_ups');
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('doctor_patient_messages');
        Schema::dropIfExists('doctor_patient_conversations');
        Schema::dropIfExists('treated_cases');
    }
};
