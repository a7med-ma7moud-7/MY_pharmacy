import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
      }}>
        {toasts.map((toast) => (
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
              background: toast.type === 'error' ? '#fef2f2' : toast.type === 'info' ? '#eff6ff' : '#ecfdf5',
              border: `1px solid ${toast.type === 'error' ? '#fecaca' : toast.type === 'info' ? '#bfdbfe' : '#a7f3d0'}`,
              color: toast.type === 'error' ? '#991b1b' : toast.type === 'info' ? '#1e40af' : '#065f46',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {toast.type === 'error' ? (
                <AlertCircle size={20} color="#dc2626" />
              ) : toast.type === 'info' ? (
                <Info size={20} color="#2563eb" />
              ) : (
                <CheckCircle2 size={20} color="#059669" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
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
        ))}
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
