<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-tachometer-alt me-2"></i>لوحة التحكم الرئيسية
                </h2>
                <p class="text-muted mb-0 mt-1">مرحباً، {{ Auth::user()->name }}! إليك نظرة عامة على بيانات النظام</p>
            </div>
            <div class="d-flex">
                <div class="dropdown">
                    <button class="btn btn-sm btn-primary dropdown-toggle" type="button" id="addNewDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-plus me-1"></i> إضافة جديد
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="addNewDropdown">
                        <li><a class="dropdown-item" href="{{ route('doctor.create') }}"><i class="fas fa-user-md me-2"></i> طبيب جديد</a></li>
                        <li><a class="dropdown-item" href="{{ route('medicien.create') }}"><i class="fas fa-pills me-2"></i> دواء جديد</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="{{ route('users.index') }}"><i class="fas fa-users me-2"></i> إدارة المستخدمين</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </x-slot>

    <!-- إحصائيات النظام -->
    <div class="container-fluid">
        <!-- بطاقات الإحصائيات الرئيسية -->
        <div class="row g-4 mb-4">
            <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">إجمالي الأطباء</h6>
                                <h3 class="mb-0 fw-bold">
                                    <i class="fas fa-user-md me-2 text-primary"></i>
                                    {{ $totalDoctors }}
                                </h3>
                                <div class="small text-success mt-2">
                                    <i class="fas fa-user-md me-1"></i>
                                    <span>عدد الأطباء المسجلين في النظام</span>
                                </div>
                                <div class="mt-3">
                                    <a href="{{ route('doctor.index') }}" class="btn btn-sm btn-primary">
                                        <i class="fas fa-list me-1"></i> عرض قائمة الأطباء
                                    </a>
                                </div>
                            </div>
                            <div class="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                <i class="fas fa-user-md text-primary fa-3x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">إجمالي الأدوية</h6>
                                <h3 class="mb-0 fw-bold">
                                    <i class="fas fa-pills me-2 text-success"></i>
                                    {{ $totalMedicines }}
                                </h3>
                                <div class="small text-success mt-2">
                                    <i class="fas fa-pills me-1"></i>
                                    <span>عدد الأدوية المتوفرة في النظام</span>
                                </div>
                                <div class="mt-3">
                                    <a href="{{ route('medicien.index') }}" class="btn btn-sm btn-success">
                                        <i class="fas fa-list me-1"></i> عرض قائمة الأدوية
                                    </a>
                                </div>
                            </div>
                            <div class="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                <i class="fas fa-pills text-success fa-3x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">إجمالي المستخدمين</h6>
                                <h3 class="mb-0 fw-bold">
                                    <i class="fas fa-users me-2 text-info"></i>
                                    {{ $totalUsers }}
                                </h3>
                                <div class="small text-success mt-2">
                                    <i class="fas fa-users me-1"></i>
                                    <span>عدد المستخدمين المسجلين في النظام</span>
                                </div>
                                <div class="mt-3">
                                    <a href="{{ route('users.index') }}" class="btn btn-sm btn-info text-white">
                                        <i class="fas fa-list me-1"></i> عرض قائمة المستخدمين
                                    </a>
                                </div>
                            </div>
                            <div class="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                <i class="fas fa-users text-info fa-3x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- تفاصيل الأطباء والأدوية -->
        <div class="row g-4 mb-4">
            <!-- قائمة أحدث الأطباء -->
            <div class="col-md-6">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                        <h5 class="mb-0">
                            <i class="fas fa-user-md me-2 text-primary"></i>
                            أحدث الأطباء المضافين
                        </h5>
                        <a href="{{ route('doctor.index') }}" class="btn btn-sm btn-link text-decoration-none">عرض الكل</a>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush">
                            @forelse($doctors as $doctor)
                            <div class="list-group-item py-3 d-flex align-items-center">
                                <div class="flex-shrink-0 me-3">
                                    <div class="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        @if($doctor->image)
                                            <img src="{{ asset('storage/' . $doctor->image) }}" alt="{{ $doctor->name }}" class="rounded-circle" width="50" height="50">
                                        @else
                                            <i class="fas fa-user-md text-primary"></i>
                                        @endif
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">د. {{ $doctor->name }}</h6>
                                    <p class="text-muted small mb-0">{{ $doctor->specialization }}</p>
                                </div>
                                <div class="d-flex">
                                    <a href="{{ route('doctor.show', $doctor->id) }}" class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-eye"></i></a>
                                    <a href="{{ route('doctor.edit', $doctor->id) }}" class="btn btn-sm btn-outline-secondary"><i class="fas fa-edit"></i></a>
                                </div>
                            </div>
                            @empty
                            <div class="text-center py-5">
                                <div class="mb-3">
                                    <i class="fas fa-user-md fa-3x text-muted"></i>
                                </div>
                                <p class="text-muted">لم يتم إضافة أطباء بعد</p>
                                <a href="{{ route('doctor.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i> إضافة طبيب جديد
                                </a>
                            </div>
                            @endforelse
                        </div>
                    </div>
                    @if(count($doctors) > 0)
                    <div class="card-footer bg-white text-center">
                        <a href="{{ route('doctor.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i> إضافة طبيب جديد
                        </a>
                    </div>
                    @endif
                </div>
            </div>

            <!-- قائمة أحدث الأدوية -->
            <div class="col-md-6">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                        <h5 class="mb-0">
                            <i class="fas fa-pills me-2 text-success"></i>
                            أحدث الأدوية المضافة
                        </h5>
                        <a href="{{ route('medicien.index') }}" class="btn btn-sm btn-link text-decoration-none">عرض الكل</a>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush">
                            @forelse($medicines as $medicine)
                            <div class="list-group-item py-3 d-flex align-items-center">
                                <div class="flex-shrink-0 me-3">
                                    <div class="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        @if($medicine->image)
                                            <img src="{{ asset('storage/' . $medicine->image) }}" alt="{{ $medicine->name }}" class="rounded-circle" width="50" height="50">
                                        @else
                                            <i class="fas fa-pills text-success"></i>
                                        @endif
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">{{ $medicine->name }}</h6>
                                    <p class="text-muted small mb-0">{{ $medicine->purpose }} - {{ $medicine->price }} ج.م</p>
                                </div>
                                <div class="d-flex">
                                    <a href="{{ route('medicien.show', $medicine->id) }}" class="btn btn-sm btn-outline-success me-1"><i class="fas fa-eye"></i></a>
                                    <a href="{{ route('medicien.edit', $medicine->id) }}" class="btn btn-sm btn-outline-secondary"><i class="fas fa-edit"></i></a>
                                </div>
                            </div>
                            @empty
                            <div class="text-center py-5">
                                <div class="mb-3">
                                    <i class="fas fa-pills fa-3x text-muted"></i>
                                </div>
                                <p class="text-muted">لم يتم إضافة أدوية بعد</p>
                                <a href="{{ route('medicien.create') }}" class="btn btn-success">
                                    <i class="fas fa-plus me-1"></i> إضافة دواء جديد
                                </a>
                            </div>
                            @endforelse
                        </div>
                    </div>
                    @if(count($medicines) > 0)
                    <div class="card-footer bg-white text-center">
                        <a href="{{ route('medicien.create') }}" class="btn btn-success">
                            <i class="fas fa-plus me-1"></i> إضافة دواء جديد
                        </a>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-admin-layout> 