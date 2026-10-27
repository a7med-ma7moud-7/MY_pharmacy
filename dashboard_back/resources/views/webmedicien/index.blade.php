<x-user-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-pills me-2"></i>الأدوية المتاحة
                </h2>
                <p class="text-muted mb-0 mt-1">استعرض قائمة الأدوية المتوفرة لدينا</p>
            </div>
        </div>
    </x-slot>

    <div class="container py-4">
        <!-- تصفية وبحث -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-3">
                <form action="{{ route('webmedicien.search') }}" method="GET">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                                <input type="text" name="query" class="form-control border-start-0" placeholder="ابحث عن دواء..." value="{{ request('query') }}">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <select name="type" class="form-select">
                                <option value="all" {{ request('type') == 'all' ? 'selected' : '' }}>كل الأنواع</option>
                                @foreach($types as $type)
                                    <option value="{{ $type }}" {{ request('type') == $type ? 'selected' : '' }}>{{ $type }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-1">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        @if(count($mediciens) > 0)
            <div class="row g-4">
                @foreach($mediciens as $medicien)
                    <div class="col-lg-4 col-md-6">
                        <div class="card h-100 border-0 shadow-sm medicine-card">
                            <div class="position-relative">
                                <img src="{{ asset('storage/'.$medicien->image) }}" class="card-img-top" alt="{{ $medicien->name }}" style="height: 200px; object-fit: cover;">
                                <div class="position-absolute top-0 start-0 m-2">
                                    <span class="badge bg-success">متوفر</span>
                                </div>
                                <div class="position-absolute bottom-0 start-0 end-0 p-3 text-center" style="background: linear-gradient(transparent, rgba(0,0,0,0.7));">
                                    <h5 class="card-title text-white mb-0">{{ $medicien->name }}</h5>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between">
                                        <span class="fw-bold text-primary">{{ $medicien->price }} ج.م</span>
                                        <div class="text-warning">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="far fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                                
                                <p class="card-text text-muted small">{{ \Illuminate\Support\Str::limit($medicien->propose, 100) }}</p>
                                
                                <div class="medicine-meta border-top pt-2 mt-2">
                                    <div class="row text-center">
                                        <div class="col-6 border-end">
                                            <small class="text-muted d-block">الفئة</small>
                                            <span class="fw-semibold">{{ $medicien->type }}</span>
                                        </div>
                                        <div class="col-6">
                                            <small class="text-muted d-block">الكمية</small>
                                            <span class="fw-semibold">متوفر</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer bg-white border-0 pt-0">
                                <div class="d-grid gap-2">
                                    <a href="{{ route('webmedicien.show', $medicien->id) }}" class="btn btn-primary">
                                        <i class="fas fa-info-circle me-1"></i> عرض التفاصيل
                                    </a>
                                    <button class="btn btn-outline-success add-to-cart-btn" 
                                        data-medicine-id="{{ $medicien->id }}" 
                                        data-medicine-name="{{ $medicien->name }}" 
                                        data-medicine-price="{{ $medicien->price }}">
                                        <i class="fas fa-shopping-cart me-1"></i> أضف للسلة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
            
            <!-- ترقيم الصفحات -->
            <div class="d-flex justify-content-center mt-5">
                {{ $mediciens->links() }}
            </div>
        @else
            <div class="text-center py-5">
                <img src="{{ asset('images/no-medicines.svg') }}" alt="لا توجد أدوية" style="max-width: 200px; opacity: 0.7">
                <h4 class="mt-3">لا توجد أدوية حالياً</h4>
                <p class="text-muted">سيتم إضافة أدوية قريباً، تابعنا!</p>
            </div>
        @endif
    </div>

    <style>
        .medicine-card {
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .medicine-card:hover {
            transform: translateY(-10px);
        }
        
        .medicine-card img {
            transition: all 0.5s ease;
        }
        
        .medicine-card:hover img {
            transform: scale(1.1);
        }
        
        .pagination {
            --bs-pagination-active-bg: var(--main-color);
            --bs-pagination-active-border-color: var(--main-color);
        }
    </style>
</x-user-layout> 