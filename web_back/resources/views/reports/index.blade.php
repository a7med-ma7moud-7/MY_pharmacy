<x-admin-layout>
<div class="container-fluid">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="text-dark fw-bold mb-0">
                <i class="fas fa-chart-line me-2 text-primary"></i>التقارير والإحصائيات
            </h2>
            <p class="text-muted mb-0">نظرة عامة على أداء النظام والإحصائيات</p>
        </div>
        <div>
            <button class="btn btn-primary">
                <i class="fas fa-download me-1"></i>
                تصدير التقرير
            </button>
        </div>
    </div>

    <div class="row g-4">
        <!-- Quick Stats Cards -->
        <div class="col-12">
            <div class="row g-4 mb-4">
                <!-- Total Visitors -->
                <div class="col-md-3">
                    <div class="card border-0 bg-primary bg-opacity-10 h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-primary mb-1">إجمالي الزوار</h6>
                                    <h3 class="fw-bold mb-0">{{ $visitorStats->sum('visitors') }}</h3>
                                    <small class="text-muted">آخر 30 يوم</small>
                                </div>
                                <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                                    <i class="fas fa-users fa-2x text-primary"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Sales -->
                <div class="col-md-3">
                    <div class="card border-0 bg-success bg-opacity-10 h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-success mb-1">إجمالي المبيعات</h6>
                                    <h3 class="fw-bold mb-0">{{ $medicineSales->sum('total_revenue') }} ج.م</h3>
                                    <small class="text-muted">إجمالي المبيعات</small>
                                </div>
                                <div class="bg-success bg-opacity-10 rounded-circle p-3">
                                    <i class="fas fa-dollar-sign fa-2x text-success"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Appointments -->
                <div class="col-md-3">
                    <div class="card border-0 bg-info bg-opacity-10 h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-info mb-1">إجمالي الحجوزات</h6>
                                    <h3 class="fw-bold mb-0">{{ $appointmentStats->sum('total_appointments') }}</h3>
                                    <small class="text-muted">آخر 30 يوم</small>
                                </div>
                                <div class="bg-info bg-opacity-10 rounded-circle p-3">
                                    <i class="fas fa-calendar-check fa-2x text-info"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Doctors -->
                <div class="col-md-3">
                    <div class="card border-0 bg-warning bg-opacity-10 h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-warning mb-1">إجمالي الأطباء</h6>
                                    <h3 class="fw-bold mb-0">{{ count($doctorStats) }}</h3>
                                    <small class="text-muted">الأطباء النشطين</small>
                                </div>
                                <div class="bg-warning bg-opacity-10 rounded-circle p-3">
                                    <i class="fas fa-user-md fa-2x text-warning"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Visitor Statistics -->
        <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-transparent border-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-chart-line text-primary me-2"></i>
                            إحصائيات الزوار
                        </h5>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#"><i class="fas fa-download me-2"></i>تصدير البيانات</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-sync me-2"></i>تحديث</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <canvas id="visitorsChart" height="300"></canvas>
                </div>
            </div>
        </div>

        <!-- Medicine Sales -->
        <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-transparent border-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-pills text-success me-2"></i>
                            إحصائيات مبيعات الأدوية
                        </h5>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#"><i class="fas fa-download me-2"></i>تصدير البيانات</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-sync me-2"></i>تحديث</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <canvas id="medicineChart" height="300"></canvas>
                </div>
            </div>
        </div>

        <!-- Appointments Chart -->
        <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-transparent border-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-calendar-check text-info me-2"></i>
                            إحصائيات الحجوزات
                        </h5>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#"><i class="fas fa-download me-2"></i>تصدير البيانات</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-sync me-2"></i>تحديث</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <canvas id="appointmentChart" height="300"></canvas>
                </div>
            </div>
        </div>

        <!-- Doctor Statistics -->
        <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-transparent border-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-user-md text-warning me-2"></i>
                            إحصائيات الأطباء
                        </h5>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#"><i class="fas fa-download me-2"></i>تصدير البيانات</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-sync me-2"></i>تحديث</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">الطبيب</th>
                                    <th scope="col">عدد الحجوزات</th>
                                    <th scope="col">النسبة</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($doctorStats as $index => $doctor)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="bg-info bg-opacity-10 rounded-circle p-2 me-2">
                                                <i class="fas fa-user-md text-info"></i>
                                            </div>
                                            {{ $doctor->name }}
                                        </div>
                                    </td>
                                    <td>{{ $doctor->appointments_count }}</td>
                                    <td>
                                        @php
                                            $totalAppointments = $doctorStats->sum('appointments_count');
                                            $percentage = $totalAppointments > 0 ? ($doctor->appointments_count / $totalAppointments) * 100 : 0;
                                        @endphp
                                        <div class="d-flex align-items-center">
                                            <div class="progress flex-grow-1" style="height: 5px;">
                                                <div class="progress-bar bg-success" style="width: {{ $percentage }}%"></div>
                                            </div>
                                            <span class="ms-2">{{ number_format($percentage, 1) }}%</span>
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    Chart.defaults.font.family = "'Cairo', 'Almarai', sans-serif";
    Chart.defaults.color = '#6c757d';

    // Visitors Chart
    const visitorsCtx = document.getElementById('visitorsChart').getContext('2d');
    new Chart(visitorsCtx, {
        type: 'line',
        data: {
            labels: {!! json_encode($visitorStats->pluck('date')) !!},
            datasets: [{
                label: 'عدد الزوار',
                data: {!! json_encode($visitorStats->pluck('visitors')) !!},
                borderColor: '#0f6848',
                backgroundColor: 'rgba(15, 104, 72, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Medicine Sales Chart
    const medicineCtx = document.getElementById('medicineChart').getContext('2d');
    new Chart(medicineCtx, {
        type: 'bar',
        data: {
            labels: {!! json_encode($medicineSales->pluck('name')) !!},
            datasets: [{
                label: 'المبيعات',
                data: {!! json_encode($medicineSales->pluck('total_sales')) !!},
                backgroundColor: '#10ac84',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Appointments Chart
    const appointmentCtx = document.getElementById('appointmentChart').getContext('2d');
    new Chart(appointmentCtx, {
        type: 'line',
        data: {
            labels: {!! json_encode($appointmentStats->pluck('date')->unique()) !!},
            datasets: [{
                label: 'عدد الحجوزات',
                data: {!! json_encode($appointmentStats->pluck('total_appointments')) !!},
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
});
</script>
@endpush
</x-admin-layout>