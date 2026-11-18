import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggleButton from '../common/ThemeToggleButton';
import LanguageToggleButton from '../common/LanguageToggleButton';
import {
    ShoppingBag,
    User,
    LogOut,
    Menu,
    X,
    Stethoscope,
    Pill,
    Calendar,
    Bot,
    PackageCheck,
    Home,
    LayoutDashboard,
    ChevronDown,
    HeartPulse,
    MessageSquare,
} from 'lucide-react';

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174';

const Navbar = () => {
    const { user, logout, isAdmin, isDoctor } = useAuth();
    const { totalCount, setIsCartOpen } = useCart();
    const { isEn } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    // Detect scroll for navbar elevation
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 16);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const closeMenus = () => {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        closeMenus();
        navigate('/');
    };

    const navLinks = [
        { name: 'الرئيسية', path: '/', icon: Home },
        { name: 'الأطباء', path: '/doctors', icon: Stethoscope },
        { name: 'الأدوية', path: '/medicines', icon: Pill },
        { name: 'حجز موعد', path: '/appointments', icon: Calendar },
        { name: 'الصيدلي الذكي', path: '/ai-chat', icon: Bot },
        { name: 'تتبع طلبك', path: '/orders/track', icon: PackageCheck },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header
            className={`site-navbar sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-[#093d2b]/95 dark:bg-[#051c14]/95 backdrop-blur-xl shadow-lg border-b border-white/10'
                    : 'bg-gradient-to-r from-[#083826] via-[#0f6848] to-[#117a55] dark:from-[#041d14] dark:via-[#083424] dark:to-[#0b4631] shadow-sm dark:border-b dark:border-emerald-500/15'
            } text-white`}
        >
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8">
                <div className="flex items-center justify-between gap-3 xl:gap-6 h-[68px]">
                    {/* Brand Logo */}
                    <Link to="/" onClick={closeMenus} className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-105 group-hover:bg-white/20 transition-all shadow-inner">
                            <HeartPulse className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-xl tracking-wide font-almarai leading-none text-white">
                                صيدليتي
                            </span>
                            <span className="text-[10px] text-emerald-200 font-semibold tracking-wider mt-0.5 whitespace-nowrap">
                                رعاية طبية متكاملة
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Track */}
                    <nav className="hidden lg:flex items-center bg-black/15 dark:bg-white/[0.04] border border-white/12 rounded-full p-1 gap-0.5 backdrop-blur-sm">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={closeMenus}
                                    className={`${isEn ? 'px-2.5 xl:px-3.5 text-xs xl:text-[13px]' : 'px-3 xl:px-4 text-[13px]'} py-1.5 rounded-full font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 ${
                                        active
                                            ? 'keep-light bg-white text-[#0f6848] shadow-sm font-extrabold'
                                            : 'text-white/90 hover:bg-white/12 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`hidden xl:block w-3.5 h-3.5 shrink-0 ${active ? 'keep-light text-[#0f6848]' : 'text-emerald-200/90'}`} />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* End Actions: Unified [Lang | Theme] Capsule, Cart, Divider & Auth */}
                    <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
                        <div className="hidden sm:inline-flex items-center h-9 rounded-full bg-black/15 border border-white/15 p-0.5 backdrop-blur-sm">
                            <LanguageToggleButton variant="capsule" />
                            <span className="w-px h-3.5 bg-white/15" aria-hidden="true" />
                            <ThemeToggleButton variant="capsule" />
                        </div>

                        {/* Cart Button */}
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            aria-label="سلة المشتريات"
                            title="سلة المشتريات"
                            className="relative h-9 px-3 bg-white/12 hover:bg-white/22 rounded-full transition-all border border-white/18 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                            <ShoppingBag className="w-4 h-4 text-white" />
                            <span className="hidden 2xl:inline text-xs font-bold text-white whitespace-nowrap">السلة</span>
                            {totalCount > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-sm animate-scaleIn">
                                    {totalCount}
                                </span>
                            )}
                        </button>

                        <span className="hidden lg:block w-px h-5 bg-white/15 mx-0.5" aria-hidden="true" />

                        {/* User Menu (Desktop) */}
                        <div className="hidden lg:flex items-center gap-1.5">
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        className="flex items-center gap-2 h-9 bg-white/12 hover:bg-white/22 px-3 rounded-full text-xs font-bold border border-white/18 transition-all cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-emerald-300 text-[#093d2b] font-black text-xs flex items-center justify-center">
                                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="max-w-[100px] truncate">{user.name}</span>
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                userDropdownOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {userDropdownOpen && (
                                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 text-slate-800 border border-slate-100 z-50 animate-slideDown`}>
                                            <div className="px-4 py-2.5 border-b border-slate-100">
                                                <p className="text-xs font-extrabold text-slate-900 truncate m-0">{user.name}</p>
                                                <p className="text-[11px] text-slate-400 truncate m-0" dir="ltr">
                                                    {user.phone || user.display_email || user.email}
                                                </p>
                                            </div>

                                            {isDoctor && (
                                                <Link
                                                    to="/doctor/dashboard"
                                                    onClick={closeMenus}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#0f6848] bg-emerald-50/70 hover:bg-emerald-100 transition-colors"
                                                >
                                                    <Stethoscope className="w-4 h-4 text-[#0f6848]" />
                                                    <span>بوابة الطبيب</span>
                                                </Link>
                                            )}

                                            {isAdmin && (
                                                <a
                                                    href={DASHBOARD_URL}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={closeMenus}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#0f6848] transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                                                    <span>لوحة تحكم الإدارة</span>
                                                </a>
                                            )}

                                            {!isDoctor && (
                                                <Link
                                                    to="/my-chats"
                                                    onClick={closeMenus}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#0f6848] transition-colors"
                                                >
                                                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                                                    <span>محادثاتي مع الأطباء</span>
                                                </Link>
                                            )}

                                            <Link
                                                to="/orders/track"
                                                onClick={closeMenus}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#0f6848] transition-colors"
                                            >
                                                <PackageCheck className="w-4 h-4 text-emerald-600" />
                                                <span>متابعة طلباتي</span>
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full text-right flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>تسجيل الخروج</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Link
                                        to="/login"
                                        onClick={closeMenus}
                                        className="h-9 px-3.5 rounded-full text-xs font-bold whitespace-nowrap text-white/95 hover:text-white hover:bg-white/12 inline-flex items-center transition-all"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMenus}
                                        className="keep-light h-9 px-4 rounded-full text-xs font-extrabold whitespace-nowrap bg-white text-[#0f6848] hover:bg-emerald-50 shadow-sm inline-flex items-center transition-all"
                                    >
                                        حساب جديد
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden h-9 w-9 rounded-full bg-white/12 hover:bg-white/22 border border-white/18 text-white flex items-center justify-center focus:outline-none cursor-pointer"
                            aria-label="القائمة الرئيسية"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#093d2b]/98 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-5 space-y-1.5 animate-slideDown shadow-inner">
                    <div className="sm:hidden flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-white/8 border border-white/10">
                        <span className="text-xs font-bold text-emerald-200">اللغة والمظهر</span>
                        <div className="inline-flex items-center h-9 rounded-full bg-black/20 border border-white/15 p-0.5">
                            <LanguageToggleButton variant="capsule" />
                            <span className="w-px h-3.5 bg-white/15" aria-hidden="true" />
                            <ThemeToggleButton variant="capsule" />
                        </div>
                    </div>
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={closeMenus}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? 'keep-light bg-white text-[#0f6848] font-bold shadow-sm'
                                        : 'text-white/90 hover:bg-white/10'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? 'keep-light text-[#0f6848]' : 'text-emerald-300'}`} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-3 mt-2 border-t border-white/15">
                        {user ? (
                            <div className="space-y-2">
                                <div className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-300 text-[#093d2b] font-black text-sm flex items-center justify-center">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-white truncate m-0">{user.name}</p>
                                        <p className="text-[11px] text-emerald-200 truncate m-0" dir="ltr">
                                            {user.phone || user.display_email || user.email}
                                        </p>
                                    </div>
                                </div>

                                {isDoctor ? (
                                    <Link
                                        to="/doctor/dashboard"
                                        onClick={closeMenus}
                                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-200 hover:bg-white/10"
                                    >
                                        <Stethoscope className="w-4 h-4" />
                                        <span>بوابة الطبيب</span>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/my-chats"
                                        onClick={closeMenus}
                                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-200 hover:bg-white/10"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>محادثاتي مع الأطباء</span>
                                    </Link>
                                )}

                                {isAdmin && (
                                    <a
                                        href={DASHBOARD_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={closeMenus}
                                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-200 hover:bg-white/10"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>لوحة تحكم الإدارة</span>
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-200 hover:bg-rose-500 hover:text-white border border-rose-400/30 transition-all cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>تسجيل الخروج</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link
                                    to="/login"
                                    onClick={closeMenus}
                                    className="text-center py-2.5 rounded-xl text-xs font-bold border border-white/30 text-white hover:bg-white/10"
                                >
                                    تسجيل الدخول
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={closeMenus}
                                    className="keep-light text-center py-2.5 rounded-xl text-xs font-bold bg-white text-[#0f6848]"
                                >
                                    إنشاء حساب
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
