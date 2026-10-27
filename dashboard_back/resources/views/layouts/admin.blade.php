<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'صيدليتي') }} - لوحة التحكم</title>

        <!-- Bootstrap CSS RTL -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.rtl.min.css" integrity="sha384-gXt9imSW0VcJVHezoNQsP+TNrjYXoGcrqBZJpry9zJt8PCQjobwmhMGaDHTASo9N" crossorigin="anonymous">
           <!-- Font Awesome CDN -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
            
            .admin-layout {
                display: flex;
                min-height: 100vh;
            }
            
            /* Sidebar Styles */
            .admin-sidebar {
                width: 260px;
                background-color: var(--dark-color);
                color: white;
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                padding: 0;
                z-index: 1000;
                transition: all 0.3s;
                overflow-y: auto;
            }
            
            .admin-sidebar-header {
                padding: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .admin-sidebar-logo {
                font-size: 1.5rem;
                font-weight: bold;
                color: white;
                text-decoration: none;
                display: flex;
                align-items: center;
            }
            
            .admin-sidebar-logo:hover {
                color: white;
            }
            
            .admin-sidebar-logo img {
                margin-left: 10px;
                border-radius: 50%;
            }
            
            .admin-sidebar-nav {
                padding: 1rem 0;
            }
            
            .nav-section-title {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: rgba(255,255,255,0.5);
                padding: 0.75rem 1.5rem;
                margin-top: 1rem;
            }
            
            .nav-item {
                margin: 0.25rem 0;
            }
            
            .nav-link {
                padding: 0.75rem 1.5rem;
                color: rgba(255,255,255,0.7);
                display: flex;
                align-items: center;
                transition: all 0.3s;
                border-right: 3px solid transparent;
            }
            
            .nav-link:hover, .nav-link.active {
                color: white;
                background-color: rgba(255,255,255,0.1);
                border-right-color: var(--secondary-color);
            }
            
            .nav-link i {
                margin-left: 10px;
                font-size: 1.1rem;
                width: 20px;
                text-align: center;
            }
            
            /* Main Content Styles */
            .admin-content {
                flex: 1;
                margin-right: 260px;
                transition: all 0.3s;
            }
            
            .admin-topbar {
                background-color: white;
                box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
                padding: 0.75rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .admin-topbar-toggle {
                background: none;
                border: none;
                font-size: 1.25rem;
                cursor: pointer;
                color: var(--dark-color);
            }
            
            .admin-user-dropdown .dropdown-toggle {
                background: none;
                border: none;
                display: flex;
                align-items: center;
                padding: 0.5rem;
                font-weight: 600;
                color: var(--dark-color);
            }
            
            .admin-user-dropdown .dropdown-toggle img {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                margin-left: 10px;
            }
            
            .admin-user-dropdown .dropdown-toggle:after {
                display: none;
            }
            
            .admin-user-dropdown .dropdown-menu {
                left: 0;
                right: auto;
                min-width: 14rem;
                padding: 0.5rem 0;
                margin-top: 0.5rem;
                box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
                border: none;
            }
            
            .admin-user-dropdown .dropdown-item {
                padding: 0.5rem 1.5rem;
            }
            
            .admin-main-content {
                padding: 1.5rem;
            }
            
            .card {
                border-radius: 10px;
                overflow: hidden;
                transition: all 0.3s ease;
                border: none;
                margin-bottom: 1.5rem;
                box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
            }
            
            .card:hover {
                box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
            }
            
            .card-header {
                font-weight: 600;
                border-bottom: 1px solid rgba(0,0,0,0.05);
                background-color: white;
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
            
            .text-primary {
                color: var(--main-color) !important;
            }
            
            /* Responsive */
            @media (max-width: 992px) {
                .admin-sidebar {
                    margin-right: -260px;
                }
                
                .admin-content {
                    margin-right: 0;
                }
                
                .admin-sidebar.show {
                    margin-right: 0;
                }
                
                .admin-content.sidebar-show {
                    margin-right: 260px;
                }
            }
        </style>
    </head>
    <body>
        <div class="admin-layout">
            <!-- Sidebar -->
            <div class="admin-sidebar">
                <div class="admin-sidebar-header">
                    <a href="{{ route('admin.dashboard') }}" class="admin-sidebar-logo">
                        <img src="{{ asset('asset/1.png') }}" alt="صيدليتي" width="40" height="40" class="rounded-circle">
                        <span>صيدليتي</span>
                    </a>
                    <button class="btn d-lg-none close-sidebar">
                        <i class="fas fa-times text-white"></i>
                    </button>
                </div>
                
                <nav class="admin-sidebar-nav">
                    <div class="nav-section-title">لوحة التحكم</div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}" href="{{ route('admin.dashboard') }}">
                                <i class="fas fa-tachometer-alt"></i>
                                <span>الرئيسية</span>
                            </a>
                        </li>
                    </ul>
                    
                    <div class="nav-section-title">إدارة المستخدمين</div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('users.index') }}">
                                <i class="fas fa-users"></i>
                                <span>المستخدمين</span>
                            </a>
                        </li>
                    </ul>
                    
                    <div class="nav-section-title">إدارة الأطباء</div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('doctor.index') ? 'active' : '' }}" href="{{ route('doctor.index') }}">
                                <i class="fas fa-user-md"></i>
                                <span>قائمة الأطباء</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('doctor.create') ? 'active' : '' }}" href="{{ route('doctor.create') }}">
                                <i class="fas fa-plus"></i>
                                <span>إضافة طبيب</span>
                            </a>
                        </li>
                    </ul>
                    
                    <div class="nav-section-title">إدارة الأدوية</div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('medicien.index') ? 'active' : '' }}" href="{{ route('medicien.index') }}">
                                <i class="fas fa-pills"></i>
                                <span>قائمة الأدوية</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('medicien.create') ? 'active' : '' }}" href="{{ route('medicien.create') }}">
                                <i class="fas fa-plus"></i>
                                <span>إضافة دواء</span>
                            </a>
                        </li>
                    </ul>
                    
                    <div class="nav-section-title">الحجوزات</div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('admin.appointments.index') ? 'active' : '' }}" href="{{ route('admin.appointments.index') }}">
                                <i class="fas fa-calendar-check"></i>
                                <span>قائمة الحجوزات</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">
                                <i class="fas fa-plus"></i>
                                <span>إضافة حجز</span>
                            </a>
                        </li>
                    </ul>
                    
                    <div class="nav-section-title">المبيعات</div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('admin.orders.index') }}">
                                <i class="fas fa-shopping-cart"></i>
                                <span>طلبات الشراء</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('admin.reports.index') }}">
                                <i class="fas fa-chart-line"></i>
                                <span>التقارير</span>
                            </a>
                        </li>
                    </ul>
                    
                    <div class="nav-section-title">الإعدادات</div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="#">
                                <i class="fas fa-cog"></i>
                                <span>إعدادات النظام</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('home') }}" target="_blank">
                                <i class="fas fa-external-link-alt"></i>
                                <span>زيارة الموقع</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
            
            <!-- Main Content -->
            <div class="admin-content">
                <!-- Top Navbar -->
                <div class="admin-topbar">
                    <button class="admin-topbar-toggle d-lg-none">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <!-- Notification Button -->
                    <div class="d-flex align-items-center">
                        <div class="dropdown me-3">
                            <button class="btn position-relative" type="button" id="notificationsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-bell"></i>
                                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {{ auth()->user()->unreadNotifications->count() }}
                                </span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="notificationsDropdown" style="width: 300px;">
                                <li><h6 class="dropdown-header">الإشعارات</h6></li>
                                <li><hr class="dropdown-divider"></li>
                                @foreach(auth()->user()->unreadNotifications as $notification)
                                    <li><a class="dropdown-item" href="#">{{ $notification->data['message'] ?? 'إشعار جديد' }}</a></li>
                                @endforeach
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-center" href="#">عرض جميع الإشعارات</a></li>
                            </ul>
                        </div>
                        
                        <!-- User Dropdown -->
                        <div class="dropdown admin-user-dropdown">
                            <button class="dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <img src="{{ asset('asset/1.png') }}" alt="{{ Auth::user()->name }}" width="36" height="36" class="rounded-circle">
                                <span>{{ Auth::user()->name }}</span>
                            </button>
                            <ul class="dropdown-menu shadow" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="{{ route('profile.edit') }}"><i class="fas fa-user-edit me-2"></i> الملف الشخصي</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i> الإعدادات</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <form method="POST" action="{{ route('logout') }}">
                                        @csrf
                                        <button type="submit" class="dropdown-item"><i class="fas fa-sign-out-alt me-2"></i> تسجيل الخروج</button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Header -->
                @if (isset($header))
                    <header class="bg-white shadow-sm">
                        <div class="container-fluid py-3">
                            {{ $header }}
                        </div>
                    </header>
                @endif
                
                <!-- Main Content -->
                <main class="admin-main-content">
                    {{ $slot }}
                </main>
                
                <!-- Footer -->
                <footer class="bg-white text-center p-3 mt-4 border-top">
                    <p class="mb-0 text-muted">جميع الحقوق محفوظة &copy; {{ date('Y') }} صيدليتي - لوحة التحكم</p>
                </footer>
            </div>
        </div>

        <!-- Bootstrap JS Bundle -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
        
        <!-- Admin Layout JavaScript -->
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Toggle Sidebar on mobile
                const sidebarToggle = document.querySelector('.admin-topbar-toggle');
                const closeSidebar = document.querySelector('.close-sidebar');
                const sidebar = document.querySelector('.admin-sidebar');
                const content = document.querySelector('.admin-content');
                
                if (sidebarToggle) {
                    sidebarToggle.addEventListener('click', () => {
                        sidebar.classList.toggle('show');
                        content.classList.toggle('sidebar-show');
                    });
                }
                
                if (closeSidebar) {
                    closeSidebar.addEventListener('click', () => {
                        sidebar.classList.remove('show');
                        content.classList.remove('sidebar-show');
                    });
                }
                
                // Close sidebar when clicking outside on mobile
                document.addEventListener('click', (e) => {
                    if (window.innerWidth < 992) {
                        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('show')) {
                            sidebar.classList.remove('show');
                            content.classList.remove('sidebar-show');
                        }
                    }
                });
            });
        </script>
        <script>
            window.Echo.private('App.Models.User.' + window.userId)
                .notification((notification) => {
                    // حدث جديد: حدث تحديث للأيقونة أو أضف الإشعار للقائمة
                    updateNotificationIcon(notification);
                });
        </script>
    </body>
</html> 