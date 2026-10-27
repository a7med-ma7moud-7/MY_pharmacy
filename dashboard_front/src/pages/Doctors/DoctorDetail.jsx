import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import {
  Star,
  Phone,
  MapPin,
  DollarSign,
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

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="الملف التعريفي للطبيب" maxWidth="720px">
      {loading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="جاري جلب تفاصيل الطبيب..." size={32} />
        </div>
      ) : error ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--danger-color)' }}>
          {error}
        </div>
      ) : doctor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Card */}
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
                width: '84px',
                height: '84px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                border: '2px solid var(--primary-color)',
                flexShrink: 0,
              }}
            >
              <img
                src={
                  doctor.image
                    ? doctor.image.startsWith('http')
                      ? doctor.image
                      : `http://localhost:8080/storage/${doctor.image}`
                    : '/placeholder-doctor.png'
                }
                alt={doctor.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {doctor.name}
                </h3>
                <Badge variant={doctor.status === 'active' ? 'success' : 'danger'}>
                  {doctor.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
                <Badge variant={doctor.subscription === 'subscribed' ? 'info' : 'warning'}>
                  {doctor.subscription === 'subscribed' ? 'مشترك بالمنظومة' : 'غير مشترك'}
                </Badge>
              </div>

              <p style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px', margin: 0 }}>
                {doctor.specialty}
              </p>

              {/* Rating Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {doctor.average_rating || 0}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({doctor.ratings_count || 0} تقييم)
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DollarSign size={20} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>سعر الكشف</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{doctor.price} ر.س</div>
              </div>
            </div>

            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={20} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>رقم التواصل</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', direction: 'ltr' }}>{doctor.number}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={20} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>العنوان الرئيسي</span>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{doctor.location}</div>
              </div>
            </div>

            {doctor.tow_location && (
              <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={20} style={{ color: 'var(--primary-color)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>تفاصيل العنوان</span>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{doctor.tow_location}</div>
                </div>
              </div>
            )}
          </div>

          {/* Clinic Photo Gallery */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              معرض صور العيادة والمقر
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5]
                .map((i) => doctor[`image-${i}`])
                .filter(Boolean)
                .map((imgSrc, idx) => (
                  <a
                    key={idx}
                    href={imgSrc.startsWith('http') ? imgSrc : `http://localhost:8080/storage/${imgSrc}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: '100px',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      display: 'block',
                    }}
                  >
                    <img
                      src={imgSrc.startsWith('http') ? imgSrc : `http://localhost:8080/storage/${imgSrc}`}
                      alt={`عيادة ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </a>
                ))}
              {![1, 2, 3, 4, 5].some((i) => doctor[`image-${i}`]) && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  لا توجد صور إضافية مرفقة للعيادة
                </span>
              )}
            </div>
          </div>

          {/* Ratings list */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              سجل التقييمات والآراء
            </h4>
            {doctor.ratings && doctor.ratings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {doctor.ratings.map((rate) => (
                  <div
                    key={rate.id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-color)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        {rate.user?.name ? rate.user.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {rate.user?.name || 'مستخدم مسجل'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {rate.comment || 'لا يوجد تعليق مكتوب'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rate.rating ? '#f59e0b' : 'none'}
                          color={i < rate.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                لا توجد تقييمات مضافة لهذا الطبيب حتى الآن
              </p>
            )}
          </div>

          {/* Footer close button */}
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

export default DoctorDetail;
