import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { medicineService, doctorService } from '../services/api';
import Reveal from '../components/common/Reveal';
import MedicineCard from '../components/common/MedicineCard';
import MedicineQuickView from '../components/common/MedicineQuickView';
import DoctorCard from '../components/common/DoctorCard';
import {
    Pill,
    UserCheck,
    ArrowLeft,
    Search,
    ChevronDown,
    Stethoscope,
    Bot,
} from 'lucide-react';

const CORE_SERVICES = [
    {
        icon: Pill,
        title: 'صيدلية الأدوية',
        desc: 'اطلب أدويتك الأصلية والمرخصة مع توصيل سريع حتى باب المنزل.',
        linkTo: '/medicines',
        linkText: 'تصفح الأدوية',
    },
    {
        icon: UserCheck,
        title: 'حجز عيادات الأطباء',
        desc: 'اختر الطبيب المناسب حسب التخصص والمحافظة واحجز موعدك مباشرة.',
        linkTo: '/doctors',
        linkText: 'تصفح الأطباء',
    },
    {
        icon: Bot,
        title: 'الصيدلي الذكي',
        desc: 'اسأل مجاناً عن الجرعات أو التداخلات الدوائية واحصل على إجابة فورية.',
        linkTo: '/ai-chat',
        linkText: 'ابدأ المحادثة',
    },
];

