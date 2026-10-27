import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import {
  CalendarDays,
  Clock,
  User,
  UserRoundCheck,
} from 'lucide-react';

export const AppointmentDetail = ({ isOpen, onClose, appointmentId }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && appointmentId) {
      setLoading(true);
      setError('');
      adminApi
        .getAppointment(appointmentId)
        .then((res) => {
          if (res.data.success) {
            setAppointment(res.data.data);
          } else {
            setError('تعذر تحميل تفاصيل الحجز');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'فشل الاتصال بالخادم');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, appointmentId]);

  if (!isOpen) return null;

  const patientName = appointment?.patient_name || appointment?.name || 'مريض';
  const appDate = appointment?.appointment_date || appointment?.date;
  const appTime = appointment?.appointment_time || appointment?.time;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`تفاصيل الحجز الطبي #${appointmentId}`} maxWidth="600px">
      {loading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="جاري جلب بيانات الحجز..." size={32} />
        </div>
      ) : error ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--danger-color)' }}>
          {error}
        </div>
      ) : appointment ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>رقم مرجع الحجز</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                #{appointment.id}
              </div>
            </div>

            <Badge
              variant={
                appointment.status === 'confirmed'
                  ? 'success'
                  : appointment.status === 'completed'
                  ? 'info'
                  : appointment.status === 'cancelled'
                  ? 'danger'
                  : 'warning'
              }
            >
              {appointment.status === 'confirmed'
                ? 'موعد مؤكد'
                : appointment.status === 'completed'
                ? 'مكتمل الكشف'
                : appointment.status === 'cancelled'
                ? 'ملغي'
                : 'قيد الانتظار'}
            </Badge>
          </div>

          {/* Patient Details */}
          <div className="card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} style={{ color: 'var(--primary-color)' }} />
              <span>معلومات المريض</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>الاسم بالكامل:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patientName}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>رقم الهاتف:</span>
                <div style={{ fontWeight: 600, direction: 'ltr', textAlign: 'right' }}>
                  {appointment.phone || 'غير مسجل'}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>البريد الإلكتروني:</span>
                <div style={{ fontWeight: 500 }}>{appointment.email || 'غير مسجل'}</div>
              </div>
            </div>
          </div>

          {/* Doctor Details */}
          <div className="card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserRoundCheck size={18} style={{ color: 'var(--primary-color)' }} />
              <span>الطبيب والعيادة المختارة</span>
            </h4>
            {appointment.doctor ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>اسم الطبيب:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{appointment.doctor.name}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>التخصص:</span>
                  <div>{appointment.doctor.specialty}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>سعر الكشف:</span>
                  <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    {appointment.doctor.price} ر.س
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>موقع العيادة:</span>
                  <div>{appointment.doctor.location}</div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>طبيب غير متوفر أو تم حذفه</p>
            )}
          </div>

          {/* Appointment Schedule & Notes */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarDays size={20} style={{ color: 'var(--primary-color)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>تاريخ الموعد</span>
                  <div style={{ fontWeight: 700 }}>{appDate ? String(appDate).split('T')[0] : 'غير محدد'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} style={{ color: 'var(--primary-color)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>وقت الكشف</span>
                  <div style={{ fontWeight: 700 }}>{appTime || 'غير محدد'}</div>
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  ملاحظات المريض أو الأعراض:
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Modal Actions */}
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

export default AppointmentDetail;
