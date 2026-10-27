<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-calendar-alt me-2"></i>تفاصيل الحجز
                </h2>
                <p class="text-muted mb-0 mt-1">عرض كافة بيانات الحجز والسماح بتعديل حالته</p>
            </div>
            <div>
                <a href="{{ route('admin.appointments.index') }}" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-arrow-right me-1"></i> عودة إلى قائمة الحجوزات
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container-fluid">
        <!-- رسائل النجاح والفشل -->
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-1"></i>
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        <div class="row">
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-info-circle text-primary me-2"></i>معلومات الحجز</h5>
                        <div>
                            @if($appointment->status == 'pending')
                                <span class="badge bg-warning px-3 py-2">قيد الانتظار</span>
                            @elseif($appointment->status == 'confirmed')
                                <span class="badge bg-success px-3 py-2">مؤكد</span>
                            @elseif($appointment->status == 'cancelled')
                                <span class="badge bg-danger px-3 py-2">ملغي</span>
                            @elseif($appointment->status == 'completed')
                                <span class="badge bg-info px-3 py-2">مكتمل</span>
                            @endif
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6 class="text-primary mb-3">معلومات المريض</h6>
                                <p class="mb-2"><strong>الاسم:</strong> {{ $appointment->patient_name }}</p>
                                <p class="mb-2"><strong>رقم الهاتف:</strong> {{ $appointment->phone }}</p>
                                @if($appointment->email)
                                    <p class="mb-2"><strong>البريد الإلكتروني:</strong> {{ $appointment->email }}</p>
                                @endif
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary mb-3">معلومات الموعد</h6>
                                <p class="mb-2"><strong>الطبيب:</strong> د. {{ $appointment->doctor->name }}</p>
                                <p class="mb-2"><strong>التخصص:</strong> {{ $appointment->doctor->specialty }}</p>
                                <p class="mb-2"><strong>التاريخ:</strong> {{ $appointment->appointment_date->format('Y-m-d') }}</p>
                                <p class="mb-2"><strong>الوقت:</strong> {{ $appointment->appointment_time }}</p>
                            </div>
                        </div>

                        @if($appointment->notes)
                            <div class="mb-4">
                                <h6 class="text-primary mb-3">ملاحظات المريض</h6>
                                <p class="bg-light p-3 rounded">{{ $appointment->notes }}</p>
                            </div>
                        @endif

                        <div class="mb-4">
                            <h6 class="text-primary mb-3">معلومات إضافية</h6>
                            <p class="mb-2"><strong>تاريخ إنشاء الحجز:</strong> {{ $appointment->created_at->format('Y-m-d H:i') }}</p>
                            <p class="mb-2"><strong>آخر تحديث:</strong> {{ $appointment->updated_at->format('Y-m-d H:i') }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white py-3">
                        <h5 class="mb-0"><i class="fas fa-edit text-primary me-2"></i>تغيير حالة الحجز</h5>
                    </div>
                    <div class="card-body p-4">
                        <form action="{{ route('admin.appointments.update-status', $appointment->id) }}" method="POST">
                            @csrf
                            @method('PATCH')

                            <div class="mb-4">
                                <label class="form-label fw-bold">الحالة الحالية:</label>
                                <div>
                                    @if($appointment->status == 'pending')
                                        <div class="badge bg-warning px-3 py-2 d-inline-block mb-3">قيد الانتظار</div>
                                    @elseif($appointment->status == 'confirmed')
                                        <div class="badge bg-success px-3 py-2 d-inline-block mb-3">مؤكد</div>
                                    @elseif($appointment->status == 'cancelled')
                                        <div class="badge bg-danger px-3 py-2 d-inline-block mb-3">ملغي</div>
                                    @elseif($appointment->status == 'completed')
                                        <div class="badge bg-info px-3 py-2 d-inline-block mb-3">مكتمل</div>
                                    @endif
                                </div>

                                <label for="status" class="form-label fw-bold">تغيير الحالة إلى:</label>
                                <select class="form-select" id="status" name="status" required>
                                    <option value="pending" {{ $appointment->status == 'pending' ? 'selected' : '' }}>قيد الانتظار</option>
                                    <option value="confirmed" {{ $appointment->status == 'confirmed' ? 'selected' : '' }}>تأكيد</option>
                                    <option value="cancelled" {{ $appointment->status == 'cancelled' ? 'selected' : '' }}>إلغاء</option>
                                    <option value="completed" {{ $appointment->status == 'completed' ? 'selected' : '' }}>اكتمال</option>
                                </select>
                            </div>

                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-save me-1"></i> حفظ التغييرات
                            </button>
                        </form>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white py-3">
                        <h5 class="mb-0"><i class="fas fa-tools text-primary me-2"></i>إجراءات سريعة</h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="d-grid gap-2">
                            <a href="tel:{{ $appointment->phone }}" class="btn btn-outline-primary">
                                <i class="fas fa-phone me-1"></i> اتصال بالمريض
                            </a>
                            @if($appointment->email)
                                <a href="mailto:{{ $appointment->email }}" class="btn btn-outline-secondary">
                                    <i class="fas fa-envelope me-1"></i> مراسلة المريض
                                </a>
                            @endif
                            <a href="{{ route('admin.appointments.index') }}" class="btn btn-outline-dark">
                                <i class="fas fa-arrow-right me-1"></i> عودة إلى القائمة
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout> 