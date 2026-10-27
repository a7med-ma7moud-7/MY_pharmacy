import React from 'react';

const STATUS_MAP = {
  // Appointment & Order statuses
  pending: { label: 'قيد الانتظار', class: 'badge-pending' },
  confirmed: { label: 'مؤكد', class: 'badge-confirmed' },
  processing: { label: 'قيد التجهيز', class: 'badge-processing' },
  completed: { label: 'مكتمل', class: 'badge-completed' },
  cancelled: { label: 'ملغي', class: 'badge-cancelled' },

  // Doctor statuses
  active: { label: 'نشط', class: 'badge-confirmed' },
  inactive: { label: 'غير نشط', class: 'badge-cancelled' },
  subscribed: { label: 'مشترك', class: 'badge-processing' },
  not_subscribed: { label: 'غير مشترك', class: 'badge-cancelled' },

  // User roles
  admin: { label: 'مدير نظام', class: 'badge-cancelled' },
  user: { label: 'عميل', class: 'badge-processing' },

  // Stock
  in_stock: { label: 'متوفر', class: 'badge-confirmed' },
  low_stock: { label: 'مخزون منخفض', class: 'badge-pending' },
  out_of_stock: { label: 'نفذ المخزون', class: 'badge-cancelled' },
};

export const Badge = ({ status, customLabel, variant }) => {
  const meta = STATUS_MAP[status] || {
    label: customLabel || status,
    class: variant ? `badge-${variant}` : 'badge-pending',
  };

  return (
    <span className={`badge ${meta.class}`}>
      {customLabel || meta.label}
    </span>
  );
};

export default Badge;
