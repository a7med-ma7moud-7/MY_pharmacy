import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import { OrderDetail } from './OrderDetail';

export const OrderList = () => {
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [detailOrderId, setDetailOrderId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      };
      const res = await adminApi.getOrders(params);
      if (res.data.success) {
        setOrders(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      showNotification('فشل تحميل قائمة الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [searchTerm, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      showNotification('تم تحديث حالة الطلب بنجاح', 'success');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل تحديث حالة الطلب', 'error');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportOrders();
      // Create download blob
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('تم تصدير ملف إكسل بنجاح', 'success');
    } catch (err) {
      showNotification('تعذر تصدير تقرير الطلبات حالياً', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            إدارة طلبات الأدوية والمبيعات
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            متابعة فواتير وشحنات المتجر الإلكتروني | إجمالي الطلبات: <strong style={{ color: 'var(--primary-color)' }}>{total}</strong> طلب
          </p>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={handleExportExcel}
          disabled={exporting}
          className="btn btn-outline"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            borderColor: '#10b981',
            color: '#10b981',
            fontWeight: 700,
          }}
        >
          {exporting ? <Loader2 size={16} className="spin-animation" /> : <FileSpreadsheet size={16} />}
          <span>{exporting ? 'جاري تجهيز التقرير...' : 'تصدير إلى Excel'}</span>
        </button>
      </div>

      {/* Filters Box */}
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
            placeholder="البحث برقم الطلب، اسم العميل، أو الهاتف..."
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
            <option value="pending">طلبات قيد الانتظار</option>
            <option value="processing">جاري التجهيز</option>
            <option value="completed">الطلبات المكتملة</option>
            <option value="cancelled">الملغية</option>
          </select>
        </div>

        <button
          onClick={() => fetchOrders(currentPage)}
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
          <div style={{ padding: '60px 0' }}>
            <LoadingSpinner text="جاري استرجاع سجلات الطلبات..." />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="لا توجد طلبات مطابقة"
            description="لم نتمكن من العثور على أي طلبات تطابق معايير التصفية والبحث المحددة."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>الهاتف</th>
                  <th>عدد الأصناف</th>
                  <th>المبلغ الإجمالي</th>
                  <th>طريقة الاستلام</th>
                  <th>حالة الطلب</th>
                  <th>تاريخ الطلب</th>
                  <th style={{ textAlign: 'center' }}>الفاتورة</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const customerName = order.customer_name || order.name || 'عميل المتجر';
                  const customerPhone = order.customer_phone || order.phone;

                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700 }}>#{order.id}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{customerName}</strong>
                      </td>
                      <td style={{ direction: 'ltr', textAlign: 'right', fontSize: '0.85rem' }}>
                        {customerPhone || '—'}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {order.items ? `${order.items.length} صنف` : '—'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                          {Number(order.total_price || 0).toLocaleString()} ر.س
                        </strong>
                      </td>
                      <td>
                        <Badge variant="info">{order.delivery_method || 'توصيل'}</Badge>
                      </td>
                      <td>
                        <select
                          className="form-input"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            width: 'auto',
                            borderColor:
                              order.status === 'completed'
                                ? 'var(--success-color)'
                                : order.status === 'processing'
                                ? 'var(--info-color)'
                                : order.status === 'cancelled'
                                ? 'var(--danger-color)'
                                : 'var(--warning-color)',
                          }}
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="completed">مكتمل ومسلّم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-EG') : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setDetailOrderId(order.id)}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', color: 'var(--primary-color)' }}
                          title="عرض الفاتورة وتفاصيل المنتجات"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              onPageChange={(page) => fetchOrders(page)}
            />
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetail
        isOpen={Boolean(detailOrderId)}
        onClose={() => setDetailOrderId(null)}
        orderId={detailOrderId}
        onStatusChange={(id, st) => {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: st } : o)));
        }}
      />
    </div>
  );
};

export default OrderList;
