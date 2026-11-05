<?php

declare(strict_types=1);

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
        Schema::table('doctors', function (Blueprint $table) {
            $table->index(['status', 'subscription'], 'idx_doctors_status_subscription');
            $table->index('specialty', 'idx_doctors_specialty');
            $table->index('location', 'idx_doctors_location');
            $table->index('name', 'idx_doctors_name');
        });

        Schema::table('mediciens', function (Blueprint $table) {
            $table->index('type', 'idx_mediciens_type');
            $table->index('name', 'idx_mediciens_name');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->index(['doctor_id', 'appointment_date', 'appointment_time'], 'idx_appointments_slot_lookup');
            $table->index(['status', 'appointment_date'], 'idx_appointments_status_date');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
            $table->index('customer_phone', 'idx_orders_customer_phone');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id', 'idx_order_items_order_id');
            $table->index('medicine_id', 'idx_order_items_medicine_id');
        });

        Schema::table('ratings', function (Blueprint $table) {
            $table->index('doctor_id', 'idx_ratings_doctor_id');
            $table->index('user_id', 'idx_ratings_user_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'idx_users_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropIndex('idx_doctors_status_subscription');
            $table->dropIndex('idx_doctors_specialty');
            $table->dropIndex('idx_doctors_location');
            $table->dropIndex('idx_doctors_name');
        });

        Schema::table('mediciens', function (Blueprint $table) {
            $table->dropIndex('idx_mediciens_type');
            $table->dropIndex('idx_mediciens_name');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('idx_appointments_slot_lookup');
            $table->dropIndex('idx_appointments_status_date');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_customer_phone');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_medicine_id');
        });

        Schema::table('ratings', function (Blueprint $table) {
            $table->dropIndex('idx_ratings_doctor_id');
            $table->dropIndex('idx_ratings_user_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
        });
    }
};

