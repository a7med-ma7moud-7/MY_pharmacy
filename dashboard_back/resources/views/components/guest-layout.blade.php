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
            
            .navbar-brand {
                font-size: 1.6rem;
                font-weight: bold;
                color: var(--main-color) !important;
            }
            
            .card {
                border-radius: 10px;
                overflow: hidden;
                transition: all 0.3s ease;
                border: none;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .card:hover {
                transform: translateY(-5px);
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
            
            .btn-outline-primary {
                color: var(--main-color);
                border-color: var(--main-color);
            }
            
            .btn-outline-primary:hover {
                background-color: var(--main-color);
                border-color: var(--main-color);
            }
            
            .btn-success {
                background-color: var(--secondary-color);
                border-color: var(--secondary-color);
            }
        </style>
    </head>
    <body>
        <div class="min-vh-100">
            <!-- Navigation -->
            <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">
                        <i class="fas fa-clinic-medical me-2"></i>صيدليتي
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <div class="navbar-nav">
                            <a href="{{ route('login') }}" class="btn btn-outline-success me-2">تسجيل الدخول</a>
                            <a href="{{ route('register') }}" class="btn btn-outline-primary">إنشاء حساب</a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Page Content -->
            <div class="container py-4">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card">
                            {{ $slot }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    </body>
</html> 