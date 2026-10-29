import React from 'react';
import { Link } from 'react-router-dom';
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
  CheckCircle2,
  Calendar
} from 'lucide-react';

const Home = () => {
  const stats = [
    { value: '+150', label: 'طبيب واستشاري معتمد', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: '+1,200', label: 'دواء ومستحضر مرخص', icon: Pill, color: 'text-teal-600', bg: 'bg-teal-50' },
    { value: '24/7', label: 'استشارات بالذكاء الاصطناعي', icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { value: '100%', label: 'أدوية أصلية وموثقة', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const features = [
    {
      icon: Pill,
      title: 'إدارة المخزون الذكية',
      desc: 'تتبع مخزون الأدوية بسهولة وتلقي تنبيهات عند انخفاض المخزون لضمان توافر الأدوية دائمًا للمرضى.',
      accent: 'border-emerald-500/20 hover:border-emerald-500',
    },
    {
      icon: FileText,
      title: 'الوصفات الطبية الإلكترونية',
      desc: 'سجل وتتبع الوصفات الطبية والتأكد من صرف الأدوية الصحيحة للمرضى بدقة وبشكل آمن تماماً.',
      accent: 'border-teal-500/20 hover:border-teal-500',
    },
    {
      icon: BarChart3,
      title: 'تقارير وإحصائيات دقيقة',
      desc: 'مراقبة أداء الصيدلية من خلال تقارير مفصلة ورسوم بيانية تساعدك في اتخاذ القرارات المناسبة.',
      accent: 'border-cyan-500/20 hover:border-cyan-500',
    },
    {
      icon: Users,
      title: 'سجل طبي متكامل للعملاء',
      desc: 'تسجيل بيانات العملاء وتاريخهم الطبي وتقديم خدمة شخصية راقية بناءً على معرفة احتياجاتهم الصحية.',
      accent: 'border-emerald-500/20 hover:border-emerald-500',
    },
    {
      icon: Bell,
      title: 'نظام التنبيهات الفوري',
      desc: 'تنبيهات تلقائية للمواعيد وتواريخ انتهاء الصلاحية ومتابعة الشحنات والطلبات اليومية بكل يسر.',
      accent: 'border-teal-500/20 hover:border-teal-500',
    },
    {
      icon: Smartphone,
      title: 'منصة متوافقة مع كل الأجهزة',
      desc: 'وصول سهل وسريع لمنصتك من أي مكان وفي أي وقت عبر الهاتف المحمول أو التابلت أو الحاسوب.',
      accent: 'border-cyan-500/20 hover:border-cyan-500',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="hero-section text-center relative overflow-hidden py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 px-5 py-2 rounded-full text-white text-xs sm:text-sm font-bold mb-8 backdrop-blur-md shadow-lg animate-fadeIn">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>المنصة الرائدة للرعاية الصحية والصيدلية في مصر</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-almarai mb-6 leading-tight text-white drop-shadow-md">
            رعايتك الصحية وأدويتك <br />
            <span className="text-emerald-200">في مكان واحد بكل سهولة وأمان</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white/95 mb-10 font-normal leading-relaxed max-w-2xl mx-auto">
            منصة صيدليتي توفر لك دليلاً شاملاً لأفضل الأطباء، وصيدلية متكاملة أونلاين، ومساعد ذكاء اصطناعي طبي يجيبك فوراً.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/medicines"
              className="bg-white text-[#0f6848] hover:bg-emerald-50 hover:scale-105 active:scale-95 font-extrabold px-8 py-3.5 rounded-full shadow-2xl text-base md:text-lg transition-all inline-flex items-center gap-2.5"
            >
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>اطلب دواءك الآن</span>
            </Link>
            <Link
              to="/doctors"
              className="bg-white/10 backdrop-blur-md border-2 border-white/80 hover:bg-white hover:text-[#0f6848] active:scale-95 font-bold px-8 py-3.5 rounded-full text-base md:text-lg text-white transition-all inline-flex items-center gap-2.5 shadow-lg"
            >
              <UserCheck className="w-5 h-5" />
              <span>استشر طبيباً متخصصاً</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Stats Counter Strip */}
      <section className="relative z-20 -mt-10 sm:-mt-12 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100/80 p-6 md:p-8 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center pt-4 md:pt-0 group">
                  <div className={`p-3.5 ${s.bg} rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-almarai tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Services Row */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              الخدمات المتاحة
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-almarai text-gray-900 mb-3">
              خدماتنا الطبية المتكاملة
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed m-0">
              نوفر لك حلولاً فورية وموثوقة لتلبية كافة احتياجاتك العلاجية والصحية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-50 text-[#0f6848] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <UserCheck className="w-8 h-8 text-[#0f6848]" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-xl mb-3 font-almarai">
                  نخبة الأطباء والاستشاريين
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  احجز موعد كشفك مع كبار الأطباء في كافة التخصصات الطبية، واستفد من تقييمات وتجارب المرضى الحقيقية بكل شفافية.
                </p>
              </div>
              <Link 
                to="/doctors" 
                className="text-[#0f6848] font-bold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                <span>تصفح الأطباء وحجز موعد</span>
                <ArrowLeft className="w-4 h-4 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-50 text-[#0f6848] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Pill className="w-8 h-8 text-[#0f6848]" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-xl mb-3 font-almarai">
                  صيدلية متكاملة أونلاين
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  جميع الأدوية الأصلية والمستلزمات الطبية متوفرة بأسعار معتمدة، مع خيارات توصيل منزلي سريع وآمن حتى باب بيتك.
                </p>
              </div>
              <Link 
                to="/medicines" 
                className="text-[#0f6848] font-bold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                <span>تصفح قائمة الأدوية</span>
                <ArrowLeft className="w-4 h-4 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-emerald-50 text-[#0f6848] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Sparkles className="w-8 h-8 text-[#0f6848]" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-xl mb-3 font-almarai">
                  الصيدلي الذكي (AI) 24/7
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  استفسر في أي لحظة عن الجرعات، التفاعلات الدوائية، أو البدائل، وسيقوم المساعد الذكي بإرشادك فوراً وبدقة.
                </p>
              </div>
              <Link 
                to="/ai-chat" 
                className="text-[#0f6848] font-bold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                <span>ابدأ الاستشارة الذكية</span>
                <ArrowLeft className="w-4 h-4 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              لماذا صيدليتي؟
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-almarai text-gray-900 mb-4">
              مميزات منصة صيدليتي
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              نظام تقني متطور يجمع بين سهولة الاستخدام للمرضى، والكفاءة الاحترافية لإدارة الصيدليات والعيادات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className={`p-7 rounded-3xl bg-slate-50/60 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300 group hover:-translate-y-1.5`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-[#0f6848] group-hover:text-white transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold font-almarai text-gray-800 mb-3 group-hover:text-[#0f6848] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed m-0">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0f6848] via-[#10ac84] to-[#0f6848] relative overflow-hidden text-white">
        <div className="absolute top-0 right-10 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-900/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-almarai mb-6 text-white drop-shadow-sm">
            ابدأ في استخدام منصة صيدليتي اليوم
          </h2>
          <p className="text-base md:text-xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed">
            انضم الآن لآلاف المرضى والأطباء واستمتع بتجربة رعاية صحية رقمية استثنائية وسريعة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-[#0f6848] hover:bg-emerald-50 hover:scale-105 active:scale-95 font-extrabold px-9 py-3.5 text-base md:text-lg rounded-full shadow-2xl transition-all"
            >
              سجّل حسابك الآن مجاناً
            </Link>
            <Link
              to="/login"
              className="bg-white/10 backdrop-blur-md border-2 border-white/80 hover:bg-white hover:text-[#0f6848] text-white font-bold px-9 py-3.5 text-base md:text-lg rounded-full transition-all active:scale-95 shadow-lg"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
