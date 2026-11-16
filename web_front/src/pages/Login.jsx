import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogIn,
    Phone,
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
    Stethoscope,
    User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174';

export default function Login() {
    const [loginAs, setLoginAs] = useState('user');
    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState(null);
    const [pendingBanner, setPendingBanner] = useState('');
    const [infoBanner, setInfoBanner] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const showInfo = (msg) => {
        setInfoBanner(msg);
        setTimeout(() => setInfoBanner(''), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setPendingBanner('');
        setInfoBanner('');
        setLoading(true);

        try {
            const trimmed = phoneOrEmail.trim();
            const payload = {
                ...(trimmed.includes('@') ? { email: trimmed } : { phone: trimmed }),
                password,
                remember,
                login_as: loginAs,
            };

            const res = await login(payload);
            const loggedUser = res?.user;

            if (loggedUser?.role === 'doctor') {
                navigate('/doctor/dashboard', { replace: true });
            } else if (loggedUser?.role === 'admin') {
                window.location.href = DASHBOARD_URL;
            } else {
                const safeFrom = from.startsWith('/doctor') ? '/' : from;
                navigate(safeFrom, { replace: true });
            }
        } catch (err) {
            const code = err.response?.data?.code;
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                'بيانات الدخول غير صحيحة، يرجى التحقق من رقم الهاتف وكلمة المرور.';

            if (code === 'DOCTOR_PENDING_VERIFICATION') {
                setPendingBanner(msg);
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 bg-transparent min-h-screen flex items-center justify-center px-4">
            <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/96 backdrop-blur-md rounded-3xl shadow-2xl ring-8 ring-white/50 border border-white overflow-hidden animate-scaleIn">
                {/* Visual Brand Showcase Side */}
                <div className="hidden lg:flex lg:col-span-5 hero-mesh text-white p-10 flex-col justify-between relative overflow-hidden">
                    <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-6 shadow-inner">
                            {loginAs === 'doctor' ? (
                                <Stethoscope className="w-7 h-7 text-emerald-300" />
                            ) : (
                                <HeartPulse className="w-7 h-7 text-emerald-300" />
                            )}
                        </div>
                        <h2 className="text-2xl font-extrabold font-almarai text-white mb-3 leading-snug">
                            {loginAs === 'doctor'
                                ? 'بوابة الأطباء والكوادر الطبية المعتمدة'
                                : 'مرحباً بعودتك إلى منصة صيدليتي'}
                        </h2>
                        <p className="text-emerald-100/90 text-xs leading-relaxed">
                            {loginAs === 'doctor'
                                ? 'أدر ملفك المهني، انشر الحالات العلاجية، تواصل مع مرضاك مباشرة، وتابع الروشتات وسجل المتابعات بأمان تام.'
                                : 'سجّل دخولك برقم هاتفك لمتابعة طلبات الأدوية، إدارة حجوزات العيادات، والتواصل المباشر مع طبيبك المعالج.'}
                        </p>
                    </div>

                    <div className="space-y-3 relative z-10 pt-8">
                        <div className="glass-dark p-3.5 rounded-2xl flex items-center gap-3 text-xs">
                            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
                            <span>
                                {loginAs === 'doctor'
                                    ? 'عزل كامل لبيانات المرضى وصلاحيات موثقة لكل طبيب'
                                    : 'بياناتك الطبية والشخصية محمية ومشفرة بالكامل'}
                            </span>
                        </div>
                        <div className="glass-dark p-3.5 rounded-2xl flex items-center gap-3 text-xs">
                            <Clock className="w-5 h-5 text-amber-300 shrink-0" />
                            <span>
                                {loginAs === 'doctor'
                                    ? 'متابعة فورية للمواعيد والمحادثات والروشتات'
                                    : 'تتبع لحظي للطلبات وحجوزات الأطباء 24/7'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-7 p-6 sm:p-10">
                    <div className="mb-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f6848] bg-emerald-50 px-3 py-1 rounded-full mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{loginAs === 'doctor' ? 'بوابة الأطباء' : 'بوابة المستخدمين'}</span>
                        </span>
                        <h1 className="text-2xl font-extrabold font-almarai text-slate-900 m-0">
                            تسجيل الدخول
                        </h1>
                        <p className="text-slate-500 text-xs mt-1 m-0">
                            اختر نوع حسابك وأدخل رقم الهاتف وكلمة المرور للمتابعة
                        </p>
                    </div>

                    {/* Role Selector Tabs */}
                    <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-slate-100 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginAs('user');
                                setError(null);
                                setPendingBanner('');
                            }}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                loginAs === 'user'
                                    ? 'bg-white text-[#0f6848] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>مريض / مستخدم</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLoginAs('doctor');
                                setError(null);
                                setPendingBanner('');
                            }}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                loginAs === 'doctor'
                                    ? 'bg-[#0f6848] text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Stethoscope className="w-4 h-4" />
                            <span>طبيب ممارس</span>
                        </button>
                    </div>

                    {pendingBanner && (
                        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-fadeIn leading-relaxed">
                            <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                            <span>{pendingBanner}</span>
                        </div>
                    )}

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
                                رقم الهاتف {loginAs === 'user' && <span className="text-slate-400 font-normal">(أو البريد الإلكتروني)</span>}{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    dir="ltr"
                                    value={phoneOrEmail}
                                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                                    placeholder="01012345678"
                                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-right focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
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
                                        loginAs === 'doctor'
                                            ? 'لإعادة تعيين كلمة مرور الطبيب بأمان، يرجى التواصل مع إدارة منصة صيدليتي.'
                                            : 'لإعادة تعيين كلمة المرور، يرجى التواصل مع خدمة العملاء عبر info@pharmacy-app.com'
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
                                    <span>
                                        {loginAs === 'doctor' ? 'الدخول إلى بوابة الطبيب' : 'تسجيل الدخول'}
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
                        <span>ليس لديك حساب بعد؟ </span>
                        <Link to="/register" className="text-[#0f6848] font-extrabold hover:underline">
                            إنشاء حساب جديد (مستخدم أو طبيب)
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
