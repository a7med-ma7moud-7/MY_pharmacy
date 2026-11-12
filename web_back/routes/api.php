<?php

use App\Http\Controllers\Api\v1\AIChatApiController;
use App\Http\Controllers\Api\v1\AppointmentApiController;
use App\Http\Controllers\Api\v1\AuthApiController;
use App\Http\Controllers\Api\v1\DoctorApiController;
use App\Http\Controllers\Api\v1\MedicienApiController;
use App\Http\Controllers\Api\v1\OrderApiController;
use App\Http\Controllers\Api\v1\RatingApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for MY_pharmacy Public Website Backend
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->middleware('throttle:api-public')->group(function () {
    // Health Check
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'app' => 'MY_pharmacy API v1',
        ]);
    });

    // Doctors API
    Route::get('/doctors', [DoctorApiController::class, 'index']);
    Route::get('/doctors/{id}', [DoctorApiController::class, 'show'])->whereNumber('id');

    // Medicines API
    Route::get('/medicines', [MedicienApiController::class, 'index']);
    Route::get('/medicines/{id}', [MedicienApiController::class, 'show'])->whereNumber('id');

    // Orders, Appointments & Ratings Write Endpoints
    Route::middleware('throttle:api-write')->group(function () {
        Route::post('/orders', [OrderApiController::class, 'store']);
        Route::post('/orders/check', [OrderApiController::class, 'check']);

        Route::post('/appointments', [AppointmentApiController::class, 'store']);
        Route::get('/appointments/{id}', [AppointmentApiController::class, 'show'])->whereNumber('id');

        Route::post('/ratings', [RatingApiController::class, 'store']);
    });

    // AI Chat API
    Route::post('/ask-ai', [AIChatApiController::class, 'ask'])->middleware('throttle:api-ai');

    // Authentication API
    Route::prefix('auth')->middleware('throttle:api-auth')->group(function () {
        Route::post('/register', [AuthApiController::class, 'register']);
        Route::post('/login', [AuthApiController::class, 'login']);
        Route::get('/user', [AuthApiController::class, 'user']);
        Route::post('/logout', [AuthApiController::class, 'logout']);
    });
});
