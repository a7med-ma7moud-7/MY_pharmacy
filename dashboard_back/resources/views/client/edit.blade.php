<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-user-edit me-2"></i>تعديل بيانات المستخدم
                </h2>
                <p class="text-muted mb-0 mt-1">تعديل بيانات المستخدم {{ $user->name }}</p>
            </div>
            <div>
                <a href="{{ route('users.index') }}" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-arrow-right me-1"></i> عودة إلى قائمة المستخدمين
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container-fluid">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white py-3">
                        <h5 class="mb-0"><i class="fas fa-user-edit text-primary me-2"></i>تعديل معلومات المستخدم</h5>
                    </div>
                    <div class="card-body p-4">
                        <form action="{{ route('users.update', $user->id) }}" method="POST">
                            @csrf
                            @method('PUT')
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="name" class="form-label">اسم المستخدم</label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name', $user->name) }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="col-md-6">
                                    <label for="email" class="form-label">البريد الإلكتروني</label>
                                    <input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email', $user->email) }}" required>
                                    @error('email')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="role" class="form-label">نوع الحساب</label>
                                    <select class="form-select @error('role') is-invalid @enderror" id="role" name="role" required>
                                        <option value="user" {{ $user->role == 'user' ? 'selected' : '' }}>مستخدم</option>
                                        <option value="admin" {{ $user->role == 'admin' ? 'selected' : '' }}>مدير</option>
                                    </select>
                                    @error('role')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="col-md-6">
                                    <label for="password" class="form-label">كلمة المرور <span class="text-muted">(اتركها فارغة إذا لم تكن تريد تغييرها)</span></label>
                                    <input type="password" class="form-control @error('password') is-invalid @enderror" id="password" name="password">
                                    @error('password')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-end mt-4">
                                <a href="{{ route('users.index') }}" class="btn btn-outline-secondary me-2">إلغاء</a>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout> 