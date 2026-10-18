<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'صيدليتي') }}</title>

        <!-- Bootstrap CSS RTL -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.rtl.min.css" integrity="sha384-gXt9imSW0VcJVHezoNQsP+TNrjYXoGcrqBZJpry9zJt8PCQjobwmhMGaDHTASo9N" crossorigin="anonymous">
        
        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        
        <!-- Google Fonts - Arabic -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Almarai:wght@300;400;700&display=swap" rel="stylesheet">
        
        <style>
            :root {
                --main-color: #0f6848;
                --secondary-color: #10ac84;
                --light-color: #f1f9f6;
                --dark-color: #1e272e;
                --danger-color: #ee5253;
                --warning-color: #fdcb6e;
            }
            
            body {
                font-family: 'Cairo', 'Almarai', sans-serif;
                background-color: #f8f9fa;
                letter-spacing: 0.3px;
                color: #333;
            }
            
            h1, h2, h3, h4, h5, h6 {
                font-family: 'Almarai', 'Cairo', sans-serif;
                font-weight: 700;
            }
            
            .main-content {
                min-height: 100vh;
                padding: 20px;
            }
            
            .navbar-brand {
                font-weight: bold;
                font-size: 1.6rem;
                color: var(--main-color) !important;
            }
            
            .dropdown-menu {
                left: 0;
                right: auto;
                text-align: right;
                border: none;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .card {
                border-radius: 10px;
                overflow: hidden;
                transition: all 0.3s ease;
                border: none;
            }
            
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
            }
            
            .card-header {
                font-weight: 600;
                border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            
            .btn {
                border-radius: 5px;
                padding: 0.5rem 1.5rem;
                font-weight: 500;
                letter-spacing: 0.5px;
            }
            
            .btn-primary {
                background-color: var(--main-color);
                border-color: var(--main-color);
            }
            
            .btn-primary:hover {
                background-color: var(--secondary-color);
                border-color: var(--secondary-color);
            }
            
            .bg-primary {
                background-color: var(--main-color) !important;
            }
            
            .table th {
                font-weight: 600;
            }
            
            .badge {
                padding: 0.5em 0.8em;
                font-weight: 500;
            }
            
            /* تحسين مظهر القائمة المنسدلة للمستخدم */
            .user-dropdown .dropdown-toggle {
                padding: 8px 15px;
                border-radius: 50px;
                background-color: var(--light-color);
                color: var(--main-color);
                font-weight: 600;
                border: none;
            }
            
            .user-dropdown .dropdown-toggle:hover {
                background-color: rgba(15, 104, 72, 0.1);
            }

            .header-logo {
                height: 40px;
                margin-left: 10px;
            }

            .top-navbar {
                background-color: var(--main-color);
                color: white;
                padding: 1rem;
            }

            .top-navbar .nav-link {
                color: rgba(255, 255, 255, 0.85);
                padding: 0.5rem 1rem;
                margin: 0 0.2rem;
                border-radius: 0.25rem;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .top-navbar .nav-link:hover,
            .top-navbar .nav-link.active {
                background-color: rgba(255, 255, 255, 0.15);
                color: white;
            }

            .service-card {
                transition: all 0.3s ease;
            }

            .service-card:hover {
                transform: translateY(-10px);
            }
            
            .service-icon {
                width: 80px;
                height: 80px;
                line-height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .divider {
                display: flex;
                align-items: center;
                text-align: center;
                color: #6c757d;
                font-size: 0.9rem;
            }

            .divider::before,
            .divider::after {
                content: '';
                flex: 1;
                border-bottom: 1px solid #dee2e6;
                margin: 0 10px;
            }

            .ai-float-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 9999;
                background: #0f6848;
                color: #fff;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                transition: background 0.2s, box-shadow 0.2s;
                text-decoration: none;
            }
            .ai-float-btn:hover {
                background: #10ac84;
                color: #fff;
                box-shadow: 0 8px 24px rgba(0,0,0,0.20);
                text-decoration: none;
            }
        </style>
    </head>
    <body>
    
        <div class="container-fluid p-0">
            <!-- Top Navbar -->
            <nav class="navbar navbar-expand-lg top-navbar">
                <div class="container">
                    <a href="{{ route('home') }}" class="d-flex align-items-center navbar-brand">
                        <img src="{{ asset('asset/1.png') }}" alt="صيدليتي" width="40" height="40" class="rounded-circle me-2">
                        <span class="fs-5 fw-bold text-main">صيدليتي</span>
                    </a>
                    
                    <button class="navbar-toggler bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="navbarContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('home') ? 'active' : '' }}" href="{{ url('/') }}">
                                    <i class="fas fa-home me-1"></i> الرئيسية
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}" href="{{ route('dashboard') }}">
                                    <i class="fas fa-tachometer-alt me-1"></i> الاختيارات
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('webdoctor.*') ? 'active' : '' }}" href="{{ route('webdoctor.index') }}">
                                    <i class="fas fa-user-md me-1"></i> قائمة الأطباء
                                </a>
                            </li>
                        
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('webmedicien.*') ? 'active' : '' }}" href="{{ route('webmedicien.index') }}">
                                    <i class="fas fa-capsules me-1"></i> قائمة الأدوية
                                </a>
                            </li>
                            
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('consult.*') ? 'active' : '' }}" href="{{ url('/consult/doctor') }}">
                                    <i class="fas fa-stethoscope me-1"></i> الاستشاريين
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" id="cartNavLink">
                                    <i class="fas fa-shopping-cart me-1"></i> السلة
                                    <span class="badge rounded-pill bg-danger cart-count" style="display: none;">0</span>
                                </a>
                            </li>
                          
                
                        </ul>
                        
                        <!-- User dropdown / Auth buttons -->
                        <div class="ms-auto">
                            @auth
                            <div class="dropdown user-dropdown">
                                <a class="btn dropdown-toggle" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-user-circle me-1"></i> {{ Auth::user()->name }}
                                </a>
                                <ul class="dropdown-menu dropdown-menu-start shadow-sm border-0" aria-labelledby="userDropdown">
                                    <li><a class="dropdown-item" href="{{ route('profile.edit') }}"><i class="fas fa-user-edit me-2"></i> الملف الشخصي</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <form method="POST" action="{{ route('logout') }}">
                                            @csrf
                                            <button type="submit" class="dropdown-item"><i class="fas fa-sign-out-alt me-2"></i> تسجيل الخروج</button>
                                        </form>
                                    </li>
                                </ul>
                            </div>
                            @else
                            <div class="d-flex gap-2">
                                <a href="{{ route('login') }}" class="btn btn-outline-primary btn-sm"><i class="fas fa-sign-in-alt me-1"></i> دخول</a>
                                <a href="{{ route('register') }}" class="btn btn-primary btn-sm"><i class="fas fa-user-plus me-1"></i> تسجيل</a>
                            </div>
                            @endauth
                        </div>
                    </div>
                </div>
            </nav>
            
            <!-- Page Heading -->
            @if (isset($header))
                <header class="bg-white shadow-sm">
                    <div class="container py-3">
                        {{ $header }}
                    </div>
                </header>
            @endif
            
            <!-- Main Content -->
            <main class="main-content">
                <div class="container">
                    {{ $slot }}
                </div>
            </main>

            <!-- Footer -->
            <footer class="bg-white text-center p-4 mt-5 border-top">
                <div class="container">
                    <p class="mb-0 text-muted">جميع الحقوق محفوظة &copy; {{ date('Y') }} صيدليتي</p>
                </div>
            </footer>
        </div>

        <!-- Bootstrap JS (with Popper) -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
        
        <!-- Modal نافذة حجز الموعد -->
        <div class="modal fade" id="appointmentModal" tabindex="-1" aria-labelledby="appointmentModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="appointmentModalLabel"><i class="fas fa-calendar-plus me-2"></i> حجز موعد جديد</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div id="appointment-form-container">
                            <form id="appointmentForm">
                                @csrf
                                <input type="hidden" id="doctor_id" name="doctor_id" value="">
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="patient_name" class="form-label">الاسم الكامل <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="patient_name" name="patient_name" required>
                                        <div class="invalid-feedback" id="patient_name_error"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="phone" class="form-label">رقم الهاتف <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="phone" name="phone" required>
                                        <div class="invalid-feedback" id="phone_error"></div>
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="email" class="form-label">البريد الإلكتروني</label>
                                        <input type="email" class="form-control" id="email" name="email">
                                        <div class="invalid-feedback" id="email_error"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="appointment_date" class="form-label">تاريخ الموعد <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="appointment_date" name="appointment_date" min="{{ date('Y-m-d') }}" required>
                                        <div class="invalid-feedback" id="appointment_date_error"></div>
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="appointment_time" class="form-label">وقت الموعد <span class="text-danger">*</span></label>
                                        <input type="time" class="form-control" id="appointment_time" name="appointment_time" required>
                                        <div class="invalid-feedback d-block" id="time-error-js" style="display:none"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="selected-doctor" class="form-label">الطبيب</label>
                                        <input type="text" class="form-control" id="selected-doctor" readonly>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="notes" class="form-label">ملاحظات إضافية</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="3"></textarea>
                                    <div class="invalid-feedback" id="notes_error"></div>
                                </div>
                                
                                <div class="d-flex justify-content-end mt-4">
                                    <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">إلغاء</button>
                                    <button type="submit" class="btn btn-primary" id="submit-appointment">
                                        <i class="fas fa-calendar-check me-1"></i> تأكيد الحجز
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal نافذة تأكيد الحجز -->
        <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="confirmationModalLabel"><i class="fas fa-check-circle me-2"></i> تم الحجز بنجاح</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 text-center">
                        <div class="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                            <i class="fas fa-check-circle text-success fa-4x"></i>
                        </div>
                        <h4 class="text-success mb-1">تم استلام طلب الحجز بنجاح</h4>
                        <p class="text-muted mb-4">سيتم التواصل معك قريباً لتأكيد موعدك</p>
                        
                        <div class="appointment-details border p-3 mb-4 rounded text-start">
                            <h6 class="fw-bold mb-2">تفاصيل الحجز:</h6>
                            <p class="mb-1"><strong>الاسم:</strong> <span id="confirm-name"></span></p>
                            <p class="mb-1"><strong>الطبيب:</strong> <span id="confirm-doctor"></span></p>
                            <p class="mb-1"><strong>التاريخ:</strong> <span id="confirm-date"></span></p>
                            <p class="mb-1"><strong>الوقت:</strong> <span id="confirm-time"></span></p>
                        </div>
                        
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="fas fa-check me-1"></i> تم
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal نافذة طلب الدواء -->
        <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="cartModalLabel"><i class="fas fa-shopping-cart me-2"></i> إكمال الطلب</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="cart-items mb-4">
                            <h6 class="fw-bold mb-3">الأدوية المطلوبة:</h6>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>الدواء</th>
                                            <th>السعر</th>
                                            <th>الكمية</th>
                                            <th>الإجمالي</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody id="cartItemsContainer">
                                        <!-- سيتم إضافة العناصر هنا ديناميكيًا -->
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="text-start fw-bold">الإجمالي:</td>
                                            <td colspan="2" id="cartTotal" class="fw-bold">0 ج.م</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div class="text-end mt-3">
                                <button class="btn btn-success" id="checkoutBtn">
                                    <i class="fas fa-arrow-left me-1"></i> متابعة الطلب
                                </button>
                            </div>
                        </div>
                        
                        <div id="customer-info-section" style="display: none;">
                            <form id="orderForm">
                                @csrf
                                <input type="hidden" id="cart_items" name="cart_items" value="">
                                
                                <h6 class="fw-bold mb-3">بيانات التوصيل:</h6>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="customer_name" class="form-label">الاسم الكامل <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="customer_name" name="customer_name" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="customer_phone" class="form-label">رقم الهاتف <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="customer_phone" name="customer_phone" required>
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="customer_email" class="form-label">البريد الإلكتروني</label>
                                        <input type="email" class="form-control" id="customer_email" name="customer_email">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="delivery_method" class="form-label">طريقة التوصيل <span class="text-danger">*</span></label>
                                        <select class="form-select" id="delivery_method" name="delivery_method" required>
                                            <option value="delivery">توصيل للمنزل</option>
                                            <option value="pickup">استلام من الصيدلية</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="address" class="form-label">العنوان <span class="text-danger">*</span></label>
                                    <textarea class="form-control" id="address" name="address" rows="2" required></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="notes" class="form-label">ملاحظات إضافية</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="2"></textarea>
                                </div>
                                
                                <div class="d-flex justify-content-between mt-4">
                                    <button type="button" class="btn btn-outline-secondary" onclick="showCartReviewStep()">
                                        <i class="fas fa-shopping-cart me-1"></i> عرض السلة
                                    </button>
                                    <button type="submit" class="btn btn-success" id="submit-order">
                                        <i class="fas fa-check-circle me-1"></i> تأكيد الطلب
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal نافذة تأكيد الطلب -->
        <div class="modal fade" id="orderConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title"><i class="fas fa-check-circle me-2"></i> تم تقديم الطلب بنجاح</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 text-center">
                        <div class="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                            <i class="fas fa-check-circle text-success fa-4x"></i>
                        </div>
                        <h4 class="text-success mb-3">تم استلام طلبك بنجاح</h4>
                        <p class="mb-4">سيتم التواصل معك قريبًا لتأكيد الطلب وتحديد موعد التوصيل</p>
                        
                        <div class="order-details border p-3 mb-4 rounded text-start">
                            <h6 class="fw-bold mb-2">تفاصيل الطلب:</h6>
                            <p class="mb-1"><strong>رقم الطلب:</strong> <span id="order-number"></span></p>
                            <p class="mb-1"><strong>الاسم:</strong> <span id="order-name"></span></p>
                            <p class="mb-1"><strong>العنوان:</strong> <span id="order-address"></span></p>
                            <p class="mb-1"><strong>إجمالي الطلب:</strong> <span id="order-total"></span></p>
                        </div>
                        
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="fas fa-check me-1"></i> تم
                        </button>
                        
                        <div class="mt-3">
                            <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
                            <span class="text-muted">جاري التحويل إلى صفحة الأدوية...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- زر عائم للذكاء الاصطناعي -->
        <a href="{{ route('ai.chat') }}" class="ai-float-btn" title="الدردشة مع الذكاء الاصطناعي">
            <i class="fas fa-robot"></i>
        </a>
        
        <script>
            // تعريف المتغيرات العامة
            let cart = [];
            
            // عرض خطوة إدخال بيانات العميل
            function showCustomerInfoStep() {
                // أخفي قسم السلة وأظهر قسم بيانات العميل
                document.querySelector('.cart-items').style.display = 'none';
                document.getElementById('customer-info-section').style.display = 'block';
                
                // تغيير عنوان النافذة
                document.getElementById('cartModalLabel').innerHTML = '<i class="fas fa-user me-2"></i> إدخال بياناتك';
                
                // إظهار النافذة المنبثقة
                const modal = new bootstrap.Modal(document.getElementById('cartModal'));
                modal.show();
            }
            
            // عرض خطوة مراجعة السلة
            function showCartReviewStep() {
                // أخفي قسم بيانات العميل وأظهر قسم السلة
                document.querySelector('.cart-items').style.display = 'block';
                document.getElementById('customer-info-section').style.display = 'none';
                
                // تغيير عنوان النافذة
                document.getElementById('cartModalLabel').innerHTML = '<i class="fas fa-shopping-cart me-2"></i> مراجعة الطلب';
                
                // إظهار النافذة المنبثقة
                const modal = new bootstrap.Modal(document.getElementById('cartModal'));
                modal.show();
            }
            
            // كود JavaScript للتعامل مع نموذج الحجز
            document.addEventListener('DOMContentLoaded', function() {
                // زر القائمة العلوية لحجز الموعد
                const navAppointmentBtn = document.getElementById('navAppointmentBtn');
                if (navAppointmentBtn) {
                    navAppointmentBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // احضار قائمة الأطباء بشكل ديناميكي (AJAX)
                        fetch('{{ route("webdoctor.index") }}')
                        .then(response => {
                            // عرض النافذة المنبثقة وملء خانة اختيار الطبيب
                            // يمكنك هنا إضافة كود لجلب قائمة الأطباء ديناميكٍ بـ AJAX
                            
                            // تعيين قيمة افتراضية - في الواقع سيتم تحميل قائمة الأطباء
                            document.getElementById('doctor_id').value = "";
                            document.getElementById('selected-doctor').value = "يرجى اختيار طبيب من صفحة الأطباء";
                            
                            // عرض النافذة المنبثقة
                            const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
                            modal.show();
                        });
                    });
                }
                
                // فتح النافذة المنبثقة للحجز عند النقر على زر الحجز
                const appointmentBtns = document.querySelectorAll('.book-appointment-btn');
                if (appointmentBtns) {
                    appointmentBtns.forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            
                            // استخراج معلومات الطبيب
                            const doctorId = this.getAttribute('data-doctor-id');
                            const doctorName = this.getAttribute('data-doctor-name');
                            
                            // تعبئة معلومات الطبيب في النموذج
                            document.getElementById('doctor_id').value = doctorId;
                            document.getElementById('selected-doctor').value = doctorName;
                            
                            // عرض النافذة المنبثقة
                            const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
                            modal.show();
                        });
                    });
                }
                
                // إرسال نموذج الحجز باستخدام AJAX
                const appointmentForm = document.getElementById('appointmentForm');
                if (appointmentForm) {
                    appointmentForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        // إعادة تعيين رسائل الخطأ
                        document.querySelectorAll('.invalid-feedback').forEach(el => el.innerHTML = '');
                        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
                        
                        // جمع بيانات النموذج
                        const formData = new FormData(appointmentForm);
                        
                        // إخفاء رسالة الخطأ قبل كل محاولة إرسال
                        const timeError = document.getElementById('time-error-js');
                        if (timeError) {
                            timeError.textContent = '';
                            timeError.style.display = 'none';
                            document.getElementById('appointment_time').classList.remove('is-invalid');
                        }
                        
                        // زر التقديم - إظهار حالة التحميل
                        const submitBtn = document.getElementById('submit-appointment');
                        const originalBtnText = submitBtn.innerHTML;
                        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الحفظ...';
                        submitBtn.disabled = true;
                        
                        // إرسال الطلب
                        fetch('{{ route("appointments.store") }}', {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            }
                        })
                        .then(async response => {
                            // إعادة زر التقديم إلى وضعه الطبيعي
                            submitBtn.innerHTML = originalBtnText;
                            submitBtn.disabled = false;
                            
                            if (response.status === 422) {
                                const data = await response.json();
                                // إظهار رسالة الخطأ تحت حقل الوقت
                                const timeError = document.getElementById('time-error-js');
                                if (timeError) {
                                    timeError.textContent = data.message || 'هذا الموعد محجوز بالفعل لهذا الطبيب. اختر وقتًا آخر.';
                                    timeError.style.display = 'block';
                                    document.getElementById('appointment_time').classList.add('is-invalid');
                                }
                                return;
                            }
                            
                            // بغض النظر عن الاستجابة، نعرض نافذة التأكيد
                            // إغلاق نافذة الحجز
                            const appointmentModal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
                            appointmentModal.hide();
                            
                            // تعبئة بيانات التأكيد
                            document.getElementById('confirm-name').textContent = formData.get('patient_name');
                            document.getElementById('confirm-doctor').textContent = document.getElementById('selected-doctor').value;
                            document.getElementById('confirm-date').textContent = formData.get('appointment_date');
                            document.getElementById('confirm-time').textContent = formData.get('appointment_time');
                            
                            // عرض نافذة التأكيد
                            const confirmModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
                            confirmModal.show();
                            
                            // إعادة تعيين النموذج
                            appointmentForm.reset();
                            
                            return response.json();
                        })
                        .catch(error => {
                            // في حالة حدوث خطأ، نتجاهله ونعرض نافذة التأكيد
                            console.error('Error:', error);
                            
                            // إعادة زر التقديم إلى وضعه الطبيعي
                            submitBtn.innerHTML = originalBtnText;
                            submitBtn.disabled = false;
                        });
                    });
                }
            });

            // إضافة عنصر إلى السلة
            const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
            console.log("تم العثور على أزرار السلة:", addToCartButtons.length);
            
            if (addToCartButtons.length > 0) {
                addToCartButtons.forEach(button => {
                    button.addEventListener('click', function(e) {
                        console.log("تم النقر على زر إضافة للسلة");
                        e.preventDefault();
                        
                        const medicineId = this.getAttribute('data-medicine-id');
                        const medicineName = this.getAttribute('data-medicine-name');
                        const medicinePrice = parseFloat(this.getAttribute('data-medicine-price'));
                        
                        console.log("معلومات المنتج:", medicineId, medicineName, medicinePrice);
                        
                        // التحقق مما إذا كان الدواء موجودًا بالفعل في السلة
                        const existingItemIndex = cart.findIndex(item => item.id === medicineId);
                        
                        if (existingItemIndex !== -1) {
                            // زيادة الكمية إذا كان العنصر موجودًا بالفعل
                            cart[existingItemIndex].quantity += 1;
                            cart[existingItemIndex].total = cart[existingItemIndex].quantity * cart[existingItemIndex].price;
                        } else {
                            // إضافة عنصر جديد إذا لم يكن موجودًا
                            cart.push({
                                id: medicineId,
                                name: medicineName,
                                price: medicinePrice,
                                quantity: 1,
                                total: medicinePrice
                            });
                        }
                        
                        // حفظ السلة في التخزين المحلي
                        localStorage.setItem('cart', JSON.stringify(cart));
                        
                        // تحديث السلة
                        updateCartDisplay();
                        
                        alert("تمت إضافة المنتج للسلة بنجاح");
                        
                        // انتقل إلى عرض محتويات السلة
                        showCartReviewStep();
                    });
                });
            }
            
            // تحديث عرض السلة
            function updateCartDisplay() {
                const cartContainer = document.getElementById('cartItemsContainer');
                const cartTotal = document.getElementById('cartTotal');
                
                if (!cartContainer || !cartTotal) {
                    console.log("لم يتم العثور على عناصر السلة");
                    return;
                }
                
                // مسح المحتوى الحالي
                cartContainer.innerHTML = '';
                
                // حساب المجموع الكلي
                let total = 0;
                
                console.log("المنتجات في السلة:", cart.length);
                
                // إذا كانت السلة فارغة
                if (cart.length === 0) {
                    cartContainer.innerHTML = '<tr><td colspan="5" class="text-center py-3">لا توجد أدوية في السلة</td></tr>';
                } else {
                    // إضافة كل عنصر إلى الجدول
                    cart.forEach((item, index) => {
                        total += item.total;
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${item.name}</td>
                            <td>${item.price} ج.م</td>
                            <td>
                                <div class="input-group input-group-sm">
                                    <button class="btn btn-outline-secondary decrease-qty" data-index="${index}">-</button>
                                    <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                                    <button class="btn btn-outline-secondary increase-qty" data-index="${index}">+</button>
                                </div>
                            </td>
                            <td>${item.total.toFixed(2)} ج.م</td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        `;
                        cartContainer.appendChild(row);
                    });
                    
                    // إضافة مستمعي الأحداث بعد إنشاء العناصر
                    addQuantityListeners();
                }
                
                // تحديث المجموع الكلي
                cartTotal.textContent = total.toFixed(2) + ' ج.م';
                
                // تحديث حقل البيانات المخفي للنموذج
                const cartItemsInput = document.getElementById('cart_items');
                if (cartItemsInput) {
                    cartItemsInput.value = JSON.stringify(cart);
                }
                
                // تحديث شارة عدد عناصر السلة
                updateCartBadge();
            }
            
            // مستمعي الأحداث لأزرار زيادة ونقصان الكمية
            function addQuantityListeners() {
                // أزرار زيادة الكمية
                const increaseButtons = document.querySelectorAll('.increase-qty');
                increaseButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const index = parseInt(this.dataset.index);
                        increaseQuantity(index);
                    });
                });
                
                // أزرار تقليل الكمية
                const decreaseButtons = document.querySelectorAll('.decrease-qty');
                decreaseButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const index = parseInt(this.dataset.index);
                        decreaseQuantity(index);
                    });
                });
                
                // أزرار إزالة عنصر
                const removeButtons = document.querySelectorAll('.remove-item');
                removeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const index = parseInt(this.dataset.index);
                        removeFromCart(index);
                    });
                });
            }
            
            // زيادة كمية منتج
            function increaseQuantity(index) {
                cart[index].quantity++;
                cart[index].total = cart[index].price * cart[index].quantity;
                saveCart();
                updateCartDisplay();
            }
            
            // تقليل كمية منتج
            function decreaseQuantity(index) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    cart[index].total = cart[index].price * cart[index].quantity;
                    saveCart();
                    updateCartDisplay();
                }
            }
            
            // إزالة منتج من السلة
            function removeFromCart(index) {
                cart.splice(index, 1);
                saveCart();
                updateCartDisplay();
            }
            
            // إضافة منتج للسلة
            function addToCart(medicineId, medicineName, medicinePrice) {
                console.log("إضافة للسلة:", medicineId, medicineName, medicinePrice);
                
                // البحث عن المنتج في السلة
                const existingItemIndex = cart.findIndex(item => item.id === medicineId);
                
                if (existingItemIndex !== -1) {
                    // إذا كان المنتج موجود بالفعل، قم بزيادة الكمية
                    cart[existingItemIndex].quantity++;
                    cart[existingItemIndex].total = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
                } else {
                    // إضافة منتج جديد
                    const newItem = {
                        id: medicineId,
                        name: medicineName,
                        price: parseFloat(medicinePrice),
                        quantity: 1,
                        total: parseFloat(medicinePrice)
                    };
                    cart.push(newItem);
                }
                
                // حفظ السلة في التخزين المحلي
                saveCart();
                
                // إظهار رسالة نجاح
                alert('تمت إضافة المنتج إلى السلة بنجاح!');
                
                // فتح نافذة السلة
                $('#cartModal').modal('show');
                
                // تحديث عرض السلة
                updateCartDisplay();
            }
            
            // حفظ السلة في التخزين المحلي
            function saveCart() {
                localStorage.setItem('cart', JSON.stringify(cart));
                console.log("تم حفظ السلة:", cart);
            }
            
            // تحديث شارة عدد عناصر السلة
            function updateCartBadge() {
                const cartBadge = document.getElementById('cartBadge');
                if (cartBadge) {
                    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
                    cartBadge.textContent = itemCount;
                    cartBadge.style.display = itemCount > 0 ? 'inline-block' : 'none';
                }
            }
            
            // استرجاع السلة عند تحميل الصفحة
            document.addEventListener('DOMContentLoaded', function() {
                // تحقق من وجود السلة في التخزين المحلي
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    try {
                        cart = JSON.parse(savedCart);
                        console.log("تم استعادة السلة:", cart);
                        // تحديث عرض السلة فورًا
                        updateCartDisplay();
                    } catch (e) {
                        console.error("خطأ في تحميل السلة:", e);
                        // إعادة تعيين السلة في حالة وجود خطأ
                        cart = [];
                        localStorage.setItem('cart', JSON.stringify([]));
                    }
                } else {
                    console.log("لم يتم العثور على سلة محفوظة");
                    cart = [];
                }
            });
            
            // التعامل مع تقديم نموذج الطلب
            const orderForm = document.getElementById('orderForm');
            if (orderForm) {
                orderForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // إذا كانت السلة فارغة
                    if (cart.length === 0) {
                        alert('الرجاء إضافة أدوية إلى السلة أولاً');
                        return;
                    }
                    
                    // زر التقديم - إظهار حالة التحميل
                    const submitBtn = document.getElementById('submit-order');
                    const originalBtnText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الحفظ...';
                    submitBtn.disabled = true;
                    
                    // جمع بيانات النموذج
                    const formData = new FormData(orderForm);
                    
                    // إرسال الطلب إلى الخادم باستخدام AJAX
                    fetch('{{ route("orders.store") }}', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        // إعادة زر التقديم إلى وضعه الطبيعي
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                        
                        if (data.success) {
                            // إعداد تأكيد الطلب
                            document.getElementById('order-number').textContent = 'ORD-' + data.order.id;
                            document.getElementById('order-name').textContent = formData.get('customer_name');
                            document.getElementById('order-address').textContent = formData.get('address');
                            document.getElementById('order-total').textContent = data.order.total.toFixed(2) + ' ج.م';
                            
                            // إغلاق نافذة السلة وفتح نافذة التأكيد
                            const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
                            cartModal.hide();
                            
                            const confirmationModal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
                            confirmationModal.show();
                            
                            // مسح السلة بعد الطلب
                            cart = [];
                            saveCart();
                            updateCartDisplay();
                            orderForm.reset();
                            
                            // إعادة توجيه المستخدم إلى صفحة الأدوية بعد 3 ثوانٍ
                            setTimeout(function() {
                                window.location.href = '{{ route("webmedicien.index") }}';
                            }, 3000);
                        } else {
                            // عرض رسائل الخطأ
                            alert('حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.');
                            console.error('Error:', data.message);
                        }
                    })
                    .catch(error => {
                        // إعادة زر التقديم إلى وضعه الطبيعي
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                        
                        console.error('Error:', error);
                        alert('حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.');
                    });
                });
            }

            // تحديث شارة عدد العناصر في السلة
            function updateCartBadge() {
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    if (cart.length > 0) {
                        let totalItems = 0;
                        cart.forEach(item => {
                            totalItems += item.quantity;
                        });
                        
                        cartCount.textContent = totalItems;
                        cartCount.style.display = 'inline-block';
                    } else {
                        cartCount.style.display = 'none';
                    }
                }
            }
            
            // تحديث زر السلة في القائمة عند النقر عليه
            const cartNavLink = document.getElementById('cartNavLink');
            if (cartNavLink) {
                cartNavLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (cart.length === 0) {
                        alert('السلة فارغة! قم بإضافة بعض المنتجات أولاً.');
                        return;
                    }
                    
                    // إظهار قسم السلة وإخفاء قسم بيانات العميل
                    showCartReviewStep();
                });
            }

            // إضافة حدث لزر متابعة الطلب
            const checkoutBtn = document.getElementById('checkoutBtn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', function() {
                    showCustomerInfoStep();
                });
            }
        </script>
    </body>
</html> 




