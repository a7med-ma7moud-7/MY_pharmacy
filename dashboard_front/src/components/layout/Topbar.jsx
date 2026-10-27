import React, { useState, useEffect } from 'react';
import {
  Menu,
  ExternalLink,
  ChevronDown,
  LogOut,
  Clock,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = ({ onToggleCollapse, onToggleMobile }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        height: 'var(--topbar-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1020,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left side (in RTL, Right side visually): Toggle and Breadcrumb / Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile Toggle */}
        <button
          onClick={onToggleMobile}
          className="mobile-only"
          aria-label="القائمة"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            display: 'none', // Overridden in CSS for mobile
          }}
        >
          <Menu size={22} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="desktop-only"
          aria-label="طي القائمة"
          title="طي/توسيع القائمة الجانبية"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary-color)';
            e.currentTarget.style.backgroundColor = 'var(--bg-main)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Menu size={20} />
        </button>

        {/* Current Date & Time Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-main)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Clock size={15} style={{ color: 'var(--primary-color)' }} />
          <span>{currentDateTime}</span>
        </div>
      </div>

      {/* Right side (in RTL, Left side visually): Website link & Admin Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Link to public website */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          title="فتح المتجر الإلكتروني للمستخدمين"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--primary-color)',
            backgroundColor: 'rgba(13, 148, 136, 0.08)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(13, 148, 136, 0.16)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(13, 148, 136, 0.08)')}
        >
          <span>الموقع العام</span>
          <ExternalLink size={14} />
        </a>

        {/* Admin User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: '1px solid var(--border-color)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {admin?.name || 'مدير النظام'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 500 }}>
                مسؤول رئيسي
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: '210px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                padding: '8px',
                zIndex: 1050,
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {admin?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
                  border: 'none',
                  background: 'none',
                  color: 'var(--danger-color)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
