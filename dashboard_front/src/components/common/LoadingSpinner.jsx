import React from 'react';

export const LoadingSpinner = ({ text = 'جاري تحميل البيانات...', size = 32, variant = 'default' }) => {
  if (variant === 'dots') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: '16px',
        color: 'var(--slate-500)',
      }}>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        {text && <span style={{ fontSize: '0.9rem', fontWeight: 600, animation: 'fadeIn 0.3s ease-out' }}>{text}</span>}
      </div>
    );
  }

  if (variant === 'skeleton-table' || variant === 'table') {
    return (
      <div style={{ padding: '16px 20px', width: '100%', boxSizing: 'border-box' }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 0',
              borderBottom: '1px solid var(--slate-100)',
              animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`,
            }}
          >
            <div className="skeleton skeleton-avatar" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
            <div style={{ flex: 2 }}>
              <div className="skeleton skeleton-title" style={{ width: '55%', height: '14px', marginBottom: '8px' }} />
              <div className="skeleton skeleton-text" style={{ width: '35%', height: '11px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-badge" style={{ width: '75px', height: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '60px', height: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="skeleton skeleton-avatar" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton skeleton-text" style={{ width: `${90 - i * 15}%`, marginBottom: '12px' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '16px',
      color: 'var(--slate-500)',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        {/* Outer glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, transparent 70%)',
            animation: 'breathe 2s ease-in-out infinite',
          }}
        />
        {/* Main spinner */}
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            border: '3px solid var(--slate-200)',
            borderTopColor: 'var(--primary-600)',
            borderRightColor: 'var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            position: 'relative',
          }}
        />
      </div>
      {text && (
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'countUp 0.4s ease-out',
        }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
