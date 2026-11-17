import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { adminApi, resolveImageUrl } from '../../services/api';
import {
  Star,
  Phone,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  BriefcaseMedical,
  FileText,
} from 'lucide-react';

export const DoctorDetail = ({ isOpen, onClose, doctorId }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && doctorId) {
      setLoading(true);
      setError('');
      adminApi
        .getDoctor(doctorId)
        .then((res) => {
          if (res.data.success) {
            setDoctor(res.data.data);
          } else {
            setError('تعذر تحميل بيانات الطبيب');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'فشل الاتصال بالخادم');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, doctorId]);

  if (!isOpen) return null;

  const act = doctor?.activity_overview || {};

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="الملف التعريفي ونشاط الطبيب" maxWidth="760px">
      {loading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="جاري جلب تفاصيل الطبيب..." size={32} />
        </div>
      ) : error ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--danger-color)' }}>
          {error}
        </div>
      ) : doctor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Header Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'var(--bg-main)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--slate-50)',
                border: '2px solid var(--primary-color)',
                flexShrink: 0,
              }}
            >
              <img
                src={resolveImageUrl(doctor) || '/placeholder-doctor.png'}
                alt={doctor.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {doctor.name}
                </h3>
                <Badge variant={doctor.status === 'active' ? 'success' : 'danger'}>
                  {doctor.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
                <Badge variant={doctor.verification_status === 'verified' ? 'info' : 'warning'}>
                  {doctor.verification_status === 'verified' ? 'حساب موثق' : 'قيد التوثيق'}
                </Badge>
                <Badge variant={doctor.creation_method === 'self_registered' ? 'warning' : 'info'}>
                  {doctor.creation_method === 'self_registered' ? 'تسجيل ذاتي' : 'إنشاء إداري'}
                </Badge>
              </div>

              <p style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.88rem', margin: '4px 0 0' }}>
                {doctor.specialty}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>تاريخ التسجيل: {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString('ar-EG') : '—'}</span>
                <span>•</span>
                <span>بوابة الطبيب: {doctor.has_login_account ? 'مفعلة بحساب دخول' : 'بدون حساب دخول'}</span>
              </div>
            </div>
          </div>

          {/* Activity Overview Metrics */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              ملخص نشاط الطبيب بالمنظومة
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '12px' }}>
              <div className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Users size={15} /> <span>إجمالي المرضى</span>
                </div>
                <strong style={{ fontSize: '1.15rem', display: 'block', marginTop: '4px' }}>{act.total_patients ?? 0}</strong>
              </div>
              <div className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Calendar size={15} /> <span>المواعيد</span>
                </div>
                <strong style={{ fontSize: '1.15rem', display: 'block', marginTop: '4px' }}>{act.total_appointments ?? 0}</strong>
              </div>
              <div className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <BriefcaseMedical size={15} /> <span>الحالات المنشورة</span>
                </div>
                <strong style={{ fontSize: '1.15rem', display: 'block', marginTop: '4px' }}>{act.total_treated_cases ?? 0}</strong>
              </div>
              <div className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <FileText size={15} /> <span>الروشتات</span>
                </div>
                <strong style={{ fontSize: '1.15rem', display: 'block', marginTop: '4px' }}>{act.total_prescriptions ?? 0}</strong>
              </div>
              <div className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Star size={15} color="#f59e0b" /> <span>متوسط التقييم</span>
                </div>
                <strong style={{ fontSize: '1.15rem', display: 'block', marginTop: '4px' }}>
                  {act.average_rating || 0} ({act.total_reviews || 0})
                </strong>
              </div>
            </div>
          </div>

          {/* Contact & Clinic Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={18} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>سعر الكشف</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{doctor.price} ج.م</div>
              </div>
            </div>
            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={18} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>رقم الهاتف</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', direction: 'ltr' }}>{doctor.number}</div>
              </div>
            </div>
            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>العنوان</span>
                <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{doctor.location}</div>
              </div>
            </div>
          </div>

          {/* Published Treated Cases */}
          {doctor.treated_cases && doctor.treated_cases.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                أحدث الحالات المعالجة المنشورة ({doctor.treated_cases.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {doctor.treated_cases.map((tc) => (
                  <div
                    key={tc.id}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.84rem' }}>{tc.title}</strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{tc.published_at}</div>
                    </div>
                    <Badge variant={tc.status === 'published' ? 'success' : 'danger'}>
                      {tc.status === 'published' ? 'منشورة' : 'مخفية'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              إغلاق
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
};

export default DoctorDetail;
