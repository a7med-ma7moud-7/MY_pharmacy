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
        </style>
    </head>
    <body>
        <div class="container-fluid p-0">
            <!-- Top Navbar -->
            <nav class="navbar navbar-expand-lg top-navbar">
                <div class="container">
                    <a class="navbar-brand text-white" href="{{ route('dashboard') }}">
                        <i class="fas fa-clinic-medical"></i> صيدليتي
                    </a>
                    
                    <button class="navbar-toggler bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="navbarContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}" href="{{ route('dashboard') }}">
                                    <i class="fas fa-home me-1"></i> الرئيسية
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('doctor.*') ? 'active' : '' }}" href="{{ route('doctor.index') }}">
                                    <i class="fas fa-user-md me-1"></i> الأطباء
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#">
                                    <i class="fas fa-pills me-1"></i> الأدوية
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#">
                                    <i class="fas fa-stethoscope me-1"></i> الاستشاريين
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#">
                                    <i class="fas fa-shopping-cart me-1"></i> السلة
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

        <!-- Bootstrap JS Bundle -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    </body>
</html> 