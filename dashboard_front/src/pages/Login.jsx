import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    Cross,
    Mail,
    Lock,
    AlertCircle,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    Eye,
    EyeOff,
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
                    maxWidth: '450px',
                    backgroundColor: 'rgba(255, 255, 255, 0.97)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    padding: '42px 38px',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    animation: 'fadeInScale 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div
                        style={{
                            width: '66px',
                            height: '66px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            margin: '0 auto 16px',
                            boxShadow: '0 12px 28px -6px rgba(20, 184, 166, 0.45)',
                            animation: 'float 3.5s ease-in-out infinite',
                        }}
                    >
                        <Cross size={34} />
                    </div>
                    <h1
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            margin: '0 0 6px',
                        }}
                    >
                        لوحة التحكم الإدارية
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        بوابة الإدارة المركزية لمنظومة صيدليتي الإلكترونية
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
    );
};

export default Login;
