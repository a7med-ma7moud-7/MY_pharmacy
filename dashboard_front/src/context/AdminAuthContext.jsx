import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('admin_token');
      if (savedToken) {
        try {
          const res = await adminApi.me();
          if (res.data.success && res.data.user) {
            setAdmin(res.data.user);
            localStorage.setItem('admin_user', JSON.stringify(res.data.user));
          }
        } catch {
          setAdmin(null);
          setToken(null);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password, remember = false) => {
    const res = await adminApi.login({ email, password, remember });
    if (res.data.success) {
      setAdmin(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (err) {
      console.warn('Logout request failed or timed out:', err);
    } finally {
      setAdmin(null);
      setToken(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout, isAuthenticated: !!token && !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
