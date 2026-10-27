<x-admin-layout>
    <x-slot name="header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2 class="fw-bold m-0">
                    <i class="fas fa-pills me-2"></i>إضافة دواء جديد
                </h2>
                <p class="text-muted mb-0 mt-1">إضافة دواء جديد إلى النظام</p>
            </div>
            <div>
                <a href="{{ route('medicien.index') }}" class="btn btn-secondary">
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
                        <form action="{{ route('medicien.store') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            
                            <div class="row mb-4">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label for="name" class="form-label">اسم الدواء <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name') }}" required>
                                        @error('name')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="propose" class="form-label">الغرض من الدواء <span class="text-danger">*</span></label>
                                        <textarea class="form-control @error('propose') is-invalid @enderror" id="propose" name="propose" rows="3" required>{{ old('propose') }}</textarea>
                                        @error('propose')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="mb-3">
                                        <label for="type" class="form-label">نوع الدواء <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control @error('type') is-invalid @enderror" id="type" name="type" value="{{ old('type') }}" required>
                                        @error('type')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="mb-3">
                                        <label for="count" class="form-label">العدد <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control @error('count') is-invalid @enderror" id="count" name="count" value="{{ old('count') }}" required>
                                        @error('count')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="price" class="form-label">سعر الدواء <span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="number" class="form-control @error('price') is-invalid @enderror" id="price" name="price" value="{{ old('price') }}" required>
                                            <span class="input-group-text">ج.م</span>
                                            @error('price')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="image" class="form-label">صورة الدواء <span class="text-danger">*</span></label>
                                        <div class="image-preview text-center mb-2">
                                            <img id="preview-image" src="https://via.placeholder.com/150?text=صورة+الدواء" alt="معاينة الصورة" class="img-fluid rounded" style="width: 150px; height: 150px; object-fit: cover;">
                                        </div>
                                        <input type="file" class="form-control @error('image') is-invalid @enderror" id="image" name="image" accept="image/*" required>
                                        @error('image')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                        <div class="form-text">يفضل رفع صورة واضحة للدواء</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-end pt-3 border-top">
                                <button type="reset" class="btn btn-light me-2">إعادة تعيين</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> حفظ الدواء
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