import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserPlus,
    User,
    Mail,
    Phone,
    Lock,
    AlertCircle,
    Eye,
    EyeOff,
    Loader2,
    HeartPulse,
    CheckCircle2,
    Sparkles,
    Stethoscope,
    MapPin,
    Award,
    DollarSign,
    ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SPECIALTY_SUGGESTIONS = [
    'باطنة',
    'قلب وأوعية دموية',
    'أطفال وحديثي الولادة',
    'عظام ومفاصل',
    'عيون',
    'جلدية وتجميل',
    'أنف وأذن وحنجرة',
    'مخ وأعصاب',
    'نساء وتوليد',
    'أسنان',
];

export default function Register() {
    const [accountType, setAccountType] = useState('user');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [price, setPrice] = useState('300');
    const [location, setLocation] = useState('القاهرة');
    const [clinicName, setClinicName] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [doctorPendingSuccess, setDoctorPendingSuccess] = useState(null);

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

        if (!phone.trim()) {
            setError('يرجى إدخال رقم الهاتف.');
            return;
        }

        if (accountType === 'doctor' && !specialty.trim()) {
            setError('يرجى تحديد التخصص الطبي.');
            return;
        }

        setLoading(true);

        try {
            const payload =
                accountType === 'doctor'
                    ? {
                          account_type: 'doctor',
                          name: name.trim(),
                          phone: phone.trim(),
                          ...(email.trim() ? { email: email.trim() } : {}),
                          password,
                          password_confirmation: passwordConfirmation,
                          specialty: specialty.trim(),
                          price: Number(price || 250),
                          location: location.trim() || 'القاهرة',
                          clinic_name: clinicName.trim() || undefined,
                          experience_years: experienceYears ? Number(experienceYears) : undefined,
                          qualifications: qualifications.trim() || undefined,
                      }
                    : {
                          account_type: 'user',
                          name: name.trim(),
                          phone: phone.trim(),
                          ...(email.trim() ? { email: email.trim() } : {}),
                          password,
                          password_confirmation: passwordConfirmation,
                      };

            const res = await register(payload);

            if (res?.pending_verification) {
                setDoctorPendingSuccess(res);
                return;
            }

            navigate('/');
        } catch (err) {
            const serverMsg =
                err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(' ')
                    : err.response?.data?.message;
            setError(serverMsg || 'تعذر إنشاء الحساب، يرجى التحقق من البيانات المدخلة.');
        } finally {
            setLoading(false);
        }
    };

    if (doctorPendingSuccess) {
        return (
            <div className="py-16 bg-transparent min-h-screen flex items-center justify-center px-4">
                <div className="max-w-lg w-full bg-white/96 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-100 p-8 text-center animate-scaleIn">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0f6848] flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <ShieldCheck className="w-9 h-9" />
                    </div>
                    <h2 className="text-2xl font-extrabold font-almarai text-slate-900 mb-3">
                        تم تسجيل طلب انضمامك كطبيب بنجاح!
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                        {doctorPendingSuccess.message}
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-4 text-right text-xs text-slate-600 space-y-1.5 mb-6 border border-slate-100">
                        <div>
                            <strong className="text-slate-800">الاسم المهني:</strong>{' '}
                            {doctorPendingSuccess.doctor_summary?.name}
                        </div>
                        <div>
                            <strong className="text-slate-800">التخصص الطبي:</strong>{' '}
                            {doctorPendingSuccess.doctor_summary?.specialty}
                        </div>
                        <div>
                            <strong className="text-slate-800">حالة الحساب:</strong>{' '}
                            <span className="text-amber-600 font-bold">قيد التوثيق والمراجعة من الإدارة</span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/login" className="btn-main px-6 py-3 rounded-xl text-sm font-bold">
                            الانتقال لصفحة تسجيل الدخول
                        </Link>
                        <Link to="/" className="btn-outline-main px-6 py-3 rounded-xl text-sm font-bold">
                            العودة للرئيسية
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 bg-transparent min-h-screen flex items-center justify-center px-4">
            <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/96 backdrop-blur-md rounded-3xl shadow-2xl ring-8 ring-white/50 border border-white overflow-hidden animate-scaleIn">
                {/* Showcase Side */}
                <div className="hidden lg:flex lg:col-span-5 hero-mesh text-white p-10 flex-col justify-between relative overflow-hidden">
                    <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-6 shadow-inner">
                            {accountType === 'doctor' ? (
                                <Stethoscope className="w-7 h-7 text-emerald-300" />
                            ) : (
                                <HeartPulse className="w-7 h-7 text-emerald-300" />
                            )}
                        </div>
                        <h2 className="text-2xl font-extrabold font-almarai text-white mb-3 leading-snug">
                            {accountType === 'doctor'
                                ? 'انضم إلى نخبة الأطباء المعتمدين في صيدليتي'
                                : 'انضم إلى عائلة صيدليتي اليوم'}
                        </h2>
                        <p className="text-emerald-100/90 text-xs leading-relaxed">
                            {accountType === 'doctor'
                                ? 'سجّل بياناتك المهنية للحصول على بوابة طبيب متكاملة لإدارة مرضاك، نشر الحالات المعالجة، وإصدار الروشتات الإلكترونية بعد اعتماد التوثيق.'
                                : 'أنشئ حسابك المجاني في ثوانٍ واستمتع بطلب الأدوية، حجز الكشوفات الطبية، والتواصل مع الأطباء بكل سهولة.'}
                        </p>
                    </div>

                    <div className="space-y-3 relative z-10 pt-8 text-xs">
                        {(accountType === 'doctor'
                            ? [
                                  'لوحة تحكم طبية متكاملة لإدارة العيادة والمرضى',
                                  'نشر الحالات التي تم علاجها مباشرة على ملفك العام',
                                  'محادثات طبية مؤمّنة وإصدار روشتات ومتابعات دقيقة',
                              ]
                            : [
                                  'طلب سريع للأدوية مع توصيل لباب المنزل',
                                  'حجز فوري لدى نخبة الأطباء والاستشاريين',
                                  'محادثة مباشرة مع طبيبك بعد حجز الموعد',
                              ]
                        ).map((benefit, idx) => (
                            <div key={idx} className="glass-dark p-3 rounded-2xl flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-7 p-6 sm:p-10">
                    <div className="mb-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f6848] bg-emerald-50 px-3 py-1 rounded-full mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{accountType === 'doctor' ? 'تسجيل الكوادر الطبية' : 'عضوية المرضى والعملاء'}</span>
                        </span>
                        <h1 className="text-2xl font-extrabold font-almarai text-slate-900 m-0">
                            إنشاء حساب جديد
                        </h1>
                        <p className="text-slate-500 text-xs mt-1 m-0">
                            اختر نوع الحساب ثم أكمل البيانات المطلوبة
                        </p>
                    </div>

                    {/* Account Type Step Selector */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setAccountType('user');
                                setError(null);
                            }}
                            className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center gap-3 ${
                                accountType === 'user'
                                    ? 'border-[#0f6848] bg-emerald-50/60 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    accountType === 'user'
                                        ? 'bg-[#0f6848] text-white'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-slate-900 font-almarai">
                                    مريض / مستخدم
                                </div>
                                <div className="text-[11px] text-slate-500">حجز مواعيد وطلب أدوية</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setAccountType('doctor');
                                setError(null);
                            }}
                            className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center gap-3 ${
                                accountType === 'doctor'
                                    ? 'border-[#0f6848] bg-emerald-50/60 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    accountType === 'doctor'
                                        ? 'bg-[#0f6848] text-white'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-slate-900 font-almarai">
                                    طبيب ممارس
                                </div>
                                <div className="text-[11px] text-slate-500">إدارة العيادة والمرضى</div>
                            </div>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {accountType === 'doctor' ? 'اسم الطبيب الثلاثي' : 'الاسم بالكامل'}{' '}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={accountType === 'doctor' ? 'د. أحمد محمود علي' : 'محمد أحمد'}
                                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    رقم الهاتف <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                    <input
                                        type="tel"
                                        required
                                        dir="ltr"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="01012345678"
                                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-right focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {accountType === 'doctor' ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            التخصص الطبي <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Stethoscope className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                            <input
                                                type="text"
                                                required
                                                list="doctor-specialties-list"
                                                value={specialty}
                                                onChange={(e) => setSpecialty(e.target.value)}
                                                placeholder="اختر أو اكتب التخصص الطبي"
                                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                            <datalist id="doctor-specialties-list">
                                                {SPECIALTY_SUGGESTIONS.map((sp) => (
                                                    <option key={sp} value={sp} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            قيمة الكشف (ج.م)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="300"
                                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            المدينة / عنوان العيادة
                                        </label>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="القاهرة - مدينة نصر"
                                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            سنوات الخبرة المهنية
                                        </label>
                                        <div className="relative">
                                            <Award className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="60"
                                                value={experienceYears}
                                                onChange={(e) => setExperienceYears(e.target.value)}
                                                placeholder="مثال: 10"
                                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            اسم العيادة / المركز (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            value={clinicName}
                                            onChange={(e) => setClinicName(e.target.value)}
                                            placeholder="مثال: عيادة النخبة التخصصية"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            المؤهلات العلمية والدرجة المهنية (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            value={qualifications}
                                            onChange={(e) => setQualifications(e.target.value)}
                                            placeholder="مثال: ماجستير / دكتوراه الأمراض الباطنة"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    البريد الإلكتروني <span className="text-slate-400 font-normal">(اختياري للإشعارات)</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

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

                        {accountType === 'doctor' && (
                            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900 flex items-start gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#0f6848] shrink-0 mt-0.5" />
                                <span>
                                    يخضع تسجيل حساب الطبيب لمراجعة وتوثيق الإدارة قبل منح صلاحيات بوابة الأطباء وظهور الملف للجمهور.
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-main py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري إرسال البيانات...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>
                                        {accountType === 'doctor'
                                            ? 'إرسال طلب تسجيل حساب طبيب'
                                            : 'إنشاء الحساب الآن'}
                                    </span>
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
