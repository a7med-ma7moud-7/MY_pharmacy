<x-user-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-pills me-2"></i>{{ $medicien->name }}
                </h2>
                <p class="text-muted mb-0 mt-1">تفاصيل الدواء وطريقة الاستخدام</p>
            </div>
            <div>
                <a href="{{ route('webmedicien.index') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-right me-1"></i> العودة للقائمة
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container py-4">
        <div class="row">
            <!-- صورة الدواء والمعلومات -->
            <div class="col-lg-8 mb-4">
                <div class="row">
                    <!-- صورة الدواء -->
                    <div class="col-md-5 mb-4">
                        <div class="card border-0 shadow-sm overflow-hidden">
                            <div class="position-relative">
                                <img src="{{ asset('storage/'.$medicien->image) }}" class="img-fluid w-100" alt="{{ $medicien->name }}" style="object-fit: cover; max-height: 350px;">
                                <span class="position-absolute top-0 start-0 p-2 bg-success text-white">متوفر</span>
                            </div>
                            <div class="card-body text-center">
                                <div class="d-flex justify-content-center my-3">
                                    <div class="text-warning">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="far fa-star"></i>
                                        <span class="ms-1 text-dark">(4.0)</span>
                                    </div>
                                </div>
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary add-to-cart-btn" 
                                        data-medicine-id="{{ $medicien->id }}" 
                                        data-medicine-name="{{ $medicien->name }}" 
                                        data-medicine-price="{{ $medicien->price }}">
                                        <i class="fas fa-shopping-cart me-1"></i> أضف إلى السلة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- معلومات الدواء -->
                    <div class="col-md-7 mb-4">
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
                                        <span class="fw-bold">السعر:</span>
                                        <span class="text-primary fw-bold">{{ $medicien->price }} ج.م</span>
                                    </div>
                                    <div class="d-flex justify-content-between py-3 border-bottom">
                                        <span class="fw-bold">الحالة:</span>
                                        <span class="badge bg-success">متوفر بالمخزون</span>
                                    </div>
                                    <div class="d-flex justify-content-between py-3 border-bottom">
                                        <span class="fw-bold">الشركة المصنعة:</span>
                                        <span>فارما للأدوية</span>
                                    </div>
                                    <div class="d-flex justify-content-between py-3">
                                        <span class="fw-bold">التصنيف:</span>
                                        <span>أدوية عامة</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- تفاصيل ووصف الدواء -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <ul class="nav nav-tabs card-header-tabs" id="medicineTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab" aria-controls="description" aria-selected="true">الوصف</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="usage-tab" data-bs-toggle="tab" data-bs-target="#usage" type="button" role="tab" aria-controls="usage" aria-selected="false">الاستخدامات</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="side-effects-tab" data-bs-toggle="tab" data-bs-target="#side-effects" type="button" role="tab" aria-controls="side-effects" aria-selected="false">الآثار الجانبية</button>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body">
                        <div class="tab-content" id="medicineTabContent">
                            <div class="tab-pane fade show active" id="description" role="tabpanel" aria-labelledby="description-tab">
                                <h5 class="mb-3">وصف الدواء</h5>
                                <p>{{ $medicien->propose }}</p>
                                <p>هذا الدواء يستخدم لعلاج الحالات المرضية المختلفة، ويجب استشارة الطبيب قبل استخدامه. تأكد من قراءة النشرة الداخلية بعناية.</p>
                            </div>
                            <div class="tab-pane fade" id="usage" role="tabpanel" aria-labelledby="usage-tab">
                                <h5 class="mb-3">الاستخدامات</h5>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item py-3"><i class="fas fa-check-circle text-success me-2"></i> يستخدم في علاج الحالات الخفيفة إلى المتوسطة من الألم.</li>
                                    <li class="list-group-item py-3"><i class="fas fa-check-circle text-success me-2"></i> يساعد في خفض درجة الحرارة أثناء الحمى.</li>
                                    <li class="list-group-item py-3"><i class="fas fa-check-circle text-success me-2"></i> يمكن استخدامه في حالات الالتهاب البسيطة.</li>
                                </ul>
                            </div>
                            <div class="tab-pane fade" id="side-effects" role="tabpanel" aria-labelledby="side-effects-tab">
                                <h5 class="mb-3">الآثار الجانبية</h5>
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    يجب استشارة الطبيب أو الصيدلي إذا استمرت أي من الأعراض التالية أو ساءت.
                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item py-3"><i class="fas fa-exclamation-circle text-warning me-2"></i> قد يسبب اضطرابات معوية خفيفة.</li>
                                    <li class="list-group-item py-3"><i class="fas fa-exclamation-circle text-warning me-2"></i> في حالات نادرة، قد يحدث دوار أو صداع.</li>
                                    <li class="list-group-item py-3"><i class="fas fa-exclamation-circle text-warning me-2"></i> قد يتسبب في حساسية لدى بعض الأشخاص.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- القسم الجانبي -->
            <div class="col-lg-4">
                <!-- طريقة الاستخدام -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0"><i class="fas fa-info-circle me-2 text-primary"></i> طريقة الاستخدام</h5>
                    </div>
                    <div class="card-body">
                        <div class="usage-steps">
                            <div class="d-flex mb-3">
                                <div class="me-3">
                                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">1</div>
                                </div>
                                <div>
                                    <h6 class="mb-1">الجرعة</h6>
                                    <p class="text-muted small mb-0">يؤخذ حسب إرشادات الطبيب، عادة قرص واحد ثلاث مرات يومياً.</p>
                                </div>
                            </div>
                            <div class="d-flex mb-3">
                                <div class="me-3">
                                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">2</div>
                                </div>
                                <div>
                                    <h6 class="mb-1">طريقة الأخذ</h6>
                                    <p class="text-muted small mb-0">يفضل تناوله بعد الأكل مع كوب من الماء.</p>
                                </div>
                            </div>
                            <div class="d-flex">
                                <div class="me-3">
                                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">3</div>
                                </div>
                                <div>
                                    <h6 class="mb-1">مدة العلاج</h6>
                                    <p class="text-muted small mb-0">يستمر العلاج حسب توصية الطبيب وحتى اكتمال فترة العلاج.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- تنبيهات هامة -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0"><i class="fas fa-exclamation-triangle me-2 text-warning"></i> تنبيهات هامة</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-unstyled warnings-list">
                            <li class="d-flex align-items-start mb-3">
                                <i class="fas fa-circle text-warning me-2 mt-1" style="font-size: 10px;"></i>
                                <span class="text-muted small">يحفظ بعيداً عن متناول الأطفال.</span>
                            </li>
                            <li class="d-flex align-items-start mb-3">
                                <i class="fas fa-circle text-warning me-2 mt-1" style="font-size: 10px;"></i>
                                <span class="text-muted small">يحفظ في درجة حرارة الغرفة بعيداً عن الرطوبة والحرارة المباشرة.</span>
                            </li>
                            <li class="d-flex align-items-start mb-3">
                                <i class="fas fa-circle text-warning me-2 mt-1" style="font-size: 10px;"></i>
                                <span class="text-muted small">لا تتجاوز الجرعة الموصى بها.</span>
                            </li>
                            <li class="d-flex align-items-start mb-3">
                                <i class="fas fa-circle text-warning me-2 mt-1" style="font-size: 10px;"></i>
                                <span class="text-muted small">اتصل بالطبيب فوراً في حالة ظهور أعراض تحسس شديدة.</span>
                            </li>
                            <li class="d-flex align-items-start">
                                <i class="fas fa-circle text-warning me-2 mt-1" style="font-size: 10px;"></i>
                                <span class="text-muted small">لا تستخدم الدواء بعد تاريخ انتهاء الصلاحية.</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- أدوية مشابهة -->
                
            </div>
        </div>
    </div>
</x-user-layout> 