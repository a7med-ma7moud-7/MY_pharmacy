<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-calendar-alt me-2"></i>إدارة الحجوزات
                </h2>
                <p class="text-muted mb-0 mt-1">قائمة بجميع الحجوزات والمواعيد المسجلة في النظام</p>
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

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-calendar-alt text-primary me-2"></i>الحجوزات</h5>
                <div>
                    <!-- فلتر الحالة -->
                    <div class="dropdown d-inline-block">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="statusFilter" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-filter me-1"></i> فلتر حسب الحالة
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="statusFilter">
                            <li><a class="dropdown-item" href="#">جميع الحجوزات</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#">قيد الانتظار</a></li>
                            <li><a class="dropdown-item" href="#">مؤكدة</a></li>
                            <li><a class="dropdown-item" href="#">ملغية</a></li>
                            <li><a class="dropdown-item" href="#">مكتملة</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="card-body p-0">
                @if(count($appointments) > 0)
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3 text-center" width="60">#</th>
                                    <th class="py-3">اسم المريض</th>
                                    <th class="py-3">الطبيب</th>
                                    <th class="py-3">تاريخ الموعد</th>
                                    <th class="py-3">وقت الموعد</th>
                                    <th class="py-3">الحالة</th>
                                    <th class="py-3 text-center" width="150">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($appointments as $key => $appointment)
                                    <tr>
                                        <td class="text-center">{{ $key + 1 }}</td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                                                    <i class="fas fa-user text-primary"></i>
                                                </div>
                                                <div>
                                                    <h6 class="mb-0">{{ $appointment->patient_name }}</h6>
                                                    <p class="small text-muted mb-0">{{ $appointment->phone }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>د. {{ $appointment->doctor->name }}</td>
                                        <td>{{ $appointment->appointment_date->format('Y-m-d') }}</td>
                                        <td>{{ $appointment->appointment_time }}</td>
                                        <td>
                                            @if($appointment->status == 'pending')
                                                <span class="badge bg-warning">قيد الانتظار</span>
                                            @elseif($appointment->status == 'confirmed')
                                                <span class="badge bg-success">مؤكد</span>
                                            @elseif($appointment->status == 'cancelled')
                                                <span class="badge bg-danger">ملغي</span>
                                            @elseif($appointment->status == 'completed')
                                                <span class="badge bg-info">مكتمل</span>
                                            @endif
                                        </td>
                                        <td class="text-center">
                                            <a href="{{ route('admin.appointments.show', $appointment->id) }}" class="btn btn-sm btn-outline-primary me-1">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <!-- قائمة تحديث الحالة -->
                                            <div class="dropdown d-inline-block">
                                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="statusDropdown{{ $appointment->id }}" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="statusDropdown{{ $appointment->id }}">
                                                    <li class="dropdown-header">تغيير الحالة</li>
                                                    <li>
                                                        <form action="{{ route('admin.appointments.update-status', $appointment->id) }}" method="POST">
                                                            @csrf
                                                            @method('PATCH')
                                                            <input type="hidden" name="status" value="pending">
                                                            <button type="submit" class="dropdown-item">قيد الانتظار</button>
                                                        </form>
                                                    </li>
                                                    <li>
                                                        <form action="{{ route('admin.appointments.update-status', $appointment->id) }}" method="POST">
                                                            @csrf
                                                            @method('PATCH')
                                                            <input type="hidden" name="status" value="confirmed">
                                                            <button type="submit" class="dropdown-item">تأكيد</button>
                                                        </form>
                                                    </li>
                                                    <li>
                                                        <form action="{{ route('admin.appointments.update-status', $appointment->id) }}" method="POST">
                                                            @csrf
                                                            @method('PATCH')
                                                            <input type="hidden" name="status" value="cancelled">
                                                            <button type="submit" class="dropdown-item">إلغاء</button>
                                                        </form>
                                                    </li>
                                                    <li>
                                                        <form action="{{ route('admin.appointments.update-status', $appointment->id) }}" method="POST">
                                                            @csrf
                                                            @method('PATCH')
                                                            <input type="hidden" name="status" value="completed">
                                                            <button type="submit" class="dropdown-item">اكتمال</button>
                                                        </form>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    <!-- pagination -->
                    <div class="d-flex justify-content-center py-3">
                        {{ $appointments->links() }}
                    </div>
                @else
                    <div class="text-center py-5">
                        <div class="mb-3">
                            <i class="fas fa-calendar-times fa-3x text-muted"></i>
                        </div>
                        <p class="text-muted">لا توجد حجوزات في النظام حالياً</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-admin-layout> 