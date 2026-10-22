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
  Truck,
  HeartPulse,
  ArrowLeft
} from 'lucide-react';

const Home = () => {
  const stats = [
    { value: '+150', label: 'طبيب واستشاري معتمد', icon: UserCheck },
    { value: '+1,200', label: 'دواء ومستحضر مرخص', icon: Pill },
    { value: '24/7', label: 'استشارات بالذكاء الاصطناعي', icon: Clock },
    { value: '100%', label: 'أدوية أصلية وموثقة', icon: ShieldCheck },
  ];

  const features = [
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

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 px-5 py-2 rounded-full text-white text-sm font-semibold mb-6 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>المنصة الرائدة للرعاية الصحية والصيدلية في مصر</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold font-almarai mb-6 leading-tight text-white drop-shadow-sm">
            رعايتك الصحية وأدويتك <br />
            <span className="text-emerald-200">في مكان واحد بكل سهولة</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-10 font-normal leading-relaxed max-w-2xl mx-auto">
            منصة صيدليتي توفر لك دليلاً شاملاً لأفضل الأطباء، وصيدلية متكاملة أونلاين، ومساعد ذكاء اصطناعي طبي يجيبك فوراً.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/medicines"
              className="bg-white text-main hover:bg-emerald-50 hover:scale-105 font-bold px-8 py-3.5 rounded-full shadow-xl text-base md:text-lg transition-all inline-flex items-center gap-2"
            >
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>اطلب دواءك الآن</span>
            </Link>
            <Link
              to="/doctors"
              className="bg-white/10 backdrop-blur-md border-2 border-white hover:bg-white hover:text-main font-bold px-8 py-3.5 rounded-full text-base md:text-lg text-white transition-all inline-flex items-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>استشر طبيباً متخصصاً</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Stats Counter Strip */}
      <section className="py-8 bg-white border-b border-gray-100 shadow-sm relative -mt-8 mx-4 sm:mx-8 md:mx-auto max-w-6xl rounded-2xl z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 text-center divide-x divide-x-reverse divide-gray-100">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-2 flex flex-col items-center">
                <div className="p-2.5 bg-emerald-50 text-main rounded-xl mb-2">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-gray-900 font-almarai">{s.value}</div>
                <div className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Services Row */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold font-almarai text-gray-900 mb-2">
              خدماتنا الطبية المتكاملة
            </h2>
            <p className="text-gray-500 text-sm">
              نوفر لك حلولاً سريعة وموثوقة لتلبية كافة احتياجاتك العلاجية والصحية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm card-hover flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-100/70 text-main rounded-2xl flex items-center justify-center mb-4">
                  <UserCheck className="w-7 h-7 text-emerald-700" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-2 font-almarai">نخبة الأطباء والاستشاريين</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  احجز موعد كشفك مع كبار الأطباء في كافة التخصصات الطبية، واستفد من تقييمات وتجارب المرضى الحقيقية.
                </p>
              </div>
              <Link to="/doctors" className="text-main font-bold text-sm inline-flex items-center gap-1 hover:text-emerald-700">
                <span>تصفح الأطباء وحجز موعد</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm card-hover flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-100/70 text-main rounded-2xl flex items-center justify-center mb-4">
                  <Pill className="w-7 h-7 text-emerald-700" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-2 font-almarai">صيدلية متكاملة أونلاين</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  جميع الأدوية الأصلية والمستلزمات الطبية متوفرة بأسعار معتمدة، مع خيارات توصيل منزلي سريع وآمن.
                </p>
              </div>
              <Link to="/medicines" className="text-main font-bold text-sm inline-flex items-center gap-1 hover:text-emerald-700">
                <span>تصفح قائمة الأدوية</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm card-hover flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-100/70 text-main rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-emerald-700" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-2 font-almarai">الصيدلي الذكي (AI) 24/7</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  استفسر في أي لحظة عن الجرعات، التفاعلات الدوائية، أو البدائل، وسيقوم المساعد الذكي بإرشادك فوراً.
                </p>
              </div>
              <Link to="/ai-chat" className="text-main font-bold text-sm inline-flex items-center gap-1 hover:text-emerald-700">
                <span>ابدأ الاستشارة الذكية</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold font-almarai text-gray-900 mb-4">
              مميزات منصة صيدليتي
            </h2>
            <p className="text-gray-600 text-base">
              نظام تقني متطور يجمع بين سهولة الاستخدام للمرضى، والكفاءة الاحترافية لإدارة الصيدليات والعيادات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="feature-box">
                  <div className="text-main mb-6">
                    <Icon className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold font-almarai text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0f6848] to-[#10ac84] relative overflow-hidden text-white">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-almarai mb-6 text-white">
            ابدأ في استخدام منصة صيدليتي اليوم
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            انضم الآن لآلاف المرضى والأطباء والصيادلة واستمتع بتجربة رعاية صحية رقمية استثنائية وسريعة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-main hover:bg-emerald-50 hover:scale-105 font-bold px-8 py-3.5 text-base md:text-lg rounded-full shadow-lg transition-all"
            >
              سجّل حسابك الآن مجاناً
            </Link>
            <Link
              to="/login"
              className="bg-white/10 backdrop-blur-md border-2 border-white hover:bg-white hover:text-main text-white font-bold px-8 py-3.5 text-base md:text-lg rounded-full transition-all"
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
