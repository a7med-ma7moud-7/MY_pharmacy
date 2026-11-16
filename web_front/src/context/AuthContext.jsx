import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AUTH_TOKEN_KEY } from '../services/api';

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
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
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
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setUser(null);
        }
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (identifierOrPayload, password, remember = false) => {
    const payload =
      typeof identifierOrPayload === 'object' && identifierOrPayload !== null
        ? identifierOrPayload
        : identifierOrPayload.includes('@')
        ? { email: identifierOrPayload, password, remember }
        : { phone: identifierOrPayload, password, remember };

    const res = await authService.login(payload);
    if (res.data?.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
      }
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'فشل تسجيل الدخول');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data?.success) {
      if (res.data.pending_verification) {
        return res.data;
      }
      if (res.data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
      }
      if (res.data.user) {
        setUser(res.data.user);
      }
      return res.data;
    }
    throw new Error(res.data?.message || 'فشل إنشاء الحساب');
  };

  const updateAuthState = useCallback((updatedUser, newToken = null) => {
    if (newToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    }
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    }
  };

  const isAdmin = Boolean(user?.role === 'admin' || user?.is_admin);
  const isDoctor = Boolean(user?.role === 'doctor');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isDoctor,
        loading,
        login,
        register,
        logout,
        checkUser,
        updateAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
