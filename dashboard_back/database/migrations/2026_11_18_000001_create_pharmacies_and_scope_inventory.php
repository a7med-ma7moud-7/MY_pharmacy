<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('pharmacies')) {
            Schema::create('pharmacies', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
                $table->string('name');
                $table->string('slug')->nullable()->unique();
                $table->string('image')->nullable();
                $table->string('phone', 30)->nullable()->index();
                $table->string('email')->nullable()->index();
                $table->string('city', 120)->nullable()->index();
                $table->string('address', 500)->nullable();
                $table->decimal('latitude', 10, 7);
                $table->decimal('longitude', 10, 7);
                $table->string('working_hours', 180)->nullable();
                $table->string('license_number', 100)->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedBigInteger('created_by_admin_id')->nullable();
                $table->timestamps();

                $table->index(['latitude', 'longitude'], 'pharmacies_lat_lng_idx');
            });
        }

        if (Schema::hasTable('mediciens') && !Schema::hasColumn('mediciens', 'pharmacy_id')) {
            Schema::table('mediciens', function (Blueprint $table) {
                $table->unsignedBigInteger('pharmacy_id')->nullable()->after('id');
                $table->index(['pharmacy_id', 'count'], 'mediciens_pharmacy_stock_idx');
            });
        }

        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'pharmacy_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('pharmacy_id')->nullable()->after('id');
                $table->index(['pharmacy_id', 'status'], 'orders_pharmacy_status_idx');
            });
        }

        if (Schema::hasTable('order_items') && !Schema::hasColumn('order_items', 'pharmacy_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->unsignedBigInteger('pharmacy_id')->nullable()->after('medicine_id');
                $table->index('pharmacy_id', 'order_items_pharmacy_idx');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('order_items') && Schema::hasColumn('order_items', 'pharmacy_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropIndex('order_items_pharmacy_idx');
                $table->dropColumn('pharmacy_id');
            });
        }

        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'pharmacy_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex('orders_pharmacy_status_idx');
                $table->dropColumn('pharmacy_id');
            });
        }

        if (Schema::hasTable('mediciens') && Schema::hasColumn('mediciens', 'pharmacy_id')) {
            Schema::table('mediciens', function (Blueprint $table) {
                $table->dropIndex('mediciens_pharmacy_stock_idx');
                $table->dropColumn('pharmacy_id');
            });
        }

        Schema::dropIfExists('pharmacies');
    }
};
