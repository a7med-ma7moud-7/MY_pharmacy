import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorPortalService } from '../../services/api';
import {
    Plus,
    ClipboardList,
    Edit2,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
} from 'lucide-react';

export default function DoctorFollowUps() {
    const [searchParams, setSearchParams] = useSearchParams();
    const preselectedKey = searchParams.get('patient_key') || '';

    const [followUps, setFollowUps] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(Boolean(preselectedKey));
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        patient_key: preselectedKey,
        followup_date: new Date().toISOString().split('T')[0],
        consultation_notes: '',
        treatment_updates: '',
        next_followup_date: '',
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [fuRes, ptRes] = await Promise.all([
                doctorPortalService.getFollowUps(search ? { search } : {}),
                doctorPortalService.getPatients(),
            ]);
            if (fuRes.data?.success) setFollowUps(fuRes.data.data || []);
            if (ptRes.data?.success) setPatients(ptRes.data.data || []);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openCreate = () => {
        setEditingItem(null);
        setForm({
            patient_key: preselectedKey || '',
            followup_date: new Date().toISOString().split('T')[0],
            consultation_notes: '',
            treatment_updates: '',
            next_followup_date: '',
        });
        setErrorMsg('');
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({
            patient_key: item.patient_user_id ? `u_${item.patient_user_id}` : `p_${item.patient_phone || ''}`,
            followup_date: item.followup_date || new Date().toISOString().split('T')[0],
            consultation_notes: item.consultation_notes || '',
            treatment_updates: item.treatment_updates || '',
            next_followup_date: item.next_followup_date || '',
        });
        setErrorMsg('');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const payload = {
                patient_key: form.patient_key,
                followup_date: form.followup_date,
                consultation_notes: form.consultation_notes.trim(),
                treatment_updates: form.treatment_updates.trim() || null,
                next_followup_date: form.next_followup_date || null,
            };

            if (editingItem) {
                await doctorPortalService.updateFollowUp(editingItem.id, payload);
                setNotice('تم تحديث سجل المتابعة بنجاح!');
            } else {
                await doctorPortalService.createFollowUp(payload);
                setNotice('تم إضافة ملاحظة المتابعة الطبية بنجاح!');
            }

            setModalOpen(false);
            setSearchParams({}, { replace: true });
            loadData();
            setTimeout(() => setNotice(''), 3500);
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : err.response?.data?.message;
            setErrorMsg(msg || 'تعذر حفظ سجل المتابعة.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل تريد حذف ملاحظة المتابعة هذه؟')) return;
        await doctorPortalService.deleteFollowUp(id);
        setNotice('تم حذف ملاحظة المتابعة.');
        loadData();
        setTimeout(() => setNotice(''), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold font-almarai text-slate-900 m-0">
                        سجل المتابعات الطبية (Follow-up History)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 m-0">
                        توثيق ملاحظات الكشف وتحديثات العلاج ومواعيد المراجعة القادمة لمرضاك.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="btn-main px-5 py-3 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل متابعة جديدة</span>
                </button>
            </div>

            {notice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{notice}</span>
                </div>
            )}

            <div className="bg-white/95 rounded-2xl p-4 border border-white shadow-xs">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم المريض أو نص الملاحظة الطبية..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                />
            </div>

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 text-[#0f6848] animate-spin" />
                </div>
            ) : followUps.length === 0 ? (
                <div className="bg-white/95 rounded-3xl p-12 text-center border border-white">
                    <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500 m-0">
                        لا توجد سجلات متابعة مضافة بعد.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {followUps.map((fu) => (
                        <div
                            key={fu.id}
                            className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-extrabold text-slate-900 m-0">
                                        {fu.patient_name}
                                    </h3>
                                    <span className="text-[11px] font-bold text-slate-500">
                                        بتاريخ: {fu.followup_date}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line m-0">
                                    {fu.consultation_notes}
                                </p>
                                {fu.treatment_updates && (
                                    <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700">
                                        <strong>تحديثات العلاج:</strong> {fu.treatment_updates}
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-bold text-[#0f6848]">
                                    {fu.next_followup_date
                                        ? `المتابعة القادمة: ${fu.next_followup_date}`
                                        : 'لا يوجد موعد متابعة قادم محدد'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(fu)}
                                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-[#0f6848] cursor-pointer"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(fu.id)}
                                        className="p-2 rounded-xl bg-slate-50 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                                {editingItem ? 'تعديل ملاحظة المتابعة' : 'تسجيل متابعة طبية جديدة'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-xl bg-slate-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editingItem && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">المريض *</label>
                                    <select
                                        required
                                        value={form.patient_key}
                                        onChange={(e) => setForm((p) => ({ ...p, patient_key: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                                    >
                                        <option value="">-- اختر المريض --</option>
                                        {patients.map((pt) => (
                                            <option key={pt.patient_key} value={pt.patient_key}>
                                                {pt.patient_name} ({pt.phone})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المتابعة *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.followup_date}
                                        onChange={(e) => setForm((p) => ({ ...p, followup_date: e.target.value }))}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">موعد المتابعة القادمة</label>
                                    <input
                                        type="date"
                                        value={form.next_followup_date}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, next_followup_date: e.target.value }))
                                        }
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الاستشارة والمتابعة *</label>
                                <textarea
                                    rows="3"
                                    required
                                    value={form.consultation_notes}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, consultation_notes: e.target.value }))
                                    }
                                    placeholder="سجّل تطور الحالة والفحص السريري..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">تحديثات الخطة العلاجية</label>
                                <textarea
                                    rows="2"
                                    value={form.treatment_updates}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, treatment_updates: e.target.value }))
                                    }
                                    placeholder="أي تعديل في الجرعات أو التوصيات..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-main px-6 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer"
                                >
                                    {submitting ? 'جاري الحفظ...' : 'حفظ المتابعة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
