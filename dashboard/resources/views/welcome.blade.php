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
    
    <!-- Custom Styles -->
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
            direction: rtl;
            text-align: right;
            color: #333;
            line-height: 1.6;
            letter-spacing: 0.3px;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Almarai', 'Cairo', sans-serif;
            font-weight: 700;
        }
        
        .hero-section {
            background: linear-gradient(rgba(15, 104, 72, 0.85), rgba(15, 104, 72, 0.85)), url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 120px 0;
            position: relative;
        }
        
        .hero-section::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(to top right, transparent 49%, white 50%);
        }
        
        .feature-box {
            padding: 25px;
            border-radius: 10px;
            transition: all 0.4s ease;
            height: 100%;
            border: none;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            position: relative;
            z-index: 1;
            overflow: hidden;
        }
        
        .feature-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 100%;
            background-color: var(--main-color);
            transition: all 0.4s ease;
            z-index: -1;
        }
        
        .feature-box:hover::before {
            width: 100%;
            background-color: var(--light-color);
        }
        
        .feature-box:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        
        .feature-box:hover .feature-icon {
            color: var(--main-color);
            transform: scale(1.1);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 25px;
            color: var(--main-color);
            transition: all 0.4s ease;
        }
        
        .navbar-brand {
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--main-color) !important;
        }
        
        .btn-auth {
            margin-right: 10px;
            min-width: 120px;
            font-weight: 600;
        }
        
        .btn-primary {
            background-color: var(--main-color);
            border-color: var(--main-color);
        }
        
        .btn-primary:hover {
            background-color: var(--secondary-color);
            border-color: var(--secondary-color);
        }
        
        .btn-outline-primary {
            color: var(--main-color);
            border-color: var(--main-color);
        }
        
        .btn-outline-primary:hover {
            background-color: var(--main-color);
            border-color: var(--main-color);
        }
        
        .cta-section {
            background-color: var(--light-color);
            padding: 100px 0;
            position: relative;
        }
        
        .cta-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(to bottom right, white 49%, transparent 50%);
        }
        
        footer {
            background-color: var(--dark-color);
            color: white;
            padding: 70px 0 30px;
        }
    </style>
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand" href="/">
                <i class="fas fa-clinic-medical me-2"></i>صيدليتي
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" href="{{ url('/') }}"><i class="fas fa-home me-1"></i> الرئيسية</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('webdoctor.index') }}"><i class="fas fa-user-md me-1"></i> الأطباء</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('webmedicien.index') }}"><i class="fas fa-capsules me-1"></i> الأدوية</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('appointments.index') }}"><i class="fas fa-calendar-check me-1"></i> حجز موعد</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('ai.chat') }}"><i class="fas fa-robot me-1"></i> الصيدلي الذكي (AI)</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('rate.index') }}"><i class="fas fa-star me-1"></i> التقييمات</a>
                    </li>
                </ul>
                <div class="navbar-nav align-items-center">
                    @auth
                        @if(Auth::user()->role === 'admin')
                            <a href="{{ route('admin.dashboard') }}" class="btn btn-outline-success btn-auth me-2">لوحة الإدارة</a>
                        @else
                            <a href="{{ route('dashboard') }}" class="btn btn-outline-success btn-auth me-2">حسابي</a>
                        @endif
                        <form method="POST" action="{{ route('logout') }}" class="d-inline">
                            @csrf
                            <button type="submit" class="btn btn-outline-danger btn-auth">خروج</button>
                        </form>
                    @else
                        <a href="{{ route('login') }}" class="btn btn-outline-primary btn-auth">تسجيل الدخول</a>
                        <a href="{{ route('register') }}" class="btn btn-primary btn-auth">إنشاء حساب</a>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container text-center">
            <h1 class="display-4 fw-bold mb-4">منصة صيدليتي الطبية</h1>
            <p class="lead mb-5 fs-4">أفضل منصة لإدارة الصيدليات وتوفير الخدمات الطبية والصيدلانية</p>
            <div>
                <a href="{{ route('register') }}" class="btn btn-light btn-lg me-3 px-4 py-2">ابدأ الآن</a>
                <a href="#features" class="btn btn-outline-light btn-lg px-4 py-2">تعرف على المزيد</a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-5" id="features">
        <div class="container py-5">
            <div class="text-center mb-5">
                <h2 class="fw-bold fs-1 mb-3">مميزات المنصة</h2>
                <p class="text-muted fs-5 w-75 mx-auto">اكتشف كيف يمكن لمنصتنا أن تساعد في تحسين إدارة صيدليتك وتطوير أعمالك بشكل فعّال</p>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="feature-box bg-white text-center">
                        <div class="feature-icon">
                            <i class="fas fa-pills"></i>
                        </div>
                        <h5 class="fs-4 mb-3">إدارة المخزون</h5>
                        <p>تتبع مخزون الأدوية بسهولة وتلقي تنبيهات عند انخفاض المخزون لضمان توافر الأدوية دائمًا</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-box bg-white text-center">
                        <div class="feature-icon">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <h5 class="fs-4 mb-3">إدارة الوصفات الطبية</h5>
                        <p>سجل وتتبع الوصفات الطبية والتأكد من صرف الأدوية الصحيحة للمرضى بدقة وبشكل آمن</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-box bg-white text-center">
                        <div class="feature-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h5 class="fs-4 mb-3">تقارير وإحصائيات</h5>
                        <p>مراقبة أداء الصيدلية من خلال تقارير مفصلة ورسوم بيانية تساعدك في اتخاذ القرارات المناسبة</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-box bg-white text-center">
                        <div class="feature-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h5 class="fs-4 mb-3">إدارة العملاء</h5>
                        <p>تسجيل بيانات العملاء وتاريخهم الطبي وتقديم خدمة أفضل بناءً على معرفة احتياجاتهم</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-box bg-white text-center">
                        <div class="feature-icon">
                            <i class="fas fa-bell"></i>
                        </div>
                        <h5 class="fs-4 mb-3">نظام التنبيهات</h5>
                        <p>تنبيهات تلقائية للمواعيد وانتهاء صلاحية الأدوية ومتابعة جميع العمليات اليومية بسهولة</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-box bg-white text-center">
                        <div class="feature-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h5 class="fs-4 mb-3">موقع متوافق مع الجوال</h5>
                        <p>الوصول إلى منصتك من أي مكان وفي أي وقت عبر أجهزة الحاسوب والهواتف الذكية والأجهزة اللوحية</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container text-center">
            <h2 class="fw-bold fs-1 mb-4">ابدأ في استخدام منصة صيدليتي اليوم</h2>
            <p class="lead mb-5 fs-5">انضم إلى آلاف الصيدليات التي تستخدم منصتنا لتحسين أدائها وزيادة أرباحها وتقديم خدمة أفضل للمرضى</p>
            <div>
                <a href="{{ route('register') }}" class="btn btn-primary btn-lg me-3 px-5 py-3 fs-5 rounded-pill">سجّل الآن</a>
                <a href="{{ route('login') }}" class="btn btn-outline-secondary btn-lg px-5 py-3 fs-5 rounded-pill">تسجيل الدخول</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4 mb-md-0">
                    <h3 class="mb-4 fs-3">صيدليتي</h3>
                    <p class="opacity-75 fs-5">منصة متكاملة لإدارة الصيدليات وتقديم أفضل الخدمات الصيدلانية للمرضى والعملاء.</p>
                </div>
                <div class="col-md-4 mb-4 mb-md-0">
                    <h3 class="mb-4 fs-3">روابط سريعة</h3>
                    <ul class="list-unstyled fs-5">
                        <li class="mb-3"><a href="#" class="text-white text-decoration-none opacity-75"><i class="fas fa-angle-left me-2"></i> الرئيسية</a></li>
                        <li class="mb-3"><a href="#features" class="text-white text-decoration-none opacity-75"><i class="fas fa-angle-left me-2"></i> المميزات</a></li>
                        <li class="mb-3"><a href="{{ route('login') }}" class="text-white text-decoration-none opacity-75"><i class="fas fa-angle-left me-2"></i> تسجيل الدخول</a></li>
                        <li><a href="{{ route('register') }}" class="text-white text-decoration-none opacity-75"><i class="fas fa-angle-left me-2"></i> إنشاء حساب</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h3 class="mb-4 fs-3">تواصل معنا</h3>
                    <ul class="list-unstyled fs-5">
                        <li class="mb-3"><i class="fas fa-envelope me-3 opacity-75"></i> info@pharmacy-app.com</li>
                        <li class="mb-3"><i class="fas fa-phone me-3 opacity-75"></i> +123 456 7890</li>
                        <li><i class="fas fa-map-marker-alt me-3 opacity-75"></i> القاهرة، مصر</li>
                    </ul>
                </div>
            </div>
            <hr class="my-5 opacity-25">
            <div class="text-center">
                <p class="mb-0 opacity-75">جميع الحقوق محفوظة &copy; {{ date('Y') }} صيدليتي</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>