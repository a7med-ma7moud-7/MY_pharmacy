import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ChevronLeft, Heart, ArrowUp, ShieldCheck, Clock, Sparkles } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-[#162029] via-[#0f171e] to-[#0a0f14] text-white pt-16 pb-10 border-t border-emerald-950/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Feature Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12 mb-12 border-b border-gray-800/80">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-gray-200 m-0">أدوية مرخصة 100%</h5>
              <p className="text-xs text-gray-400 mt-0.5 m-0">موثوقة ومسجلة بوزارة الصحة</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-gray-200 m-0">خدمة عملاء 24/7</h5>
              <p className="text-xs text-gray-400 mt-0.5 m-0">واستشارات ذكية في أي وقت</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-gray-200 m-0">توصيل منزلي سريع</h5>
              <p className="text-xs text-gray-400 mt-0.5 m-0">إلى باب منزلك بأمان</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* About */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/asset/1.png" 
                alt="صيدليتي" 
                className="w-10 h-10 rounded-full border-2 border-emerald-500/60 shadow-lg object-cover bg-white" 
              />
              <div>
                <h3 className="text-2xl font-extrabold font-almarai text-white m-0 tracking-wide">
                  صيدليتي
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">منصة الرعاية الصحية المتكاملة</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              منصتك الرائدة في مصر لطلب وتوصيل الأدوية الموثوقة، وحجز كشوفات الأطباء والاستشاريين في كافة التخصصات، مع مساعد طبي بالذكاء الاصطناعي للإجابة على استفساراتك فوراً.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                متاح الآن لخدمتك أونلاين
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
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
                { to: '/track-order', label: 'متابعة وتتبع طلبك' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.to} 
                    className="text-gray-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all hover:-translate-x-1 duration-200"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-emerald-500/70" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-bold font-almarai text-white mb-4 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:right-0 after:w-8 after:h-0.5 after:bg-emerald-500 after:rounded-full">
              تواصل معنا
            </h4>
            <ul className="space-y-3.5 text-sm text-gray-400">
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="group-hover:text-gray-300 transition-colors">info@pharmacy-app.com</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span dir="ltr" className="group-hover:text-gray-300 transition-colors font-mono">+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="group-hover:text-gray-300 transition-colors">القاهرة، جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Back to Top */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="m-0 flex items-center gap-1.5">
            <span>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} صيدليتي. صُمم بكل</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>لرعايتكم وراحتكم.</span>
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-300 border border-white/10 transition-all active:scale-95"
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
