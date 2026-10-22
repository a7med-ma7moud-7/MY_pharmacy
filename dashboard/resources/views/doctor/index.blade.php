<x-admin-layout>

    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-user-md me-2"></i>قائمة الأطباء
                </h2>
                <p class="text-muted mb-0 mt-1">إدارة قائمة الأطباء المتاحين بالنظام</p>
            </div>
            <div>
                <a href="{{ route('doctor.create') }}" class="btn btn-primary">
                    <i class="fas fa-plus me-1"></i> إضافة طبيب جديد
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container py-4">
        <!-- Alert Messages -->
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">الصورة</th>
                                <th scope="col">اسم الطبيب</th>
                                <th scope="col">التخصص</th>
                                <th scope="col">سعر الكشف</th>
                                <th scope="col">المحافظه</th>
                                <th scope="col">المدينه</th>
                                <th scope="col">رقم الهاتف</th>
                                <th scope="col">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($doctors as $index => $doctor)
                                <tr>
                                    <th scope="row">{{ $index + 1 }}</th>
                                    <td>
                                        <img src="{{ asset('storage/' . $doctor->image) }}" alt="{{ $doctor->name }}" class="rounded-circle" width="50" height="50">
                                    </td>
                                    <td>{{ $doctor->name }}</td>
                                    <td>{{ $doctor->specialty }}</td>
                                    <td>{{ $doctor->price }} ج.م</td>
                                    <td>{{ $doctor->location }}</td>
                                    <td>{{ $doctor->tow_location }}</td>
                                    <td>{{ $doctor->number }}</td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('doctor.edit', $doctor->id) }}" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ route('doctor.destroy', $doctor->id) }}" method="POST" class="d-inline" onsubmit="return confirm('هل أنت متأكد من حذف هذا الطبيب؟');">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-outline-danger">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center py-4">
                                        <div class="d-flex flex-column align-items-center">
                                            <i class="fas fa-user-md fa-3x text-muted mb-3"></i>
                                            <h5>لا يوجد أطباء حتى الآن</h5>
                                            <p class="text-muted">قم بإضافة أطباء جدد من خلال الضغط على زر "إضافة طبيب جديد"</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>