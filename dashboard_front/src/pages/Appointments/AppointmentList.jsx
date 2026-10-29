import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
import { useNotification } from '../../context/NotificationContext';
import { AppointmentDetail } from './AppointmentDetail';

export const AppointmentList = () => {
  const { showNotification } = useNotification();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [detailAppointmentId, setDetailAppointmentId] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      };
      const res = await adminApi.getAppointments(params);
      if (res.data.success) {
        setAppointments(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      showNotification('فشل تحميل قائمة الحجوزات الطبية', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await adminApi.updateAppointmentStatus(appointmentId, newStatus);
      showNotification('تم تحديث حالة الحجز بنجاح', 'success');
      // Update locally
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل تحديث حالة الحجز', 'error');
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteAppointment(appointmentToDelete.id);
      showNotification(`تم حذف الحجز #${appointmentToDelete.id} بنجاح`, 'success');
      setAppointmentToDelete(null);
      fetchAppointments(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل حذف الحجز', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
            إدارة الحجوزات الطبية
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            متابعة مواعيد الكشوفات الطبية والتواصل مع المرضى | إجمالي الحجوزات: <strong style={{ color: 'var(--primary-color)' }}>{total}</strong>
          </p>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          >
            <Search size={18} />
          </div>
          <input
            type="text"
            className="form-input"
            style={{ paddingRight: '38px' }}
            placeholder="البحث باسم المريض، رقم الهاتف، أو اسم الطبيب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">المواعيد المؤكدة</option>
            <option value="completed">الكشوفات المكتملة</option>
            <option value="cancelled">الملغية</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ minWidth: '160px' }}>
          <input
            type="date"
            className="form-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="تصفية حسب تاريخ الحجز"
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchAppointments(currentPage)}
          className="btn btn-outline"
          title="تحديث البيانات"
          style={{ padding: '9px 12px' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Main Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner variant="skeleton-table" />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="لا توجد حجوزات مطابقة"
            description="لم يتم العثور على أي مواعيد طبية وفق محددات البحث الحالية."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>رقم الحجز</th>
                  <th>المريض</th>
                  <th>الطبيب المختص</th>
                  <th>الموعد والوقت</th>
                  <th>الحالة وتعديلها</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  const patientName = app.patient_name || app.name || 'مريض';
                  const appDate = app.appointment_date || app.date;
                  const appTime = app.appointment_time || app.time;

                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700 }}>#{app.id}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patientName}</div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', direction: 'ltr', display: 'inline-block' }}>
                            {app.phone || '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {app.doctor ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{app.doctor.name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>
                              {app.doctor.specialty}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>غير محدد</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {appDate ? String(appDate).split('T')[0] : '—'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {appTime || 'غير محدد'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {/* Interactive Status Changer */}
                        <select
                          className="form-input"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            width: 'auto',
                            borderColor:
                              app.status === 'confirmed'
                                ? 'var(--success-color)'
                                : app.status === 'completed'
                                ? 'var(--info-color)'
                                : app.status === 'cancelled'
                                ? 'var(--danger-color)'
                                : 'var(--warning-color)',
                          }}
                          value={app.status || 'pending'}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="confirmed">تأكيد الموعد</option>
                          <option value="completed">كشف مكتمل</option>
                          <option value="cancelled">إلغاء الحجز</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setDetailAppointmentId(app.id)}
                            className="btn btn-outline"
                            style={{ padding: '6px 8px', color: 'var(--primary-color)' }}
                            title="عرض تفاصيل الحجز"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setAppointmentToDelete(app)}
                            className="btn btn-outline"
                            style={{ padding: '6px 8px', color: 'var(--danger-color)' }}
                            title="حذف الحجز"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              onPageChange={(page) => fetchAppointments(page)}
            />
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetail
        isOpen={Boolean(detailAppointmentId)}
        onClose={() => setDetailAppointmentId(null)}
        appointmentId={detailAppointmentId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(appointmentToDelete)}
        onClose={() => setAppointmentToDelete(null)}
        title="تأكيد حذف الحجز الطبي"
        maxWidth="440px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger-color)', margin: '0 auto 16px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
            هل أنت متأكد من حذف الحجز #{appointmentToDelete?.id}؟
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            سيتم إزالة موعد المريض (
            <strong style={{ color: 'var(--text-main)' }}>
              {appointmentToDelete?.patient_name || appointmentToDelete?.name}
            </strong>
            ) نهائياً من جدول العيادة.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setAppointmentToDelete(null)}
              className="btn btn-outline"
              disabled={deleting}
            >
              إلغاء التراجع
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={deleting}
              style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}
            >
              {deleting ? 'جاري الحذف...' : 'نعم، احذف الحجز'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AppointmentList;
