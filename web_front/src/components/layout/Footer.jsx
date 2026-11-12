import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    ChevronLeft,
    Heart,
    ArrowUp,
    ShieldCheck,
    Clock,
    Sparkles,
    Send,
    CheckCircle2,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;
        setSubscribed(true);
        setNewsletterEmail('');
        setTimeout(() => setSubscribed(false), 4500);
    };

    return (
        <footer className="bg-gradient-to-b from-[#0f1c18] via-[#0b1512] to-[#070e0c] text-white pt-16 pb-10 border-t border-emerald-950/60 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-10 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Top Feature Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12 mb-12 border-b border-white/10">
                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-sm text-white m-0">أدوية مرخصة 100%</h5>
                            <p className="text-xs text-slate-400 mt-0.5 m-0">موثوقة ومسجلة بوزارة الصحة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-teal-500/30 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-sm text-white m-0">خدمة عملاء 24/7</h5>
                            <p className="text-xs text-slate-400 mt-0.5 m-0">واستشارات ذكية في أي وقت</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-sm text-white m-0">توصيل منزلي سريع</h5>
                            <p className="text-xs text-slate-400 mt-0.5 m-0">إلى باب منزلك بأمان تام</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
                    {/* About & Newsletter */}
                    <div className="md:col-span-5 space-y-5">
                        <div className="flex items-center gap-3">
                            <img
                                src="/asset/1.png"
                                alt="صيدليتي"
                                className="w-11 h-11 rounded-2xl border-2 border-emerald-500/60 shadow-lg object-cover bg-white"
                            />
                            <div>
                                <h3 className="text-2xl font-extrabold font-almarai text-white m-0 tracking-wide">
                                    صيدليتي
                                </h3>
                                <span className="text-xs text-emerald-400 font-semibold">
                                    منصة الرعاية الصحية المتكاملة
                                </span>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            منصتك الرائدة في مصر لطلب وتوصيل الأدوية الموثوقة، وحجز كشوفات الأطباء والاستشاريين في كافة التخصصات، مع مساعد طبي بالذكاء الاصطناعي للإجابة على استفساراتك فوراً.
                        </p>

                        {/* Newsletter */}
                        <div className="pt-1 max-w-md">
                            <p className="text-xs font-bold text-slate-300 mb-2">
                                اشترك في نشرة النصائح الصحية الأسبوعية:
                            </p>
                            {subscribed ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3 animate-fadeIn">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>شكراً لاشتراكك! ستصلك أحدث النصائح الطبية قريباً.</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="flex gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="أدخل بريدك الإلكتروني..."
                                        className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                                    >
                                        <span>اشتراك</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-3">
                        <h4 className="text-base font-bold font-almarai text-white mb-4 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:right-0 after:w-8 after:h-0.5 after:bg-emerald-500 after:rounded-full">
                            روابط سريعة
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {[
                                { to: '/', label: 'الصفحة الرئيسية' },
                                { to: '/doctors', label: 'دليل الأطباء والكشوفات' },
                                { to: '/medicines', label: 'صيدلية الأدوية والمستلزمات' },
                                { to: '/appointments', label: 'حجز موعد عيادة' },
                                { to: '/ai-chat', label: 'الصيدلي الذكي (AI)' },
                                { to: '/orders/track', label: 'متابعة وتتبع طلبك' },
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        className="text-slate-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all hover:-translate-x-1 duration-200"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 text-emerald-500/80" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-4">
                        <h4 className="text-base font-bold font-almarai text-white mb-4 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:right-0 after:w-8 after:h-0.5 after:bg-emerald-500 after:rounded-full">
                            تواصل معنا
                        </h4>
                        <ul className="space-y-3.5 text-sm text-slate-400">
                            <li className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="group-hover:text-slate-200 transition-colors">
                                    info@pharmacy-app.com
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span dir="ltr" className="group-hover:text-slate-200 transition-colors font-mono">
                                    +20 100 000 0000
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="group-hover:text-slate-200 transition-colors">
                                    القاهرة، جمهورية مصر العربية
                                </span>
                            </li>
                        </ul>

                        <div className="mt-5">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                متاح الآن لخدمتك أونلاين
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar with Back to Top */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p className="m-0 flex items-center gap-1.5">
                        <span>جميع الحقوق محفوظة &copy; {CURRENT_YEAR} صيدليتي. صُمم بكل</span>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>لرعايتكم وراحتكم.</span>
                    </p>

                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 transition-all active:scale-95 cursor-pointer"
                        title="العودة للأعلى"
                    >
                        <span>للأعلى</span>
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
