<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    /**
     * توجيه المستخدم إلى صفحة تسجيل الدخول بالشبكة الاجتماعية
     */
    public function redirect($provider)
    {
        try {
            Log::info('Starting social login redirect', ['provider' => $provider]);
            
            // تجربة بدون stateless() لمعرفة إذا كانت المشكلة في الجلسة
            if ($provider === 'google') {
                return Socialite::driver($provider)
                    ->stateless()
                    ->with(['prompt' => 'select_account'])
                    ->redirect();
            }
            
            if ($provider === 'facebook') {
                return Socialite::driver($provider)
                    ->scopes(['email', 'public_profile'])
                    ->redirect();
            }
            
            return Socialite::driver($provider)->redirect();
        } catch (Exception $e) {
            Log::error('Social redirect error', [
                'provider' => $provider,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('login')
                ->with('error', 'حدث خطأ أثناء الاتصال بـ ' . $provider . ': ' . $e->getMessage());
        }
    }

    /**
     * معالجة استجابة الشبكة الاجتماعية بعد تسجيل الدخول
     */
    public function callback($provider)
    {
        try {
            Log::info('Starting social login callback', ['provider' => $provider]);
            
            // تسجيل معلومات الطلب للتشخيص
            Log::info('Callback request details', [
                'provider' => $provider,
                'all_request' => request()->all(),
                'query' => request()->query(),
                'has_error' => request()->has('error'),
                'error' => request()->input('error'),
                'error_description' => request()->input('error_description')
            ]);
            
         $socialUser = Socialite::driver($provider)->stateless()->user();
            
            // Debug: عرض بيانات المستخدم من Google
            \Log::info('Social user full data', [
                'provider' => $provider,
                'id' => $socialUser->getId(),
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'avatar' => $socialUser->getAvatar(),
                'token' => $socialUser->token,
                'refreshToken' => $socialUser->refreshToken,
                'user_array' => $socialUser->toArray()
            ]);
            
         dd($socialUser);
            // تسجيل بيانات المستخدم من الشبكة الاجتماعية
            \Log::info('Social user data', [
                'provider' => $provider,
                'id' => $socialUser->getId(),
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'token' => $socialUser->token,
            ]);
            
            // البحث عن المستخدم في قاعدة البيانات
            $user = User::where([
                $provider.'_id' => $socialUser->getId()
            ])->first();
            
            // إذا لم يكن المستخدم موجودًا، نبحث عن طريق البريد الإلكتروني
            if (!$user) {
                $user = User::where('email', $socialUser->getEmail())->first();
                
                // إذا وجدنا المستخدم، نقوم بتحديث معرف الشبكة الاجتماعية
                if ($user) {
                    $user->update([
                        $provider.'_id' => $socialUser->getId(),
                        'social_token' => $socialUser->token,
                        'social_refresh_token' => $socialUser->refreshToken ?? null,
                    ]);
                } else {
                    // إنشاء مستخدم جديد
                    $user = User::create([
                        'name' => $socialUser->getName(),
                        'email' => $socialUser->getEmail(),
                        'password' => Hash::make(Str::random(16)),
                        $provider.'_id' => $socialUser->getId(),
                        'avatar' => $socialUser->getAvatar(),
                        'social_token' => $socialUser->token,
                        'social_refresh_token' => $socialUser->refreshToken ?? null,
                    ]);
                    
                    \Log::info('Created new user from social login', ['user_id' => $user->id]);
                }
            }
            
            // تسجيل دخول المستخدم
            Auth::login($user);
            
            return redirect()->route('dashboard');
            
        } catch (\Exception $e) {
            // تسجيل الخطأ بالتفصيل
            \Log::error('Social login error', [
                'provider' => $provider,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('login')
                ->with('error', 'حدث خطأ أثناء تسجيل الدخول بواسطة ' . $provider . ': ' . $e->getMessage());
        }
    }
}








