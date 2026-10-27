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
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--slate-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: 'var(--slate-400)',
      }}>
        <Icon size={32} />
      </div>
      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '6px' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', maxWidth: '360px', marginBottom: actionText ? '20px' : '0' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
