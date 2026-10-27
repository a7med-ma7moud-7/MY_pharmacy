import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Cross, Mail, Lock, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNotification } from '../context/NotificationContext';

export const Login = () => {
  const { isAuthenticated, login, loading: authLoading } = useAdminAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const msg = err.response?.data?.message || 'بيانات الدخول غير صحيحة أو لا تملك صلاحية الإدارة';
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
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(13, 148, 136, 0.15) 0%, transparent 60%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px',
              boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)',
            }}
          >
            <Cross size={34} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
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
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '8px',
              }}
            >
              البريد الإلكتروني
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
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
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'var(--bg-main)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '8px',
              }}
            >
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'var(--bg-main)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>تذكر بياناتي في هذا المتصفح</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Reassurance */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
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
