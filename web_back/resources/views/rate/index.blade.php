<x-user-layout>
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">إضافة تقييم</div>
                <div class="card-body">
                    @if(session('success'))
                        <div class="alert alert-success">{{ session('success') }}</div>
                    @endif
                    @if(request('doctor_id'))
                        <form action="{{ route('rate.store') }}" method="POST">
                            @csrf
                            <input type="hidden" name="doctor_id" value="{{ request('doctor_id') }}">
                            <input type="hidden" name="user_id" value="{{ auth()->user()->id }}">
                            <div class="mb-3">
                                <label for="rating" class="form-label">التقييم:</label>
                                <select name="rating" id="rating" class="form-select" required>
                                    <option value="">اختر التقييم</option>
                                    @for($i = 1; $i <= 5; $i++)
                                        <option value="{{ $i }}">{{ $i }}</option>
                                    @endfor
                                </select>
                                @error('rating')<div class="text-danger">{{ $message }}</div>@enderror
                            </div>
                            <div class="mb-3">
                                <label for="comment" class="form-label">تعليق (اختياري):</label>
                                <textarea name="comment" id="comment" class="form-control" maxlength="255"></textarea>
                                @error('comment')<div class="text-danger">{{ $message }}</div>@enderror
                            </div>
                            <button type="submit" class="btn btn-primary">إرسال التقييم</button>
                        </form>
                    @else
                        <div class="alert alert-warning">يرجى اختيار دكتور أولاً لإضافة تقييم.</div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
</x-user-layout>