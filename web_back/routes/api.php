<?php

use App\Http\Controllers\Api\v1\AIChatApiController;
use App\Http\Controllers\Api\v1\AppointmentApiController;
use App\Http\Controllers\Api\v1\AuthApiController;
use App\Http\Controllers\Api\v1\Doctor\DoctorChatController;
use App\Http\Controllers\Api\v1\Doctor\DoctorFollowUpController;
use App\Http\Controllers\Api\v1\Doctor\DoctorPatientController;
use App\Http\Controllers\Api\v1\Doctor\DoctorPortalDashboardController;
use App\Http\Controllers\Api\v1\Doctor\DoctorPrescriptionController;
use App\Http\Controllers\Api\v1\Doctor\DoctorProfileController;
use App\Http\Controllers\Api\v1\Doctor\DoctorReviewController;
use App\Http\Controllers\Api\v1\Doctor\DoctorTreatedCaseController;
use App\Http\Controllers\Api\v1\DoctorApiController;
use App\Http\Controllers\Api\v1\MedicienApiController;
use App\Http\Controllers\Api\v1\OrderApiController;
use App\Http\Controllers\Api\v1\PatientChatController;
use App\Http\Controllers\Api\v1\RatingApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Saydalety (MY_pharmacy) Public Website & Doctor Portal
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

    // Doctors Public Directory & Treated Cases API
    Route::get('/doctors', [DoctorApiController::class, 'index']);
    Route::get('/doctors/{id}', [DoctorApiController::class, 'show'])->whereNumber('id');
    Route::get('/doctors/{doctorId}/cases/{caseId}', [DoctorApiController::class, 'showCase'])
        ->whereNumber(['doctorId', 'caseId']);

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

    // AI Pharmacist API (Guest & Authenticated Experience, References, Feedback, Conversation Management)
    Route::get('/ai-suggested-questions', [AIChatApiController::class, 'suggestedQuestions']);
    Route::post('/ask-ai', [AIChatApiController::class, 'ask'])->middleware('throttle:api-ai');
    Route::delete('/ai-guest-session', [AIChatApiController::class, 'endGuestSession']);
    Route::post('/ai-feedback', [AIChatApiController::class, 'submitFeedback'])->middleware('throttle:api-write');
    Route::get('/ai-chats', [AIChatApiController::class, 'index']);
    Route::post('/ai-chats', [AIChatApiController::class, 'create'])->middleware('throttle:api-write');
    Route::get('/ai-chats/{id}', [AIChatApiController::class, 'show'])->whereNumber('id');
    Route::delete('/ai-chats/{id}', [AIChatApiController::class, 'destroy'])->whereNumber('id');

    // Authentication API (User & Doctor Registration + Role-Aware Login)
    Route::prefix('auth')->middleware('throttle:api-auth')->group(function () {
        Route::post('/register', [AuthApiController::class, 'register']);
        Route::post('/login', [AuthApiController::class, 'login']);
        Route::get('/user', [AuthApiController::class, 'user']);
        Route::post('/logout', [AuthApiController::class, 'logout']);
    });

    // Authenticated Patient Routes (Appointment-Gated Doctor Chat & My Overview)
    Route::prefix('patient')->middleware(['auth_api'])->group(function () {
        Route::get('/overview', [PatientChatController::class, 'myOverview']);
        Route::get('/chats', [PatientChatController::class, 'index']);
        Route::post('/chats/start', [PatientChatController::class, 'startWithDoctor']);
        Route::get('/chats/{conversationId}', [PatientChatController::class, 'show'])->whereNumber('conversationId');
        Route::post('/chats/{conversationId}/messages', [PatientChatController::class, 'sendMessage'])->whereNumber('conversationId');
    });

    // Protected Doctor Portal API Routes (Strictly Enforces Verified & Active Doctor Role)
    Route::prefix('doctor')->middleware(['is_doctor_api', 'throttle:api-doctor'])->group(function () {
        // 1. Dashboard & Appointment Status Actions
        Route::get('/dashboard', [DoctorPortalDashboardController::class, 'index']);
        Route::patch('/appointments/{id}/status', [DoctorPortalDashboardController::class, 'updateAppointmentStatus'])->whereNumber('id');

        // 2. Doctor Profile Management
        Route::get('/profile', [DoctorProfileController::class, 'show']);
        Route::match(['post', 'put'], '/profile', [DoctorProfileController::class, 'update']);

        // 3. Treated Cases Management (Direct Publish)
        Route::get('/cases', [DoctorTreatedCaseController::class, 'index']);
        Route::post('/cases', [DoctorTreatedCaseController::class, 'store']);
        Route::get('/cases/{id}', [DoctorTreatedCaseController::class, 'show'])->whereNumber('id');
        Route::match(['post', 'put'], '/cases/{id}', [DoctorTreatedCaseController::class, 'update'])->whereNumber('id');
        Route::delete('/cases/{id}', [DoctorTreatedCaseController::class, 'destroy'])->whereNumber('id');

        // 4. My Reviews
        Route::get('/reviews', [DoctorReviewController::class, 'index']);
        Route::post('/reviews/{id}/report', [DoctorReviewController::class, 'report'])->whereNumber('id');

        // 5. My Patients & Strict Doctor-Scoped Medical Records
        Route::get('/patients', [DoctorPatientController::class, 'index']);
        Route::get('/patients/{patientKey}/records', [DoctorPatientController::class, 'records']);

        // 6. Patient Chat
        Route::get('/chats', [DoctorChatController::class, 'index']);
        Route::post('/chats/start', [DoctorChatController::class, 'startWithPatient']);
        Route::get('/chats/{conversationId}', [DoctorChatController::class, 'show'])->whereNumber('conversationId');
        Route::post('/chats/{conversationId}/messages', [DoctorChatController::class, 'sendMessage'])->whereNumber('conversationId');

        // 7. Prescriptions (Integrated with Medicines Store Catalog)
        Route::get('/medicines-catalog', [DoctorPrescriptionController::class, 'medicinesCatalog']);
        Route::get('/prescriptions', [DoctorPrescriptionController::class, 'index']);
        Route::post('/prescriptions', [DoctorPrescriptionController::class, 'store']);
        Route::get('/prescriptions/{id}', [DoctorPrescriptionController::class, 'show'])->whereNumber('id');
        Route::patch('/prescriptions/{id}/status', [DoctorPrescriptionController::class, 'updateStatus'])->whereNumber('id');

        // 8. Follow-up History
        Route::get('/follow-ups', [DoctorFollowUpController::class, 'index']);
        Route::post('/follow-ups', [DoctorFollowUpController::class, 'store']);
        Route::put('/follow-ups/{id}', [DoctorFollowUpController::class, 'update'])->whereNumber('id');
        Route::delete('/follow-ups/{id}', [DoctorFollowUpController::class, 'destroy'])->whereNumber('id');
    });
});
