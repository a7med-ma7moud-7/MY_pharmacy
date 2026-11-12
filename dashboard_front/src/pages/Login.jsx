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
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNotification } from '../context/NotificationContext';

export const Login = () => {
    const { isAuthenticated, login, loading: authLoading } = useAdminAuth();
    const { showNotification } = useNotification();
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
            style={{
                minHeight: '100vh',
                backgroundColor: '#07111e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage:
                    'radial-gradient(circle at 20% 25%, rgba(13, 148, 136, 0.22) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.14) 0%, transparent 45%)',
            }}
        >
            {/* Floating Aurora Orbs */}
            <div
                style={{
                    position: 'absolute',
                    top: '-80px',
                    right: '-80px',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(20, 184, 166, 0.18), transparent 70%)',
                    animation: 'breathe 5s ease-in-out infinite',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-100px',
                    left: '-60px',
                    width: '340px',
                    height: '340px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.14), transparent 70%)',
                    animation: 'breathe 6s ease-in-out infinite 1s',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    width: '100%',
                    maxWidth: '860px',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(18px)',
                    borderRadius: '28px',
                    boxShadow: '0 28px 70px -14px rgba(0, 0, 0, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
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
                <div style={{ textAlign: 'right', marginBottom: '26px' }}>
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
                                    right: '13px',
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
                                    padding: '11px 42px 11px 14px',
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
                                    right: '13px',
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
                                    left: '12px',
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
