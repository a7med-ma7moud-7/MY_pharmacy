import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserPlus,
    User,
    Mail,
    Lock,
    AlertCircle,
    Eye,
    EyeOff,
    Loader2,
    HeartPulse,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const passwordStrength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;

        if (score <= 1) return { score: 25, label: 'ضعيفة', color: 'bg-rose-500' };
        if (score === 2) return { score: 50, label: 'متوسطة', color: 'bg-amber-500' };
        if (score === 3) return { score: 75, label: 'جيدة', color: 'bg-emerald-500' };
        return { score: 100, label: 'قوية جداً', color: 'bg-[#0f6848]' };
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirmation) {
            setError('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
            return;
        }

        setLoading(true);

        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            const serverMsg =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(' ')
                    : null);
            setError(serverMsg || 'تعذر إنشاء الحساب، يرجى التحقق من البيانات المدخلة.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 bg-slate-50 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scaleIn">
                {/* Showcase Side */}
                <div className="hidden lg:flex lg:col-span-5 hero-mesh text-white p-10 flex-col justify-between relative overflow-hidden">
                    <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-6 shadow-inner">
                            <HeartPulse className="w-7 h-7 text-emerald-300" />
                        </div>
                        <h2 className="text-2xl font-extrabold font-almarai text-white mb-3 leading-snug">
                            انضم إلى عائلة صيدليتي اليوم
                        </h2>
                        <p className="text-emerald-100/90 text-xs leading-relaxed">
                            أنشئ حسابك المجاني في ثوانٍ واستمتع بطلب الأدوية، حجز الكشوفات الطبية، وتقييم الأطباء بكل سهولة.
                        </p>
                    </div>

                    <div className="space-y-3 relative z-10 pt-8 text-xs">
                        {[
                            'طلب سريع للأدوية مع توصيل لباب المنزل',
                            'حجز فوري لدى نخبة الأطباء والاستشاريين',
                            'استشارات دوائية ذكية مجانية على مدار الساعة',
                        ].map((benefit, idx) => (
                            <div key={idx} className="glass-dark p-3 rounded-2xl flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-7 p-6 sm:p-10">
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f6848] bg-emerald-50 px-3 py-1 rounded-full mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>عضوية مجانية</span>
                        </span>
                        <h1 className="text-2xl font-extrabold font-almarai text-slate-900 m-0">
                            إنشاء حساب جديد
                        </h1>
                        <p className="text-slate-500 text-xs mt-1 m-0">
                            أكمل البيانات التالية للبدء فوراً
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                الاسم بالكامل <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="محمد أحمد"
                                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                البريد الإلكتروني <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                                        className="w-full pr-10 pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    تأكيد كلمة المرور <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div>
                                <div className="flex justify-between text-[11px] mb-1">
                                    <span className="text-slate-400 font-semibold">قوة كلمة المرور:</span>
                                    <span className="font-extrabold text-slate-700">
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${passwordStrength.score}%` }}
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-main py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-3 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري إنشاء الحساب...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>إنشاء الحساب الآن</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
                        <span>لديك حساب بالفعل؟ </span>
                        <Link to="/login" className="text-[#0f6848] font-extrabold hover:underline">
                            تسجيل الدخول هنا
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
