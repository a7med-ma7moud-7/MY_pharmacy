import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'لا توجد بيانات متاحة',
  description = 'لم يتم العثور على أي عناصر مطابقة في الوقت الحالي.',
  actionText,
  onAction,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--slate-500)',
      animation: 'fadeInUp 0.5s ease-out',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--slate-100), var(--slate-50))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        color: 'var(--slate-400)',
        animation: 'float 3s ease-in-out infinite',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
      }}>
        <Icon size={36} />
      </div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '8px' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', maxWidth: '360px', marginBottom: actionText ? '24px' : '0', lineHeight: 1.6 }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm" style={{
          animation: 'fadeIn 0.3s ease-out 0.2s both',
        }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
