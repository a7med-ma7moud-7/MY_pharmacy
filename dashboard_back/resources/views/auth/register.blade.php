<x-guest-layout>
    <div class="card-header bg-primary text-white text-center">
        <h3>{{ __('إنشاء حساب جديد') }}</h3>
    </div>
    
    <form method="POST" action="{{ route('register') }}">
        @csrf

        <!-- Name -->
        <div class="mb-3">
            <x-input-label for="name" :value="__('الاسم')" />
            <x-text-input id="name" type="text" name="name" :value="old('name')" required autofocus autocomplete="name" />
            <x-input-error :messages="$errors->get('name')" />
        </div>

        <!-- Email Address -->
        <div class="mb-3">
            <x-input-label for="email" :value="__('البريد الإلكتروني')" />
            <x-text-input id="email" type="email" name="email" :value="old('email')" required autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" />
        </div>

        <!-- Password -->
        <div class="mb-3">
            <x-input-label for="password" :value="__('كلمة المرور')" />
            <x-text-input id="password" type="password" name="password" required autocomplete="new-password" />
            <x-input-error :messages="$errors->get('password')" />
        </div>

        <!-- Confirm Password -->
        <div class="mb-3">
            <x-input-label for="password_confirmation" :value="__('تأكيد كلمة المرور')" />
            <x-text-input id="password_confirmation" type="password" name="password_confirmation" required autocomplete="new-password" />
            <x-input-error :messages="$errors->get('password_confirmation')" />
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4">
            <a class="btn btn-link" href="{{ route('login') }}">
                {{ __('لديك حساب بالفعل؟') }}
            </a>

            <x-primary-button>
                {{ __('تسجيل') }}
            </x-primary-button>
        </div>
    </form>

    <div class="mt-4">
        <div class="text-center mb-3">
            <span class="divider">{{ __('أو إنشاء حساب باستخدام') }}</span>
        </div>
        
        <div class="d-flex justify-content-center gap-3">
            <a href="{{ route('socialite.redirect', 'google') }}" class="btn btn-outline-danger w-100">
                <i class="fab fa-google me-2"></i>Google
            </a>
            
            <a href="{{ route('socialite.redirect', 'facebook') }}" class="btn btn-outline-primary w-100">
                <i class="fab fa-facebook-f me-2"></i>Facebook
            </a>
        </div>
    </div>
</x-guest-layout>


