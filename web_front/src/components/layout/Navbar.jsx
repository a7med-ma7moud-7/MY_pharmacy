import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
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
    Truck,
    Sparkles,
} from 'lucide-react';

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { totalCount, setIsCartOpen } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showPromoBar, setShowPromoBar] = useState(true);
    const dropdownRef = useRef(null);

    // Detect scroll for navbar elevation & reading progress bar
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 16);
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(docHeight > 0 ? Math.min(100, Math.round((y / docHeight) * 100)) : 0);
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
        <>
            {/* Top Promotional Announcement Strip */}
            {showPromoBar && (
                <div className="bg-[#06281c] text-emerald-100/95 border-b border-white/10 text-[11px] sm:text-xs py-1.5 px-4 relative z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4 mx-auto sm:mx-0">
                            <span className="inline-flex items-center gap-1.5 font-bold">
                                <Truck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                <span>توصيل مجاني للطلبات فوق 300 ج.م</span>
                            </span>
                            <span className="hidden md:inline text-white/25">|</span>
                            <Link
                                to="/ai-chat"
                                className="hidden md:inline-flex items-center gap-1.5 text-emerald-200 hover:text-white font-semibold transition-colors"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                <span>استشر الصيدلي الذكي مجاناً 24/7</span>
                            </Link>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPromoBar(false)}
                            aria-label="إغلاق الشريط الترويجي"
                            className="text-emerald-300/70 hover:text-white p-0.5 rounded transition-colors cursor-pointer shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <header
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-[#093d2b]/95 backdrop-blur-xl shadow-xl shadow-emerald-950/20 border-b border-white/10'
                        : 'bg-gradient-to-r from-[#073323] via-[#0f6848] to-[#117a55] shadow-md'
                } text-white`}
            >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <Link to="/" onClick={closeMenus} className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 group-hover:scale-105 group-hover:bg-white/20 transition-all shadow-inner">
                            <HeartPulse className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-xl tracking-wide font-almarai leading-none text-white">
                                صيدليتي
                            </span>
                            <span className="text-[10px] text-emerald-200 font-semibold tracking-wider mt-0.5">
                                رعاية طبية متكاملة
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={closeMenus}
                                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
                                        active
                                            ? 'bg-white text-[#0f6848] shadow-md font-bold scale-[1.02]'
                                            : 'text-white/90 hover:bg-white/15 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? 'text-[#0f6848]' : 'text-emerald-200'}`} />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side Actions: Cart & Auth */}
                    <div className="flex items-center gap-2.5">
                        {/* Cart Button */}
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            aria-label="سلة المشتريات"
                            className="relative px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            <ShoppingBag className="w-5 h-5 text-white" />
                            <span className="hidden sm:inline text-xs font-bold text-white">السلة</span>
                            {totalCount > 0 && (
                                <span className="bg-rose-500 text-white text-[11px] font-black rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-sm animate-scaleIn">
                                    {totalCount}
                                </span>
                            )}
                        </button>

                        {/* User Menu (Desktop) */}
                        <div className="hidden lg:flex items-center gap-2">
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-xl text-sm font-semibold border border-white/20 transition-all cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-emerald-300 text-[#093d2b] font-black text-xs flex items-center justify-center">
                                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="max-w-[110px] truncate">{user.name}</span>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform duration-200 ${
                                                userDropdownOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {userDropdownOpen && (
                                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 text-slate-800 border border-slate-100 z-50 animate-slideDown">
                                            <div className="px-4 py-2.5 border-b border-slate-100">
                                                <p className="text-xs font-extrabold text-slate-900 truncate m-0">{user.name}</p>
                                                <p className="text-[11px] text-slate-400 truncate m-0">{user.email}</p>
                                            </div>

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
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        onClick={closeMenus}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/15 border border-white/30 transition-all"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMenus}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#0f6848] hover:bg-emerald-50 shadow-sm transition-all"
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
                            className="lg:hidden p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white focus:outline-none cursor-pointer"
                            aria-label="القائمة الرئيسية"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#093d2b]/98 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-5 space-y-1.5 animate-slideDown shadow-inner">
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
                                        ? 'bg-white text-[#0f6848] font-bold shadow-sm'
                                        : 'text-white/90 hover:bg-white/10'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? 'text-[#0f6848]' : 'text-emerald-300'}`} />
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
                                        <p className="text-[11px] text-emerald-200 truncate m-0">{user.email}</p>
                                    </div>
                                </div>

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
                                    className="text-center py-2.5 rounded-xl text-xs font-bold bg-white text-[#0f6848]"
                                >
                                    إنشاء حساب
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Smooth Scroll Reading Progress Line */}
            {scrollProgress > 1 && (
                <div className="h-[2.5px] w-full bg-black/15 overflow-hidden">
                    <div
                        style={{ width: `${scrollProgress}%` }}
                        className="h-full bg-gradient-to-l from-amber-300 via-emerald-300 to-teal-400 transition-[width] duration-150 ease-out"
                    />
                </div>
            )}
            </header>
        </>
    );
};

export default Navbar;
