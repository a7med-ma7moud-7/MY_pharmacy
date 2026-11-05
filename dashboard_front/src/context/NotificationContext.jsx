import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

const TOAST_STYLES = {
  success: {
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    iconColor: '#059669',
    Icon: CheckCircle2,
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    iconColor: '#dc2626',
    Icon: AlertCircle,
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    iconColor: '#d97706',
    Icon: AlertTriangle,
  },
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    iconColor: '#2563eb',
    Icon: Info,
  },
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        showNotification: showToast,
        removeToast,
      }}
    >
      {children}
      {/* Toast Render Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
        }}
      >
        {toasts.map((toast) => {
          const scheme = TOAST_STYLES[toast.type] || TOAST_STYLES.success;
          const IconComponent = scheme.Icon;
          return (
            <div
              key={toast.id}
              className="animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: scheme.bg,
                border: `1px solid ${scheme.border}`,
                color: scheme.text,
                boxShadow: 'var(--shadow-lg)',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconComponent size={20} color={scheme.iconColor} style={{ flexShrink: 0 }} />
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  color: 'currentColor',
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
