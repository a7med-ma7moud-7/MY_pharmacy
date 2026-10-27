import React from 'react';

export const LoadingSpinner = ({ text = 'جاري تحميل البيانات...', size = 32 }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '14px',
      color: 'var(--slate-500)',
    }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '3px solid var(--slate-200)',
          borderTopColor: 'var(--primary-600)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
