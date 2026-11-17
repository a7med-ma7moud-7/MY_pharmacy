import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Bot,
  BarChart3,
  Settings,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
  Lock,
  Plus,
  CheckCircle2,
  Trash2,
  Power,
  Activity,
  Edit3,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
import { useNotification } from '../../context/NotificationContext';

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TABS = [
  { id: 'analytics', label: 'الإحصائيات والتحليلات', icon: BarChart3 },
  { id: 'config', label: 'إعدادات الذكاء الاصطناعي', icon: Settings },
  { id: 'sources', label: 'مصادر المعرفة الطبية', icon: BookOpen },
  { id: 'feedback', label: 'تقييمات المستخدمين', icon: ThumbsUp },
  { id: 'monitoring', label: 'المراقبة والخصوصية', icon: ShieldAlert },
];

const EMPTY_SOURCE_FORM = {
  name: '',
  source_type: 'medical_organization',
  base_url: '',
  language: 'ar,en',
  is_enabled: true,
  summary_notes: '',
};

export const AiChatList = () => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('analytics');

  // 1. Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // 2. Configuration State
  const [configForm, setConfigForm] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  // 3. Knowledge Sources State
  const [sources, setSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [sourceForm, setSourceForm] = useState(EMPTY_SOURCE_FORM);
  const [sourceSaving, setSourceSaving] = useState(false);

  // 4. Feedback State
  const [feedbackRows, setFeedbackRows] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackLastPage, setFeedbackLastPage] = useState(1);
  const [feedbackFilterType, setFeedbackFilterType] = useState('');

  // 5. Monitoring & Privacy-Masked Metadata State
  const [logs, setLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [maskedChats, setMaskedChats] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logStatusFilter, setLogStatusFilter] = useState('');

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await adminApi.getAiAnalytics();
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch {
      showNotification('تعذر تحميل إحصائيات الصيدلي الذكي', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [showNotification]);

  const loadConfiguration = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await adminApi.getAiConfiguration();
      if (res.data?.success) {
        setConfigForm(res.data.data.settings);
        setIntegrationStatus(res.data.data.integration_status || {});
      }
    } catch {
      showNotification('تعذر تحميل إعدادات الصيدلي الذكي', 'error');
    } finally {
      setConfigLoading(false);
    }
  }, [showNotification]);

  const loadSources = useCallback(async () => {
    setSourcesLoading(true);
    try {
      const res = await adminApi.getAiKnowledgeSources();
      if (res.data?.success) {
        setSources(res.data.data || []);
      }
    } catch {
      showNotification('تعذر تحميل مصادر المعرفة الطبية', 'error');
    } finally {
      setSourcesLoading(false);
    }
  }, [showNotification]);

  const loadFeedback = useCallback(
    async (page = 1) => {
      setFeedbackLoading(true);
      try {
        const res = await adminApi.getAiFeedback({
          page,
          per_page: 10,
          feedback_type: feedbackFilterType || undefined,
        });
        if (res.data?.success) {
          setFeedbackRows(res.data.data || []);
          setFeedbackPage(res.data.current_page || 1);
          setFeedbackLastPage(res.data.last_page || 1);
        }
      } catch {
        showNotification('تعذر تحميل تقييمات المستخدمين', 'error');
      } finally {
        setFeedbackLoading(false);
      }
    },
    [feedbackFilterType, showNotification]
  );

  const loadMonitoring = useCallback(async () => {
    setLogsLoading(true);
    try {
      const [logsRes, chatsRes] = await Promise.all([
        adminApi.getAiLogs({ per_page: 12, status: logStatusFilter || undefined }),
        adminApi.getAiChats({ per_page: 8 }),
      ]);
      if (logsRes.data?.success) {
        setLogs(logsRes.data.data || []);
        setAuditLogs(logsRes.data.audit_logs || []);
      }
      if (chatsRes.data?.success) {
        setMaskedChats(chatsRes.data.data || []);
      }
    } catch {
      showNotification('تعذر تحميل سجلات المراقبة', 'error');
    } finally {
      setLogsLoading(false);
    }
  }, [logStatusFilter, showNotification]);

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'config') loadConfiguration();
    if (activeTab === 'sources') loadSources();
    if (activeTab === 'feedback') loadFeedback(1);
    if (activeTab === 'monitoring') loadMonitoring();
  }, [activeTab, loadAnalytics, loadConfiguration, loadSources, loadFeedback, loadMonitoring]);

  const handleSaveConfiguration = async (e) => {
    e.preventDefault();
    if (!configForm || configSaving) return;
    setConfigSaving(true);
    try {
      const res = await adminApi.updateAiConfiguration(configForm);
      if (res.data?.success) {
        setConfigForm(res.data.data.settings);
        setIntegrationStatus(res.data.data.integration_status || {});
        showNotification('تم حفظ إعدادات الصيدلي الذكي بنجاح', 'success');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'تعذر حفظ الإعدادات', 'error');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleOpenSourceModal = (src = null) => {
    if (src) {
      setEditingSource(src);
      setSourceForm({
        name: src.name,
        source_type: src.source_type,
        base_url: src.base_url,
        language: src.language,
        is_enabled: src.is_enabled,
        summary_notes: src.summary_notes || '',
      });
    } else {
      setEditingSource(null);
      setSourceForm(EMPTY_SOURCE_FORM);
    }
    setIsSourceModalOpen(true);
  };

  const handleSaveSource = async (e) => {
    e.preventDefault();
    if (sourceSaving) return;
    setSourceSaving(true);
    try {
      if (editingSource) {
        await adminApi.updateAiKnowledgeSource(editingSource.id, sourceForm);
        showNotification('تم تحديث مصدر المعرفة بنجاح', 'success');
      } else {
        await adminApi.createAiKnowledgeSource(sourceForm);
        showNotification('تمت إضافة مصدر المعرفة الطبية بنجاح', 'success');
      }
      setIsSourceModalOpen(false);
      loadSources();
    } catch (err) {
      showNotification(err.response?.data?.message || 'تحقق من صحة الرابط والبيانات', 'error');
    } finally {
      setSourceSaving(false);
    }
  };

  const handleToggleSource = async (id) => {
    try {
      const res = await adminApi.toggleAiKnowledgeSource(id);
      showNotification(res.data?.message || 'تم تحديث حالة المصدر', 'success');
      loadSources();
    } catch {
      showNotification('تعذر تغيير حالة المصدر', 'error');
    }
  };

  const handleSyncSource = async (id) => {
    if (syncingId) return;
    setSyncingId(id);
    try {
      const res = await adminApi.syncAiKnowledgeSource(id);
      showNotification(res.data?.message || 'تمت مزامنة المصدر بنجاح', 'success');
      loadSources();
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل الاتصال بالمصدر الخارجي', 'error');
      loadSources();
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المصدر من قاعدة المعرفة؟')) return;
    try {
      await adminApi.deleteAiKnowledgeSource(id);
      showNotification('تم حذف المصدر بنجاح', 'success');
      loadSources();
    } catch {
      showNotification('تعذر حذف المصدر', 'error');
    }
  };

  const handleMarkFeedback = async (id, adminStatus) => {
    try {
      await adminApi.updateAiFeedback(id, { admin_status: adminStatus });
      showNotification('تم تحديث حالة المراجعة', 'success');
      loadFeedback(feedbackPage);
    } catch {
      showNotification('تعذر تحديث حالة المراجعة', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--slate-900)',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Bot size={28} style={{ color: 'var(--primary-600, #0f6848)' }} />
            <span>مركز إدارة الصيدلي الذكي (AI Pharmacist)</span>
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', margin: 0 }}>
            التحليلات التشغيلية، إعدادات النماذج والأمان، مصادر المعرفة الموثقة، والتقييمات — مع حماية خصوصية سجلات المرضى
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTab === 'analytics') loadAnalytics();
            if (activeTab === 'config') loadConfiguration();
            if (activeTab === 'sources') loadSources();
            if (activeTab === 'feedback') loadFeedback(feedbackPage);
            if (activeTab === 'monitoring') loadMonitoring();
          }}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        className="card"
        style={{
          padding: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const isCurrent = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.86rem',
                background: isCurrent ? 'var(--primary-600, #0f6848)' : 'transparent',
                color: isCurrent ? '#ffffff' : 'var(--slate-600)',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: ANALYTICS ================= */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {analyticsLoading || !analytics ? (
            <div className="card" style={{ padding: '60px 20px' }}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* KPI Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '16px',
                }}
              >
                {[
                  {
                    title: 'إجمالي المحادثات المحفوظة',
                    value: analytics.total_conversations,
                    sub: `${analytics.active_conversations} نشطة | ${analytics.deleted_conversations} محذوفة`,
                  },
                  {
                    title: 'إجمالي الأسئلة المعالجة',
                    value: analytics.total_questions,
                    sub: `اليوم: ${analytics.daily_questions} | هذا الشهر: ${analytics.monthly_questions}`,
                  },
                  {
                    title: 'متوسط زمن الاستجابة',
                    value: `${analytics.performance?.average_response_time_ms ?? 0} ms`,
                    sub: `أخطاء: ${analytics.performance?.failed_requests ?? 0} | محظورة أمنياً: ${analytics.performance?.blocked_requests ?? 0}`,
                  },
                  {
                    title: 'معدل رضا المستخدمين',
                    value:
                      analytics.feedback?.satisfaction_rate !== null
                        ? `${analytics.feedback.satisfaction_rate}%`
                        : 'لا توجد تقييمات بعد',
                    sub: `إيجابي: ${analytics.feedback?.positive ?? 0} | سلبي: ${analytics.feedback?.negative ?? 0}`,
                  },
                ].map((kpi, idx) => (
                  <div key={idx} className="card" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: 700 }}>
                      {kpi.title}
                    </div>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: 'var(--slate-900)',
                        margin: '8px 0 6px',
                      }}
                    >
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)' }}>{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                  gap: '16px',
                }}
              >
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '14px' }}>
                    أنماط الاسترجاع الذكي (Retrieval Modes)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>معرفة طبية عامة (General Knowledge)</span>
                      <Badge variant="success">{analytics.retrieval_modes?.general ?? 0}</Badge>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>سجلات المريض الشخصية (Internal Data)</span>
                      <Badge variant="info">{analytics.retrieval_modes?.internal ?? 0}</Badge>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>استرجاع مدمج (Combined Retrieval)</span>
                      <Badge variant="primary">{analytics.retrieval_modes?.combined ?? 0}</Badge>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>طلبات مقيدة / طوارئ</span>
                      <Badge variant="warning">
                        {(analytics.retrieval_modes?.restricted ?? 0) +
                          (analytics.retrieval_modes?.emergency ?? 0)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '14px' }}>
                    توزيع المستخدمين واللغات
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>مستخدمون مسجلون (Authenticated)</span>
                      <strong>{analytics.usage_by_user_type?.authenticated ?? 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>زوار (Guest Sessions)</span>
                      <strong>{analytics.usage_by_user_type?.guest ?? 0}</strong>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--slate-100)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>اللغة العربية (Arabic)</span>
                      <strong>{analytics.usage_by_language?.ar ?? 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>اللغة الإنجليزية (English)</span>
                      <strong>{analytics.usage_by_language?.en ?? 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '14px' }}>
                    أكثر التصنيفات الطبية شيوعاً
                  </h3>
                  {(analytics.top_categories || []).length === 0 ? (
                    <p style={{ fontSize: '0.84rem', color: 'var(--slate-400)' }}>
                      لا توجد بيانات مصنفة مسجلة بعد.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      {analytics.top_categories.map((cat, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600 }}>{cat.category}</span>
                          <Badge variant="info">{cat.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 2: AI CONFIGURATION ================= */}
      {activeTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {configLoading || !configForm ? (
            <div className="card" style={{ padding: '60px 20px' }}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Integration Status */}
              <div className="card" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '6px' }}>
                  حالة تكامل مزودي الذكاء الاصطناعي (المفاتيح محمية على الخادم ولا تُعرض)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '16px' }}>
                  تُدار مفاتيح الربط السرية حصراً عبر متغيرات بيئة الخادم (.env) وفق معايير الأمان الطبي.
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {Object.entries(integrationStatus).map(([provKey, info]) => (
                    <div
                      key={provKey}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid var(--slate-200)',
                        background: 'var(--slate-50)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <strong style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>
                          {provKey}
                        </strong>
                        <Badge
                          variant={
                            info.status === 'operational' || info.status === 'configured'
                              ? 'success'
                              : info.status === 'degraded_key_error'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {info.status}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                        {info.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Settings Form */}
              <form onSubmit={handleSaveConfiguration} className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '18px' }}>
                  ضوابط التشغيل والاسترجاع والأمان
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  {[
                    { key: 'ai_enabled', label: 'تفعيل خدمة الصيدلي الذكي بالموقع' },
                    { key: 'general_knowledge_enabled', label: 'تفعيل استرجاع المعرفة الطبية العامة' },
                    { key: 'internal_data_enabled', label: 'تفعيل استرجاع السجلات الشخصية المصرح بها' },
                    { key: 'combined_retrieval_enabled', label: 'تفعيل الاسترجاع المدمج (شخصي + طبي عام)' },
                    { key: 'external_medical_sources_enabled', label: 'تفعيل المصادر الطبية الحية (OpenFDA / Wiki)' },
                    { key: 'strict_safety_mode', label: 'وضع الأمان الطبي الصارم وفرز الطوارئ' },
                  ].map((toggle) => (
                    <label
                      key={toggle.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--slate-200)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(configForm[toggle.key])}
                        onChange={(e) =>
                          setConfigForm((prev) => ({ ...prev, [toggle.key]: e.target.checked }))
                        }
                      />
                      <span>{toggle.label}</span>
                    </label>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: '16px',
                    marginBottom: '22px',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      مزود المعالجة النشط
                    </label>
                    <select
                      className="form-control"
                      value={configForm.active_provider}
                      onChange={(e) =>
                        setConfigForm((prev) => ({ ...prev, active_provider: e.target.value }))
                      }
                    >
                      <option value="auto">تلقائي ذكي (Auto Failover)</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="groq">Groq</option>
                      <option value="hybrid_local">المحرك الإكلينيكي الهجين فقط</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      اللغات المدعومة
                    </label>
                    <select
                      className="form-control"
                      value={configForm.supported_languages}
                      onChange={(e) =>
                        setConfigForm((prev) => ({ ...prev, supported_languages: e.target.value }))
                      }
                    >
                      <option value="ar,en">العربية والإنجليزية (ar,en)</option>
                      <option value="ar">العربية فقط (ar)</option>
                      <option value="en">الإنجليزية فقط (en)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      الحد الأقصى لطول السؤال (حرف)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={4000}
                      className="form-control"
                      value={configForm.max_question_length}
                      onChange={(e) =>
                        setConfigForm((prev) => ({
                          ...prev,
                          max_question_length: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      مدة انتهاء جلسة الزائر (دقيقة)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      className="form-control"
                      value={configForm.guest_session_ttl_minutes}
                      onChange={(e) =>
                        setConfigForm((prev) => ({
                          ...prev,
                          guest_session_ttl_minutes: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={configSaving} className="btn btn-primary">
                    {configSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 3: KNOWLEDGE SOURCES ================= */}
      {activeTab === 'sources' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--slate-100)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                مصادر المعرفة والمراجع الطبية المعتمدة
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '2px 0 0' }}>
                يتحقق زر المزامنة فعلياً من استجابة المصدر الطبي قبل تحديث حالة المزامنة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenSourceModal(null)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>إضافة مصدر طبي معتمد</span>
            </button>
          </div>

          {sourcesLoading ? (
            <div style={{ padding: '60px 20px' }}>
              <LoadingSpinner />
            </div>
          ) : sources.length === 0 ? (
            <div style={{ padding: '48px 20px' }}>
              <EmptyState
                icon={BookOpen}
                title="لا توجد مصادر معرفة مضافة"
                description="أضف مصدراً طبياً معتمداً لتغذية المراجع الموثقة."
              />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>المصدر الطبي</th>
                    <th>النوع</th>
                    <th>اللغات</th>
                    <th>الحالة والمزامنة</th>
                    <th>آخر مزامنة</th>
                    <th style={{ textAlign: 'center' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((src) => (
                    <tr key={src.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{src.name}</div>
                        <a
                          href={src.base_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.76rem', color: 'var(--primary-600)' }}
                        >
                          {src.base_url}
                        </a>
                        {src.last_error && (
                          <div style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '4px' }}>
                            خطأ: {src.last_error}
                          </div>
                        )}
                      </td>
                      <td>{src.source_type}</td>
                      <td>{src.language}</td>
                      <td>
                        <Badge
                          variant={
                            !src.is_enabled
                              ? 'secondary'
                              : src.sync_status === 'synced'
                              ? 'success'
                              : src.sync_status === 'error'
                              ? 'danger'
                              : 'info'
                          }
                        >
                          {!src.is_enabled ? 'معطّل' : src.sync_status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{formatDateTime(src.last_synced_at)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            disabled={!src.is_enabled || syncingId === src.id}
                            onClick={() => handleSyncSource(src.id)}
                            className="btn btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            title="فحص ومزامنة المصدر فعلياً"
                          >
                            <RefreshCw size={14} />
                            <span>{syncingId === src.id ? '...' : 'مزامنة'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleSource(src.id)}
                            className="btn btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            title={src.is_enabled ? 'تعطيل' : 'تفعيل'}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSourceModal(src)}
                            className="btn btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            title="تعديل"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSource(src.id)}
                            className="btn btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#dc2626' }}
                            title="حذف"
                          >
                            <Trash2 size={14} />
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
      )}

      {/* ================= TAB 4: FEEDBACK MANAGEMENT ================= */}
      {activeTab === 'feedback' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--slate-100)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                تقييمات وملاحظات جودة الإجابات
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', margin: '2px 0 0' }}>
                تُعرض المراجع الرمزية وملاحظة التقييم فقط دون كشف نصوص المحادثات الطبية الخاصة للمرضى.
              </p>
            </div>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
              value={feedbackFilterType}
              onChange={(e) => setFeedbackFilterType(e.target.value)}
            >
              <option value="">كل التقييمات</option>
              <option value="positive">إيجابية فقط (Positive)</option>
              <option value="negative">سلبية فقط (Negative)</option>
            </select>
          </div>

          {feedbackLoading ? (
            <div style={{ padding: '60px 20px' }}>
              <LoadingSpinner />
            </div>
          ) : feedbackRows.length === 0 ? (
            <div style={{ padding: '48px 20px' }}>
              <EmptyState
                icon={ThumbsUp}
                title="لا توجد تقييمات مسجلة بعد"
                description="ستظهر تقييمات المستخدمين للإجابات هنا لمراجعة الجودة."
              />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>النوع</th>
                    <th>نمط الاسترجاع</th>
                    <th>ملاحظة المستخدم</th>
                    <th>المرجع الرمزي</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th style={{ textAlign: 'center' }}>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackRows.map((fb) => (
                    <tr key={fb.id}>
                      <td>#{fb.id}</td>
                      <td>
                        <Badge variant={fb.feedback_type === 'positive' ? 'success' : 'danger'}>
                          {fb.feedback_type === 'positive' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ThumbsUp size={12} /> إيجابي
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ThumbsDown size={12} /> سلبي
                            </span>
                          )}
                        </Badge>
                      </td>
                      <td>{fb.retrieval_mode || '—'}</td>
                      <td style={{ maxWidth: '280px' }}>{fb.comment || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                        {fb.user_ref} • {fb.conversation_ref}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{formatDateTime(fb.created_at)}</td>
                      <td>
                        <Badge variant={fb.admin_status === 'resolved' ? 'success' : 'info'}>
                          {fb.admin_status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {fb.admin_status !== 'resolved' && (
                          <button
                            type="button"
                            onClick={() => handleMarkFeedback(fb.id, 'resolved')}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          >
                            <CheckCircle2 size={13} />
                            <span>تمت المراجعة</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!feedbackLoading && feedbackLastPage > 1 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--slate-100)' }}>
              <Pagination
                currentPage={feedbackPage}
                lastPage={feedbackLastPage}
                onPageChange={(p) => loadFeedback(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: MONITORING & PRIVACY ================= */}
      {activeTab === 'monitoring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Privacy Enforcement Banner (BR-16) */}
          <div
            className="card"
            style={{
              padding: '18px 22px',
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Lock size={22} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-800)', lineHeight: 1.6 }}>
              <strong>سياسة حماية خصوصية المرضى (BR-16 — Least Privilege):</strong> لا يُمنح مشرفو النظام وصولاً تلقائياً إلى نصوص محادثات المرضى الخاصة أو سجلاتهم الطبية والروشتات. يقتصر هذا القسم على مراقبة الأداء الفني، الأخطاء التشغيلية، والبيانات الوصفية المُقنّعة (Masked Metadata) مع تسجيل كافة العمليات في سجل التدقيق الأمني.
            </div>
          </div>

          {/* Request & Error Monitoring Logs */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--slate-100)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} />
                <span>سجل المراقبة الفنية والأخطاء والطلبات المحظورة</span>
              </h3>
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '180px' }}
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
              >
                <option value="">كل الحالات</option>
                <option value="failed">أخطاء فنية (Failed)</option>
                <option value="blocked">محاولات محظورة أمنياً (Blocked)</option>
                <option value="success">عمليات ناجحة (Success)</option>
              </select>
            </div>

            {logsLoading ? (
              <div style={{ padding: '48px 20px' }}>
                <LoadingSpinner />
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                لا توجد سجلات مطابقة للفلتر المحدد.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>المستخدم</th>
                      <th>اللغة</th>
                      <th>التصنيف / الاسترجاع</th>
                      <th>المزود</th>
                      <th>الزمن</th>
                      <th>الحالة / الخطأ</th>
                      <th>التوقيت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id}>
                        <td>#{l.id}</td>
                        <td>{l.user_ref}</td>
                        <td>{l.language}</td>
                        <td>
                          {l.classification_category} / <strong>{l.retrieval_mode}</strong>
                        </td>
                        <td>{l.provider_used || '—'}</td>
                        <td>{l.response_time_ms} ms</td>
                        <td>
                          <Badge
                            variant={
                              l.status === 'success'
                                ? 'success'
                                : l.status === 'blocked'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {l.status}
                          </Badge>
                          {l.error_message && (
                            <div style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '3px' }}>
                              {l.error_message}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{formatDateTime(l.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Masked Conversation Metadata & Audit Logs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 800, marginBottom: '12px' }}>
                ملخص جلسات المستخدمين (بيانات مُقنّعة بدون نصوص المحادثات)
              </h4>
              {maskedChats.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>لا توجد جلسات مسجلة.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  {maskedChats.map((mc) => (
                    <div
                      key={mc.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--slate-50)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{mc.conversation_ref}</strong> —{' '}
                        {mc.masked_user?.masked_email || mc.masked_user?.user_ref || 'مستخدم'}
                      </div>
                      <Badge variant={mc.status === 'deleted' ? 'secondary' : 'info'}>
                        {mc.messages_count} رسالة ({mc.status})
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 800, marginBottom: '12px' }}>
                سجل التدقيق الأمني لعمليات الذكاء الاصطناعي (Audit Trail)
              </h4>
              {auditLogs.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>لا توجد أحداث تدقيق بعد.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  {auditLogs.slice(0, 8).map((al) => (
                    <div
                      key={al.id}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: 'var(--slate-50)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        <strong>{al.action}</strong> ({al.actor_role})
                      </span>
                      <span style={{ color: 'var(--slate-500)' }}>{formatDateTime(al.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Knowledge Source Modal */}
      <Dialog
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        title={editingSource ? 'تعديل مصدر المعرفة الطبية' : 'إضافة مصدر طبي معتمد'}
        maxWidth="540px"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsSourceModalOpen(false)}
              className="btn btn-outline"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="ai-source-form"
              disabled={sourceSaving}
              className="btn btn-primary"
            >
              {sourceSaving ? 'جاري الحفظ...' : 'حفظ المصدر'}
            </button>
          </div>
        }
      >
        <form
          id="ai-source-form"
          onSubmit={handleSaveSource}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              اسم المصدر الطبي *
            </label>
            <input
              type="text"
              required
              className="form-control"
              value={sourceForm.name}
              onChange={(e) => setSourceForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="مثال: منظمة الصحة العالمية (WHO)"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              نوع المصدر *
            </label>
            <select
              className="form-control"
              value={sourceForm.source_type}
              onChange={(e) => setSourceForm((p) => ({ ...p, source_type: e.target.value }))}
            >
              <option value="medical_organization">مؤسسة صحية رسمية (Medical Organization)</option>
              <option value="drug_authority">هيئة دوائية (Drug Authority)</option>
              <option value="clinical_guideline">دليل إكلينيكي معتمد (Clinical Guideline)</option>
              <option value="encyclopedia">موسوعة علمية (Medical Encyclopedia)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              الرابط المرجعي الرسمي (URL) *
            </label>
            <input
              type="url"
              required
              className="form-control"
              value={sourceForm.base_url}
              onChange={(e) => setSourceForm((p) => ({ ...p, base_url: e.target.value }))}
              placeholder="https://medlineplus.gov"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              اللغات المدعومة *
            </label>
            <input
              type="text"
              required
              className="form-control"
              value={sourceForm.language}
              onChange={(e) => setSourceForm((p) => ({ ...p, language: e.target.value }))}
              placeholder="ar,en"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              وصف نطاق المصدر (اختياري)
            </label>
            <textarea
              rows={3}
              className="form-control"
              value={sourceForm.summary_notes}
              onChange={(e) => setSourceForm((p) => ({ ...p, summary_notes: e.target.value }))}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default AiChatList;
