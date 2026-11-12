import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    ChevronLeft,
    Heart,
    ShieldCheck,
    Clock,
    Sparkles,
    Send,
    CheckCircle2,
    HeartPulse,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;
        setSubscribed(true);
        setNewsletterEmail('');
        setTimeout(() => setSubscribed(false), 4500);
    };

    return (
        <footer className="bg-gradient-to-b from-[#0d1c17] via-[#091410] to-[#060d0b] text-white pt-16 pb-10 border-t border-emerald-900/40 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-10 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Top Feature Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12 mb-12 border-b border-white/10">
                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/35 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-sm text-white">أدوية مرخصة 100%</h5>
                            <p className="text-xs text-slate-400 mt-0.5">موثوقة ومسجلة بوزارة الصحة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-teal-500/35 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-sm text-white">خدمة عملاء 24/7</h5>
                            <p className="text-xs text-slate-400 mt-0.5">واستشارات ذكية في أي وقت</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/35 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-sm text-white">توصيل منزلي سريع</h5>
                            <p className="text-xs text-slate-400 mt-0.5">إلى باب منزلك بأمان تام</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
                    {/* About & Newsletter */}
                    <div className="md:col-span-5 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center shadow-lg">
                                <HeartPulse className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold font-almarai text-white tracking-wide">
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
                            <p className="text-xs font-bold text-slate-300 mb-2.5">
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
                                        <Send className="w-3.5 h-3.5 -scale-x-100" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-3">
                        <h4 className="text-base font-bold font-almarai text-white mb-5 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:right-0 after:w-8 after:h-0.5 after:bg-emerald-500 after:rounded-full">
                            روابط سريعة
                        </h4>
                        <ul className="space-y-3 text-sm">
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
                                        className="text-slate-300 hover:text-emerald-300 flex items-center gap-2 transition-all hover:-translate-x-1 duration-200"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-4">
                        <h4 className="text-base font-bold font-almarai text-white mb-5 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:right-0 after:w-8 after:h-0.5 after:bg-emerald-500 after:rounded-full">
                            تواصل معنا
                        </h4>
                        <ul className="space-y-3.5 text-sm text-slate-300">
                            <li className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="group-hover:text-white transition-colors">
                                    info@pharmacy-app.com
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span dir="ltr" className="group-hover:text-white transition-colors font-mono">
                                    +20 100 000 0000
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="group-hover:text-white transition-colors">
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

                {/* Bottom Copyright Bar */}
                <div className="pt-8 pb-10 sm:pb-4 border-t border-white/10 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 text-center">
                    <p className="flex items-center justify-center gap-1.5 m-0">
                        <span>جميع الحقوق محفوظة &copy; {CURRENT_YEAR} صيدليتي. صُمم بكل</span>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>لرعايتكم وراحتكم.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
