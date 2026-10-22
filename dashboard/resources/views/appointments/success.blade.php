<x-user-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-check-circle text-success me-2"></i>تم الحجز بنجاح
                </h2>
                <p class="text-muted mb-0 mt-1">شكراً لحجزك موعد في صيدليتنا</p>
            </div>
            <div>
                <a href="{{ route('webdoctor.index') }}" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-user-md me-1"></i> عودة إلى قائمة الأطباء
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white py-3">
                        <h5 class="mb-0 text-success"><i class="fas fa-calendar-check me-2"></i>تفاصيل الحجز</h5>
                    </div>
                    <div class="card-body p-4">
                        @if(session('success'))
                            <div class="alert alert-success mb-4">
                                <i class="fas fa-check-circle me-2"></i>
                                {{ session('success') }}
                            </div>
                        @endif

                        <div class="row mb-4">
                            <div class="col-md-12 text-center mb-4">
                                <div class="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                                    <i class="fas fa-check-circle text-success fa-4x"></i>
                                </div>
                                <h4 class="text-success mb-1">تم استلام طلب الحجز بنجاح</h4>
                                <p class="text-muted">سيتم التواصل معك قريباً للتأكيد</p>
                            </div>
                        </div>

                        <div class="border-top pt-4">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6 class="fw-bold mb-2">معلومات المريض:</h6>
                                    <p class="mb-1"><i class="fas fa-user text-primary me-2"></i>{{ $appointment->patient_name }}</p>
                                    <p class="mb-1"><i class="fas fa-phone text-primary me-2"></i>{{ $appointment->phone }}</p>
                                    @if($appointment->email)
                                        <p class="mb-1"><i class="fas fa-envelope text-primary me-2"></i>{{ $appointment->email }}</p>
                                    @endif
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6 class="fw-bold mb-2">معلومات الموعد:</h6>
                                    <p class="mb-1"><i class="fas fa-user-md text-primary me-2"></i>د. {{ $appointment->doctor->name }}</p>
                                    <p class="mb-1"><i class="fas fa-calendar-alt text-primary me-2"></i>{{ $appointment->appointment_date->format('Y-m-d') }}</p>
                                    <p class="mb-1"><i class="fas fa-clock text-primary me-2"></i>{{ $appointment->appointment_time }}</p>
                                </div>
                            </div>
                        </div>

                        @if($appointment->notes)
                            <div class="border-top pt-3 mt-3">
                                <h6 class="fw-bold mb-2">ملاحظات:</h6>
                                <p class="text-muted mb-0">{{ $appointment->notes }}</p>
                            </div>
                        @endif

                        <div class="border-top pt-4 mt-4 text-center">
                            <h6 class="mb-3">ماذا يحدث الآن؟</h6>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border-0 shadow-sm">
                                        <div class="card-body p-3 text-center">
                                            <div class="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px;">
                                                <i class="fas fa-phone text-primary fa-2x"></i>
                                            </div>
                                            <h6 class="mb-2">1. التأكيد</h6>
                                            <p class="small text-muted mb-0">سيتم التواصل معك هاتفياً لتأكيد الموعد</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border-0 shadow-sm">
                                        <div class="card-body p-3 text-center">
                                            <div class="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px;">
                                                <i class="fas fa-calendar-check text-success fa-2x"></i>
                                            </div>
                                            <h6 class="mb-2">2. الحضور</h6>
                                            <p class="small text-muted mb-0">يرجى الحضور قبل الموعد بـ 15 دقيقة</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border-0 shadow-sm">
                                        <div class="card-body p-3 text-center">
                                            <div class="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px;">
                                                <i class="fas fa-stethoscope text-info fa-2x"></i>
                                            </div>
                                            <h6 class="mb-2">3. الفحص</h6>
                                            <p class="small text-muted mb-0">سيقوم الطبيب بفحصك وتقديم العلاج المناسب</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="text-center mt-4">
                            <a href="{{ route('webdoctor.index') }}" class="btn btn-primary">
                                <i class="fas fa-home me-1"></i> العودة إلى الصفحة الرئيسية
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-user-layout> 