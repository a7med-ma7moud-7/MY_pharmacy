<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\ConsultController;
use App\Http\Controllers\WebDoctorController;
use App\Http\Controllers\MedicienController;
use App\Http\Controllers\WebMedicienController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AIChatController;
use App\Http\Controllers\admin\AppointmentController;
use App\Http\Controllers\ShowOrederController;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\LangController;
use App\Http\Controllers\TechController;
use App\Http\Middleware\AdminMiddleware;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('/home', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// الصفحات العامة
Route::get('/doctors', [WebDoctorController::class, 'index'])->name('webdoctor.index');
Route::get('/doctors/search', [WebDoctorController::class, 'search'])->name('webdoctor.search');
Route::get('/doctors/{id}', [WebDoctorController::class, 'show'])->name('webdoctor.show');
Route::get('/medicines', [WebMedicienController::class, 'index'])->name('webmedicien.index');
Route::get('/medicines/search', [WebMedicienController::class, 'search'])->name('webmedicien.search');
Route::get('/medicines/{id}', [WebMedicienController::class, 'show'])->name('webmedicien.show');
Route::post('/orders', [WebMedicienController::class, 'storeOrder'])->name('orders.store');
Route::get('/orders/status', [WebMedicienController::class, 'orderStatus'])->name('orders.status');
Route::post('/orders/check', [WebMedicienController::class, 'checkOrder'])->name('orders.check');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // مسارات الأطباء
    Route::resource('doctor', DoctorController::class);
    
    // مسارات الأدوية
    Route::resource('medicien', MedicienController::class);
    
    // مسارات الاستشاريين
    Route::get('/consult/doctor', [ConsultController::class, 'doctor'])->name('consult.doctor');
});

// مسارات الحجوزات العامة
Route::get('/appointments', [AppointmentController::class, 'create'])->name('appointments.index');
Route::get('/appointments/create/{doctor_id?}', [AppointmentController::class, 'create'])->name('appointments.create');
Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
Route::get('/appointments/success/{id}', [AppointmentController::class, 'success'])->name('appointments.success');

// مسارات لوحة التحكم الإدارية - متاحة فقط للإدارة
Route::middleware(['auth', 'is_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    
    // مسارات إدارة الحجوزات
    Route::get('/appointments', [AppointmentController::class, 'index'])->name('admin.appointments.index');
    Route::get('/appointments/{id}', [AppointmentController::class, 'show'])->name('admin.appointments.show');
    Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus'])->name('admin.appointments.update-status');

    // مسارات إدارة الطلبات
    Route::get('/orders', [ShowOrederController::class, 'index'])->name('admin.orders.index');
    Route::get('/orders/{id}', [ShowOrederController::class, 'show'])->name('admin.orders.show');
    Route::put('/orders/{id}/status', [ShowOrederController::class, 'updateStatus'])->name('admin.orders.update-status');
    Route::get('/orders-search', [ShowOrederController::class, 'search'])->name('admin.orders.search');
    Route::get('/orders-export', [ShowOrederController::class, 'export'])->name('admin.orders.export');

    // مسارات التقارير والإحصائيات
    Route::get('/reports', [App\Http\Controllers\ReportsController::class, 'index'])->name('admin.reports.index');
});

// مسارات إدارة المستخدمين
Route::middleware(['auth'])->group(function () {
    Route::get('/users', [UserController::class, 'user'])->name('users.index');
    Route::get('/users/{id}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
});

// مسارات تسجيل الدخول بالشبكات الاجتماعية
Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirect'])
    ->where('provider', 'google|facebook')
    ->name('socialite.redirect');

Route::get('/auth/{provider}/callback', [SocialiteController::class, 'callback'])
    ->where('provider', 'google|facebook')
    ->name('socialite.callback');

// تضمين ملف مسارات المصادقة
require __DIR__.'/auth.php';

// للتصحيح فقط - يجب إزالته في الإنتاج
Route::get('/debug/doctors', function() {
    $doctors = \App\Models\doctor::all();
    return response()->json([
        'count' => $doctors->count(),
        'doctors' => $doctors->map(function($doctor) {
            return [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'specialty' => $doctor->specialty
            ];
        })
    ]);
})->middleware('auth');

// للتصحيح فقط - يجب إزالته في الإنتاج
Route::get('/debug/search', [WebDoctorController::class, 'debug'])->middleware('auth');

// للتصحيح فقط - يجب إزالته في الإنتاج
Route::get('/debug/socialite', function() {
    return response()->json([
        'google' => [
            'client_id' => config('services.google.client_id'),
            'client_secret' => substr(config('services.google.client_secret'), 0, 5) . '...',
            'redirect' => config('services.google.redirect'),
        ],
        'facebook' => [
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => substr(config('services.facebook.client_secret'), 0, 5) . '...',
            'redirect' => config('services.facebook.redirect'),
        ],
        'app_url' => config('app.url'),
        'session_driver' => config('session.driver'),
        'socialite_version' => \Composer\InstalledVersions::getVersion('laravel/socialite'),
    ]);
})->middleware('auth');

// للتشخيص فقط - يجب إزالته في الإنتاج
Route::get('/debug/socialite/detailed', function() {
    // تحقق من وجود الأعمدة المطلوبة في جدول المستخدمين
    $userColumns = Schema::getColumnListing('users');
    
    // تحقق من إعدادات الجلسة
    $sessionConfig = config('session');
    
    return response()->json([
        'google' => [
            'client_id' => config('services.google.client_id'),
            'client_secret' => substr(config('services.google.client_secret'), 0, 5) . '...',
            'redirect' => config('services.google.redirect'),
        ],
        'facebook' => [
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => substr(config('services.facebook.client_secret'), 0, 5) . '...',
            'redirect' => config('services.facebook.redirect'),
        ],
        'app_url' => config('app.url'),
        'user_columns' => $userColumns,
        'has_google_id_column' => in_array('google_id', $userColumns),
        'has_facebook_id_column' => in_array('facebook_id', $userColumns),
        'session_driver' => $sessionConfig['driver'],
        'session_lifetime' => $sessionConfig['lifetime'],
        'session_path' => storage_path('framework/sessions'),
        'session_path_writable' => is_writable(storage_path('framework/sessions')),
        'socialite_version' => \Composer\InstalledVersions::getVersion('laravel/socialite'),
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version(),
    ]);
});

// AI Chat Route - Public access
Route::post('/ask-ai', [AIChatController::class, 'ask'])->name('ai.ask');
Route::get('/tech', [TechController::class, 'index'])->name('tech.index');
Route::view('/ai-chat', 'ai-chat')->name('ai.chat');

// مسارات التقييم
Route::get('/rate', [App\Http\Controllers\RateController::class, 'index'])->name('rate.index');
Route::post('/rate', [App\Http\Controllers\RateController::class, 'store'])->middleware('auth')->name('rate.store');


Route::get('lang/{locale}', [LangController::class, 'switchLang'])->name('lang.switch');