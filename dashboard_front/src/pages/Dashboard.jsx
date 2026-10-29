import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserRoundCheck,
  Pill,
  ShoppingBag,
  CalendarDays,
  DollarSign,
  PlusCircle,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { useAdminAuth } from '../context/AdminAuthContext';

export const Dashboard = () => {
  const { admin } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getDashboard();
      if (res.data.success) {
        setData(res.data);
      } else {
        setError('تعذر تحميل بيانات لوحة التحكم');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner text="جاري تحديث بيانات لوحة التحكم..." size={42} variant="dots" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '48px 40px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-sm)',
          animation: 'fadeInScale 0.4s ease-out',
          maxWidth: '500px',
          margin: '40px auto',
        }}
      >
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <AlertCircle size={36} style={{ color: '#ef4444' }} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '8px' }}>
          {error}
        </h3>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.7 }}>
          يرجى التحقق من تشغيل خادم الواجهة الخلفية على المنفذ 8080 ثم إعادة المحاولة.
        </p>
        <button
          onClick={fetchDashboardData}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <RefreshCw size={16} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  const { stats, recent_doctors = [], recent_medicines = [], recent_appointments = [], recent_orders = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 40px rgba(15, 23, 42, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInUp 0.4s ease-out',
        }}
      >
        {/* Decorative animated circles */}
        <div style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, transparent 70%)',
          animation: 'breathe 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60%',
          left: '-5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          animation: 'breathe 5s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                color: '#2dd4bf',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(45, 212, 191, 0.2)',
              }}
            >
              <Sparkles size={13} style={{ animation: 'float 2s ease-in-out infinite' }} />
              مركز المراقبة والتحكم
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            مرحباً بك مجدداً، {admin?.name || 'مدير النظام'} 👋
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '600px', lineHeight: 1.7 }}>
            إليك نظرة عامة على نشاط الصيدلية والعيادات الطبية وحركة المبيعات والحجوزات الحالية.
          </p>
        </div>

        {/* Quick actions buttons in header */}
        <div style={{ display: 'flex', gap: '12px', zIndex: 1, flexWrap: 'wrap' }}>
          <Link
            to="/medicines"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
            }}
          >
            <PlusCircle size={16} />
            <span>إضافة دواء جديد</span>
          </Link>
          <Link
            to="/doctors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <PlusCircle size={16} />
            <span>إضافة طبيب جديد</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        <StatCard
          title="إجمالي الأطباء"
          value={stats?.total_doctors ?? 0}
          icon={UserRoundCheck}
          color="primary"
          subtext="الأطباء المعتمدين بالمنصة"
          linkText="إدارة الأطباء"
          linkTo="/doctors"
        />
        <StatCard
          title="قائمة الأدوية"
          value={stats?.total_medicines ?? 0}
          icon={Pill}
          color="blue"
          subtext="أصناف الأدوية بالمخزون"
          linkText="إدارة الأدوية"
          linkTo="/medicines"
        />
        <StatCard
          title="طلبات الشراء"
          value={stats?.total_orders ?? 0}
          icon={ShoppingBag}
          color="purple"
          subtext="إجمالي طلبات المتجر"
          linkText="عرض الطلبات"
          linkTo="/orders"
        />
        <StatCard
          title="حجوزات قيد الانتظار"
          value={stats?.pending_appointments ?? 0}
          icon={CalendarDays}
          color="warning"
          subtext="بانتظار التأكيد الطبي"
          linkText="مراجعة الحجوزات"
          linkTo="/appointments"
        />
        <StatCard
          title="المستخدمين المسجلين"
          value={stats?.total_users ?? 0}
          icon={Users}
          color="success"
          subtext="العملاء والمسؤولين"
          linkText="إدارة المستخدمين"
          linkTo="/users"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${Number(stats?.total_revenue ?? 0).toLocaleString()} ر.س`}
          icon={DollarSign}
          color="rose"
          subtext="مبيعات الطلبات المؤكدة"
          linkText="التقارير المالية"
          linkTo="/reports"
        />
      </div>

      {/* Recent Activity: 2 Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Orders Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              أحدث طلبات الشراء
            </h3>
            <Link
              to="/orders"
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span>عرض كل الطلبات</span>
              <ArrowLeft size={14} />
            </Link>
          </div>

          {recent_orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
              لا توجد طلبات شراء حتى الآن
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>#{order.id}</td>
                      <td>{order.name || 'عميل المتجر'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                        {Number(order.total_price || 0).toLocaleString()} ر.س
                      </td>
                      <td>
                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'success'
                              : order.status === 'processing'
                              ? 'info'
                              : order.status === 'cancelled'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {order.status === 'completed'
                            ? 'مكتمل'
                            : order.status === 'processing'
                            ? 'قيد التجهيز'
                            : order.status === 'cancelled'
                            ? 'ملغي'
                            : 'قيد الانتظار'}
                        </Badge>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-EG') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Appointments Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              أحدث الحجوزات الطبية
            </h3>
            <Link
              to="/appointments"
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span>عرض كل الحجوزات</span>
              <ArrowLeft size={14} />
            </Link>
          </div>

          {recent_appointments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
              لا توجد حجوزات طبية مسجلة
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>المريض</th>
                    <th>الطبيب المختص</th>
                    <th>موعد الكشف</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_appointments.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.name}</td>
                      <td>{app.doctor?.name || `طبيب #${app.doctor_id || '—'}`}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.date ? `${app.date} (${app.time || '—'})` : 'غير محدد'}
                      </td>
                      <td>
                        <Badge
                          variant={
                            app.status === 'confirmed'
                              ? 'success'
                              : app.status === 'completed'
                              ? 'info'
                              : app.status === 'cancelled'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {app.status === 'confirmed'
                            ? 'مؤكد'
                            : app.status === 'completed'
                            ? 'مكتمل'
                            : app.status === 'cancelled'
                            ? 'ملغي'
                            : 'قيد الانتظار'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Recent Medicines & Recent Doctors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Medicines */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              أحدث الأدوية المضافة
            </h3>
            <Link
              to="/medicines"
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span>إدارة الأدوية</span>
              <ArrowLeft size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>اسم الدواء</th>
                  <th>الاستخدام الطبي</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                </tr>
              </thead>
              <tbody>
                {recent_medicines.map((med) => (
                  <tr key={med.id}>
                    <td style={{ fontWeight: 600 }}>{med.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{med.propose || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{med.price} ر.س</td>
                    <td>
                      <Badge variant={med.count > 10 ? 'success' : med.count > 0 ? 'warning' : 'danger'}>
                        {med.count > 0 ? `${med.count} عبوة` : 'نفد المخزون'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Doctors */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              أحدث الأطباء المنضمين
            </h3>
            <Link
              to="/doctors"
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span>إدارة الأطباء</span>
              <ArrowLeft size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>اسم الطبيب</th>
                  <th>التخصص</th>
                  <th>سعر الكشف</th>
                  <th>الهاتف</th>
                </tr>
              </thead>
              <tbody>
                {recent_doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600 }}>{doc.name}</td>
                    <td>
                      <Badge variant="info">{doc.specialty || 'طبيب عام'}</Badge>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{doc.price} ر.س</td>
                    <td style={{ direction: 'ltr', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {doc.number || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
