import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import {
  User,
  Truck,
} from 'lucide-react';

export const OrderDetail = ({ isOpen, onClose, orderId, onStatusChange }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStatus, setCurrentStatus] = useState('pending');

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      setError('');
      adminApi
        .getOrder(orderId)
        .then((res) => {
          if (res.data.success) {
            setOrder(res.data.data);
            setCurrentStatus(res.data.data.status || 'pending');
          } else {
            setError('تعذر استرجاع تفاصيل الطلب');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'فشل الاتصال بالخادم');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderId]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (!isOpen) return null;

  const customerName = order?.customer_name || order?.name || 'عميل المتجر';
  const customerPhone = order?.customer_phone || order?.phone;
  const customerEmail = order?.customer_email || order?.email;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`فاتورة تفاصيل الطلب #${orderId}`} maxWidth="750px">
      {loading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="جاري استرجاع تفاصيل الفاتورة..." size={32} />
        </div>
      ) : error ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--danger-color)' }}>
          {error}
        </div>
      ) : order ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Summary */}
          <div
            style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>رقم مرجع الفاتورة</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                #{order.id}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                تاريخ الإنشاء: {order.created_at ? new Date(order.created_at).toLocaleString('ar-EG') : '—'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>حالة الطلب:</span>
                <select
                  className="form-input"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    width: 'auto',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  value={currentStatus}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">جاري التجهيز</option>
                  <option value="completed">مكتمل ومسلّم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                الإجمالي: {Number(order.total_price || 0).toLocaleString()} ر.س
              </div>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="card" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} style={{ color: 'var(--primary-color)' }} />
                <span>بيانات المشتري</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>الاسم: </span>
                  <strong>{customerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>الهاتف: </span>
                  <span style={{ direction: 'ltr', display: 'inline-block' }}>{customerPhone || 'غير متوفر'}</span>
                </div>
                {customerEmail && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>البريد: </span>
                    <span>{customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} style={{ color: 'var(--primary-color)' }} />
                <span>عنوان وتفاصيل التوصيل</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>طريقة الاستلام: </span>
                  <Badge variant="info">{order.delivery_method || 'توصيل للمنزل'}</Badge>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>العنوان: </span>
                  <span>{order.address || 'العنوان غير مسجل'}</span>
                </div>
                {order.notes && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>ملاحظات: </span>
                    <span>{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.95rem' }}>
              الأدوية والمنتجات المطلوبة ({order.items?.length || 0})
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th>سعر الوحدة</th>
                    <th>الكمية</th>
                    <th>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.medicine?.image && (
                              <img
                                src={
                                  item.medicine.image.startsWith('http')
                                    ? item.medicine.image
                                    : `http://localhost:8080/storage/${item.medicine.image}`
                                }
                                alt={item.medicine.name}
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: 'var(--radius-sm)',
                                  objectFit: 'contain',
                                  border: '1px solid var(--border-color)',
                                }}
                              />
                            )}
                            <div>
                              <strong style={{ color: 'var(--text-main)' }}>
                                {item.medicine?.name || `صنف #${item.medicine_id}`}
                              </strong>
                              {item.medicine?.type && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {item.medicine.type}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{item.price} ر.س</td>
                        <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                          {(item.total || item.price * item.quantity).toLocaleString()} ر.س
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                        لا توجد عناصر مسجلة ضمن هذا الطلب
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              إغلاق
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
};

export default OrderDetail;
