import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
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
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
