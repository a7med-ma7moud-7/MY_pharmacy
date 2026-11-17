import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggleButton from '../common/ThemeToggleButton';
import LanguageToggleButton from '../common/LanguageToggleButton';
import {
    LayoutDashboard,
    UserCog,
    BriefcaseMedical,
    Star,
    Users,
    MessageSquare,
    FolderHeart,
    FileSpreadsheet,
    ClipboardList,
    LogOut,
    HeartPulse,
    Menu,
    X,
    ExternalLink,
    ShieldCheck,
    Loader2,
} from 'lucide-react';

const PORTAL_NAV = [
    { name: 'لوحة التحكم', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'ملفي المهني', path: '/doctor/profile', icon: UserCog },
    { name: 'الحالات المعالجة', path: '/doctor/cases', icon: BriefcaseMedical },
    { name: 'تقييمات المرضى', path: '/doctor/reviews', icon: Star },
    { name: 'مرضاي', path: '/doctor/patients', icon: Users },
    { name: 'محادثات المرضى', path: '/doctor/chat', icon: MessageSquare },
    { name: 'السجلات الطبية', path: '/doctor/records', icon: FolderHeart },
    { name: 'الروشتات الطبية', path: '/doctor/prescriptions', icon: FileSpreadsheet },
    { name: 'سجل المتابعات', path: '/doctor/follow-ups', icon: ClipboardList },
];

export default function DoctorPortalLayout() {
    const { user, isDoctor, loading, logout } = useAuth();
    const { dir, isEn } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-9 h-9 text-[#0f6848] animate-spin" />
                <span className="text-xs font-bold text-slate-500">جاري التحقق من صلاحيات الطبيب...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isDoctor) {
        return <Navigate to="/" replace />;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const activeTitle =
        PORTAL_NAV.find((item) => location.pathname.startsWith(item.path))?.name || 'بوابة الطبيب';

    return (
        <div className="min-h-screen flex bg-transparent" dir={dir}>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/55 backdrop-blur-xs lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 ${isEn ? 'left-0 border-r' : 'right-0 border-l'} z-50 h-screen w-72 shrink-0 bg-gradient-to-b from-[#06251b] via-[#091f17] to-[#05130e] text-white flex flex-col border-white/10 shadow-2xl transition-transform duration-300 ${
                    mobileOpen
                        ? 'translate-x-0'
                        : isEn
                        ? '-translate-x-full lg:translate-x-0'
                        : 'translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Brand Header */}
                <div className="h-18 px-5 flex items-center justify-between border-b border-white/10 bg-emerald-500/5">
                    <Link to="/doctor/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f6848] to-[#10ac84] border border-white/20 flex items-center justify-center shadow-lg">
                            <HeartPulse className="w-5 h-5 text-emerald-200" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold font-almarai text-white m-0 leading-tight">
                                صيدليتي — الأطباء
                            </h2>
                            <span className="text-[11px] text-emerald-300 font-bold">
                                البوابة الطبية المعتمدة
                            </span>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-1.5 rounded-xl text-slate-300 hover:bg-white/10 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Doctor Identity Card */}
                <div className="px-4 py-4 border-b border-white/10">
                    <div className="p-3.5 rounded-2xl bg-white/6 border border-white/10 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 font-black text-base flex items-center justify-center shrink-0 overflow-hidden">
                            {user.doctor_image_url ? (
                                <img
                                    src={user.doctor_image_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                (user.name || 'د').charAt(0)
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-white truncate m-0">
                                {user.name}
                            </p>
                            <p className="text-[11px] text-emerald-300 font-semibold truncate m-0">
                                {user.doctor_specialty || 'طبيب معتمد'}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-200/90 mt-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>حساب موثّق ونشط</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {PORTAL_NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-gradient-to-l from-[#0f6848] to-[#10ac84]/80 text-white shadow-md border-r-3 border-emerald-300'
                                            : 'text-slate-300 hover:bg-white/8 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}

                    {user.doctor_id && (
                        <div className="pt-3 mt-3 border-t border-white/10">
                            <Link
                                to={`/doctors/${user.doctor_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 transition-all"
                            >
                                <span>معاينة ملفي العام بالموقع</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-rose-500/15 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-400/25 transition-all cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-emerald-900/10 px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-base sm:text-lg font-extrabold font-almarai text-slate-900 m-0">
                                {activeTitle}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <LanguageToggleButton variant="surface" />
                        <ThemeToggleButton variant="surface" showLabel />
                        <Link
                            to="/"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0f6848] bg-white border border-slate-200 hover:border-emerald-300 transition-all"
                        >
                            الموقع الرئيسي
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
