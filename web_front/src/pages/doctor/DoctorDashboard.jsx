import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { doctorPortalService } from '../../services/api';
import {
    Users,
    CalendarClock,
    CheckCircle2,
    BriefcaseMedical,
    Star,
    MessageSquare,
    FileSpreadsheet,
    ArrowLeft,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';

const STATUS_LABELS = {
    pending: { label: 'قيد الانتظار', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed: { label: 'مؤكد', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
    completed: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'ملغي', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function DoctorDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingApptId, setUpdatingApptId] = useState(null);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await doctorPortalService.getDashboard();
            if (res.data?.success) {
                setData(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'تعذر تحميل إحصائيات لوحة الطبيب.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const handleQuickStatus = async (apptId, newStatus) => {
        setUpdatingApptId(apptId);
        try {
            await doctorPortalService.updateAppointmentStatus(apptId, newStatus);
            await loadDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'تعذر تحديث حالة الموعد.');
        } finally {
            setUpdatingApptId(null);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0f6848] animate-spin" />
                <span className="text-xs font-bold text-slate-500">جاري تحميل مؤشرات العيادة...</span>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="bg-white rounded-3xl p-8 text-center border border-rose-100">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-rose-700 mb-4">{error}</p>
                <button
                    type="button"
                    onClick={loadDashboard}
                    className="btn-main px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    const stats = data?.stats || {};
    const kpiCards = [
        {
            label: 'إجمالي المرضى',
            value: stats.total_patients ?? 0,
            icon: Users,
            tone: 'bg-emerald-50 text-[#0f6848]',
            to: '/doctor/patients',
        },
        {
            label: 'المواعيد القادمة',
            value: stats.upcoming_appointments ?? 0,
            icon: CalendarClock,
            tone: 'bg-sky-50 text-sky-700',
            to: '/doctor/patients',
        },
        {
            label: 'المواعيد المكتملة',
            value: stats.completed_appointments ?? 0,
            icon: CheckCircle2,
            tone: 'bg-teal-50 text-teal-700',
            to: '/doctor/patients',
        },
        {
            label: 'الحالات المنشورة',
            value: stats.total_treated_cases ?? 0,
            icon: BriefcaseMedical,
            tone: 'bg-indigo-50 text-indigo-700',
            to: '/doctor/cases',
        },
        {
            label: 'تقييمات المرضى',
            value: `${stats.total_reviews ?? 0} (${stats.average_rating || '0.0'}★)`,
            icon: Star,
            tone: 'bg-amber-50 text-amber-700',
            to: '/doctor/reviews',
        },
        {
            label: 'رسائل غير مقروءة',
            value: stats.unread_messages ?? 0,
            icon: MessageSquare,
            tone: 'bg-rose-50 text-rose-700',
            to: '/doctor/chat',
        },
        {
            label: 'الروشتات الصادرة',
            value: stats.total_prescriptions ?? 0,
            icon: FileSpreadsheet,
            tone: 'bg-purple-50 text-purple-700',
            to: '/doctor/prescriptions',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="hero-mesh rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div>
                    <span className="text-xs font-bold text-emerald-200 block mb-1">
                        مرحباً بك في بوابة العيادة الرقمية
                    </span>
                    <h2 className="text-2xl font-extrabold font-almarai text-white m-0">
                        {data?.doctor?.name} — {data?.doctor?.specialty}
                    </h2>
                    <p className="text-xs text-emerald-100/90 mt-1 m-0">
                        جميع الإحصائيات أدناه مستخرجة لحظياً من سجلات مرضاك ومواعيدك الفعلية على المنصة.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/doctor/cases"
                        className="px-4 py-2.5 rounded-xl bg-white text-[#0f6848] font-extrabold text-xs hover:bg-emerald-50 transition-all"
                    >
                        + نشر حالة معالجة
                    </Link>
                    <button
                        type="button"
                        onClick={loadDashboard}
                        className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>تحديث</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <Link
                            key={idx}
                            to={kpi.to}
                            className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-white shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-3.5"
                        >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${kpi.tone}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[11px] font-bold text-slate-400 block truncate">
                                    {kpi.label}
                                </span>
                                <span className="text-lg font-black text-slate-900 block">
                                    {kpi.value}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                            المواعيد القادمة
                        </h3>
                        <Link
                            to="/doctor/patients"
                            className="text-xs font-bold text-[#0f6848] inline-flex items-center gap-1 hover:underline"
                        >
                            <span>كل المرضى</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {(data?.upcoming_appointments || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-10 m-0">
                            لا توجد مواعيد قادمة قيد الانتظار حالياً.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {data.upcoming_appointments.map((appt) => {
                                const st = STATUS_LABELS[appt.status] || STATUS_LABELS.pending;
                                return (
                                    <div
                                        key={appt.id}
                                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3"
                                    >
                                        <div>
                                            <Link
                                                to={`/doctor/records/${encodeURIComponent(appt.patient_key)}`}
                                                className="text-xs font-extrabold text-slate-900 hover:text-[#0f6848]"
                                            >
                                                {appt.patient_name}
                                            </Link>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                {appt.appointment_date} • الساعة {appt.appointment_time}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}>
                                                {st.label}
                                            </span>
                                            {appt.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    disabled={updatingApptId === appt.id}
                                                    onClick={() => handleQuickStatus(appt.id, 'confirmed')}
                                                    className="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-bold cursor-pointer hover:bg-sky-700"
                                                >
                                                    تأكيد
                                                </button>
                                            )}
                                            {appt.status !== 'completed' && (
                                                <button
                                                    type="button"
                                                    disabled={updatingApptId === appt.id}
                                                    onClick={() => handleQuickStatus(appt.id, 'completed')}
                                                    className="px-2.5 py-1 rounded-lg bg-[#0f6848] text-white text-[10px] font-bold cursor-pointer hover:bg-[#0b5239]"
                                                >
                                                    إتمام الكشف
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Patient Conversations */}
                <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                            أحدث محادثات المرضى
                        </h3>
                        <Link
                            to="/doctor/chat"
                            className="text-xs font-bold text-[#0f6848] inline-flex items-center gap-1 hover:underline"
                        >
                            <span>فتح المحادثات</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {(data?.recent_conversations || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-10 m-0">
                            لا توجد محادثات نشطة مع المرضى بعد.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {data.recent_conversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    to={`/doctor/chat?conversation_id=${conv.id}`}
                                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="text-xs font-extrabold text-slate-900">
                                            {conv.patient_name}
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate mt-0.5 m-0">
                                            {conv.last_message_preview || 'محادثة مفتوحة'}
                                        </p>
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span className="bg-[#0f6848] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0">
                                            {conv.unread_count} جديد
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recently Added Treated Cases */}
                <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                            أحدث الحالات المعالجة المنشورة
                        </h3>
                        <Link
                            to="/doctor/cases"
                            className="text-xs font-bold text-[#0f6848] inline-flex items-center gap-1 hover:underline"
                        >
                            <span>إدارة الحالات</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {(data?.recent_treated_cases || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-10 m-0">
                            لم تقم بنشر حالات علاجية بعد. أضف حالتك الأولى لإبراز خبرتك المهنية.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {data.recent_treated_cases.map((tc) => (
                                <div
                                    key={tc.id}
                                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="text-xs font-extrabold text-slate-900 truncate">
                                            {tc.title}
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                            {tc.published_at} • {tc.specialty}
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0f6848]">
                                        منشورة
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Patient Reviews */}
                <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                            أحدث تقييمات المرضى
                        </h3>
                        <Link
                            to="/doctor/reviews"
                            className="text-xs font-bold text-[#0f6848] inline-flex items-center gap-1 hover:underline"
                        >
                            <span>كل التقييمات</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {(data?.recent_reviews || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-10 m-0">
                            لا توجد تقييمات مسجلة بعد.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {data.recent_reviews.map((rev) => (
                                <div
                                    key={rev.id}
                                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-extrabold text-slate-800">
                                            {rev.user?.name || 'مريض معتمد'}
                                        </span>
                                        <span className="text-xs font-black text-amber-500">
                                            {'★'.repeat(rev.rating || 5)}
                                        </span>
                                    </div>
                                    {rev.comment && (
                                        <p className="text-[11px] text-slate-600 m-0 line-clamp-2">
                                            {rev.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
