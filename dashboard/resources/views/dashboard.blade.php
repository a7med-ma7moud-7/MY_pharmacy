<x-user-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-home me-2"></i>الصفحة الرئيسية
        </h2>
                <p class="text-muted mb-0 mt-1">مرحباً، {{ Auth::user()->name }}! نتمنى لك يوماً سعيداً</p>
            </div>
            <div class="d-flex">
                <a href="{{ route('tech.index') }}" class="btn btn-sm btn-outline-primary">
                     الدعم الفني
                </a>
            </div>
        </div>
    </x-slot>

    <!-- Main Services Section -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <h4 class="mb-4 border-bottom pb-2">خدماتنا الرئيسية</h4>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <a href="{{ route('webdoctor.index') }}" class="text-decoration-none">
                                <div class="card h-100 border-0 shadow-sm service-card">
                                    <div class="card-body text-center p-4">
                                        <div class="service-icon bg-primary text-white mx-auto mb-3">
                                            <i class="fas fa-user-md fa-2x"></i>
                                        </div>
                                        <h5 class="card-title">الدكاترة الموجودين</h5>
                                        <p class="card-text text-muted">تصفح قائمة الأطباء المتاحين لدينا للحصول على الخدمات الطبية</p>
                                        <div class="mt-3">
                                            <span class="btn btn-sm btn-primary">عرض الدكاترة</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="{{ route('webmedicien.index') }}" class="text-decoration-none">
                                <div class="card h-100 border-0 shadow-sm service-card">
                                    <div class="card-body text-center p-4">
                                        <div class="service-icon bg-success text-white mx-auto mb-3">
                                            <i class="fas fa-pills fa-2x"></i>
                                        </div>
                                        <h5 class="card-title">الأدوية المتاحة</h5>
                                        <p class="card-text text-muted">استعرض جميع الأدوية المتوفرة لدينا والتعرف على أسعارها</p>
                                        <div class="mt-3">
                                            <span class="btn btn-sm btn-success">عرض الأدوية</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="{{ route('consult.doctor') }}" class="text-decoration-none">
                                <div class="card h-100 border-0 shadow-sm service-card">
                                    <div class="card-body text-center p-4">
                                        <div class="service-icon bg-info text-white mx-auto mb-3">
                                            <i class="fas fa-stethoscope fa-2x"></i>
                                        </div>
                                        <h5 class="card-title">الدكاترة الاستشاريين</h5>
                                        <p class="card-text text-muted">تواصل مع أفضل الأطباء الاستشاريين في مختلف التخصصات</p>
                                        <div class="mt-3">
                                            <span class="btn btn-sm btn-info">عرض الاستشاريين</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Featured Doctors Section -->
    
    <!-- Popular Medicines -->
   
        
        <!-- Medical Consultants -->
      

    <style>
        /* Service Cards */
        .service-icon {
            width: 80px;
            height: 80px;
            line-height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .service-card {
            transition: all 0.3s ease;
        }

        .service-card:hover {
            transform: translateY(-10px);
        }

        /* Doctor Cards */
        .doctor-img {
            width: 100px;
            height: 100px;
            overflow: hidden;
            border-radius: 50%;
            border: 5px solid rgba(0, 123, 255, 0.1);
        }

        .doctor-card, .medicine-card {
            transition: all 0.3s ease;
        }

        .doctor-card:hover, .medicine-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }

        .rating-value {
            font-size: 0.8rem;
        }
    </style>
</x-user-layout>
