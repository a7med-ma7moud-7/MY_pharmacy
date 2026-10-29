import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ExternalLink,
  ChevronDown,
  LogOut,
  Clock
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = ({ onToggleCollapse, onToggleMobile }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const dropdownRef = useRef(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

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
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--slate-200)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1020,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Left side: Toggle and Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            borderRadius: 'var(--radius-sm)',
            color: 'var(--slate-700)',
            transition: 'all 0.2s ease',
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
            borderRadius: 'var(--radius-sm)',
            color: 'var(--slate-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary-600)';
            e.currentTarget.style.backgroundColor = 'var(--slate-100)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--slate-500)';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Menu size={20} />
        </button>

        {/* Current Date & Time Display */}
        <div
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.83rem',
            color: 'var(--slate-500)',
            backgroundColor: 'var(--slate-50)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <Clock size={14} style={{ color: 'var(--primary-600)' }} />
          <span>{currentDateTime}</span>
        </div>
      </div>

      {/* Right side: Website link & Admin Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Link to public website */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          title="فتح المتجر الإلكتروني للمستخدمين"
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.83rem',
            fontWeight: 600,
            color: 'var(--primary-600)',
            backgroundColor: 'rgba(13, 148, 136, 0.06)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            border: '1px solid rgba(13, 148, 136, 0.12)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(13, 148, 136, 0.12)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(13, 148, 136, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(13, 148, 136, 0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>الموقع العام</span>
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
              background: 'none',
              border: '1px solid var(--slate-200)',
              padding: '5px 14px 5px 10px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-500)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.08)';
            }}
            onMouseLeave={(e) => {
              if (!showDropdown) {
                e.currentTarget.style.borderColor = 'var(--slate-200)';
                e.currentTarget.style.boxShadow = 'none';
              }
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
              <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--slate-800)', lineHeight: 1.2 }}>
                {admin?.name || 'مدير النظام'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 500 }}>
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

          {/* Dropdown Menu */}
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
                  border: 'none',
                  background: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.06)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
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
