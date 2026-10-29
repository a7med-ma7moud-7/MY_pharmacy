import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  UserCheck, 
  Pill, 
  Calendar, 
  Bot, 
  Star, 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X,
  PackageCheck,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/doctors', label: 'الأطباء', icon: UserCheck },
    { to: '/medicines', label: 'الأدوية', icon: Pill },
    { to: '/appointments', label: 'حجز موعد', icon: Calendar },
    { to: '/ai-chat', label: 'الصيدلي الذكي (AI)', icon: Bot, isHighlight: true },
    { to: '/rate', label: 'التقييمات', icon: Star },
    { to: '/track-order', label: 'تتبع الطلب', icon: PackageCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0f6848]/95 backdrop-blur-md text-white border-b border-emerald-700/40 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group text-decoration-none focus:outline-none">
            <div className="relative">
              <img 
                src="/asset/1.png" 
                alt="صيدليتي" 
                className="w-10 h-10 rounded-full border-2 border-white/60 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 object-cover bg-white" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0f6848] rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold font-almarai tracking-wide text-white group-hover:text-emerald-200 transition-colors">
                صيدليتي
              </span>
              <span className="text-[10px] text-emerald-200/90 font-medium -mt-1 hidden sm:block">
                رعايتك الصحية الذكية
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                    active
                      ? 'bg-white text-[#0f6848] shadow-md shadow-emerald-950/20 font-bold'
                      : link.isHighlight
                      ? 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/35 border border-emerald-400/30'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#0f6848]' : link.isHighlight ? 'text-yellow-300 animate-pulse' : 'text-emerald-200'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Action Buttons: Cart & Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white px-3.5 py-2 rounded-xl border border-white/20 transition-all shadow-sm group"
              title="سلة المشتريات"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">السلة</span>
              {totalItems > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-white text-[#0f6848] font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-50 shadow-md transition-all active:scale-95 border border-emerald-100"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f6848] flex items-center justify-center text-xs font-black">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl py-2 z-50 text-gray-800 border border-gray-100 animate-fadeIn divide-y divide-gray-50">
                    <div className="px-4 py-2.5 bg-gray-50/70">
                      <p className="text-xs text-gray-400 font-medium">تسجيل الدخول باسم</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === 'admin' && (
                        <a
                          href="http://localhost:8080/admin/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50 transition-colors font-semibold"
                        >
                          <ShieldAlert className="w-4 h-4 text-emerald-600" />
                          <span>لوحة الإدارة</span>
                        </a>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-right flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-transparent hover:bg-white/10 text-white text-sm font-bold px-3.5 py-2 rounded-xl transition-all border border-white/30"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-400 hover:bg-emerald-300 text-[#0f4e36] text-sm font-black px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu and cart button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
              title="السلة"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c5339] border-t border-emerald-600/50 px-4 pt-3 pb-6 space-y-1.5 shadow-2xl animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-semibold transition-all ${
                  active 
                    ? 'bg-white text-[#0f6848] font-bold shadow-md' 
                    : link.isHighlight
                    ? 'bg-emerald-500/20 text-emerald-200'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#0f6848]' : link.isHighlight ? 'text-yellow-300' : 'text-emerald-300'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-3 border-t border-emerald-600/50 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-emerald-200 font-bold px-2 py-1 text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>مرحباً، {user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <a
                    href="http://localhost:8080/admin/dashboard"
                    className="flex items-center justify-center gap-2 bg-emerald-500/30 hover:bg-emerald-500/40 text-white py-2.5 rounded-xl text-sm font-bold border border-emerald-400/30"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-200" />
                    <span>لوحة الإدارة</span>
                  </a>
                )}
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 bg-rose-600/90 hover:bg-rose-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center border border-white/60 text-white hover:bg-white/10 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-emerald-400 hover:bg-emerald-300 text-[#0f4e36] py-2.5 rounded-xl text-sm font-black shadow-md transition-colors"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
