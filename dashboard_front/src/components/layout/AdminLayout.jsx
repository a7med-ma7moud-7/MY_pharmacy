import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AdminLayout = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
        }}
      >
        <LoadingSpinner text="جاري التحقق من الجلسة..." size={36} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sidebarWidth = isCollapsed ? '80px' : 'var(--sidebar-width)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginRight: sidebarWidth,
          transition: 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: 0,
        }}
      >
        <Topbar
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onToggleMobile={() => setIsOpenMobile(!isOpenMobile)}
        />

        <main style={{ flex: 1, padding: '28px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
