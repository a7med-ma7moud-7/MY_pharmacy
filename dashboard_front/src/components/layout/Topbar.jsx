import React, { useState, useEffect, useRef } from 'react';
import {
    Menu,
    ExternalLink,
    ChevronDown,
    LogOut,
    Clock,
    Search,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const QUICK_ROUTES = [
    { label: 'الرئيسية والإحصائيات', path: '/dashboard' },
    { label: 'إدارة الأطباء', path: '/doctors' },
    { label: 'إدارة الأدوية والمخزون', path: '/medicines' },
    { label: 'حجوزات العيادات', path: '/appointments' },
    { label: 'طلبات الشراء', path: '/orders' },
    { label: 'التقارير المالية', path: '/reports' },
    { label: 'إدارة المستخدمين', path: '/users' },
];

const PAGE_TITLES = {
    '/dashboard': 'نظرة عامة على المنظومة',
    '/doctors': 'إدارة الأطباء والعيادات',
    '/medicines': 'إدارة الأدوية والمخزون',
    '/appointments': 'إدارة المواعيد والحجوزات',
    '/orders': 'إدارة طلبات الشراء',
    '/reports': 'التقارير التحليلية والمالية',
    '/users': 'إدارة المستخدمين والصلاحيات',
};

export const Topbar = ({ onToggleCollapse, onToggleMobile }) => {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [quickQuery, setQuickQuery] = useState('');
    const [showQuickResults, setShowQuickResults] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState('');
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setShowQuickResults(true);
            } else if (e.key === 'Escape') {
                setShowQuickResults(false);
                setShowDropdown(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const options = {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            };
            setCurrentDateTime(now.toLocaleDateString('ar-EG', options));
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowQuickResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setShowDropdown(false);
        await logout();
        navigate('/login');
    };

    const filteredRoutes = QUICK_ROUTES.filter((r) =>
        r.label.toLowerCase().includes(quickQuery.trim().toLowerCase())
    );

    const currentTitle = PAGE_TITLES[location.pathname] || 'لوحة التحكم الإدارية';

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                height: 'var(--topbar-height)',
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderBottom: '1px solid var(--slate-200)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                zIndex: 1020,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            }}
        >
            {/* Left side: Toggle + Current Page Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={onToggleMobile}
                    className="mobile-only"
                    aria-label="القائمة"
                    style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--slate-700)',
                    }}
                >
                    <Menu size={22} />
                </button>

                <button
                    onClick={onToggleCollapse}
                    className="desktop-only"
                    aria-label="طي القائمة"
                    title="طي/توسيع القائمة الجانبية"
                    style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--slate-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Menu size={20} />
                </button>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                            }}
                        />
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)' }}>
                            {currentTitle}
                        </span>
                    </div>
                </div>
            </div>

            {/* Center Quick Navigation Search */}
            <div
                ref={searchRef}
                className="desktop-only"
                style={{ position: 'relative', flex: '0 1 320px' }}
            >
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search
                        size={15}
                        style={{
                            position: 'absolute',
                            right: '13px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--slate-400)',
                        }}
                    />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={quickQuery}
                        onFocus={() => setShowQuickResults(true)}
                        onChange={(e) => {
                            setQuickQuery(e.target.value);
                            setShowQuickResults(true);
                        }}
                        placeholder="انتقال سريع لقسم..."
                        style={{
                            width: '100%',
                            padding: '8px 36px 8px 56px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--slate-200)',
                            backgroundColor: 'var(--slate-50)',
                            fontSize: '0.8rem',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            color: 'var(--slate-400)',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--slate-200)',
                            borderRadius: '6px',
                            padding: '1px 6px',
                            pointerEvents: 'none',
                            letterSpacing: '0.3px',
                        }}
                    >
                        Ctrl K
                    </span>
                </div>

                {showQuickResults && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            left: 0,
                            backgroundColor: '#ffffff',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--slate-200)',
                            boxShadow: 'var(--shadow-lg)',
                            padding: '6px',
                            zIndex: 1060,
                            animation: 'fadeInScale 0.18s ease-out',
                        }}
                    >
                        {filteredRoutes.map((route) => (
                            <button
                                key={route.path}
                                type="button"
                                onClick={() => {
                                    navigate(route.path);
                                    setQuickQuery('');
                                    setShowQuickResults(false);
                                }}
                                style={{
                                    width: '100%',
                                    textAlign: 'right',
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    color:
                                        location.pathname === route.path
                                            ? 'var(--primary-700)'
                                            : 'var(--slate-700)',
                                    backgroundColor:
                                        location.pathname === route.path
                                            ? 'var(--primary-50)'
                                            : 'transparent',
                                    display: 'block',
                                }}
                            >
                                {route.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right side: Clock, Website link & Admin Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                    className="desktop-only"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--slate-500)',
                        backgroundColor: 'var(--slate-50)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--slate-200)',
                    }}
                >
                    <Clock size={13} style={{ color: 'var(--primary-600)' }} />
                    <span>{currentDateTime}</span>
                </div>

                <a
                    href={import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173'}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="فتح المتجر الإلكتروني للمستخدمين"
                    className="desktop-only"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--primary-600)',
                        backgroundColor: 'rgba(13, 148, 136, 0.08)',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        textDecoration: 'none',
                        border: '1px solid rgba(13, 148, 136, 0.16)',
                        transition: 'all 0.25s ease',
                    }}
                >
                    <span>المتجر العام</span>
                    <ExternalLink size={13} />
                </a>

                {/* Admin User Profile Dropdown */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#ffffff',
                            border: '1px solid var(--slate-200)',
                            padding: '5px 12px 5px 10px',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                        }}
                    >
                        <div
                            style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                boxShadow: '0 0 8px rgba(13, 148, 136, 0.2)',
                            }}
                        >
                            {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="desktop-only" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-800)', lineHeight: 1.2 }}>
                                {admin?.name || 'مدير النظام'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                                مسؤول رئيسي
                            </span>
                        </div>
                        <ChevronDown
                            size={14}
                            className="desktop-only"
                            style={{
                                color: 'var(--slate-400)',
                                transition: 'transform 0.2s ease',
                                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                            }}
                        />
                    </button>

                    {showDropdown && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                left: 0,
                                width: '220px',
                                backgroundColor: '#ffffff',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-xl)',
                                border: '1px solid var(--slate-200)',
                                padding: '8px',
                                zIndex: 1050,
                                animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                        >
                            <div
                                style={{
                                    padding: '10px 12px',
                                    borderBottom: '1px solid var(--slate-100)',
                                    marginBottom: '6px',
                                }}
                            >
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                                    {admin?.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                                    {admin?.email}
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    color: '#ef4444',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <LogOut size={16} />
                                <span>تسجيل الخروج</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
