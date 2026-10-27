<?php

use App\Http\Controllers\Api\v1\Admin\AdminAppointmentApiController;
use App\Http\Controllers\Api\v1\Admin\AdminAuthApiController;
use App\Http\Controllers\Api\v1\Admin\AdminDashboardApiController;
use App\Http\Controllers\Api\v1\Admin\AdminDoctorApiController;
use App\Http\Controllers\Api\v1\Admin\AdminMedicienApiController;
use App\Http\Controllers\Api\v1\Admin\AdminOrderApiController;
use App\Http\Controllers\Api\v1\Admin\AdminReportsApiController;
use App\Http\Controllers\Api\v1\Admin\AdminUserApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin REST API Routes for MY_pharmacy Dashboard Backend
|--------------------------------------------------------------------------
*/

Route::prefix('v1/admin')->group(function () {

    // Health Check Endpoint
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'app' => 'MY_pharmacy Admin API v1',
        ]);
    });

    // Public Admin Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AdminAuthApiController::class, 'login']);
    });

    // Protected Admin Routes (Requires Admin Authentication & Role)
    Route::middleware('is_admin_api')->group(function () {

        // Authenticated Session
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AdminAuthApiController::class, 'me']);
            Route::post('/logout', [AdminAuthApiController::class, 'logout']);
        });

        // Dashboard Metrics & Recent Feeds
        Route::get('/dashboard', [AdminDashboardApiController::class, 'index']);

        // Doctors Management
        Route::get('/doctors', [AdminDoctorApiController::class, 'index']);
        Route::post('/doctors', [AdminDoctorApiController::class, 'store']);
        Route::get('/doctors/{id}', [AdminDoctorApiController::class, 'show'])->whereNumber('id');
        Route::match(['post', 'put'], '/doctors/{id}', [AdminDoctorApiController::class, 'update'])->whereNumber('id');
        Route::delete('/doctors/{id}', [AdminDoctorApiController::class, 'destroy'])->whereNumber('id');

        // Medicines Management
        Route::get('/medicines', [AdminMedicienApiController::class, 'index']);
        Route::post('/medicines', [AdminMedicienApiController::class, 'store']);
        Route::get('/medicines/{id}', [AdminMedicienApiController::class, 'show'])->whereNumber('id');
        Route::match(['post', 'put'], '/medicines/{id}', [AdminMedicienApiController::class, 'update'])->whereNumber('id');
        Route::patch('/medicines/{id}/stock', [AdminMedicienApiController::class, 'updateStock'])->whereNumber('id');
        Route::delete('/medicines/{id}', [AdminMedicienApiController::class, 'destroy'])->whereNumber('id');

        // Appointments Management
        Route::get('/appointments', [AdminAppointmentApiController::class, 'index']);
        Route::get('/appointments/{id}', [AdminAppointmentApiController::class, 'show'])->whereNumber('id');
        Route::patch('/appointments/{id}/status', [AdminAppointmentApiController::class, 'updateStatus'])->whereNumber('id');
        Route::delete('/appointments/{id}', [AdminAppointmentApiController::class, 'destroy'])->whereNumber('id');

        // Orders Management
        Route::get('/orders', [AdminOrderApiController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderApiController::class, 'show'])->whereNumber('id');
        Route::patch('/orders/{id}/status', [AdminOrderApiController::class, 'updateStatus'])->whereNumber('id');
        Route::get('/orders-export', [AdminOrderApiController::class, 'export']);

        // Reports & Analytics
        Route::get('/reports', [AdminReportsApiController::class, 'index']);

        // Users Management
        Route::get('/users', [AdminUserApiController::class, 'index']);
        Route::post('/users', [AdminUserApiController::class, 'store']);
        Route::get('/users/{id}', [AdminUserApiController::class, 'show'])->whereNumber('id');
        Route::put('/users/{id}', [AdminUserApiController::class, 'update'])->whereNumber('id');
        Route::delete('/users/{id}', [AdminUserApiController::class, 'destroy'])->whereNumber('id');
    });
});
