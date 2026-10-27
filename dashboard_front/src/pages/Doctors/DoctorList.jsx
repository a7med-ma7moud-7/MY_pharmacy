import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
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

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState(null);
  const [detailDoctorId, setDetailDoctorId] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        specialty: specialtyFilter || undefined,
      };
      const res = await adminApi.getDoctors(params);
      if (res.data.success) {
        setDoctors(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      showNotification('فشل تحميل قائمة الأطباء', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(1);
  }, [searchTerm, statusFilter, specialtyFilter]);

  const handleOpenAdd = () => {
    setSelectedDoctorForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doctor) => {
    setSelectedDoctorForEdit(doctor);
    setIsFormOpen(true);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
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
            إدارة الأطباء والكوادر الطبية
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            إجمالي الأطباء المتاحين بالمنظومة: <strong style={{ color: 'var(--primary-color)' }}>{total}</strong> طبيب
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

      {/* Filters & Search Bar */}
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
            placeholder="البحث باسم الطبيب، التخصص، أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '150px' }}>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="active">الأطباء النشطين</option>
            <option value="inactive">غير النشطين</option>
          </select>
        </div>

        {/* Specialty Filter */}
        <div style={{ minWidth: '160px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="تصفية حسب التخصص..."
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchDoctors(currentPage)}
          className="btn btn-outline"
          title="تحديث البيانات"
          style={{ padding: '9px 12px' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0' }}>
            <LoadingSpinner text="جاري تحميل سجلات الأطباء..." />
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="لا يوجد أطباء مطابقين"
            description="لم يتم العثور على أطباء وفق معايير البحث الحالية، أو لم تتم إضافة أطباء بعد."
            actionText="إضافة طبيب الآن"
            onAction={handleOpenAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>الطبيب</th>
                  <th>التخصص</th>
                  <th>سعر الكشف</th>
                  <th>الهاتف</th>
                  <th>العنوان والمدينة</th>
                  <th>الحالة</th>
                  <th>الاشتراك</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              doc.image
                                ? doc.image.startsWith('http')
                                  ? doc.image
                                  : `http://localhost:8080/storage/${doc.image}`
                                : '/placeholder-doctor.png'
                            }
                            alt={doc.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{doc.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{doc.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant="info">{doc.specialty}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-color)' }}>{doc.price} ر.س</strong>
                    </td>
                    <td style={{ direction: 'ltr', textAlign: 'right', fontSize: '0.85rem' }}>
                      {doc.number}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {doc.location}
                    </td>
                    <td>
                      <Badge variant={doc.status === 'active' ? 'success' : 'danger'}>
                        {doc.status === 'active' ? 'نشط' : 'معطل'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={doc.subscription === 'subscribed' ? 'info' : 'warning'}>
                        {doc.subscription === 'subscribed' ? 'مشترك' : 'غير مشترك'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setDetailDoctorId(doc.id)}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--primary-color)' }}
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--info-color)' }}
                          title="تعديل البيانات"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDoctorToDelete(doc)}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--danger-color)' }}
                          title="حذف الطبيب"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
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

      {/* Doctor Create/Edit Form Modal */}
      <DoctorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        doctor={selectedDoctorForEdit}
        onSuccess={() => fetchDoctors(currentPage)}
      />

      {/* Doctor Detail Modal */}
      <DoctorDetail
        isOpen={Boolean(detailDoctorId)}
        onClose={() => setDetailDoctorId(null)}
        doctorId={detailDoctorId}
      />

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
            سيتم إزالة حساب الطبيب <strong style={{ color: 'var(--text-main)' }}>{doctorToDelete?.name}</strong> وجميع
            الصور والمرفقات التابعة له من المنظومة بشكل نهائي.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setDoctorToDelete(null)}
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
              {deleting ? 'جاري الحذف...' : 'نعم، احذف الطبيب'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DoctorList;
