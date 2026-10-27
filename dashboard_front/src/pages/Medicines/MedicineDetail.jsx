import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DollarSign, Package, FileText } from 'lucide-react';

export const MedicineDetail = ({ isOpen, onClose, medicineId }) => {
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && medicineId) {
      setLoading(true);
      setError('');
      adminApi
        .getMedicine(medicineId)
        .then((res) => {
          if (res.data.success) {
            setMedicine(res.data.data);
          } else {
            setError('تعذر تحميل بيانات الدواء');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'فشل الاتصال بالخادم');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, medicineId]);

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="تفاصيل الصنف الدوائي" maxWidth="560px">
      {loading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="جاري جلب تفاصيل الدواء..." size={32} />
        </div>
      ) : error ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--danger-color)' }}>
          {error}
        </div>
      ) : medicine ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top visual card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'var(--bg-main)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                flexShrink: 0,
              }}
            >
              <img
                src={
                  medicine.image
                    ? medicine.image.startsWith('http')
                      ? medicine.image
                      : `http://localhost:8080/storage/${medicine.image}`
                    : '/placeholder-medicine.png'
                }
                alt={medicine.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M6 3h12v2H6zm0 16h12v2H6zm-2-4h16V7H4v8zm2-6h12v4H6V9z"/></svg>';
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {medicine.name}
                </h3>
                <Badge variant="info">{medicine.type || 'أقراص'}</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <Badge variant={medicine.count > 10 ? 'success' : medicine.count > 0 ? 'warning' : 'danger'}>
                  {medicine.count > 10
                    ? `متوفر (${medicine.count} عبوة)`
                    : medicine.count > 0
                    ? `مخزون منخفض (${medicine.count} عبوة)`
                    : 'نفد من المخزون'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <FileText size={18} style={{ color: 'var(--primary-color)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  دواعي الاستعمال والغرض الطبي
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                {medicine.propose || 'لا توجد تفاصيل محددة'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign size={22} style={{ color: 'var(--primary-color)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>السعر للجمهور</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    {medicine.price} ر.س
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package size={22} style={{ color: 'var(--primary-color)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الكمية الإجمالية بالمخزن</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    {medicine.count} عبوة
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close action */}
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

export default MedicineDetail;
