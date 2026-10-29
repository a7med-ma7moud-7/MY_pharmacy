import React from 'react';

const STATUS_MAP = {
  // Appointment & Order statuses
  pending: { label: 'قيد الانتظار', class: 'badge-pending', dotColor: '#f59e0b' },
  confirmed: { label: 'مؤكد', class: 'badge-confirmed', dotColor: '#10b981' },
  processing: { label: 'قيد التجهيز', class: 'badge-processing', dotColor: '#3b82f6' },
  completed: { label: 'مكتمل', class: 'badge-completed', dotColor: '#059669' },
  cancelled: { label: 'ملغي', class: 'badge-cancelled', dotColor: '#ef4444' },

  // Doctor statuses
  active: { label: 'نشط', class: 'badge-confirmed', dotColor: '#10b981' },
  inactive: { label: 'غير نشط', class: 'badge-cancelled', dotColor: '#ef4444' },
  subscribed: { label: 'مشترك', class: 'badge-processing', dotColor: '#3b82f6' },
  not_subscribed: { label: 'غير مشترك', class: 'badge-cancelled', dotColor: '#ef4444' },

  // User roles
  admin: { label: 'مدير نظام', class: 'badge-cancelled', dotColor: '#ef4444' },
  user: { label: 'عميل', class: 'badge-processing', dotColor: '#3b82f6' },

  // Stock
  in_stock: { label: 'متوفر', class: 'badge-confirmed', dotColor: '#10b981' },
  low_stock: { label: 'مخزون منخفض', class: 'badge-pending', dotColor: '#f59e0b' },
  out_of_stock: { label: 'نفذ المخزون', class: 'badge-cancelled', dotColor: '#ef4444' },
};

export const Badge = ({ status, customLabel, variant }) => {
  const meta = STATUS_MAP[status] || {
    label: customLabel || status,
    class: variant ? `badge-${variant}` : 'badge-pending',
    dotColor: '#64748b',
  };

  return (
    <span className={`badge ${meta.class}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: meta.dotColor,
          display: 'inline-block',
          boxShadow: `0 0 0 2px rgba(255, 255, 255, 0.6)`,
        }}
      />
      <span>{customLabel || meta.label}</span>
    </span>
  );
};

export default Badge;
