<x-user-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-stethoscope me-2"></i>الاستشاريين المتاحين
                </h2>
                <p class="text-muted mb-0 mt-1">تواصل مع الاستشاريين لديننا للحصول على استشارة طبية مجانية</p>
            </div>
        </div>
    </x-slot>

    <div class="container py-4">
        <!-- Alert للخدمة المجانية -->
        <div class="alert alert-success mb-4" role="alert">
            <div class="d-flex align-items-center">
                <i class="fas fa-gift fa-2x me-3"></i>
                <div>
                    <h5 class="alert-heading mb-1">خدمة استشارية مجانية!</h5>
                    <p class="mb-0">نقدم لعملائنا الكرام خدمة الاستشارات الطبية المجانية مع نخبة من أفضل الاستشاريين. تواصل معهم الآن للحصول على استشارتك المجانية.</p>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <!-- الاستشاري الأول -->
            <div class="col-lg-4 col-md-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 text-center">
                        <div class="mb-3">
                            <img src="https://randomuser.me/api/portraits/men/75.jpg" class="rounded-circle" style="width: 120px; height: 120px; object-fit: cover; border: 4px solid #e6f7ff;">
                        </div>
                        <h4 class="mb-1">د. محمد كمال</h4>
                        <p class="text-primary mb-2">استشاري الباطنة العامة</p>
                        <div class="d-flex justify-content-center text-warning my-2">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                            <span class="ms-1 text-dark">(4.8)</span>
                        </div>
                        <p class="text-muted small mb-3">خبرة أكثر من 15 عامًا في مجال أمراض الباطنة والجهاز الهضمي</p>
                        
                        <div class="d-flex justify-content-center mt-3 border-top pt-3">
                            <a href="tel:+201012345678" class="btn btn-sm btn-outline-primary me-2">
                                <i class="fas fa-phone-alt me-1"></i> 01012345678
                            </a>
                            <a href="#" class="btn btn-sm btn-primary">
                                <i class="fas fa-comment-medical me-1"></i> استشارة
                            </a>
                        </div>
                    </div>
                    <div class="card-footer bg-primary text-white text-center py-2">
                        <small><i class="fas fa-info-circle me-1"></i> متاح يوميًا من 10 ص - 6 م</small>
                    </div>
                </div>
            </div>

            <!-- الاستشاري الثاني -->
            <div class="col-lg-4 col-md-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 text-center">
                        <div class="mb-3">
                            <img src="https://randomuser.me/api/portraits/women/65.jpg" class="rounded-circle" style="width: 120px; height: 120px; object-fit: cover; border: 4px solid #e6f7ff;">
                        </div>
                        <h4 class="mb-1">د. سارة أحمد</h4>
                        <p class="text-primary mb-2">استشارية أمراض النساء والتوليد</p>
                        <div class="d-flex justify-content-center text-warning my-2">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span class="ms-1 text-dark">(5.0)</span>
                        </div>
                        <p class="text-muted small mb-3">متخصصة في أمراض النساء والولادة وصحة المرأة بخبرة 12 عامًا</p>
                        
                        <div class="d-flex justify-content-center mt-3 border-top pt-3">
                            <a href="tel:+201123456789" class="btn btn-sm btn-outline-primary me-2">
                                <i class="fas fa-phone-alt me-1"></i> 01123456789
                            </a>
                            <a href="#" class="btn btn-sm btn-primary">
                                <i class="fas fa-comment-medical me-1"></i> استشارة
                            </a>
                        </div>
                    </div>
                    <div class="card-footer bg-primary text-white text-center py-2">
                        <small><i class="fas fa-info-circle me-1"></i> متاحة يوميًا من 12 م - 8 م</small>
                    </div>
                </div>
            </div>

            <!-- الاستشاري الثالث -->
            <div class="col-lg-4 col-md-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 text-center">
                        <div class="mb-3">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" class="rounded-circle" style="width: 120px; height: 120px; object-fit: cover; border: 4px solid #e6f7ff;">
                        </div>
                        <h4 class="mb-1">د. عمرو خالد</h4>
                        <p class="text-primary mb-2">استشاري طب الأطفال</p>
                        <div class="d-flex justify-content-center text-warning my-2">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="far fa-star"></i>
                            <span class="ms-1 text-dark">(4.2)</span>
                        </div>
                        <p class="text-muted small mb-3">متخصص في طب الأطفال وحديثي الولادة بخبرة تزيد عن 10 سنوات</p>
                        
                        <div class="d-flex justify-content-center mt-3 border-top pt-3">
                            <a href="tel:+201234567890" class="btn btn-sm btn-outline-primary me-2">
                                <i class="fas fa-phone-alt me-1"></i> 01234567890
                            </a>
                            <a href="#" class="btn btn-sm btn-primary">
                                <i class="fas fa-comment-medical me-1"></i> استشارة
                            </a>
                        </div>
                    </div>
                    <div class="card-footer bg-primary text-white text-center py-2">
                        <small><i class="fas fa-info-circle me-1"></i> متاح يوميًا من 9 ص - 5 م</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- معلومات إضافية -->
        <div class="mt-5">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <h4 class="mb-3 border-bottom pb-2">كيفية الحصول على الاستشارة المجانية</h4>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <div class="d-flex">
                                <div class="me-3">
                                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-phone-alt"></i>
                                    </div>
                                </div>
                                <div>
                                    <h5>اتصل بالاستشاري</h5>
                                    <p class="text-muted small">اتصل برقم الاستشاري المناسب لحالتك مباشرة</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="d-flex">
                                <div class="me-3">
                                    <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-comment-dots"></i>
                                    </div>
                                </div>
                                <div>
                                    <h5>اشرح حالتك</h5>
                                    <p class="text-muted small">قدم وصفًا دقيقًا لحالتك للحصول على استشارة طبية دقيقة</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="d-flex">
                                <div class="me-3">
                                    <div class="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-clipboard-check"></i>
                                    </div>
                                </div>
                                <div>
                                    <h5>احصل على الاستشارة</h5>
                                    <p class="text-muted small">احصل على استشارتك المجانية واتبع النصائح الطبية</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ملاحظة مهمة -->
        <div class="alert alert-warning mt-4" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>ملاحظة هامة:</strong> الاستشارات الطبية عبر الهاتف لا تغني عن زيارة الطبيب في الحالات الطارئة.
        </div>
    </div>
</x-user-layout>
