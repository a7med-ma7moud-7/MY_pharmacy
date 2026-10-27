<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <h2 class="h4 font-weight-bold">
                تفاصيل الطلب #{{ $order->id }}
            </h2>
            <div>
                <a href="{{ route('admin.orders.index') }}" class="btn btn-sm btn-secondary me-2">
                    <i class="fas fa-arrow-right me-1"></i> العودة للطلبات
                </a>
                <a href="#" class="btn btn-sm btn-primary" onclick="window.print()">
                    <i class="fas fa-print me-1"></i> طباعة الطلب
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container-fluid py-4">
        @if (session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif
        
        <div class="row">
            <!-- بيانات العميل -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm h-100">
                    <div class="card-header bg-white py-3">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-user-circle me-2 text-primary"></i>
                            بيانات العميل
                        </h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">الاسم</span>
                                <span class="fw-bold">{{ $order->customer_name }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">رقم الهاتف</span>
                                <span class="fw-bold">{{ $order->customer_phone }}</span>
                            </li>
                            @if($order->customer_email)
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">البريد الإلكتروني</span>
                                <span class="fw-bold">{{ $order->customer_email }}</span>
                            </li>
                            @endif
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">العنوان</span>
                                <span class="fw-bold">{{ $order->address }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">طريقة التوصيل</span>
                                <span>
                                    @if ($order->delivery_method == 'delivery')
                                        <span class="badge bg-info">توصيل للمنزل</span>
                                    @else
                                        <span class="badge bg-secondary">استلام من الصيدلية</span>
                                    @endif
                                </span>
                            </li>
                        </ul>
                        
                        @if($order->notes)
                        <div class="mt-3">
                            <h6 class="text-muted">ملاحظات:</h6>
                            <p class="mb-0">{{ $order->notes }}</p>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
            
            <!-- معلومات الطلب -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm h-100">
                    <div class="card-header bg-white py-3">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-info-circle me-2 text-primary"></i>
                            معلومات الطلب
                        </h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">رقم الطلب</span>
                                <span class="fw-bold">#{{ $order->id }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">تاريخ الطلب</span>
                                <span class="fw-bold">{{ $order->created_at->format('Y-m-d') }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">وقت الطلب</span>
                                <span class="fw-bold">{{ $order->created_at->format('H:i:s') }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">عدد الأدوية</span>
                                <span class="fw-bold">{{ $order->items->count() }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span class="text-muted">إجمالي الطلب</span>
                                <span class="fw-bold text-success">{{ $order->total_price }} ج.م</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- حالة الطلب -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm h-100">
                    <div class="card-header bg-white py-3">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-tasks me-2 text-primary"></i>
                            حالة الطلب
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-4">
                            @if ($order->status == 'pending')
                                <div class="bg-warning bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                                    <i class="fas fa-hourglass-half text-warning fa-3x"></i>
                                </div>
                                <h5>قيد الانتظار</h5>
                                <p class="text-muted small">الطلب في انتظار المراجعة</p>
                            @elseif ($order->status == 'processing')
                                <div class="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                                    <i class="fas fa-cogs text-primary fa-3x"></i>
                                </div>
                                <h5>قيد التجهيز</h5>
                                <p class="text-muted small">يتم تجهيز الطلب حالياً</p>
                            @elseif ($order->status == 'completed')
                                <div class="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                                    <i class="fas fa-check-circle text-success fa-3x"></i>
                                </div>
                                <h5>مكتمل</h5>
                                <p class="text-muted small">تم تسليم الطلب بنجاح</p>
                            @elseif ($order->status == 'canceled')
                                <div class="bg-danger bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                                    <i class="fas fa-times-circle text-danger fa-3x"></i>
                                </div>
                                <h5>ملغي</h5>
                                <p class="text-muted small">تم إلغاء الطلب</p>
                            @endif
                        </div>
                        
                        <form action="{{ route('admin.orders.update-status', $order->id) }}" method="POST">
                            @csrf
                            @method('PUT')
                            <div class="mb-3">
                                <label for="status" class="form-label">تغيير الحالة</label>
                                <select name="status" id="status" class="form-select">
                                    <option value="pending" {{ $order->status == 'pending' ? 'selected' : '' }}>قيد الانتظار</option>
                                    <option value="processing" {{ $order->status == 'processing' ? 'selected' : '' }}>قيد التجهيز</option>
                                    <option value="completed" {{ $order->status == 'completed' ? 'selected' : '' }}>مكتمل</option>
                                    <option value="canceled" {{ $order->status == 'canceled' ? 'selected' : '' }}>ملغي</option>
                                </select>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> تحديث الحالة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- الأدوية المطلوبة -->
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-white py-3">
                <h5 class="card-title mb-0">
                    <i class="fas fa-pills me-2 text-primary"></i>
                    الأدوية المطلوبة
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th>#</th>
                                <th>الصورة</th>
                                <th>اسم الدواء</th>
                                <th>السعر</th>
                                <th>الكمية</th>
                                <th>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($order->items as $index => $item)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>
                                        @if (isset($item->medicine->image))
                                            <img src="{{ asset('storage/' . $item->medicine->image) }}" alt="{{ $item->medicine->name }}" width="50" class="rounded">
                                        @else
                                            <div class="bg-light text-center rounded p-2" style="width: 50px; height: 50px;">
                                                <i class="fas fa-pills text-muted"></i>
                                            </div>
                                        @endif
                                    </td>
                                    <td>{{ $item->medicine->name ?? 'دواء غير معروف' }}</td>
                                    <td>{{ $item->price }} ج.م</td>
                                    <td>{{ $item->quantity }}</td>
                                    <td>{{ $item->total }} ج.م</td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <td colspan="5" class="text-start fw-bold">الإجمالي</td>
                                <td class="fw-bold">{{ $order->total_price }} ج.م</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <style>
        @media print {
            body * {
                visibility: hidden;
            }
            .card, .card * {
                visibility: visible;
            }
            .card {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            .btn, form, .alert {
                display: none !important;
            }
        }
    </style>
</x-admin-layout>
