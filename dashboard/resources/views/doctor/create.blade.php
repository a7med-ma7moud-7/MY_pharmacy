<x-admin-layout>
        <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-user-md me-2"></i>إضافة طبيب جديد
                </h2>
                <p class="text-muted mb-0 mt-1">إضافة طبيب جديد إلى النظام</p>
            </div>
            <div>
                <a href="{{ route('doctor.index') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-right me-1"></i> العودة للقائمة
                </a>
            </div>
        </div>
    </x-slot>

    <div class="container py-4">
        <div class="row justify-content-center">
            <div class="col-md-10">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <form action="{{ route('doctor.store') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            
                            <div class="row mb-4">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label for="name" class="form-label">اسم الطبيب <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name') }}" required>
                                        @error('name')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="mb-3">
                                        <label for="location" class="form-label">المحافظه <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control @error('location') is-invalid @enderror" id="location" name="location" value="{{ old('location') }}" required>
                                        @error('location')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="mb-3">
                                        <label for="tow_location" class="form-label"> المدينه</label>
                                        <input type="text" class="form-control @error('tow_location') is-invalid @enderror" id="tow_location" name="tow_location" value="{{ old('tow_location') }}">
                                        @error('tow_location')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="specialty" class="form-label">التخصص <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control @error('specialty') is-invalid @enderror" id="specialty" name="specialty" value="{{ old('specialty') }}" required>
                                        @error('specialty')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="price" class="form-label">سعر الكشف <span class="text-danger">*</span></label>
                                                <div class="input-group">
                                                    <input type="number" class="form-control @error('price') is-invalid @enderror" id="price" name="price" value="{{ old('price') }}" required>
                                                    <span class="input-group-text">ج.م</span>
                                                    @error('price')
                                                        <div class="invalid-feedback">{{ $message }}</div>
                                                    @enderror
                                                </div>
                                            </div>
                                        </div>
                                        <!--status -->
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="status" class="form-label">الحالة <span class="text-danger">*</span></label>
                                                <select class="form-select @error('status') is-invalid @enderror" id="status" name="status" required>
                                                    <option value="active" {{ old('status') == 'active' ? 'selected' : '' }}>نشط</option>
                                                    <option value="inactive" {{ old('status') == 'inactive' ? 'selected' : '' }}>غير نشط</option>
                                                </select>
                                                @error('status')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>  
                                        <!--subscription -->
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="subscription" class="form-label">الحالة <span class="text-danger">*</span></label>
                                                <select class="form-select @error('subscription') is-invalid @enderror" id="subscription" name="subscription" required>
                                                    <option value="subscribed" {{ old('subscription') == 'subscribed' ? 'selected' : '' }}>مشترك</option>
                                                    <option value="not_subscribed" {{ old('subscription') == 'not_subscribed' ? 'selected' : '' }}>غير مشترك</option>
                                                </select>
                                                @error('subscription')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>  
                                        
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="number" class="form-label">رقم الهاتف <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control @error('number') is-invalid @enderror" id="number" name="number" value="{{ old('number') }}" required>
                                                @error('number')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="image" class="form-label">صورة الطبيب <span class="text-danger">*</span></label>
                                        <div class="image-preview text-center mb-2">
                                            <img id="preview-image" src="https://via.placeholder.com/150?text=صورة+الطبيب" alt="معاينة الصورة" class="img-fluid rounded-circle" style="width: 150px; height: 150px; object-fit: cover;">
                                        </div>
                                        <input type="file" class="form-control @error('image') is-invalid @enderror" id="image" name="image" accept="image/*" required>
                                        @error('image')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                        <div class="form-text">يفضل رفع صورة مربعة بدقة عالية</div>
                                    </div>
                                </div>
                            </div>
                            
                            
                            
                            <div class="d-flex justify-content-end pt-3 border-top">
                                <button type="reset" class="btn btn-light me-2">إعادة تعيين</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> حفظ الطبيب
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Image Preview Script -->
    <script>
        document.getElementById('image').addEventListener('change', function(e) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('preview-image').src = event.target.result;
            }
            reader.readAsDataURL(e.target.files[0]);
        });
    </script>
</x-admin-layout>