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
        
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        
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
            
            .sidebar {
                background-color: var(--main-color);
                min-height: 100vh;
                color: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            
            .sidebar .nav-link {
                color: rgba(255, 255, 255, 0.85);
                padding: 0.8rem 1rem;
                margin: 0.3rem 0;
                border-radius: 0.25rem;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .sidebar .nav-link:hover,
            .sidebar .nav-link.active {
                background-color: rgba(255, 255, 255, 0.15);
                color: white;
                transform: translateX(-5px);
            }
            
            .sidebar .nav-link i {
                margin-left: 12px;
                width: 20px;
                text-align: center;
            }
            
            .main-content {
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
            
            #ai-chat-fab {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 9999;
                background: #0d6efd;
                color: #fff;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                font-size: 2rem;
                transition: background 0.2s;
                text-decoration: none;
            }
            #ai-chat-fab:hover {
                background: #0b5ed7;
                color: #fff;
            }
        </style>
    </head>
    <body>
        @if(auth()->check())
        <script>
            window.userId = {{ auth()->id() }};
        </script>
        @endif

        <div class="container-fluid">
            <div class="row">
                <!-- Sidebar -->
                <div class="col-md-3 col-lg-2 sidebar p-0 d-none d-md-block">
                    <div class="p-3 text-center">
                        <a href="{{ route('dashboard') }}" class="text-decoration-none text-white">
                            <h3><i class="fas fa-clinic-medical"></i> صيدليتي</h3>
                        </a>
                    </div>
                    <hr class="my-2 opacity-25">
                    <ul class="nav flex-column px-2">
                        <li class="nav-item">
                            <a href="{{ route('dashboard') }}" class="nav-link active">
                                <i class="fas fa-tachometer-alt"></i>لوحة التحكم
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-pills"></i>الأدوية
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-file-prescription"></i>الوصفات
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-users"></i>العملاء
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-shopping-cart"></i>المبيعات
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-chart-line"></i>التقارير
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-cog"></i>الإعدادات
                            </a>
                        </li>
                    </ul>
                </div>
                
                <!-- Main Content -->
                <main class="col-md-9 col-lg-10 ms-sm-auto px-md-4 py-4">
                    @yield('content')
                </main>
            </div>
        </div>

        <!-- Bootstrap Bundle with Popper -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
        @stack('scripts')
    </body>
</html>
