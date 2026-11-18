<?php

use App\Http\Controllers\Api\v1\Admin\AdminAiChatApiController;
use App\Http\Controllers\Api\v1\Admin\AdminAppointmentApiController;
use App\Http\Controllers\Api\v1\Admin\AdminAuthApiController;
use App\Http\Controllers\Api\v1\Admin\AdminDashboardApiController;
use App\Http\Controllers\Api\v1\Admin\AdminDoctorApiController;
use App\Http\Controllers\Api\v1\Admin\AdminMedicienApiController;
use App\Http\Controllers\Api\v1\Admin\AdminModerationApiController;
use App\Http\Controllers\Api\v1\Admin\AdminOrderApiController;
use App\Http\Controllers\Api\v1\Admin\AdminPharmacyApiController;
use App\Http\Controllers\Api\v1\Admin\AdminReportsApiController;
use App\Http\Controllers\Api\v1\Admin\AdminUserApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin & Pharmacy Dashboard REST API Routes for MY_pharmacy
|--------------------------------------------------------------------------
*/

Route::prefix('v1/admin')->group(function () {

    // Health Check Endpoint
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'app' => 'MY_pharmacy Admin API v1',
        ]);
    });

    // Public Dashboard Auth Routes (Super Admin & Provisioned Pharmacies Only — No Self-Registration)
    Route::prefix('auth')->middleware('throttle:admin-auth')->group(function () {
        Route::post('/login', [AdminAuthApiController::class, 'login']);
    });

    // Shared Scoped Dashboard Routes (Accessible to Super Admin & Active Pharmacies, strictly scoped per Pharmacy)
    Route::middleware(['is_dashboard_staff_api', 'throttle:admin-api'])->group(function () {
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AdminAuthApiController::class, 'me']);
            Route::post('/logout', [AdminAuthApiController::class, 'logout']);
        });

        // Medicines & Pharmacy-Scoped Inventory Management
        Route::get('/medicines', [AdminMedicienApiController::class, 'index']);
        Route::post('/medicines', [AdminMedicienApiController::class, 'store']);
        Route::get('/medicines/{id}', [AdminMedicienApiController::class, 'show'])->whereNumber('id');
        Route::match(['post', 'put'], '/medicines/{id}', [AdminMedicienApiController::class, 'update'])->whereNumber('id');
        Route::patch('/medicines/{id}/stock', [AdminMedicienApiController::class, 'updateStock'])->whereNumber('id');
        Route::delete('/medicines/{id}', [AdminMedicienApiController::class, 'destroy'])->whereNumber('id');

        // Orders Management (Strictly Scoped to Owning Pharmacy when role=pharmacy)
        Route::get('/orders', [AdminOrderApiController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderApiController::class, 'show'])->whereNumber('id');
        Route::patch('/orders/{id}/status', [AdminOrderApiController::class, 'updateStatus'])->whereNumber('id');
        Route::get('/orders-export', [AdminOrderApiController::class, 'export']);
    });

    // Exclusive Super Admin Routes (Strictly role=admin ONLY)
    Route::middleware(['is_admin_api', 'throttle:admin-api'])->group(function () {

        // Platform Overview Dashboard
        Route::get('/dashboard', [AdminDashboardApiController::class, 'index']);

        // Pharmacies Management (Super Admin Only — Provisioning + Geographic Coordinates lat/long)
        Route::get('/pharmacies', [AdminPharmacyApiController::class, 'index']);
        Route::post('/pharmacies', [AdminPharmacyApiController::class, 'store']);
        Route::get('/pharmacies/{id}', [AdminPharmacyApiController::class, 'show'])->whereNumber('id');
        Route::match(['post', 'put'], '/pharmacies/{id}', [AdminPharmacyApiController::class, 'update'])->whereNumber('id');
        Route::patch('/pharmacies/{id}/status', [AdminPharmacyApiController::class, 'updateStatus'])->whereNumber('id');
        Route::delete('/pharmacies/{id}', [AdminPharmacyApiController::class, 'destroy'])->whereNumber('id');

        // Doctors Management & Account Administration
        Route::get('/doctors', [AdminDoctorApiController::class, 'index']);
        Route::post('/doctors', [AdminDoctorApiController::class, 'store']);
        Route::get('/doctors/{id}', [AdminDoctorApiController::class, 'show'])->whereNumber('id');
        Route::match(['post', 'put'], '/doctors/{id}', [AdminDoctorApiController::class, 'update'])->whereNumber('id');
        Route::patch('/doctors/{id}/account-status', [AdminDoctorApiController::class, 'updateAccountStatus'])->whereNumber('id');
        Route::patch('/doctors/{id}/verify', [AdminDoctorApiController::class, 'verifyDoctor'])->whereNumber('id');
        Route::post('/doctors/{id}/reset-password', [AdminDoctorApiController::class, 'resetPassword'])->whereNumber('id');
        Route::delete('/doctors/{id}', [AdminDoctorApiController::class, 'destroy'])->whereNumber('id');

        // Treated Cases & Reviews Post-Publication Moderation
        Route::get('/treated-cases', [AdminModerationApiController::class, 'treatedCases']);
        Route::patch('/treated-cases/{id}/moderation', [AdminModerationApiController::class, 'moderateTreatedCase'])->whereNumber('id');
        Route::delete('/treated-cases/{id}', [AdminModerationApiController::class, 'deleteTreatedCase'])->whereNumber('id');

        Route::get('/reviews', [AdminModerationApiController::class, 'reviews']);
        Route::patch('/reviews/{id}/status', [AdminModerationApiController::class, 'moderateReview'])->whereNumber('id');
        Route::delete('/reviews/{id}', [AdminModerationApiController::class, 'deleteReview'])->whereNumber('id');

        // Appointments Management
        Route::get('/appointments', [AdminAppointmentApiController::class, 'index']);
        Route::get('/appointments/{id}', [AdminAppointmentApiController::class, 'show'])->whereNumber('id');
        Route::patch('/appointments/{id}/status', [AdminAppointmentApiController::class, 'updateStatus'])->whereNumber('id');
        Route::delete('/appointments/{id}', [AdminAppointmentApiController::class, 'destroy'])->whereNumber('id');

        // Reports & Analytics
        Route::get('/reports', [AdminReportsApiController::class, 'index']);

        // AI Pharmacist Management
        Route::get('/ai/analytics', [AdminAiChatApiController::class, 'analytics']);
        Route::get('/ai/configuration', [AdminAiChatApiController::class, 'getConfiguration']);
        Route::put('/ai/configuration', [AdminAiChatApiController::class, 'updateConfiguration']);
        Route::get('/ai/knowledge-sources', [AdminAiChatApiController::class, 'listKnowledgeSources']);
        Route::post('/ai/knowledge-sources', [AdminAiChatApiController::class, 'storeKnowledgeSource']);
        Route::put('/ai/knowledge-sources/{id}', [AdminAiChatApiController::class, 'updateKnowledgeSource'])->whereNumber('id');
        Route::patch('/ai/knowledge-sources/{id}/toggle', [AdminAiChatApiController::class, 'toggleKnowledgeSource'])->whereNumber('id');
        Route::post('/ai/knowledge-sources/{id}/sync', [AdminAiChatApiController::class, 'syncKnowledgeSource'])->whereNumber('id');
        Route::delete('/ai/knowledge-sources/{id}', [AdminAiChatApiController::class, 'destroyKnowledgeSource'])->whereNumber('id');
        Route::get('/ai/feedback', [AdminAiChatApiController::class, 'listFeedback']);
        Route::patch('/ai/feedback/{id}', [AdminAiChatApiController::class, 'updateFeedbackStatus'])->whereNumber('id');
        Route::get('/ai/logs', [AdminAiChatApiController::class, 'listLogs']);
        Route::get('/ai-chats', [AdminAiChatApiController::class, 'index']);
        Route::get('/ai-chats/{id}', [AdminAiChatApiController::class, 'show'])->whereNumber('id');

        // Users Management
        Route::get('/users', [AdminUserApiController::class, 'index']);
        Route::post('/users', [AdminUserApiController::class, 'store']);
        Route::get('/users/{id}', [AdminUserApiController::class, 'show'])->whereNumber('id');
        Route::put('/users/{id}', [AdminUserApiController::class, 'update'])->whereNumber('id');
        Route::delete('/users/{id}', [AdminUserApiController::class, 'destroy'])->whereNumber('id');
    });
});
