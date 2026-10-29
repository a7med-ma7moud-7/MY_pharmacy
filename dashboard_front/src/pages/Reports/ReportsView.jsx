import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { BarChart, DistributionList } from '../../components/dashboard/SimpleChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';

export const ReportsView = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getReports();
      if (res.data.success) {
        setReports(res.data.data);
      } else {
        setError('تعذر استخراج التقارير التحليلية');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الاتصال بخادم التقارير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <LoadingSpinner variant="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--danger-color)', fontWeight: 700 }}>{error}</p>
        <button onClick={fetchReports} className="btn btn-primary" style={{ marginTop: '12px' }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const {
    visitor_stats = [],
    medicine_sales = [],
    doctor_stats = [],
    monthly_revenue = [],
  } = reports || {};

  // Format monthly revenue for BarChart
  const monthlyChartData = monthly_revenue.map((m) => ({
    label: m.month || 'شهر',
    value: Math.round(Number(m.revenue || 0)),
    color: '#0d9488',
  })).reverse();

  // Format doctor appointments for BarChart
  const doctorChartData = doctor_stats.slice(0, 6).map((d) => ({
    label: d.name ? d.name.split(' ')[0] : 'طبيب',
    value: Number(d.appointments_count || 0),
    color: '#3b82f6',
  }));

  // Format top selling medicines for DistributionList
  const topMedicinesData = medicine_sales.slice(0, 5).map((m) => ({
    label: m.name,
    value: Number(m.total_sales || 0),
    color: '#10b981',
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
            التقارير التحليلية والمؤشرات الإحصائية
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            تحليل دقيق لأداء المتجر، عوائد الأدوية، وحركة المواعيد الطبية والزيارات
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} />
          <span>تحديث الإحصائيات</span>
        </button>
      </div>

      {/* Top Visual Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Monthly Revenue Chart */}
        <BarChart
          title="الإيرادات الشهرية المحققة (ر.س)"
          subtitle="مجموع قيم المبيعات المؤكدة خلال الأشهر الماضية"
          data={monthlyChartData.length > 0 ? monthlyChartData : [{ label: 'لا توجد بيانات', value: 0 }]}
          height={280}
          barColor="#0d9488"
        />

        {/* Doctor Appointments Chart */}
        <BarChart
          title="إقبال المرضى على الأطباء (حجز)"
          subtitle="الأطباء الأكثر طلباً وفق إجمالي الحجوزات الطبية"
          data={doctorChartData.length > 0 ? doctorChartData : [{ label: 'لا توجد بيانات', value: 0 }]}
          height={280}
          barColor="#3b82f6"
        />
      </div>

      {/* Second Row: Top Selling Medicines & Visitors Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Top 5 Medicines Distribution */}
        <DistributionList
          title="الأدوية الأكثر مبيعاً في المتجر"
          subtitle="نسبة مساهمة الأصناف الأعلى طلباً من إجمالي المبيعات"
          data={topMedicinesData.length > 0 ? topMedicinesData : [{ label: 'لا توجد مبيعات', value: 0 }]}
        />

        {/* Visitors Stats / Sessions Activity */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>
            نشاط زوار المنصة خلال آخر 30 يوماً
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            سجل الجلسات النشطة للمستخدمين والمرضى
          </p>

          {visitor_stats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              لا توجد جلسات زيارة مسجلة حالياً
            </p>
          ) : (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>تاريخ الجلسة</th>
                    <th>عدد الزوار / الجلسات</th>
                  </tr>
                </thead>
                <tbody>
                  {visitor_stats.slice(0, 7).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.date}</td>
                      <td>
                        <Badge variant="info">{item.visitors} زيارة</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Medicine Revenue Performance Detail Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            جدول أداء مبيعات الأدوية بالتفصيل
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>اسم الدواء</th>
                <th>إجمالي مرات الطلب</th>
                <th>إجمالي العوائد المالية (ر.س)</th>
              </tr>
            </thead>
            <tbody>
              {medicine_sales.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    لا توجد بيانات مبيعات مسجلة بعد
                  </td>
                </tr>
              ) : (
                medicine_sales.map((med) => (
                  <tr key={med.id}>
                    <td style={{ fontWeight: 700 }}>{med.name}</td>
                    <td>
                      <Badge variant="success">{med.total_sales} عبوة مباعة</Badge>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      {Number(med.total_revenue || 0).toLocaleString()} ر.س
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
