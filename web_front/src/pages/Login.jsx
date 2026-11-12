import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogIn,
    Mail,
    Lock,
    AlertCircle,
    Info,
    Eye,
    EyeOff,
    Loader2,
    HeartPulse,
    ShieldCheck,
    Sparkles,
    Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState(null);
    const [infoBanner, setInfoBanner] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const showInfo = (msg) => {
        setInfoBanner(msg);
        setTimeout(() => setInfoBanner(''), 4500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setInfoBanner('');
        setLoading(true);

        try {
            await login(email, password, remember);
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    'بيانات الاعتماد غير صحيحة، يرجى المحاولة مرة أخرى.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 bg-slate-50 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scaleIn">
                {/* Visual Brand Showcase Side */}
                <div className="hidden lg:flex lg:col-span-5 hero-mesh text-white p-10 flex-col justify-between relative overflow-hidden">
                    <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-6 shadow-inner">
                            <HeartPulse className="w-7 h-7 text-emerald-300" />
                        </div>
                        <h2 className="text-2xl font-extrabold font-almarai text-white mb-3 leading-snug">
                            مرحباً بعودتك إلى منصة صيدليتي
                        </h2>
                        <p className="text-emerald-100/90 text-xs leading-relaxed">
                            سجّل دخولك لمتابعة طلبات الأدوية الخاصة بك، إدارة حجوزات العيادات، والاستفادة من المساعد الطبي الذكي.
                        </p>
                    </div>

                    <div className="space-y-3 relative z-10 pt-8">
                        <div className="glass-dark p-3.5 rounded-2xl flex items-center gap-3 text-xs">
                            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
                            <span>بياناتك الطبية والشخصية محمية ومشفرة بالكامل</span>
                        </div>
                        <div className="glass-dark p-3.5 rounded-2xl flex items-center gap-3 text-xs">
                            <Clock className="w-5 h-5 text-amber-300 shrink-0" />
                            <span>تتبع لحظي للطلبات وحجوزات الأطباء 24/7</span>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-7 p-6 sm:p-10">
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f6848] bg-emerald-50 px-3 py-1 rounded-full mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>بوابة الأعضاء</span>
                        </span>
                        <h1 className="text-2xl font-extrabold font-almarai text-slate-900 m-0">
                            تسجيل الدخول
                        </h1>
                        <p className="text-slate-500 text-xs mt-1 m-0">
                            أدخل بريدك الإلكتروني وكلمة المرور للمتابعة
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {infoBanner && (
                        <div className="mb-5 p-3.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-slideDown">
                            <Info className="w-4 h-4 shrink-0 text-sky-600" />
                            <span>{infoBanner}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                البريد الإلكتروني <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                كلمة المرور <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold select-none">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="rounded border-slate-300 accent-[#0f6848] w-4 h-4 cursor-pointer"
                                />
                                <span>تذكرني</span>
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    showInfo(
                                        'لإعادة تعيين كلمة المرور، يرجى التواصل مع خدمة العملاء عبر info@pharmacy-app.com'
                                    )
                                }
                                className="text-[#0f6848] hover:underline font-bold cursor-pointer"
                            >
                                نسيت كلمة المرور؟
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-main py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري تسجيل الدخول...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    <span>تسجيل الدخول</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Logins */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-center text-xs text-slate-400 mb-3">أو تسجيل الدخول السريع</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => showInfo('تسجيل الدخول السريع عبر Google سيتوفر قريباً.')}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                            >
                                <span>Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => showInfo('تسجيل الدخول السريع عبر Facebook سيتوفر قريباً.')}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                            >
                                <span>Facebook</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-6 text-xs text-slate-500">
                        <span>ليس لديك حساب بعد؟ </span>
                        <Link to="/register" className="text-[#0f6848] font-extrabold hover:underline">
                            إنشاء حساب جديد مجاناً
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
