import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { doctorPortalService } from '../../services/api';
import {
    Users,
    Search,
    FolderHeart,
    MessageSquare,
    FileSpreadsheet,
    ClipboardList,
    Loader2,
    CheckCircle2,
} from 'lucide-react';

const STATUS_BADGE = {
    pending: { label: 'قيد الانتظار', cls: 'bg-amber-50 text-amber-700' },
    confirmed: { label: 'مؤكد', cls: 'bg-sky-50 text-sky-700' },
    completed: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700' },
    cancelled: { label: 'ملغي', cls: 'bg-rose-50 text-rose-700' },
};

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [notice, setNotice] = useState('');

    const loadPatients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await doctorPortalService.getPatients({
                ...(search ? { search } : {}),
                ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
            });
            if (res.data?.success) {
                setPatients(res.data.data || []);
            }
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    const handleMarkAppointmentStatus = async (apptId, status) => {
        if (!apptId) return;
        await doctorPortalService.updateAppointmentStatus(apptId, status);
        setNotice('تم تحديث حالة آخر موعد للمريض.');
        loadPatients();
        setTimeout(() => setNotice(''), 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-extrabold font-almarai text-slate-900 m-0">
                    قائمة مرضاي ({patients.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1 m-0">
                    تضم هذه القائمة المرضى الذين قاموا بحجز مواعيد فعلية معك عبر المنصة فقط.
                </p>
            </div>

            {notice && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{notice}</span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white/95 rounded-2xl p-4 border border-white shadow-xs flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث باسم المريض، رقم المريض، أو رقم الهاتف..."
                        className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                >
                    <option value="all">جميع حالات المواعيد</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                </select>
            </div>

            {/* Patients Table */}
            <div className="bg-white/95 rounded-3xl border border-white shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-16 flex justify-center">
                        <Loader2 className="w-7 h-7 text-[#0f6848] animate-spin" />
                    </div>
                ) : patients.length === 0 ? (
                    <div className="py-16 text-center px-4">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-500 m-0">
                            لا يوجد مرضى مطابقون لمعايير البحث الحالية.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold">
                                <tr>
                                    <th className="px-5 py-3.5">المريض</th>
                                    <th className="px-4 py-3.5">الهاتف</th>
                                    <th className="px-4 py-3.5">آخر موعد</th>
                                    <th className="px-4 py-3.5">حالة الموعد</th>
                                    <th className="px-4 py-3.5">السجلات المتاحة</th>
                                    <th className="px-5 py-3.5 text-center">إجراءات طبية</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {patients.map((pt) => {
                                    const st = STATUS_BADGE[pt.last_appointment_status] || STATUS_BADGE.pending;
                                    return (
                                        <tr key={pt.patient_key} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-extrabold text-slate-900">
                                                    {pt.patient_name}
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400">
                                                    {pt.patient_id_display}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-slate-700" dir="ltr">
                                                {pt.phone || '—'}
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                <div>{pt.last_appointment_date || '—'}</div>
                                                <span className="text-[10px] text-slate-400">
                                                    {pt.appointments_count} زيارات
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>
                                                        {st.label}
                                                    </span>
                                                    {pt.last_appointment_status !== 'completed' &&
                                                        pt.last_appointment_status !== 'cancelled' && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleMarkAppointmentStatus(
                                                                        pt.last_appointment_id,
                                                                        'completed'
                                                                    )
                                                                }
                                                                className="text-[10px] font-bold text-[#0f6848] underline cursor-pointer"
                                                            >
                                                                إتمام
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                <span className="inline-block ml-2">
                                                    روشتات: <strong>{pt.prescriptions_count}</strong>
                                                </span>
                                                <span className="inline-block">
                                                    متابعات: <strong>{pt.follow_ups_count}</strong>
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                    <Link
                                                        to={`/doctor/records/${encodeURIComponent(pt.patient_key)}`}
                                                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-[#0f6848] hover:bg-[#0f6848] hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
                                                        title="عرض السجل الطبي"
                                                    >
                                                        <FolderHeart className="w-3.5 h-3.5" />
                                                        <span>السجل</span>
                                                    </Link>
                                                    {pt.can_chat && pt.patient_user_id && (
                                                        <Link
                                                            to={`/doctor/chat?patient_user_id=${pt.patient_user_id}`}
                                                            className="px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
                                                            title="محادثة المريض"
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            <span>محادثة</span>
                                                        </Link>
                                                    )}
                                                    <Link
                                                        to={`/doctor/prescriptions?patient_key=${encodeURIComponent(pt.patient_key)}&patient_name=${encodeURIComponent(pt.patient_name)}`}
                                                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
                                                        title="إصدار روشتة"
                                                    >
                                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                                        <span>روشتة</span>
                                                    </Link>
                                                    <Link
                                                        to={`/doctor/follow-ups?patient_key=${encodeURIComponent(pt.patient_key)}&patient_name=${encodeURIComponent(pt.patient_name)}`}
                                                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
                                                        title="إضافة متابعة"
                                                    >
                                                        <ClipboardList className="w-3.5 h-3.5" />
                                                        <span>متابعة</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
