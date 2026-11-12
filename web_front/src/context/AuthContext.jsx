import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const res = await authService.getUser();
      if (res.data?.authenticated && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    authService
      .getUser()
      .then((res) => {
        if (!active) return;
        if (res.data?.authenticated && res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (emailOrCredentials, password, remember = false) => {
    const payload =
      typeof emailOrCredentials === 'object' && emailOrCredentials !== null
        ? emailOrCredentials
        : { email: emailOrCredentials, password, remember };

    const res = await authService.login(payload);
    if (res.data?.success && res.data?.user) {
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'فشل تسجيل الدخول');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data?.success && res.data?.user) {
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'فشل إنشاء الحساب');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const isAdmin = Boolean(user?.role === 'admin' || user?.is_admin);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