const FAQS = [
    {
        q: 'هل جميع الأدوية المتوفرة مرخصة وأصلية؟',
        a: 'نعم، جميع الأدوية المعروضة مرخصة من وزارة الصحة المصرية ومن موزعين معتمدين رسمياً.',
    },
    {
        q: 'كيف أتابع حالة طلب الأدوية الخاص بي؟',
        a: 'بعد إتمام الطلب تحصل على رقم الطلب، ويمكنك متابعته في أي وقت من صفحة "تتبع طلبك" برقم الطلب ورقم الهاتف.',
    },
    {
        q: 'هل حجز موعد الطبيب يتطلب دفع إلكتروني مسبق؟',
        a: 'لا، الحجز يتم مجاناً عبر المنصة ويكون الدفع مباشرة في العيادة عند الحضور.',
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
    const [quickViewMed, setQuickViewMed] = useState(null);

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
            {/* Elevated Layered Hero Section */}
            <section className="hero-mesh relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
                {/* Architectural Grid + Masked Fade */}
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>

                {/* Soft Ambient Aurora Orbs */}
                <div
                    className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full pointer-events-none blur-3xl opacity-35 animate-pulse"
                    style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', animationDuration: '7s' }}
                />
                <div
                    className="absolute -bottom-28 -left-24 w-[460px] h-[460px] rounded-full pointer-events-none blur-3xl opacity-30 animate-pulse"
                    style={{ background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)', animationDuration: '9s' }}
                />

                {/* Subtle Decorative Glass Rings & Medical Pulse Line */}
                <div className="absolute top-10 left-12 w-56 h-56 rounded-full border border-white/10 pointer-events-none hidden lg:block"></div>
                <div className="absolute top-16 left-18 w-44 h-44 rounded-full border border-emerald-200/10 pointer-events-none hidden lg:block"></div>
                <div className="absolute bottom-14 right-14 w-64 h-64 rounded-full border border-white/10 pointer-events-none hidden lg:block"></div>

                <svg
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-36 opacity-[0.07] pointer-events-none"
                    viewBox="0 0 1440 160"
                    fill="none"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 90 H380 L415 55 L445 125 L475 30 L505 110 L530 90 H910 L945 55 L975 125 L1005 30 L1035 110 L1060 90 H1440"
                        stroke="#a7f3d0"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold font-almarai mb-4 leading-[1.3] text-white animate-fadeInUp">
                        رعايتك الصحية وأدويتك{' '}
                        <span className="text-emerald-200">في مكان واحد</span>
                    </h1>

                    <p className="text-sm sm:text-lg text-emerald-50/90 mb-9 font-normal leading-relaxed max-w-xl mx-auto animate-fadeInUp">
                        ابحث عن دوائك واطلبه لباب المنزل، أو احجز موعدك مع نخبة الأطباء المعتمدين بسهولة.
                    </p>

                    {/* Clean Single Search Box */}
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl animate-scaleIn">
                        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 px-1">
                            <button
                                type="button"
                                onClick={() => setSearchMode('medicine')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    searchMode === 'medicine'
                                        ? 'bg-emerald-50 text-[#0f6848]'
                                        : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <Pill className="w-3.5 h-3.5" />
                                <span>الأدوية</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchMode('doctor')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    searchMode === 'doctor'
                                        ? 'bg-emerald-50 text-[#0f6848]'
                                        : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>الأطباء</span>
                            </button>
                        </div>

                        <form
                            onSubmit={handleHeroSearch}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                        >
                            <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    value={heroQuery}
                                    onChange={(e) => setHeroQuery(e.target.value)}
                                    placeholder={
                                        searchMode === 'medicine'
                                            ? 'ابحث باسم الدواء (مثال: بنادول، فيتامين سي)...'
                                            : 'ابحث باسم الطبيب أو التخصص (مثال: باطنة، أطفال)...'
                                    }
                                    className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-main px-8 py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            >
                                <span>بحث</span>
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* Subtle Minimal Metrics Line */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-emerald-100/90 font-semibold">
                        <span>+1,200 دواء مرخص</span>
                        <span className="hidden sm:inline text-white/30">•</span>
                        <span>+150 طبيب معتمد</span>
                        <span className="hidden sm:inline text-white/30">•</span>
                        <span>استشارة ذكية مجانية 24/7</span>
                    </div>
                </div>
            </section>

            {/* Core Services (3 Clean Cards) */}
            <section className="py-16 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CORE_SERVICES.map((srv, idx) => {
                            const Icon = srv.icon;
                            return (
                                <Reveal key={idx} delay={idx * 80}>
                                    <Link
                                        to={srv.linkTo}
                                        className="h-full p-7 rounded-3xl bg-white/95 backdrop-blur-xs border border-white/80 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="w-12 h-12 bg-emerald-50 text-[#0f6848] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#0f6848] group-hover:text-white transition-colors">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h2 className="font-extrabold text-slate-900 text-lg mb-2 font-almarai">
                                                {srv.title}
                                            </h2>
                                            <p className="text-sm text-slate-500 leading-relaxed mb-5">
                                                {srv.desc}
                                            </p>
                                        </div>
                                        <span className="text-[#0f6848] font-bold text-xs inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                            <span>{srv.linkText}</span>
                                            <ArrowLeft className="w-4 h-4" />
                                        </span>
                                    </Link>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Medicines */}
            {(loadingFeatured || featuredMedicines.length > 0) && (
                <section className="py-16 bg-white/30 backdrop-blur-[2px] border-t border-white/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Reveal className="flex items-center justify-between gap-4 mb-10">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold font-almarai text-slate-900 m-0">
                                    أحدث الأدوية المتوفرة
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1 m-0">
                                    أدوية أصلية جاهزة للطلب والتوصيل السريع
                                </p>
                            </div>
                            <Link
                                to="/medicines"
                                className="btn-outline-main px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                            >
                                <span>عرض الكل</span>
                                <ArrowLeft className="w-3.5 h-3.5" />
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
                                        onAddToCart={(m, qty = 1) => addToCart(m, qty)}
                                        onQuickView={setQuickViewMed}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Featured Doctors */}
            {featuredDoctors.length > 0 && (
                <section className="py-16 bg-transparent border-t border-emerald-900/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Reveal className="flex items-center justify-between gap-4 mb-10">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold font-almarai text-slate-900 m-0">
                                    نخبة الأطباء والاستشاريين
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1 m-0">
                                    احجز موعد عيادتك بسهولة مع أطباء معتمدين
                                </p>
                            </div>
                            <Link
                                to="/doctors"
                                className="btn-outline-main px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                            >
                                <span>عرض الكل</span>
                                <ArrowLeft className="w-3.5 h-3.5" />
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

            {/* Simple FAQ Section */}
            <section className="py-16 bg-white/30 backdrop-blur-[2px] border-t border-white/60">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal className="text-center mb-10">
                        <h2 className="text-xl sm:text-2xl font-extrabold font-almarai text-slate-900 mb-1.5">
                            الأسئلة الشائعة
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm m-0">
                            إجابات مختصرة لأهم الاستفسارات
                        </p>
                    </Reveal>

                    <div className="space-y-3">
                        {FAQS.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                                        isOpen
                                            ? 'border-emerald-300 bg-white/95'
                                            : 'border-white/80 bg-white/90 hover:border-emerald-200'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                        className="w-full px-5 py-4 text-right flex items-center justify-between gap-4 cursor-pointer"
                                    >
                                        <span className="font-bold text-sm text-slate-800 font-almarai">
                                            {faq.q}
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180 text-[#0f6848]' : ''
                                            }`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-emerald-100/70 pt-3 animate-fadeIn">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Clean Guest CTA Banner (shown only when not logged in) */}
            {!user && (
                <section className="py-12 bg-transparent px-4 sm:px-6 lg:px-8 border-t border-emerald-900/5">
                    <div className="max-w-5xl mx-auto hero-mesh rounded-3xl py-12 px-6 sm:px-10 text-center relative overflow-hidden text-white shadow-lg">
                        <div className="max-w-xl mx-auto relative z-10">
                            <h2 className="text-2xl sm:text-3xl font-extrabold font-almarai mb-3 text-white">
                                أنشئ حسابك المجاني في صيدليتي
                            </h2>
                            <p className="text-sm text-emerald-50/90 mb-6 leading-relaxed">
                                احفظ بيانات التوصيل وتابع طلباتك وحجوزاتك الطبية من مكان واحد.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    to="/register"
                                    className="bg-white text-[#0f6848] hover:bg-emerald-50 font-extrabold px-7 py-3 text-sm rounded-xl shadow-md transition-all"
                                >
                                    حساب جديد مجاناً
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-white/10 hover:bg-white/20 border border-white/40 text-white font-bold px-7 py-3 text-sm rounded-xl transition-all"
                                >
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <MedicineQuickView
                medicine={quickViewMed}
                onClose={() => setQuickViewMed(null)}
                onAddToCart={(med, qty = 1) => addToCart(med, qty)}
            />
        </div>
    );
};

export default Home;
