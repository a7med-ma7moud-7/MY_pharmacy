<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-pills me-2"></i>قائمة الأدوية
                </h2>
                <p class="text-muted mb-0 mt-1">إدارة قائمة الأدوية المتاحة بالنظام</p>
            </div>
            <div>
                <a href="{{ route('medicien.create') }}" class="btn btn-primary">
                    <i class="fas fa-plus me-1"></i> إضافة دواء جديد
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
                                <th scope="col">اسم الدواء</th>
                                <th scope="col">الغرض</th>
                                <th scope="col">السعر</th>
                                <th scope="col">النوع</th>
                                <th scope="col">العدد</th>
                                <th scope="col">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($mediciens as $index => $medicien)
                                <tr>
                                    <th scope="row">{{ $index + 1 }}</th>
                                    <td>
                                        <img src="{{ asset('storage/' . $medicien->image) }}" alt="{{ $medicien->name }}" class="rounded" width="50" height="50">
                                    </td>
                                    <td>{{ $medicien->name }}</td>
                                    <td>{{ $medicien->propose }}</td>
                                    <td>{{ $medicien->price }} ج.م</td>
                                    <td>{{ $medicien->type }}</td>
                                    <td>{{ $medicien->count }}</td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('medicien.show', $medicien->id) }}" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('medicien.edit', $medicien->id) }}" class="btn btn-sm btn-outline-success">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ route('medicien.destroy', $medicien->id) }}" method="POST" class="d-inline" onsubmit="return confirm('هل أنت متأكد من حذف هذا الدواء؟');">
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
                                    <td colspan="6" class="text-center py-4">
                                        <div class="d-flex flex-column align-items-center">
                                            <i class="fas fa-pills fa-3x text-muted mb-3"></i>
                                            <h5>لا توجد أدوية حتى الآن</h5>
                                            <p class="text-muted">قم بإضافة أدوية جديدة من خلال الضغط على زر "إضافة دواء جديد"</p>
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