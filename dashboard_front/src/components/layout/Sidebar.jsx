import React from 'react';
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
  Cross,
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

export const Sidebar = ({ isCollapsed, isOpenMobile, onCloseMobile }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isCollapsed ? '80px' : 'var(--sidebar-width)',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        zIndex: 1045,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isOpenMobile || window.innerWidth > 1024 ? 'translateX(0)' : 'translateX(100%)',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        {/* Brand Header */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(20, 184, 166, 0.3)',
            }}>
              <Cross size={22} />
            </div>
            {!isCollapsed && (
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, color: '#f8fafc' }}>
                  صيدليتي
                </h2>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Admin Portal
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
                  color: '#64748b',
                  fontWeight: 700,
                  padding: '4px 12px 8px 12px',
                }}>
                  {group.section}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={idx}
                      to={item.path}
                      onClick={onCloseMobile}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : '#94a3b8',
                        background: isActive ? 'linear-gradient(90deg, rgba(13, 148, 136, 0.35), rgba(13, 148, 136, 0.1))' : 'transparent',
                        borderRight: isActive ? '3px solid var(--primary-500)' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                      })}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon size={19} color="currentColor" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* External Website Link */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                color: '#60a5fa',
                transition: 'all 0.2s',
              }}
              title="زيارة الموقع العام"
            >
              <ExternalLink size={18} />
              {!isCollapsed && <span>زيارة الموقع العام</span>}
            </a>
          </div>
        </div>

        {/* Footer Admin Info & Logout */}
        <div style={{
          padding: '16px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-700)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}>
                {admin?.name?.charAt(0) || 'م'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {admin?.name || 'مدير النظام'}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>مسؤول معتمد</span>
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
              transition: 'background 0.2s',
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
