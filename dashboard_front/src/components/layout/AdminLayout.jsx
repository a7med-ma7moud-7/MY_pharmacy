import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AdminLayout = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const { isEn, dir } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Listen for window resize to detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpenMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          gap: '8px',
        }}
      >
        <LoadingSpinner text="جاري التحقق من الجلسة..." size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sidebarWidth = isCollapsed ? '80px' : 'var(--sidebar-width)';

  return (
    <div dir={dir} style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.3s ease' }}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isOpenMobile={isOpenMobile}
        isMobile={isMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginRight: isEn || isMobile ? 0 : sidebarWidth,
          marginLeft: isEn && !isMobile ? sidebarWidth : 0,
          transition: 'margin 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: 0,
        }}
      >
        <Topbar
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onToggleMobile={() => setIsOpenMobile(!isOpenMobile)}
        />

        <main style={{
          flex: 1,
          padding: isMobile ? '20px 16px' : '28px',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
