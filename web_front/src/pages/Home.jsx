import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { medicineService, doctorService } from '../services/api';
import Reveal from '../components/common/Reveal';
import AnimatedCounter from '../components/common/AnimatedCounter';
import MedicineCard from '../components/common/MedicineCard';
import DoctorCard from '../components/common/DoctorCard';
import {
    Pill,
    FileText,
    BarChart3,
    Users,
    Bell,
    Smartphone,
    UserCheck,
    Sparkles,
    Clock,
    ShieldCheck,
    HeartPulse,
    ArrowLeft,
    Calendar,
    Search,
    ChevronDown,
    Truck,
    Stethoscope,
    Bot,
} from 'lucide-react';

const STATS = [
    {
        numeric: 150,
        prefix: '+',
        suffix: '',
        label: 'طبيب واستشاري معتمد',
        icon: UserCheck,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        numeric: 1200,
        prefix: '+',
        suffix: '',
        label: 'دواء ومستحضر مرخص',
        icon: Pill,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
    },
    {
        numeric: 24,
        prefix: '',
        suffix: '/7',
        label: 'استشارات بالذكاء الاصطناعي',
        icon: Clock,
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
    },
    {
        numeric: 100,
        prefix: '',
        suffix: '%',
        label: 'أدوية أصلية وموثقة',
        icon: ShieldCheck,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
];

const SERVICES = [
    {
        icon: UserCheck,
        title: 'نخبة الأطباء والاستشاريين',
        desc: 'احجز موعد كشفك مع كبار الأطباء في كافة التخصصات الطبية، واستفد من تقييمات وتجارب المرضى الحقيقية بكل شفافية.',
        linkTo: '/doctors',
        linkText: 'تصفح الأطباء وحجز موعد',
        iconBg: 'from-emerald-100 to-teal-50',
    },
    {
        icon: Pill,
        title: 'صيدلية متكاملة أونلاين',
        desc: 'جميع الأدوية الأصلية والمستلزمات الطبية متوفرة بأسعار معتمدة، مع خيارات توصيل منزلي سريع وآمن حتى باب بيتك.',
        linkTo: '/medicines',
        linkText: 'تصفح قائمة الأدوية',
        iconBg: 'from-teal-100 to-cyan-50',
    },
    {
        icon: Sparkles,
        title: 'الصيدلي الذكي (AI) 24/7',
        desc: 'استفسر في أي لحظة عن الجرعات، التفاعلات الدوائية، أو البدائل، وسيقوم المساعد الذكي بإرشادك فوراً وبدقة.',
        linkTo: '/ai-chat',
        linkText: 'ابدأ الاستشارة الذكية',
        iconBg: 'from-cyan-100 to-emerald-50',
    },
];

const HOW_IT_WORKS = [
    {
        step: '01',
        icon: Search,
        title: 'ابحث واختر بسهولة',
        desc: 'ابحث عن الدواء المطلوب بالاسم التجاري أو العلمي، أو اختر الطبيب المتخصص حسب محافظتك وتقييمات المرضى.',
    },
    {
        step: '02',
        icon: Bot,
        title: 'استشر وتأكد فوراً',
        desc: 'اسأل الصيدلي الذكي مجاناً على مدار الساعة للتأكد من الجرعات المناسبة أو التداخلات الدوائية قبل الطلب.',
    },
    {
        step: '03',
        icon: Truck,
        title: 'استلم أو احجز في دقائق',
        desc: 'أكمل طلبك ليصلك حتى باب منزلك مع تتبع لحظي، أو احصل على تذكرة حجز فورية لموعد عيادتك.',
    },
];

const FEATURES = [
    {
        icon: Pill,
        title: 'إدارة المخزون الذكية',
        desc: 'تتبع مخزون الأدوية بسهولة وتلقي تنبيهات عند انخفاض المخزون لضمان توافر الأدوية دائمًا للمرضى.',
    },
    {
        icon: FileText,
        title: 'الوصفات الطبية الإلكترونية',
        desc: 'سجل وتتبع الوصفات الطبية والتأكد من صرف الأدوية الصحيحة للمرضى بدقة وبشكل آمن تماماً.',
    },
    {
        icon: BarChart3,
        title: 'تقارير وإحصائيات دقيقة',
        desc: 'مراقبة أداء الصيدلية من خلال تقارير مفصلة ورسوم بيانية تساعدك في اتخاذ القرارات المناسبة.',
    },
    {
        icon: Users,
        title: 'سجل طبي متكامل للعملاء',
        desc: 'تسجيل بيانات العملاء وتاريخهم الطبي وتقديم خدمة شخصية راقية بناءً على معرفة احتياجاتهم الصحية.',
    },
    {
        icon: Bell,
        title: 'نظام التنبيهات الفوري',
        desc: 'تنبيهات تلقائية للمواعيد وتواريخ انتهاء الصلاحية ومتابعة الشحنات والطلبات اليومية بكل يسر.',
    },
    {
        icon: Smartphone,
        title: 'منصة متوافقة مع كل الأجهزة',
        desc: 'وصول سهل وسريع لمنصتك من أي مكان وفي أي وقت عبر الهاتف المحمول أو التابلت أو الحاسوب.',
    },
];

const FAQS = [
    {
        q: 'هل جميع الأدوية المتوفرة في صيدليتي مرخصة وأصلية؟',
        a: 'نعم بالتأكيد، جميع الأدوية والمستحضرات الطبية المعروضة على المنصة مرخصة من وزارة الصحة المصرية ومستمدة من الموزعين المعتمدين رسمياً.',
    },
    {
        q: 'كيف يمكنني متابعة حالة طلب الأدوية الخاص بي؟',
        a: 'فور إتمام الطلب ستحصل على رقم طلب (Order ID)، ويمكنك إدخاله مع رقم هاتفك في صفحة "تتبع طلبك" لمتابعة حالة تجهيز وتوصيل الطلب خطوة بخطوة.',
    },
    {
        q: 'هل خدمة الصيدلي الذكي بالذكاء الاصطناعي مجانية؟',
        a: 'نعم، خدمة الصيدلي الذكي متاحة مجاناً على مدار 24 ساعة للإجابة الفورية عن استفسارات الجرعات والأعراض الجانبية والنصائح الدوائية العامة.',
    },
    {
        q: 'هل يمكنني حجز موعد مع طبيب بدون دفع إلكتروني مسبق؟',
        a: 'نعم، يمكنك اختيار الطبيب وتحديد التاريخ والوقت المناسبين وتأكيد الحجز مباشرة عبر المنصة، مع الدفع في العيادة عند الحضور.',
    },
];

const Home = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [searchMode, setSearchMode] = useState('medicine');
    const [heroQuery, setHeroQuery] = useState('');
    const [featuredMedicines, setFeaturedMedicines] = useState([]);
    const [featuredDoctors, setFeaturedDoctors] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [openFaq, setOpenFaq] = useState(0);

    useEffect(() => {
        let mounted = true;
        const loadFeatured = async () => {
            try {
                const [medRes, docRes] = await Promise.allSettled([
                    medicineService.getMedicines({ per_page: 4 }),
                    doctorService.getDoctors({ per_page: 3 }),
                ]);
                if (!mounted) return;
                if (medRes.status === 'fulfilled' && medRes.value.data?.success) {
                    setFeaturedMedicines((medRes.value.data.data?.data || []).slice(0, 4));
                }
                if (docRes.status === 'fulfilled' && docRes.value.data?.success) {
                    setFeaturedDoctors((docRes.value.data.data?.data || []).slice(0, 3));
                }
            } catch {
                // Silent fallback if backend is offline
            } finally {
                if (mounted) setLoadingFeatured(false);
            }
        };
        loadFeatured();
        return () => {
            mounted = false;
        };
    }, []);

    const handleHeroSearch = (e) => {
        e.preventDefault();
        const trimmed = heroQuery.trim();
        if (searchMode === 'medicine') {
            navigate(trimmed ? `/medicines?query=${encodeURIComponent(trimmed)}` : '/medicines');
        } else {
            navigate(trimmed ? `/doctors?search=${encodeURIComponent(trimmed)}` : '/doctors');
        }
    };

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="hero-mesh text-center relative overflow-hidden pt-16 pb-24 md:pt-20 md:pb-32">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>

                {/* Animated Floating Decorative Orbs */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl animate-blob pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-20 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl animate-float-slow pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-5 py-2 rounded-full text-white text-xs sm:text-sm font-bold mb-6 backdrop-blur-md shadow-lg animate-fadeIn">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>المنصة الرائدة للرعاية الصحية والصيدلية في مصر</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-almarai mb-6 leading-[1.25] text-white drop-shadow-md animate-fadeInUp">
                        رعايتك الصحية وأدويتك <br />
                        <span className="text-emerald-200">في مكان واحد بكل سهولة وأمان</span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-emerald-50/90 mb-9 font-normal leading-relaxed max-w-2xl mx-auto animate-fadeInUp">
                        منصة صيدليتي توفر لك دليلاً شاملاً لأفضل الأطباء، وصيدلية متكاملة أونلاين، ومساعد ذكاء اصطناعي طبي يجيبك فوراً.
                    </p>

                    {/* Interactive Tabbed Search Box */}
                    <div className="max-w-2xl mx-auto mb-8 bg-white/15 backdrop-blur-xl p-2.5 rounded-3xl border border-white/25 shadow-2xl animate-scaleIn">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <button
                                type="button"
                                onClick={() => setSearchMode('medicine')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    searchMode === 'medicine'
                                        ? 'bg-white text-[#0f6848] shadow-sm'
                                        : 'text-white/85 hover:bg-white/10'
                                }`}
                            >
                                <Pill className="w-3.5 h-3.5" />
                                <span>ابحث عن دواء</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchMode('doctor')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    searchMode === 'doctor'
                                        ? 'bg-white text-[#0f6848] shadow-sm'
                                        : 'text-white/85 hover:bg-white/10'
                                }`}
                            >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>ابحث عن طبيب</span>
                            </button>
                        </div>

                        <form
                            onSubmit={handleHeroSearch}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white rounded-2xl p-1.5 shadow-inner"
                        >
                            <div className="flex items-center gap-2.5 flex-1 px-3 py-1.5">
                                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                                <input
                                    type="text"
                                    value={heroQuery}
                                    onChange={(e) => setHeroQuery(e.target.value)}
                                    placeholder={
                                        searchMode === 'medicine'
                                            ? 'اكتب اسم الدواء أو المادة الفعالة (مثل: بانادول، فيتامين سي)...'
                                            : 'اكتب اسم الطبيب أو التخصص الطبي (مثل: باطنة، أطفال، جلدية)...'
                                    }
                                    className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-main px-7 py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            >
                                <span>ابحث الآن</span>
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                        <Link
                            to="/medicines"
                            className="bg-white text-[#0f6848] hover:bg-emerald-50 hover:scale-105 active:scale-95 font-extrabold px-7 py-3.5 rounded-full shadow-xl text-sm md:text-base transition-all inline-flex items-center gap-2.5"
                        >
                            <Pill className="w-5 h-5 text-emerald-600" />
                            <span>تصفح الصيدلية كاملة</span>
                        </Link>
                        <Link
                            to="/doctors"
                            className="bg-white/10 backdrop-blur-md border-2 border-white/75 hover:bg-white hover:text-[#0f6848] active:scale-95 font-bold px-7 py-3.5 rounded-full text-sm md:text-base text-white transition-all inline-flex items-center gap-2.5 shadow-lg"
                        >
                            <UserCheck className="w-5 h-5" />
                            <span>احجز موعد طبيب</span>
                        </Link>
                    </div>

                    {/* Inline Trust Highlights */}
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-emerald-50/95">
                        <span className="glass-dark px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            <span>أدوية أصلية مرخصة 100%</span>
                        </span>
                        <span className="glass-dark px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-teal-200" />
                            <span>توصيل منزلي سريع وآمن</span>
                        </span>
                        <span className="glass-dark px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-amber-300" />
                            <span>استشارة الصيدلي الذكي 24/7</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Trust Stats Counter Strip */}
            <section className="relative z-20 -mt-10 sm:-mt-12 px-4">
                <Reveal direction="up">
                    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {STATS.map((s, idx) => {
                                const Icon = s.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center text-center pt-2 md:pt-0 group"
                                    >
                                        <div
                                            className={`p-3.5 ${s.bg} rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                                        >
                                            <Icon className={`w-6 h-6 ${s.color}`} />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-black text-slate-900 font-almarai tracking-tight">
                                            <AnimatedCounter
                                                end={s.numeric}
                                                prefix={s.prefix}
                                                suffix={s.suffix}
                                            />
                                        </div>
                                        <div className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                                            {s.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Quick Services Row */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-extrabold text-[#0f6848] bg-emerald-100/80 px-4 py-1.5 rounded-full tracking-wider mb-3 inline-block">
                            الخدمات المتاحة
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-almarai text-slate-900 mb-3">
                            خدماتنا الطبية المتكاملة
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base leading-relaxed m-0">
                            نوفر لك حلولاً فورية وموثوقة لتلبية كافة احتياجاتك العلاجية والصحية
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {SERVICES.map((srv, idx) => {
                            const Icon = srv.icon;
                            return (
                                <Reveal key={idx} delay={idx * 110}>
                                    <div className="h-full p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#0f6848]/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
                                        <div>
                                            <div
                                                className={`w-16 h-16 bg-gradient-to-br ${srv.iconBg} text-[#0f6848] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}
                                            >
                                                <Icon className="w-8 h-8 text-[#0f6848]" />
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-xl mb-3 font-almarai">
                                                {srv.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                                {srv.desc}
                                            </p>
                                        </div>
                                        <Link
                                            to={srv.linkTo}
                                            className="text-[#0f6848] font-extrabold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all"
                                        >
                                            <span>{srv.linkText}</span>
                                            <ArrowLeft className="w-4 h-4 transition-transform" />
                                        </Link>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Live Featured Medicines */}
            {(loadingFeatured || featuredMedicines.length > 0) && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                            <div>
                                <span className="text-xs font-extrabold text-[#0f6848] bg-emerald-100/80 px-4 py-1.5 rounded-full inline-block mb-3">
                                    الأكثر طلباً
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold font-almarai text-slate-900 m-0">
                                    أحدث الأدوية والمستلزمات الطبية
                                </h2>
                            </div>
                            <Link
                                to="/medicines"
                                className="btn-outline-main px-5 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 self-start sm:self-auto"
                            >
                                <span>عرض كل الأدوية</span>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Reveal>

                        {loadingFeatured ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-3xl border border-slate-100 overflow-hidden bg-white p-4 space-y-3"
                                    >
                                        <div className="h-44 rounded-2xl skeleton-shimmer"></div>
                                        <div className="h-5 w-2/3 rounded skeleton-shimmer"></div>
                                        <div className="h-4 w-full rounded skeleton-shimmer"></div>
                                        <div className="h-10 w-full rounded-xl skeleton-shimmer"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredMedicines.map((med, idx) => (
                                    <MedicineCard
                                        key={med.id}
                                        medicine={med}
                                        onAddToCart={(m) => addToCart(m, 1)}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* How It Works Section */}
            <section className="py-20 bg-gradient-to-b from-slate-50 to-emerald-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-extrabold text-[#0f6848] bg-emerald-100/80 px-4 py-1.5 rounded-full inline-block mb-3">
                            خطوات بسيطة
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-almarai text-slate-900 mb-3">
                            كيف تعمل منصة صيدليتي؟
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base m-0">
                            رحلة علاجية رقمية متكاملة في 3 خطوات سريعة وآمنة
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {HOW_IT_WORKS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <Reveal key={item.step} delay={idx * 130}>
                                    <div className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center group h-full">
                                        <span className="absolute top-5 left-5 text-3xl font-black text-emerald-500/15 group-hover:text-emerald-500/30 transition-colors font-mono">
                                            {item.step}
                                        </span>
                                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#0f6848] to-[#10ac84] text-white flex items-center justify-center shadow-lg shadow-[#0f6848]/20 group-hover:scale-110 transition-transform">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-lg font-extrabold font-almarai text-slate-900 mb-2.5">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed m-0">
                                            {item.desc}
                                        </p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Live Featured Doctors */}
            {featuredDoctors.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                            <div>
                                <span className="text-xs font-extrabold text-[#0f6848] bg-emerald-100/80 px-4 py-1.5 rounded-full inline-block mb-3">
                                    نخبة الأطباء
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold font-almarai text-slate-900 m-0">
                                    احجز موعدك مع أفضل الاستشاريين
                                </h2>
                            </div>
                            <Link
                                to="/doctors"
                                className="btn-outline-main px-5 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 self-start sm:self-auto"
                            >
                                <span>عرض كل الأطباء</span>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredDoctors.map((doc, idx) => (
                                <DoctorCard key={doc.id} doctor={doc} index={idx} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="py-20 bg-slate-50" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-extrabold text-[#0f6848] bg-emerald-100/80 px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 inline-block">
                            لماذا صيدليتي؟
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold font-almarai text-slate-900 mb-4">
                            مميزات منصة صيدليتي
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            نظام تقني متطور يجمع بين سهولة الاستخدام للمرضى، والكفاءة الاحترافية لإدارة الصيدليات والعيادات
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURES.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <Reveal key={idx} delay={(idx % 3) * 100}>
                                    <div className="h-full p-7 rounded-3xl bg-white border border-slate-100 hover:border-[#0f6848]/25 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1.5">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 shadow-sm flex items-center justify-center text-[#0f6848] mb-6 group-hover:scale-110 group-hover:bg-[#0f6848] group-hover:text-white transition-all duration-300">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold font-almarai text-slate-800 mb-3 group-hover:text-[#0f6848] transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed m-0">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Accordion */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal className="text-center mb-12">
                        <span className="text-xs font-extrabold text-[#0f6848] bg-emerald-100/80 px-4 py-1.5 rounded-full inline-block mb-3">
                            الأسئلة الشائعة
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-almarai text-slate-900 mb-2">
                            إجابات سريعة لأهم استفساراتك
                        </h2>
                        <p className="text-slate-500 text-sm m-0">
                            كل ما تحتاج معرفته حول طلب الأدوية وحجز العيادات والاستشارة الذكية
                        </p>
                    </Reveal>

                    <div className="space-y-3.5">
                        {FAQS.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <Reveal key={idx} delay={idx * 70}>
                                    <div
                                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                            isOpen
                                                ? 'border-emerald-300 bg-emerald-50/30 shadow-md shadow-emerald-900/5'
                                                : 'border-slate-200/80 bg-white hover:border-emerald-200'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                            className="w-full px-6 py-4 text-right flex items-center justify-between gap-4 cursor-pointer"
                                        >
                                            <span className="font-extrabold text-sm sm:text-base text-slate-800 font-almarai">
                                                {faq.q}
                                            </span>
                                            <span
                                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                    isOpen
                                                        ? 'bg-[#0f6848] text-white rotate-180'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-emerald-100/80 pt-3 animate-fadeIn">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-slate-50 px-4 sm:px-6 lg:px-8">
                <Reveal direction="scale" className="max-w-6xl mx-auto">
                    <div className="hero-mesh rounded-3xl py-16 px-6 sm:px-12 text-center relative overflow-hidden text-white shadow-2xl">
                        <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                        <div className="max-w-3xl mx-auto relative z-10">
                            <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/25 shadow-inner animate-float">
                                <HeartPulse className="w-8 h-8 text-emerald-300" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold font-almarai mb-5 text-white drop-shadow-sm">
                                {user
                                    ? `أهلاً بك يا ${user.name} في صيدليتي`
                                    : 'ابدأ في استخدام منصة صيدليتي اليوم'}
                            </h2>
                            <p className="text-base md:text-lg text-emerald-50/90 mb-9 max-w-2xl mx-auto leading-relaxed">
                                انضم الآن لآلاف المرضى والأطباء واستمتع بتجربة رعاية صحية رقمية استثنائية وسريعة.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                {user ? (
                                    <>
                                        <Link
                                            to="/appointments"
                                            className="bg-white text-[#0f6848] hover:bg-emerald-50 hover:scale-105 active:scale-95 font-extrabold px-9 py-3.5 text-base rounded-full shadow-2xl transition-all inline-flex items-center gap-2"
                                        >
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                            <span>احجز موعد كشف الآن</span>
                                        </Link>
                                        <Link
                                            to="/orders/track"
                                            className="bg-white/10 backdrop-blur-md border-2 border-white/80 hover:bg-white hover:text-[#0f6848] text-white font-bold px-9 py-3.5 text-base rounded-full transition-all active:scale-95 shadow-lg"
                                        >
                                            متابعة طلباتك
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/register"
                                            className="bg-white text-[#0f6848] hover:bg-emerald-50 hover:scale-105 active:scale-95 font-extrabold px-9 py-3.5 text-base rounded-full shadow-2xl transition-all"
                                        >
                                            سجّل حسابك الآن مجاناً
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="bg-white/10 backdrop-blur-md border-2 border-white/80 hover:bg-white hover:text-[#0f6848] text-white font-bold px-9 py-3.5 text-base rounded-full transition-all active:scale-95 shadow-lg"
                                        >
                                            تسجيل الدخول
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>
        </div>
    );
};

export default Home;
