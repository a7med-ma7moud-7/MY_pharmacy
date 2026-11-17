import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    HeartPulse,
    Mail,
    Lock,
    AlertCircle,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    Eye,
    EyeOff,
    CheckCircle2,
    BarChart3,
    Moon,
    Sun,
    Globe,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const Login = () => {
    const { isAuthenticated, login, loading: authLoading } = useAdminAuth();
    const { showNotification } = useNotification();
    const { isDark, toggleTheme } = useTheme();
    const { isEn, dir, toggleLanguage } = useLanguage();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (authLoading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        setLoading(true);
        try {
            const res = await login(email, password, remember);
            if (res.success) {
                showNotification('تم تسجيل الدخول بنجاح! أهلاً بك في لوحة الإدارة', 'success');
                navigate('/dashboard');
            } else {
                setError(res.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
            }
        } catch (err) {
            const msg =
                err.response?.data?.message || 'بيانات الدخول غير صحيحة أو لا تملك صلاحية الإدارة';
            setError(msg);
            showNotification(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            dir={dir}
            style={{
                minHeight: '100vh',
                background: isDark
                    ? 'linear-gradient(135deg, #040d0a 0%, #071611 38%, #091e17 72%, #050f0c 100%)'
                    : 'linear-gradient(135deg, #dff1ea 0%, #f2f9f6 38%, #d6ede4 72%, #eef7f3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 20px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.4s ease',
            }}
        >
            {/* Theme & Language Floating Controls */}
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: isEn ? 'auto' : '20px',
                    right: isEn ? '20px' : 'auto',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                <button
                    type="button"
                    onClick={toggleLanguage}
                    data-no-i18n="true"
                    title={isEn ? 'التبديل إلى العربية' : 'Switch to English'}
                    style={{
                        padding: '9px 14px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--primary-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                    }}
                >
                    <Globe size={16} />
                    <span>{isEn ? 'عربي' : 'EN'}</span>
                </button>

                <button
                    type="button"
                    onClick={toggleTheme}
                    title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    style={{
                        padding: '9px 14px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--border-color)',
                        color: isDark ? '#fbbf24' : '#0f6848',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                    }}
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    <span style={{ color: 'var(--slate-700)' }}>
                        {isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    </span>
                </button>
            </div>
            {/* Animated Organic Aurora Marbling Blobs ("تشبيحات ضوئية ناعمة") */}
            <div
                style={{
                    position: 'absolute',
                    top: '-14%',
                    right: '-8%',
                    width: '560px',
                    height: '560px',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(15, 104, 72, 0.28) 0%, rgba(16, 172, 132, 0.12) 45%, transparent 72%)',
                    filter: 'blur(36px)',
                    animation: 'auroraWave1 14s ease-in-out infinite alternate',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-18%',
                    left: '-8%',
                    width: '620px',
                    height: '620px',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(16, 172, 132, 0.28) 0%, rgba(20, 184, 166, 0.12) 48%, transparent 72%)',
                    filter: 'blur(40px)',
                    animation: 'auroraWave2 17s ease-in-out infinite alternate',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '28%',
                    left: '18%',
                    width: '420px',
                    height: '260px',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(ellipse, rgba(52, 211, 153, 0.22) 0%, rgba(255, 255, 255, 0.4) 55%, transparent 75%)',
                    filter: 'blur(32px)',
                    animation: 'auroraWave1 19s ease-in-out infinite alternate-reverse',
                    pointerEvents: 'none',
                }}
            />

            {/* Flowing Diagonal Silk Streaks ("تشبيحات متموجة") */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-25%',
                    background: isDark
                        ? 'repeating-linear-gradient(125deg, rgba(16, 185, 129, 0) 0px, rgba(16, 185, 129, 0.04) 90px, rgba(20, 184, 166, 0.025) 180px, rgba(16, 185, 129, 0) 290px)'
                        : 'repeating-linear-gradient(125deg, rgba(255, 255, 255, 0) 0px, rgba(255, 255, 255, 0.48) 90px, rgba(16, 172, 132, 0.11) 180px, rgba(255, 255, 255, 0) 290px)',
                    filter: 'blur(14px)',
                    animation: 'silkRibbonFlow 16s ease-in-out infinite alternate',
                    pointerEvents: 'none',
                }}
            />

            {/* Delicate Curved Wave Veins SVG */}
            <svg
                viewBox="0 0 1440 900"
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.55,
                    pointerEvents: 'none',
                }}
            >
                <defs>
                    <linearGradient id="veinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0f6848" stopOpacity="0.18" />
                        <stop offset="50%" stopColor="#10ac84" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#0f6848" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="veinGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#34d399" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                <path
                    d="M-120,180 C260,40 520,340 920,170 C1180,60 1360,210 1560,120"
                    fill="none"
                    stroke="url(#veinGrad1)"
                    strokeWidth="2.5"
                />
                <path
                    d="M-100,720 C300,560 640,840 1040,650 C1260,545 1390,670 1560,610"
                    fill="none"
                    stroke="url(#veinGrad1)"
                    strokeWidth="2"
                />
                <path
                    d="M-80,450 C340,290 720,610 1140,390 C1320,295 1430,380 1540,340"
                    fill="none"
                    stroke="url(#veinGrad2)"
                    strokeWidth="3"
                />
            </svg>

            <div
                style={{
                    width: '100%',
                    maxWidth: '860px',
                    backgroundColor: isDark ? 'rgba(13, 28, 23, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '28px',
                    boxShadow: isDark
                        ? '0 0 0 8px rgba(16, 185, 129, 0.08), 0 28px 65px -12px rgba(0, 0, 0, 0.65)'
                        : '0 0 0 8px rgba(255, 255, 255, 0.48), 0 28px 65px -12px rgba(15, 104, 72, 0.22), 0 8px 24px -6px rgba(15, 23, 42, 0.06)',
                    border: isDark ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(255, 255, 255, 0.85)',
                    animation: 'fadeInScale 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    position: 'relative',
                    zIndex: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                    overflow: 'hidden',
                }}
            >
                {/* Executive Showcase Side */}
                <div
                    className="desktop-only"
                    style={{
                        background:
                            'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.28) 0%, transparent 50%), linear-gradient(145deg, #06281c 0%, #0f6848 60%, #0b4f36 100%)',
                        color: '#ffffff',
                        padding: '44px 36px',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                    }}
                >
                    <div>
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.14)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6ee7b7',
                                marginBottom: '24px',
                            }}
                        >
                            <HeartPulse size={28} />
                        </div>
                        <h2
                            style={{
                                fontSize: '1.55rem',
                                fontWeight: 800,
                                margin: '0 0 12px',
                                lineHeight: 1.35,
                                fontFamily: "'Almarai', 'Cairo', sans-serif",
                            }}
                        >
                            بوابة الإدارة المركزية لمنصة صيدليتي
                        </h2>
                        <p style={{ fontSize: '0.84rem', color: '#d1fae5', opacity: 0.9, lineHeight: 1.75, margin: 0 }}>
                            تحكم كامل في مخزون الأدوية، طلبات التوصيل، جداول الأطباء والعيادات، والتقارير المالية اللحظية من لوحة موحدة.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '32px' }}>
                        {[
                            { icon: BarChart3, text: 'مؤشرات مبيعات وتقارير تشغيلية فورية' },
                            { icon: CheckCircle2, text: 'مزامنة لحظية للمخزون وحجوزات العيادات' },
                            { icon: ShieldCheck, text: 'صلاحيات مشفرة وجلسات إدارة محمية' },
                        ].map((feat, idx) => {
                            const FeatIcon = feat.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '11px 14px',
                                        borderRadius: '14px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.16)',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    <FeatIcon size={16} style={{ color: '#6ee7b7', flexShrink: 0 }} />
                                    <span>{feat.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Column */}
                <div style={{ padding: '42px 36px' }}>
                {/* Brand Header */}
                <div style={{ textAlign: isEn ? 'left' : 'right', marginBottom: '26px' }}>
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-600)',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            marginBottom: '10px',
                        }}
                    >
                        <HeartPulse size={14} />
                        <span>بوابة المشرفين</span>
                    </span>
                    <h1
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            margin: '0 0 6px',
                        }}
                    >
                        تسجيل الدخول للإدارة
                    </h1>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
                        أدخل بيانات حساب المشرف للمتابعة إلى لوحة التحكم
                    </p>
                </div>

                {/* Error Alert Box */}
                {error && (
                    <div
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'var(--danger-color)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            animation: 'fadeIn 0.25s ease-out',
                        }}
                    >
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                >
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                marginBottom: '7px',
                            }}
                        >
                            البريد الإلكتروني
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    right: isEn ? 'auto' : '13px',
                                    left: isEn ? '13px' : 'auto',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                }}
                            >
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="form-input"
                                style={{
                                    padding: isEn ? '11px 14px 11px 42px' : '11px 42px 11px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-main)',
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                marginBottom: '7px',
                            }}
                        >
                            كلمة المرور
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    right: isEn ? 'auto' : '13px',
                                    left: isEn ? '13px' : 'auto',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                }}
                            >
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="form-input"
                                style={{
                                    padding: '11px 42px 11px 42px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-main)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="إظهار أو إخفاء كلمة المرور"
                                style={{
                                    position: 'absolute',
                                    left: isEn ? 'auto' : '12px',
                                    right: isEn ? '12px' : 'auto',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    padding: '4px',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '0.83rem',
                                fontWeight: 600,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                            />
                            <span style={{ color: 'var(--text-secondary)' }}>
                                تذكر بياناتي في هذا المتصفح
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '13px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            marginTop: '4px',
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin-animation" />
                                <span>جاري التحقق...</span>
                            </>
                        ) : (
                            <>
                                <span>تسجيل الدخول للوحة الإدارة</span>
                                <ArrowLeft size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Security Footer Reassurance */}
                <div
                    style={{
                        marginTop: '26px',
                        paddingTop: '18px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                    }}
                >
                    <ShieldCheck size={16} style={{ color: 'var(--primary-color)' }} />
                    <span>منطقة إدارة مشفرة ومحمية ببروتوكول أمان موثوق</span>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
