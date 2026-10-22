<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <h2 class="h4 font-weight-bold">
                إدارة الطلبات
            </h2>
            <a href="{{ route('admin.dashboard') }}" class="btn btn-sm btn-primary">
                <i class="fas fa-tachometer-alt me-1"></i> العودة للوحة التحكم
            </a>
        </div>
    </x-slot>

    <div class="container-fluid py-4">
        <div class="row mb-4">
            <div class="col-md-8">
                <form action="{{ route('admin.orders.search') }}" method="GET" class="d-flex">
                    <div class="input-group">
                        <input type="text" name="keyword" class="form-control" placeholder="البحث عن طلب..." value="{{ $keyword ?? '' }}">
                        <button class="btn btn-primary" type="submit">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </form>
            </div>
            <div class="col-md-4 text-end">
                <div class="btn-group">
                    <a href="{{ route('admin.orders.index') }}" class="btn btn-outline-secondary">
                        <i class="fas fa-sync-alt me-1"></i> تحديث
                    </a>
                    <a href="{{ route('admin.orders.export') }}" class="btn btn-success">
                        <i class="fas fa-file-excel me-1"></i> تصدير Excel
                    </a>
                </div>
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="card-header bg-white py-3">
                <h5 class="card-title mb-0">قائمة الطلبات</h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th>رقم الطلب </th>
                                <th>اسم العميل</th>
                                <th>رقم الهاتف</th>
                                <th>طريقة التوصيل</th>
                                <th>المبلغ الإجمالي</th>
                                <th>الحالة</th>
                                <th>تاريخ الطلب</th>
                                <th> الوقت</th>
                                <th>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($orders as $order)
                                <tr>
                                    <td>{{ $order->id }}</td>
                                    <td>{{ $order->customer_name }}</td>
                                    <td>{{ $order->customer_phone }}</td>
                                    <td>
                                        @if ($order->delivery_method == 'delivery')
                                            <span class="badge bg-info">توصيل للمنزل</span>
                                        @else
                                            <span class="badge bg-secondary">استلام من الصيدلية</span>
                                        @endif
                                    </td>
                                    <td>{{ $order->total_price }} ج.م</td>
                                    <td>
                                        @if ($order->status == 'pending')
                                            <span class="badge bg-warning">قيد الانتظار</span>
                                        @elseif ($order->status == 'processing')
                                            <span class="badge bg-primary">قيد التجهيز</span>
                                        @elseif ($order->status == 'completed')
                                            <span class="badge bg-success">مكتمل</span>
                                        @elseif ($order->status == 'cancelled')
                                            <span class="badge bg-danger">ملغي</span>
                                        @endif
                                    </td>
                                    <td>{{ $order->created_at->format('Y-m-d') }}</td>
                                    <td>{{ $order->created_at->format('h:i A') }}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <a href="{{ route('admin.orders.show', $order->id) }}" class="btn btn-info">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#changeStatusModal{{ $order->id }}">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </div>

                                        <!-- Modal Change Status -->
                                        <div class="modal fade" id="changeStatusModal{{ $order->id }}" tabindex="-1" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                    <form action="{{ route('admin.orders.update-status', $order->id) }}" method="POST">
                                                        @csrf
                                                        @method('PUT')
                                                        <div class="modal-header">
                                                            <h5 class="modal-title">تغيير حالة الطلب #{{ $order->id }}</h5>
                                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <div class="mb-3">
                                                                <label for="status" class="form-label">الحالة الجديدة</label>
                                                                <select name="status" id="status" class="form-select">
                                                                    <option value="pending" {{ $order->status == 'pending' ? 'selected' : '' }}>قيد الانتظار</option>
                                                                    <option value="processing" {{ $order->status == 'processing' ? 'selected' : '' }}>قيد التجهيز</option>
                                                                    <option value="completed" {{ $order->status == 'completed' ? 'selected' : '' }}>مكتمل</option>
                                                                    <option value="cancelled" {{ $order->status == 'cancelled' ? 'selected' : '' }}>ملغي</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                                                            <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="8" class="text-center py-4">
                                        <div class="text-muted">
                                            <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                                            <p>لا توجد طلبات حاليًا</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-white">
                <div class="d-flex justify-content-center">
                    {{ $orders->links() }}
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>
