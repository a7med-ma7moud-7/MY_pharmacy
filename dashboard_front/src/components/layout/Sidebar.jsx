import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserRoundCheck,
  Pill,
  CalendarDays,
  ShoppingBag,
  BarChart3,
  ExternalLink,
  LogOut,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV_ITEMS = [
  { section: 'عام', items: [
    { name: 'الرئيسية', path: '/dashboard', icon: LayoutDashboard },
  ]},
  { section: 'إدارة الكوادر والمستخدمين', items: [
    { name: 'المستخدمين', path: '/users', icon: Users },
    { name: 'الأطباء والعيادات', path: '/doctors', icon: UserRoundCheck },
  ]},
  { section: 'المتجر والمخزون', items: [
    { name: 'قائمة الأدوية', path: '/medicines', icon: Pill },
    { name: 'طلبات الأدوية', path: '/orders', icon: ShoppingBag },
  ]},
  { section: 'الخدمات والعمليات', items: [
    { name: 'الحجوزات الطبية', path: '/appointments', icon: CalendarDays },
    { name: 'التقارير والإحصائيات', path: '/reports', icon: BarChart3 },
  ]},
];

export const Sidebar = ({ isCollapsed, isOpenMobile, isMobile, onCloseMobile }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isVisible = isOpenMobile || !isMobile;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 1040,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isCollapsed ? '80px' : 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, #06251b 0%, #091e17 55%, #06140f 100%)',
        color: '#ffffff',
        zIndex: 1045,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        boxShadow: '0 0 45px rgba(4, 34, 24, 0.38)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        overflowX: 'hidden',
      }}>
        {/* Brand Header */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(16, 172, 132, 0.14) 0%, transparent 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0f6848, #10ac84)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a7f3d0',
              boxShadow: '0 8px 22px rgba(16, 172, 132, 0.32)',
              transition: 'transform 0.3s ease',
            }}>
              <HeartPulse size={22} />
            </div>
            {!isCollapsed && (
              <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, letterSpacing: '-0.2px', margin: 0, color: '#f8fafc', fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
                  صيدليتي
                </h2>
                <span style={{ fontSize: '0.68rem', color: '#6ee7b7', display: 'block', fontWeight: 700, letterSpacing: '0.3px' }}>
                  مركز الإدارة الموحد
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {NAV_ITEMS.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '20px' }}>
              {!isCollapsed && (
                <div style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#475569',
                  fontWeight: 700,
                  padding: '4px 12px 8px 12px',
                }}>
                  {group.section}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  const itemKey = `${gIdx}-${idx}`;
                  return (
                    <NavLink
                      key={idx}
                      to={item.path}
                      onClick={onCloseMobile}
                      onMouseEnter={() => setHoveredItem(itemKey)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : (hoveredItem === itemKey ? '#e2e8f0' : '#94a3b8'),
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(13, 148, 136, 0.3), rgba(13, 148, 136, 0.08))'
                          : (hoveredItem === itemKey ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                        borderRight: isActive ? '3px solid var(--primary-500)' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      })}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon size={19} color="currentColor" style={{
                        transition: 'transform 0.2s ease',
                        transform: hoveredItem === itemKey ? 'scale(1.1)' : 'scale(1)',
                      }} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* External Website Link */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#6ee7b7',
                background: 'rgba(16, 172, 132, 0.1)',
                border: '1px solid rgba(110, 231, 183, 0.16)',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              title="زيارة الموقع العام"
            >
              <ExternalLink size={17} />
              {!isCollapsed && <span>معاينة الموقع العام</span>}
            </a>

            {!isCollapsed && (
              <div style={{
                marginTop: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.73rem',
                color: '#cbd5e1',
              }}>
                <ShieldCheck size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                <span>المنظومة متصلة ومؤمّنة</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Admin Info & Logout */}
        <div style={{
          padding: '16px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-700), var(--primary-600))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(13, 148, 136, 0.2)',
              }}>
                {admin?.name?.charAt(0) || 'م'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {admin?.name || 'مدير النظام'}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>مسؤول معتمد</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="تسجيل الخروج"
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
