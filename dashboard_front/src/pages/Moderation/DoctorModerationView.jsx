import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import { EyeOff, Eye, Trash2, CheckCircle2, Star, ShieldAlert } from 'lucide-react';

export const DoctorModerationView = () => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('cases'); // cases | reviews
  const [cases, setCases] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reportedOnly, setReportedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'cases') {
        const res = await adminApi.getTreatedCases();
        if (res.data?.success) setCases(res.data.data || []);
      } else {
        const res = await adminApi.getReviews(reportedOnly ? { reported_only: true } : {});
        if (res.data?.success) setReviews(res.data.data || []);
      }
    } catch {
      showNotification('فشل تحميل بيانات المراجعة والإشراف', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, reportedOnly, showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleCaseVisibility = async (tc) => {
    const nextStatus = tc.status === 'published' ? 'hidden_by_admin' : 'published';
    try {
      const res = await adminApi.moderateTreatedCase(tc.id, { status: nextStatus });
      showNotification(res.data?.message || 'تم تحديث حالة النشر', 'success');
      loadData();
    } catch {
      showNotification('تعذر تحديث حالة الحالة العلاجية', 'error');
    }
  };

  const handleDeleteCase = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحالة العلاجية نهائياً؟')) return;
    try {
      await adminApi.deleteTreatedCase(id);
      showNotification('تم حذف الحالة العلاجية', 'success');
      loadData();
    } catch {
      showNotification('تعذر الحذف', 'error');
    }
  };

  const handleModerateReview = async (rev, nextStatus, clearReport = false) => {
    try {
      const res = await adminApi.moderateReview(rev.id, {
        status: nextStatus,
        clear_report: clearReport,
      });
      showNotification(res.data?.message || 'تم تحديث حالة التقييم', 'success');
      loadData();
    } catch {
      showNotification('تعذر تحديث التقييم', 'error');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('هل تريد حذف هذا التقييم نهائياً؟')) return;
    try {
      await adminApi.deleteReview(id);
      showNotification('تم حذف التقييم', 'success');
      loadData();
    } catch {
      showNotification('تعذر حذف التقييم', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
          إشراف الحالات العلاجية وتقييمات الأطباء
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>
          تُنشر حالات الأطباء مباشرة دون انتظار موافقة مسبقة؛ يتيح هذا القسم للإدارة مراجعة أي مخالفات لخصوصية المرضى أو التقييمات المُبلّغ عنها فقط.
        </p>
      </div>

      <div className="status-tabs" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`status-tab ${activeTab === 'cases' ? 'active' : ''}`}
          >
            الحالات العلاجية المنشورة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`status-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            تقييمات المرضى والبلاغات
          </button>
        </div>

        {activeTab === 'reviews' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={reportedOnly}
              onChange={(e) => setReportedOnly(e.target.checked)}
            />
            <span>إظهار التقييمات المُبلّغ عنها فقط</span>
          </label>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner variant="skeleton-table" />
        ) : activeTab === 'cases' ? (
          cases.length === 0 ? (
            <EmptyState
              title="لا توجد حالات علاجية منشورة بعد"
              description="ستظهر هنا الحالات السريرية التي ينشرها الأطباء عبر بوابتهم."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>عنوان الحالة</th>
                    <th>الطبيب</th>
                    <th>التخصص</th>
                    <th>تاريخ النشر</th>
                    <th>الحالة</th>
                    <th style={{ textAlign: 'center' }}>إجراءات الإشراف</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((tc) => (
                    <tr key={tc.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{tc.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tc.description}
                        </div>
                      </td>
                      <td>{tc.doctor?.name || '—'}</td>
                      <td><Badge variant="info">{tc.specialty}</Badge></td>
                      <td style={{ fontSize: '0.82rem' }}>{tc.published_at}</td>
                      <td>
                        <Badge variant={tc.status === 'published' ? 'success' : 'danger'}>
                          {tc.status === 'published' ? 'منشورة للجمهور' : 'مخفية إدارياً'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleCaseVisibility(tc)}
                            className="btn btn-outline"
                            style={{ padding: '5px 8px' }}
                            title={tc.status === 'published' ? 'إخفاء لمخالفة السياسة' : 'إعادة إظهار'}
                          >
                            {tc.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => handleDeleteCase(tc.id)}
                            className="btn btn-outline"
                            style={{ padding: '5px 8px', color: 'var(--danger-color)' }}
                            title="حذف نهائي"
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
          )
        ) : reviews.length === 0 ? (
          <EmptyState
            title="لا توجد تقييمات مطابقة"
            description="لا توجد تقييمات مسجلة أو مُبلّغ عنها حالياً."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>الطبيب</th>
                  <th>المريض</th>
                  <th>التقييم والتعليق</th>
                  <th>بلاغ الطبيب</th>
                  <th>الحالة</th>
                  <th style={{ textAlign: 'center' }}>إجراءات الإشراف</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev.id}>
                    <td style={{ fontWeight: 700 }}>{rev.doctor?.name || '—'}</td>
                    <td>{rev.user?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
                        <Star size={14} fill="#f59e0b" /> <span>{rev.rating}/5</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {rev.comment || 'بدون تعليق'}
                      </div>
                    </td>
                    <td>
                      {rev.report_reason ? (
                        <span style={{ fontSize: '0.76rem', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                          <ShieldAlert size={14} /> {rev.report_reason}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>لا يوجد بلاغ</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={(rev.status || 'visible') === 'visible' ? 'success' : 'danger'}>
                        {(rev.status || 'visible') === 'visible' ? 'ظاهر' : 'مخفي'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        {rev.report_reason && (
                          <button
                            onClick={() => handleModerateReview(rev, 'visible', true)}
                            className="btn btn-outline"
                            style={{ padding: '5px 8px', color: '#059669' }}
                            title="رفض البلاغ وإبقاء التقييم ظاهراً"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleModerateReview(
                              rev,
                              (rev.status || 'visible') === 'visible' ? 'hidden' : 'visible'
                            )
                          }
                          className="btn btn-outline"
                          style={{ padding: '5px 8px' }}
                          title={(rev.status || 'visible') === 'visible' ? 'إخفاء التقييم' : 'إظهار التقييم'}
                        >
                          {(rev.status || 'visible') === 'visible' ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="btn btn-outline"
                          style={{ padding: '5px 8px', color: 'var(--danger-color)' }}
                          title="حذف التقييم"
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
      </div>
    </div>
  );
};

export default DoctorModerationView;
