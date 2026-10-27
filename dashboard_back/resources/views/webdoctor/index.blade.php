<x-user-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-user-md me-2"></i>قائمة الأطباء
                </h2>
                <p class="text-muted mb-0 mt-1">استعرض قائمة الأطباء المتاحين في نظامنا</p>
            </div>
        </div>
    </x-slot>

    <div class="container py-4">
        <!-- تصفية وبحث -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-3">
                <form action="{{ route('webdoctor.search') }}" method="GET" id="search-form">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-3">
                            <label for="search-input" class="form-label mb-1">بحث بالاسم أو التخصص</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                                <input type="text" name="search" class="form-control border-start-0" placeholder="ابحث..." value="{{ request('search') }}" id="search-input" autocomplete="off">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label for="specialty-select" class="form-label mb-1">التخصص</label>
                            <select name="specialty" class="form-select" id="specialty-select">
                                <option value="كل التخصصات" {{ request('specialty') == 'كل التخصصات' || !request('specialty') ? 'selected' : '' }}>كل التخصصات</option>
                                @foreach($specialties as $specialty)
                                    <option value="{{ $specialty }}" {{ request('specialty') == $specialty ? 'selected' : '' }}>{{ $specialty }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="location-select" class="form-label mb-1">المحافظة</label>
                            <select name="location" class="form-select" id="location-select">
                                <option value="">كل المحافظات</option>
                                @foreach($locations as $location)
                                    <option value="{{ $location }}" {{ request('location') == $location ? 'selected' : '' }}>{{ $location }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="city-select" class="form-label mb-1">المدينة</label>
                            <select name="tow_location" class="form-select" id="city-select">
                                <option value="">كل المدن</option>
                                @foreach($cities as $city)
                                    <option value="{{ $city }}" {{ request('tow_location') == $city ? 'selected' : '' }}>{{ $city }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2 d-grid">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> بحث
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        @if(count($doctors) > 0)
            <div class="row g-4">
                @foreach($doctors as $doctor)
                    <div class="col-lg-4 col-md-6">
                        <div class="card h-100 border-0 shadow-sm doctor-card">
                            <div class="position-relative">
                                <img src="{{ asset('storage/'.$doctor->image) }}" class="card-img-top" alt="{{ $doctor->name }}" style="height: 200px; object-fit: cover;">
                                <div class="position-absolute top-0 end-0 m-2">
                                    <span class="badge bg-primary">{{ $doctor->specialty }}</span>
                                </div>
                            </div>
                            <div class="card-body text-center">
                                <div class="doctor-image mt-n5 mb-3">
                                    <img src="{{ asset('storage/'.$doctor->image) }}" class="rounded-circle border-4 border-white shadow" style="width: 100px; height: 100px; object-fit: cover;" alt="{{ $doctor->name }}">
                                </div>
                                <h4 class="card-title">د. {{ $doctor->name }}</h4>
                                <p class="card-text text-primary mb-2">{{ $doctor->specialty }}</p>
                                
                                <div class="d-flex justify-content-center text-warning mb-3">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star-half-alt"></i>
                                    <span class="ms-1 text-dark">(4.5)</span>
                                </div>
                                
                                <div class="doctor-info mb-3">
                                    <div class="d-flex justify-content-between small py-1 border-bottom">
                                        <span class="text-muted">سعر الكشف:</span>
                                        <span class="fw-bold">{{ $doctor->price }} ج.م</span>
                                    </div>
                                    <div class="d-flex justify-content-between small py-1">
                                        <span class="text-muted">رقم الهاتف:</span>
                                        <span class="fw-bold">{{ $doctor->number }}</span>
                                    </div>
                                    <div class="d-flex justify-content-between small py-1">
                                        <span class="text-muted">المحافظه:</span>
                                        <span class="fw-bold">{{ $doctor->location }}</span>
                                    </div>
                                    <div class="d-flex justify-content-between small py-1">
                                        <span class="text-muted">المدينه:</span>
                                        <span class="fw-bold">{{ $doctor->tow_location }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer bg-white border-0 pt-0">
                                <div class="d-grid gap-2">
                                    <a href="{{ route('webdoctor.show', $doctor->id) }}" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-eye me-1"></i> عرض التفاصيل
                                    </a>
                                    <a href="#" class="btn btn-sm btn-primary book-appointment-btn" data-doctor-id="{{ $doctor->id }}" data-doctor-name="د. {{ $doctor->name }}">
                                        <i class="fas fa-calendar-plus me-1"></i> حجز موعد
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
            
            <!-- ترقيم الصفحات مع الحفاظ على معلمات البحث -->
            <div class="d-flex justify-content-center mt-5">
                {{ $doctors->appends(request()->query())->links() }}
            </div>
        @else
            <div class="text-center py-5">
                <img src="{{ asset('images/no-doctors.svg') }}" alt="لا يوجد أطباء" style="max-width: 200px; opacity: 0.7">
                <h4 class="mt-3">لا يوجد أطباء مطابقين لبحثك</h4>
                <p class="text-muted">جرب تغيير معايير البحث أو التصفية</p>
                <a href="{{ route('webdoctor.index') }}" class="btn btn-outline-primary mt-2">
                    <i class="fas fa-sync-alt me-1"></i> عرض جميع الأطباء
                </a>
            </div>
        @endif
    </div>

    <style>
        .doctor-card {
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .doctor-card:hover {
            transform: translateY(-10px);
        }
        
        .doctor-image img {
            transition: all 0.3s ease;
            z-index: 10;
            position: relative;
        }
        
        .doctor-card:hover .doctor-image img {
            transform: scale(1.1);
        }
        
        .pagination {
            --bs-pagination-active-bg: var(--main-color);
            --bs-pagination-active-border-color: var(--main-color);
        }
    </style>
</x-user-layout>

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // البحث عند تغيير التخصص
        const specialtySelect = document.getElementById('specialty-select');
        if (specialtySelect) {
            specialtySelect.addEventListener('change', function() {
                document.getElementById('search-form').submit();
            });
        }
        
        // مسح البحث
        const clearSearchBtn = document.getElementById('clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', function() {
                document.getElementById('search-input').value = '';
                document.getElementById('search-form').submit();
            });
        }
        
        // تنفيذ البحث عند الضغط على Enter
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('search-form').submit();
                }
            });
        }
    });
</script>
@endsection
