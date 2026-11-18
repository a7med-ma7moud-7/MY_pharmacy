import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Store,
  MapPin,
  ExternalLink,
  Power,
  AlertTriangle,
  Pill,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { adminApi, resolveImageUrl } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
import { SearchInput } from '../../components/common/SearchInput';
import { StatCard } from '../../components/dashboard/StatCard';
import { useNotification } from '../../context/NotificationContext';
import { PharmacyForm } from './PharmacyForm';

export const PharmacyList = () => {
  const { showNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pharmacies, setPharmacies] = useState([]);
  const [meta, setMeta] = useState({
    total_pharmacies: 0,
    active_pharmacies: 0,
    inactive_pharmacies: 0,
    total_assigned_medicines: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacyToDelete, setPharmacyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPharmacies = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getPharmacies({
        page,
        per_page: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      if (res.data.success) {
        setPharmacies(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      }
    } catch {
      showNotification('فشل تحميل قائمة الصيدليات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setSelectedPharmacy(null);
      setIsFormOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleToggleStatus = async (pharmacy) => {
    try {
      const nextStatus = !pharmacy.is_active;
      await adminApi.togglePharmacyStatus(pharmacy.id, nextStatus);
      showNotification(
        nextStatus ? `تم تفعيل حساب (${pharmacy.name})` : `تم إيقاف حساب (${pharmacy.name})`,
        'success'
      );
      fetchPharmacies(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'تعذر تغيير حالة الصيدلية', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pharmacyToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deletePharmacy(pharmacyToDelete.id);
      showNotification(`تم حذف الصيدلية (${pharmacyToDelete.name}) بنجاح`, 'success');
      setPharmacyToDelete(null);
      fetchPharmacies(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'تعذر حذف الصيدلية', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
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
            إدارة الصيدليات المعتمدة وحساباتها
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            إضافة الصيدليات وتحديد إحداثياتها الجغرافية (Lat / Long) وتخصيص حساب داشبورد مستقل لكل صيدلية
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPharmacy(null);
            setIsFormOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>إضافة صيدلية جديدة</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          title="إجمالي الصيدليات"
          value={meta.total_pharmacies}
          icon={Store}
          color="primary"
          subtitle="مسجلة من السوبر أدمن"
        />
        <StatCard
          title="صيدليات نشطة"
          value={meta.active_pharmacies}
          icon={CheckCircle2}
          color="success"
          subtitle="مفعّلة للدخول والطلبات"
        />
        <StatCard
          title="صيدليات موقوفة"
          value={meta.inactive_pharmacies}
          icon={Power}
          color="warning"
          subtitle="موقوفة مؤقتاً"
        />
        <StatCard
          title="الأصناف المرتبطة بالصيدليات"
          value={meta.total_assigned_medicines}
          icon={Pill}
          color="info"
          subtitle="مخزون مستقل لكل صيدلية"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="status-tabs">
        {[
          { value: '', label: 'جميع الصيدليات' },
          { value: 'active', label: 'نشطة ومفعّلة' },
          { value: 'inactive', label: 'موقوفة' },
        ].map((tab) => (
          <button
            key={tab.value || 'all'}
            type="button"
            className={`status-tab ${statusFilter === tab.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
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
        <div style={{ flex: '1 1 280px' }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="البحث باسم الصيدلية، المدينة، البريد، الهاتف، أو رقم الترخيص..."
          />
        </div>

        <button
          onClick={() => fetchPharmacies(currentPage)}
          className="btn btn-outline"
          title="تحديث البيانات"
          style={{ padding: '9px 12px' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Pharmacies Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner variant="skeleton-table" />
        ) : pharmacies.length === 0 ? (
          <EmptyState
            title="لا توجد صيدليات مسجلة"
            description="أضف أول صيدلية مع إحداثياتها الجغرافية (Lat & Long) لإنشاء لوحة تحكم ومخزون خاص بها."
            actionText="إضافة صيدلية جديدة"
            onAction={() => {
              setSelectedPharmacy(null);
              setIsFormOpen(true);
            }}
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>الصيدلية</th>
                  <th>بيانات الدخول للداشبورد</th>
                  <th>العنوان والإحداثيات (Lat / Long)</th>
                  <th>المخزون الخاص</th>
                  <th>الطلبات</th>
                  <th>الحالة</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pharmacies.map((ph) => (
                  <tr key={ph.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-600)',
                            border: '1px solid var(--primary-200)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {ph.image ? (
                            <img
                              src={resolveImageUrl(ph)}
                              alt={ph.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Store size={20} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{ph.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {ph.license_number ? `ترخيص: ${ph.license_number}` : `ID: #${ph.id}`}
                            {ph.working_hours ? ` • ${ph.working_hours}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                        <strong dir="ltr" style={{ color: 'var(--text-main)' }}>
                          {ph.login_email || ph.email || '—'}
                        </strong>
                        {ph.login_phone && (
                          <span dir="ltr" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {ph.login_phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {ph.city || 'غير محدد'}
                          {ph.address ? ` — ${ph.address}` : ''}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${ph.latitude},${ph.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          title="فتح الموقع على خرائط Google"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            width: 'fit-content',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: 'var(--slate-100)',
                            border: '1px solid var(--slate-200)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--primary-600)',
                          }}
                        >
                          <MapPin size={12} />
                          <span>
                            {Number(ph.latitude).toFixed(5)}, {Number(ph.longitude).toFixed(5)}
                          </span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.86rem' }}>
                          {ph.medicines_count || 0} صنف دوائي
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700 }}>
                          {Number(ph.total_stock || 0).toLocaleString()} عبوة بالمخزن
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <ShoppingBag size={14} style={{ color: 'var(--info-color)' }} />
                        <span>{ph.orders_count || 0} طلب</span>
                      </div>
                    </td>

                    <td>
                      <Badge variant={ph.is_active ? 'success' : 'danger'}>
                        {ph.is_active ? 'نشطة' : 'موقوفة'}
                      </Badge>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleStatus(ph)}
                          className="btn btn-outline"
                          style={{
                            padding: '6px 8px',
                            color: ph.is_active ? 'var(--warning-color)' : 'var(--success-color)',
                          }}
                          title={ph.is_active ? 'إيقاف حساب الصيدلية' : 'تفعيل حساب الصيدلية'}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPharmacy(ph);
                            setIsFormOpen(true);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--info-color)' }}
                          title="تعديل بيانات وإحداثيات الصيدلية"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setPharmacyToDelete(ph)}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', color: 'var(--danger-color)' }}
                          title="حذف الصيدلية"
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

        {total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              total={total}
              onPageChange={(page) => fetchPharmacies(page)}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <PharmacyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        pharmacy={selectedPharmacy}
        onSuccess={() => fetchPharmacies(currentPage)}
      />

      {/* Delete Confirmation */}
      <Dialog
        isOpen={Boolean(pharmacyToDelete)}
        onClose={() => setPharmacyToDelete(null)}
        title="تأكيد حذف الصيدلية"
        maxWidth="440px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger-color)', margin: '0 auto 16px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
            هل أنت متأكد من حذف هذه الصيدلية؟
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            سيتم حذف الصيدلية <strong style={{ color: 'var(--text-main)' }}>{pharmacyToDelete?.name}</strong> وحساب
            الدخول الخاص بها ومخزون أدويتها المرتبط نهائياً.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => setPharmacyToDelete(null)} className="btn btn-outline" disabled={deleting}>
              إلغاء
            </button>
            <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
              {deleting ? 'جاري الحذف...' : 'نعم، احذف الصيدلية'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PharmacyList;
