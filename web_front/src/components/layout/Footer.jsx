import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ChevronLeft } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1e272e] text-white pt-14 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/asset/1.png" alt="صيدليتي" className="w-9 h-9 rounded-full" />
              <h3 className="text-2xl font-bold font-almarai text-white m-0">صيدليتي</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة متكاملة لإدارة الصيدليات وتقديم أفضل الخدمات الطبية والصيدلانية للمرضى والعملاء في كل مكان.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold font-almarai text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-emerald-500" />
                  <span>الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-emerald-500" />
                  <span>دليل الأطباء</span>
                </Link>
              </li>
              <li>
                <Link to="/medicines" className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-emerald-500" />
                  <span>قائمة الأدوية المتوفرة</span>
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-emerald-500" />
                  <span>حجز موعد فحص</span>
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-emerald-500" />
                  <span>متابعة وتتبع الطلب</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-bold font-almarai text-white mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>info@pharmacy-app.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span dir="ltr">+123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>القاهرة، مصر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-400">
          <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} صيدليتي - MY Pharmacy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
