import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorPortalService } from '../../services/api';
import {
    FolderHeart,
    Calendar,
    FileSpreadsheet,
    ClipboardList,
    MessageSquare,
    ShieldCheck,
    Loader2,
    AlertCircle,
} from 'lucide-react';

export default function DoctorMedicalRecords() {
    const { patientKey } = useParams();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [selectedKey, setSelectedKey] = useState(patientKey || '');
    const [record, setRecord] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingRecord, setLoadingRecord] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        doctorPortalService
            .getPatients()
            .then((res) => {
                if (res.data?.success) {
                    const list = res.data.data || [];
                    setPatients(list);
                    if (!patientKey && list.length > 0) {
                        setSelectedKey(list[0].patient_key);
                    }
                }
            })
            .finally(() => setLoadingPatients(false));
    }, [patientKey]);

    useEffect(() => {
        if (patientKey) {
            setSelectedKey(patientKey);
        }
    }, [patientKey]);

    const loadRecord = useCallback(async (key) => {
        if (!key) return;
        setLoadingRecord(true);
        setErrorMsg('');
        try {
            const res = await doctorPortalService.getPatientRecords(key);
            if (res.data?.success) {
                setRecord(res.data.data);
            }
        } catch (err) {
            setRecord(null);
            setErrorMsg(
                err.response?.data?.message || 'غير مصرح بالوصول إلى سجل هذا المريض.'
            );
        } finally {
            setLoadingRecord(false);
        }
    }, []);

    useEffect(() => {
        if (selectedKey) {
            loadRecord(selectedKey);
        }
    }, [selectedKey, loadRecord]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold font-almarai text-slate-900 m-0">
                        السجلات الطبية الخاصة بمرضاي
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 m-0">
                        يعرض السجل البيانات الطبية الناتجة عن تعاملاتك المباشرة مع المريض فقط دون كشف سجلات الأطباء الآخرين.
                    </p>
                </div>

                {patients.length > 0 && (
                    <select
                        value={selectedKey}
                        onChange={(e) => {
                            setSelectedKey(e.target.value);
                            navigate(`/doctor/records/${encodeURIComponent(e.target.value)}`, {
                                replace: true,
                            });
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 shadow-xs"
                    >
                        {patients.map((p) => (
                            <option key={p.patient_key} value={p.patient_key}>
                                {p.patient_name} ({p.patient_id_display})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {loadingPatients || loadingRecord ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 text-[#0f6848] animate-spin" />
                </div>
            ) : !record ? (
                <div className="bg-white/95 rounded-3xl p-12 text-center border border-white">
                    <FolderHeart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500 m-0">
                        اختر أحد مرضاك لعرض سجله الطبي المرتبط بعيادتك.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Patient Summary Header */}
                    <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0f6848] text-[10px] font-black font-mono">
                                    {record.patient?.patient_id_display}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>سجل معزول ومؤمّن</span>
                                </span>
                            </div>
                            <h3 className="text-lg font-extrabold font-almarai text-slate-900 m-0">
                                {record.patient?.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5 m-0" dir="ltr">
                                {record.patient?.phone || '—'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={`/doctor/prescriptions?patient_key=${encodeURIComponent(record.patient.patient_key)}&patient_name=${encodeURIComponent(record.patient.name)}`}
                                className="btn-main px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>إصدار روشتة</span>
                            </Link>
                            <Link
                                to={`/doctor/follow-ups?patient_key=${encodeURIComponent(record.patient.patient_key)}&patient_name=${encodeURIComponent(record.patient.name)}`}
                                className="btn-outline-main px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                            >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>إضافة متابعة</span>
                            </Link>
                            {record.patient?.can_chat && record.patient?.patient_user_id && (
                                <Link
                                    to={`/doctor/chat?patient_user_id=${record.patient.patient_user_id}`}
                                    className="btn-outline-main px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>فتح المحادثة</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Appointments with this doctor */}
                        <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs">
                            <h4 className="text-sm font-extrabold font-almarai text-slate-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#0f6848]" />
                                <span>سجل الزيارات والمواعيد معك ({record.appointments?.length || 0})</span>
                            </h4>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {(record.appointments || []).map((ap) => (
                                    <div
                                        key={ap.id}
                                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                                    >
                                        <div className="flex items-center justify-between font-bold text-slate-800">
                                            <span>
                                                موعد #{ap.id} — {ap.appointment_date} ({ap.appointment_time})
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200">
                                                {ap.status}
                                            </span>
                                        </div>
                                        {ap.notes && (
                                            <p className="text-slate-600 mt-1.5 m-0">
                                                ملاحظات المريض: {ap.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Prescriptions by this doctor */}
                        <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs">
                            <h4 className="text-sm font-extrabold font-almarai text-slate-900 mb-4 flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-[#0f6848]" />
                                <span>الروشتات الصادرة من عيادتك ({record.prescriptions?.length || 0})</span>
                            </h4>
                            {(record.prescriptions || []).length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-10 m-0">
                                    لم تصدر روشتات لهذا المريض بعد.
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {record.prescriptions.map((rx) => (
                                        <div
                                            key={rx.id}
                                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                                        >
                                            <div className="flex justify-between font-extrabold text-slate-900">
                                                <span>{rx.prescription_number}</span>
                                                <span className="text-slate-400">{rx.prescribed_date}</span>
                                            </div>
                                            <div className="text-slate-700">
                                                <strong>التشخيص:</strong> {rx.diagnosis}
                                            </div>
                                            <div className="text-[11px] text-[#0f6848] font-bold">
                                                {(rx.items || []).map((i) => i.medicine_name).join(' ، ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Follow-ups by this doctor */}
                        <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs lg:col-span-2">
                            <h4 className="text-sm font-extrabold font-almarai text-slate-900 mb-4 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-[#0f6848]" />
                                <span>ملاحظات الاستشارة والمتابعة السريرية ({record.follow_ups?.length || 0})</span>
                            </h4>
                            {(record.follow_ups || []).length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8 m-0">
                                    لا توجد ملاحظات متابعة مسجلة بعد لهذا المريض.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {record.follow_ups.map((fu) => (
                                        <div
                                            key={fu.id}
                                            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between font-bold text-slate-800">
                                                <span>تاريخ المتابعة: {fu.followup_date}</span>
                                                {fu.next_followup_date && (
                                                    <span className="text-[#0f6848]">
                                                        القادمة: {fu.next_followup_date}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-700 m-0 whitespace-pre-line">
                                                {fu.consultation_notes}
                                            </p>
                                            {fu.treatment_updates && (
                                                <p className="text-slate-500 m-0">
                                                    <strong>تحديث العلاج:</strong> {fu.treatment_updates}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
