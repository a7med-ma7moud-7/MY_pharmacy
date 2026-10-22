import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/doctors', label: 'الأطباء', icon: UserCheck },
    { to: '/medicines', label: 'الأدوية', icon: Pill },
    { to: '/appointments', label: 'حجز موعد', icon: Calendar },
    { to: '/ai-chat', label: 'الصيدلي الذكي (AI)', icon: Bot },
    { to: '/rate', label: 'التقييمات', icon: Star },
    { to: '/track-order', label: 'تتبع الطلب', icon: PackageCheck },
  ];

  return (
    <nav className="bg-main text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group text-decoration-none">
            <img 
              src="/asset/1.png" 
              alt="صيدليتي" 
              className="w-10 h-10 rounded-full border-2 border-white/40 shadow-sm transition-transform group-hover:scale-105" 
            />
            <span className="text-xl font-bold font-almarai tracking-wide text-white">صيدليتي</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
              className="relative flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3.5 py-2 rounded-lg transition-all"
              title="السلة"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">السلة</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-light-theme text-main font-semibold px-4 py-2 rounded-full hover:bg-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 text-gray-800 border border-gray-100">
                    {user.role === 'admin' && (
                      <a
                        href="http://localhost:8080/admin/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        لوحة الإدارة
                      </a>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-right flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-transparent border border-white/60 hover:bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="bg-secondary-theme hover:bg-secondary-theme/90 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white hover:bg-white/10 rounded-md"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-main border-t border-white/10 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium ${
                  active ? 'bg-white/20 text-white font-bold' : 'text-white/80 hover:bg-white/10 text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/20 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-white/90 font-medium px-2 py-1">مرحباً، {user.name}</div>
                {user.role === 'admin' && (
                  <a
                    href="http://localhost:8080/admin/dashboard"
                    className="flex items-center justify-center gap-2 bg-white/20 text-white py-2 rounded-lg text-sm font-semibold"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    لوحة الإدارة
                  </a>
                )}
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center border border-white text-white py-2 rounded-lg text-sm font-semibold"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-secondary-theme text-white py-2 rounded-lg text-sm font-semibold"
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
