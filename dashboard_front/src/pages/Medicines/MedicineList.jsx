import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  PackagePlus,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
import { useNotification } from '../../context/NotificationContext';
import { MedicineForm } from './MedicineForm';
import { MedicineDetail } from './MedicineDetail';

export const MedicineList = () => {
  const { showNotification } = useNotification();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedicineForEdit, setSelectedMedicineForEdit] = useState(null);
  const [detailMedicineId, setDetailMedicineId] = useState(null);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Stock Quick Edit Modal
  const [stockEditMedicine, setStockEditMedicine] = useState(null);
  const [newStockCount, setNewStockCount] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);

  const fetchMedicines = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: searchTerm || undefined,
        type: typeFilter || undefined,
      };
      const res = await adminApi.getMedicines(params);
      if (res.data.success) {
        setMedicines(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      showNotification('فشل تحميل قائمة الأدوية', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(1);
  }, [searchTerm, typeFilter]);

  const handleOpenAdd = () => {
    setSelectedMedicineForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (med) => {
    setSelectedMedicineForEdit(med);
    setIsFormOpen(true);
  };

  const handleOpenStockModal = (med) => {
    setStockEditMedicine(med);
    setNewStockCount(med.count !== undefined ? String(med.count) : '0');
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockEditMedicine) return;

    const countNum = parseInt(newStockCount, 10);
    if (isNaN(countNum) || countNum < 0) {
      showNotification('يرجى إدخال كمية صحيحة أكبر من أو تساوي 0', 'error');
      return;
    }

    setUpdatingStock(true);
    try {
      await adminApi.updateMedicineStock(stockEditMedicine.id, countNum);
      showNotification(`تم تحديث مخزون (${stockEditMedicine.name}) بنجاح إلى ${countNum} عبوة`, 'success');
      setStockEditMedicine(null);
      fetchMedicines(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل تحديث المخزون', 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleDelete = async () => {
    if (!medicineToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteMedicine(medicineToDelete.id);
      showNotification(`تم حذف الدواء (${medicineToDelete.name}) بنجاح`, 'success');
      setMedicineToDelete(null);
      fetchMedicines(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل حذف الدواء', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title & Add Button */}
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
            إدارة المخزون والأدوية
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            إجمالي الأصناف المسجلة: <strong style={{ color: 'var(--primary-color)' }}>{total}</strong> صنف دوائي
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>إضافة دواء جديد</span>
        </button>
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
            placeholder="البحث باسم الدواء، الاستخدام، أو الشكل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">جميع الأشكال الدوائية</option>
            <option value="أقراص">أقراص</option>
            <option value="كبسولات">كبسولات</option>
            <option value="شراب">شراب</option>
            <option value="حقن">حقن</option>
            <option value="مرهم / كريم">مرهم / كريم</option>
            <option value="قطرات">قطرات</option>
          </select>
        </div>

        <button
          onClick={() => fetchMedicines(currentPage)}
          className="btn btn-outline"
          title="تحديث البيانات"
          style={{ padding: '9px 12px' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Main Medicines Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner variant="skeleton-table" />
        ) : medicines.length === 0 ? (
          <EmptyState
            title="لا توجد أدوية مطابقة"
            description="لم نجد أصنافاً دوائية وفق كلمات البحث الحالية، أو لم تتم إضافة أدوية بعد."
            actionText="إضافة دواء جديد"
            onAction={handleOpenAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>الصنف الدوائي</th>
                  <th>دواعي الاستعمال</th>
                  <th>الشكل</th>
                  <th>السعر</th>
                  <th>الكمية بالمخزن</th>
                  <th>حالة التوفر</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med) => (
                  <tr key={med.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              med.image
                                ? med.image.startsWith('http')
                                  ? med.image
                                  : `http://localhost:8080/storage/${med.image}`
                                : '/placeholder-medicine.png'
                            }
                            alt={med.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              e.currentTarget.src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M6 3h12v2H6zm0 16h12v2H6zm-2-4h16V7H4v8zm2-6h12v4H6V9z"/></svg>';
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{med.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{med.id}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span title={med.propose} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {med.propose || '—'}
                      </span>
                    </td>
                    <td>
                      <Badge variant="info">{med.type || 'أقراص'}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-color)' }}>{med.price} ر.س</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{med.count}</span>
                        <button
                          onClick={() => handleOpenStockModal(med)}
                          className="btn btn-outline"
                          style={{ padding: '4px 6px', fontSize: '0.72rem' }}
                          title="تعديل سريع للمخزون"
                        >
                          <PackagePlus size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <Badge variant={med.count > 10 ? 'success' : med.count > 0 ? 'warning' : 'danger'}>
                        {med.count > 10
                          ? 'متوفر'
                          : med.count > 0
                          ? 'مخزون منخفض'
                          : 'نفد المخزون'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setDetailMedicineId(med.id)}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--primary-color)' }}
                          title="عرض التفاصيل"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--info-color)' }}
                          title="تعديل الدواء"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setMedicineToDelete(med)}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--danger-color)' }}
                          title="حذف الدواء"
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

        {/* Pagination Footer */}
        {total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              onPageChange={(page) => fetchMedicines(page)}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <MedicineForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        medicine={selectedMedicineForEdit}
        onSuccess={() => fetchMedicines(currentPage)}
      />

      {/* Detail Modal */}
      <MedicineDetail
        isOpen={Boolean(detailMedicineId)}
        onClose={() => setDetailMedicineId(null)}
        medicineId={detailMedicineId}
      />

      {/* Quick Stock Modal */}
      <Dialog
        isOpen={Boolean(stockEditMedicine)}
        onClose={() => setStockEditMedicine(null)}
        title={`تعديل كمية المخزون: ${stockEditMedicine?.name}`}
        maxWidth="400px"
      >
        <form onSubmit={handleSaveStock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label required">الكمية الجديدة المتوفرة في المخزن (عبوة)</label>
            <input
              type="number"
              min="0"
              required
              className="form-input"
              value={newStockCount}
              onChange={(e) => setNewStockCount(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setStockEditMedicine(null)}
              className="btn btn-outline"
              disabled={updatingStock}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updatingStock}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {updatingStock && <Loader2 size={16} className="spin-animation" />}
              <span>تحديث المخزون</span>
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(medicineToDelete)}
        onClose={() => setMedicineToDelete(null)}
        title="تأكيد حذف صنف الدواء"
        maxWidth="440px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger-color)', margin: '0 auto 16px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
            هل أنت متأكد من رغبتك في حذف هذا الدواء؟
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            سيتم إزالة صنف الدواء <strong style={{ color: 'var(--text-main)' }}>{medicineToDelete?.name}</strong> من
            المتجر والمخزون نهائياً.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setMedicineToDelete(null)}
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
              {deleting ? 'جاري الحذف...' : 'نعم، احذف الدواء'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MedicineList;
