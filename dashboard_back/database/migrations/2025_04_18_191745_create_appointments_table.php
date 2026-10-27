<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('patient_name');        // اسم المريض
            $table->string('email')->nullable();   // البريد الإلكتروني للمريض (اختياري)
            $table->string('phone');               // رقم هاتف المريض
            $table->unsignedBigInteger('doctor_id');  // رقم الطبيب
            $table->date('appointment_date');      // تاريخ الموعد
            $table->time('appointment_time');      // وقت الموعد
            $table->text('notes')->nullable();     // ملاحظات إضافية (اختياري)
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');  // حالة الحجز
            $table->timestamps();
            
            $table->foreign('doctor_id')
                  ->references('id')
                  ->on('doctors')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
