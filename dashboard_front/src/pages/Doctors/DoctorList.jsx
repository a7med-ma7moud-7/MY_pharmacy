import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Power,
  XCircle,
} from 'lucide-react';
import { adminApi, resolveImageUrl } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
import { SearchInput } from '../../components/common/SearchInput';
import { CustomSelect } from '../../components/common/CustomSelect';
import { useNotification } from '../../context/NotificationContext';
import { DoctorForm } from './DoctorForm';
import { DoctorDetail } from './DoctorDetail';

export const DoctorList = () => {
  const { showNotification } = useNotification();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // all | active | pending_verification | inactive
  const [creationFilter, setCreationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedSpecialty = useDebounce(specialtyFilter, 300);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState(null);
  const [detailDoctorId, setDetailDoctorId] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Password Reset Modal
  const [passwordDoctor, setPasswordDoctor] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPwd, setResettingPwd] = useState(false);

  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: debouncedSearch || undefined,
        specialty: debouncedSpecialty || undefined,
        creation_method: creationFilter || undefined,
        ...(tabFilter === 'active' ? { status: 'active', verification_status: 'verified' } : {}),
        ...(tabFilter === 'inactive' ? { status: 'inactive' } : {}),
        ...(tabFilter === 'pending_verification' ? { verification_status: 'pending_verification' } : {}),
      };
      const res = await adminApi.getDoctors(params);
      if (res.data.success) {
        setDoctors(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
        setPendingVerificationsCount(res.data.meta?.pending_verifications_count || 0);
      }
    } catch {
      showNotification('فشل تحميل قائمة الأطباء', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(1);
  }, [debouncedSearch, tabFilter, creationFilter, debouncedSpecialty]);

  const handleOpenAdd = () => {
    setSelectedDoctorForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doctor) => {
    setSelectedDoctorForEdit(doctor);
    setIsFormOpen(true);
  };

  const handleToggleAccountStatus = async (doc) => {
    const nextStatus = doc.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminApi.updateDoctorAccountStatus(doc.id, nextStatus);
      showNotification(res.data?.message || 'تم تحديث حالة الحساب', 'success');
      fetchDoctors(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'تعذر تغيير حالة الحساب', 'error');
    }
  };

  const handleVerifyDoctor = async (doc, verificationStatus) => {
    try {
      const res = await adminApi.verifyDoctor(doc.id, verificationStatus);
      showNotification(res.data?.message || 'تم تحديث حالة التوثيق', 'success');
      fetchDoctors(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'تعذر تحديث التوثيق', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordDoctor) return;
    if (newPassword.length < 8) {
      showNotification('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('كلمة المرور وتأكيدها غير متطابقين', 'error');
      return;
    }
    setResettingPwd(true);
    try {
      const res = await adminApi.resetDoctorPassword(passwordDoctor.id, {
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      showNotification(res.data?.message || 'تم إعادة تعيين كلمة المرور بأمان', 'success');
      setPasswordDoctor(null);
      setNewPassword('');
      setConfirmPassword('');
      fetchDoctors(currentPage);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message;
      showNotification(msg || 'تعذر إعادة تعيين كلمة المرور', 'error');
    } finally {
      setResettingPwd(false);
    }
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteDoctor(doctorToDelete.id);
      showNotification(`تم حذف الطبيب (${doctorToDelete.name}) بنجاح`, 'success');
      setDoctorToDelete(null);
      fetchDoctors(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل حذف الطبيب', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
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
            إدارة الأطباء وحسابات البوابة الطبية
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            إجمالي الكوادر الطبية: <strong style={{ color: 'var(--primary-color)' }}>{total}</strong> طبيب
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>إضافة طبيب جديد</span>
        </button>
      </div>

      {/* Quick Status & Verification Tabs */}
      <div className="status-tabs">
        {[
          { value: 'all', label: 'جميع الأطباء' },
          { value: 'active', label: 'نشطون وموثقون' },
          {
            value: 'pending_verification',
            label: `طلبات تسجيل الأطباء (${pendingVerificationsCount})`,
          },
          { value: 'inactive', label: 'معطلون / غير نشطين' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setTabFilter(tab.value)}
            className={`status-tab ${tabFilter === tab.value ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div
        className="card"
        style={{
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 240px' }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="البحث باسم الطبيب، التخصص، أو الهاتف..."
          />
        </div>

        <div style={{ minWidth: '175px' }}>
          <CustomSelect
            value={creationFilter}
            onChange={(val) => setCreationFilter(val)}
            options={[
              { value: '', label: 'جميع طرق الإنشاء' },
              { value: 'admin_created', label: 'إنشاء إداري (Admin)' },
              { value: 'self_registered', label: 'تسجيل ذاتي (Self)' },
            ]}
          />
        </div>

        <div style={{ minWidth: '155px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="تصفية حسب التخصص..."
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          />
        </div>

        <button
          onClick={() => fetchDoctors(currentPage)}
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
        ) : doctors.length === 0 ? (
          <EmptyState
            title="لا يوجد أطباء مطابقين"
            description="لم يتم العثور على سجلات أطباء وفق الفلتر المحدد."
            actionText="إضافة طبيب جديد"
            onAction={handleOpenAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>الطبيب</th>
                  <th>الهاتف</th>
                  <th>التخصص</th>
                  <th>طريقة الإنشاء والتسجيل</th>
                  <th>التوثيق والحالة</th>
                  <th>النشاط</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => {
                  const isPending = doc.verification_status === 'pending_verification';
                  const isSelf = doc.creation_method === 'self_registered';
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              backgroundColor: 'var(--bg-main)',
                              border: '1px solid var(--border-color)',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={resolveImageUrl(doc, '/placeholder-doctor.png')}
                              alt={doc.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.src =
                                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                              }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{doc.name}</div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {doc.price} ج.م • {doc.location}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ direction: 'ltr', textAlign: 'right', fontSize: '0.84rem', fontWeight: 600 }}>
                        {doc.number}
                      </td>
                      <td>
                        <Badge variant="info">{doc.specialty}</Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <Badge variant={isSelf ? 'warning' : 'info'}>
                            {isSelf ? 'تسجيل ذاتي' : 'إنشاء إداري'}
                          </Badge>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString('ar-EG') : '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <Badge variant={doc.status === 'active' ? 'success' : 'danger'}>
                            {doc.status === 'active' ? 'نشط' : 'معطل'}
                          </Badge>
                          {isPending && <Badge variant="warning">بانتظار التوثيق</Badge>}
                          {doc.verification_status === 'rejected' && <Badge variant="danger">مرفوض</Badge>}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <div>مرضى: <strong>{doc.patients_count ?? 0}</strong> • مواعيد: <strong>{doc.appointments_count ?? 0}</strong></div>
                        <div>حالات: <strong>{doc.treated_cases_count ?? 0}</strong> • تقييم: <strong>{doc.average_rating || 0}★</strong></div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleVerifyDoctor(doc, 'verified')}
                                className="btn btn-outline"
                                style={{ padding: '5px 8px', color: '#059669', borderColor: '#6ee7b7' }}
                                title="توثيق وتفعيل حساب الطبيب"
                              >
                                <CheckCircle2 size={15} />
                              </button>
                              <button
                                onClick={() => handleVerifyDoctor(doc, 'rejected')}
                                className="btn btn-outline"
                                style={{ padding: '5px 8px', color: 'var(--danger-color)' }}
                                title="رفض طلب التسجيل"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDetailDoctorId(doc.id)}
                            className="btn btn-outline"
                            style={{ padding: '5px 8px', color: 'var(--primary-color)' }}
                            title="عرض التفاصيل ونشاط البوابة"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleAccountStatus(doc)}
                            className="btn btn-outline"
                            style={{
                              padding: '5px 8px',
                              color: doc.status === 'active' ? '#d97706' : '#059669',
                            }}
                            title={doc.status === 'active' ? 'تعطيل حساب الطبيب' : 'تفعيل حساب الطبيب'}
                          >
                            <Power size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setPasswordDoctor(doc);
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            className="btn btn-outline"
                            style={{ padding: '5px 8px', color: '#7c3aed' }}
                            title="إعادة تعيين كلمة المرور بأمان"
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(doc)}
                            className="btn btn-outline"
                            style={{ padding: '5px 8px', color: 'var(--info-color)' }}
                            title="تعديل البيانات"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDoctorToDelete(doc)}
                            className="btn btn-outline"
                            style={{ padding: '5px 8px', color: 'var(--danger-color)' }}
                            title="حذف الطبيب"
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

        {total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              onPageChange={(page) => fetchDoctors(page)}
            />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <DoctorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        doctor={selectedDoctorForEdit}
        onSuccess={() => fetchDoctors(currentPage)}
      />

      {/* Detail & Activity Overview Modal */}
      <DoctorDetail
        isOpen={Boolean(detailDoctorId)}
        onClose={() => setDetailDoctorId(null)}
        doctorId={detailDoctorId}
      />

      {/* Secure Password Reset Dialog */}
      <Dialog
        isOpen={Boolean(passwordDoctor)}
        onClose={() => setPasswordDoctor(null)}
        title={`إعادة تعيين كلمة مرور: ${passwordDoctor?.name || ''}`}
        maxWidth="440px"
      >
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            يتم تشفير كلمة المرور الجديدة فوراً وإلغاء أي جلسات نشطة سابقة للطبيب. لا يتم عرض أو تخزين كلمات المرور كنص صريح أبداً.
          </p>
          <div>
            <label className="form-label required">كلمة المرور الجديدة</label>
            <input
              type="password"
              required
              minLength={8}
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8 أحرف أو أكثر"
            />
          </div>
          <div>
            <label className="form-label required">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              required
              minLength={8}
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد كتابة كلمة المرور"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={() => setPasswordDoctor(null)} className="btn btn-outline">
              إلغاء
            </button>
            <button type="submit" disabled={resettingPwd} className="btn btn-primary">
              {resettingPwd ? 'جاري التحديث...' : 'حفظ كلمة المرور الجديدة'}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(doctorToDelete)}
        onClose={() => setDoctorToDelete(null)}
        title="تأكيد حذف الطبيب"
        maxWidth="440px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger-color)', margin: '0 auto 16px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
            هل أنت متأكد من رغبتك في حذف هذا الطبيب؟
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            سيتم إزالة حساب الطبيب <strong style={{ color: 'var(--text-main)' }}>{doctorToDelete?.name}</strong> وملفه المرتبط بشكل نهائي.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => setDoctorToDelete(null)} className="btn btn-outline" disabled={deleting}>
              إلغاء
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={deleting}
              style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}
            >
              {deleting ? 'جاري الحذف...' : 'نعم، احذف الطبيب'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DoctorList;
