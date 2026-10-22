<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-pills me-2"></i>{{ $medicien->name }}
                </h2>
                <p class="text-muted mb-0 mt-1">عرض تفاصيل الدواء</p>
            </div>
            <div>
                <a href="{{ route('medicien.index') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-right me-1"></i> العودة للقائمة
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container py-4">
        <div class="row">
            <!-- صورة ومعلومات الدواء -->
            <div class="col-lg-5 mb-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                        <img src="{{ asset('storage/' . $medicien->image) }}" alt="{{ $medicien->name }}" class="img-fluid w-100" style="max-height: 400px; object-fit: cover;">
                    </div>
                </div>
            </div>
            
            <div class="col-lg-7">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white">
                        <h4 class="mb-0">معلومات الدواء</h4>
                    </div>
                    <div class="card-body">
                        <div class="medicine-info">
                            <div class="d-flex justify-content-between py-3 border-bottom">
                                <span class="fw-bold">اسم الدواء:</span>
                                <span>{{ $medicien->name }}</span>
                            </div>
                            <div class="d-flex justify-content-between py-3 border-bottom">
                                <span class="fw-bold">الغرض من الدواء:</span>
                                <span>{{ $medicien->propose }}</span>
                            </div>
                            <div class="d-flex justify-content-between py-3 border-bottom">
                                <span class="fw-bold">النوع:</span>
                                <span>{{ $medicien->type }}</span>
                            </div>
                            <div class="d-flex justify-content-between py-3 border-bottom">
                                <span class="fw-bold">العدد:</span>
                                <span>{{ $medicien->count }}</span>
                            </div>
                            <div class="d-flex justify-content-between py-3 border-bottom">
                                <span class="fw-bold">السعر:</span>
                                <span class="text-primary fw-bold">{{ $medicien->price }} ج.م</span>
                            </div>
                            <div class="d-flex justify-content-between py-3">
                                <span class="fw-bold">تاريخ الإضافة:</span>
                                <span>{{ $medicien->created_at->format('Y-m-d') }}</span>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <h5 class="mb-3">الإجراءات المتاحة</h5>
                            <div class="d-flex gap-2">
                                <a href="{{ route('medicien.edit', $medicien->id) }}" class="btn btn-primary">
                                    <i class="fas fa-edit me-1"></i> تعديل
                                </a>
                                <form action="{{ route('medicien.destroy', $medicien->id) }}" method="POST" class="d-inline" onsubmit="return confirm('هل أنت متأكد من حذف هذا الدواء؟');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger">
                                        <i class="fas fa-trash-alt me-1"></i> حذف
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- معلومات إضافية عن الدواء -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white">
                        <h4 class="mb-0">معلومات إضافية</h4>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <div class="border rounded p-3 h-100">
                                    <h5 class="text-primary mb-3"><i class="fas fa-info-circle me-2"></i> طريقة الاستخدام</h5>
                                    <p class="text-muted mb-0">يرجى اتباع تعليمات الطبيب أو الصيدلي عند استخدام هذا الدواء. يجب قراءة النشرة المرفقة بعناية قبل الاستخدام.</p>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="border rounded p-3 h-100">
                                    <h5 class="text-warning mb-3"><i class="fas fa-exclamation-triangle me-2"></i> الآثار الجانبية</h5>
                                    <p class="text-muted mb-0">قد يسبب بعض الآثار الجانبية مثل الدوخة أو الصداع. يرجى استشارة الطبيب إذا استمرت هذه الأعراض.</p>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="border rounded p-3 h-100">
                                    <h5 class="text-success mb-3"><i class="fas fa-check-circle me-2"></i> التخزين</h5>
                                    <p class="text-muted mb-0">يحفظ في مكان جاف بعيداً عن الحرارة والرطوبة، وبعيداً عن متناول الأطفال. لا تستخدم الدواء بعد تاريخ انتهاء الصلاحية.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout> 