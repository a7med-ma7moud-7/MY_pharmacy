import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorPortalService } from '../../services/api';
import {
    Plus,
    FileSpreadsheet,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
} from 'lucide-react';

export default function DoctorPrescriptions() {
    const [searchParams, setSearchParams] = useSearchParams();
    const preselectedKey = searchParams.get('patient_key') || '';

    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(Boolean(preselectedKey));
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        patient_key: preselectedKey,
        diagnosis: '',
        notes: '',
        prescribed_date: new Date().toISOString().split('T')[0],
        items: [{ medicine_id: '', medicine_name: '', dosage: '', duration: '', instructions: '' }],
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [rxRes, ptRes, catRes] = await Promise.all([
                doctorPortalService.getPrescriptions(search ? { search } : {}),
                doctorPortalService.getPatients(),
                doctorPortalService.getMedicinesCatalog(),
            ]);
            if (rxRes.data?.success) setPrescriptions(rxRes.data.data || []);
            if (ptRes.data?.success) setPatients(ptRes.data.data || []);
            if (catRes.data?.success) setCatalog(catRes.data.data || []);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleItemChange = (index, field, value) => {
        setForm((prev) => {
            const updated = [...prev.items];
            updated[index] = { ...updated[index], [field]: value };
            if (field === 'medicine_id' && value) {
                const med = catalog.find((m) => String(m.id) === String(value));
                if (med) {
                    updated[index].medicine_name = med.name;
                }
            }
            return { ...prev, items: updated };
        });
    };

    const addItemRow = () => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                { medicine_id: '', medicine_name: '', dosage: '', duration: '', instructions: '' },
            ],
        }));
    };

    const removeItemRow = (idx) => {
        if (form.items.length <= 1) return;
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== idx),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const payload = {
                patient_key: form.patient_key,
                diagnosis: form.diagnosis.trim(),
                notes: form.notes.trim() || undefined,
                prescribed_date: form.prescribed_date,
                items: form.items.map((it) => ({
                    ...(it.medicine_id ? { medicine_id: Number(it.medicine_id) } : {}),
                    medicine_name: it.medicine_name.trim(),
                    dosage: it.dosage.trim(),
                    duration: it.duration.trim() || undefined,
                    instructions: it.instructions.trim() || undefined,
                })),
            };

            await doctorPortalService.createPrescription(payload);
            setModalOpen(false);
            setSearchParams({}, { replace: true });
            setForm({
                patient_key: '',
                diagnosis: '',
                notes: '',
                prescribed_date: new Date().toISOString().split('T')[0],
                items: [{ medicine_id: '', medicine_name: '', dosage: '', duration: '', instructions: '' }],
            });
            setNotice('تم إصدار الروشتة الطبية بنجاح!');
            loadData();
            setTimeout(() => setNotice(''), 4000);
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : err.response?.data?.message;
            setErrorMsg(msg || 'تعذر إصدار الروشتة.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold font-almarai text-slate-900 m-0">
                        الروشتات الطبية
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 m-0">
                        إصدار ومراجعة الروشتات المرتبطة بمرضاك وربطها مباشرة بأصناف متجر الأدوية في صيدليتي.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="btn-main px-5 py-3 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>إصدار روشتة جديدة</span>
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
                    placeholder="ابحث برقم الروشتة، اسم المريض، أو التشخيص..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                />
            </div>

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 text-[#0f6848] animate-spin" />
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="bg-white/95 rounded-3xl p-12 text-center border border-white">
                    <FileSpreadsheet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500 m-0">
                        لم يتم إصدار روشتات بعد.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((rx) => (
                        <div
                            key={rx.id}
                            className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs space-y-3"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#0f6848] text-xs font-black font-mono">
                                        {rx.prescription_number}
                                    </span>
                                    <span className="text-sm font-extrabold text-slate-900">
                                        {rx.patient_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400">{rx.prescribed_date}</span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        {rx.status === 'active' ? 'سارية' : rx.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-700 m-0">
                                <strong>التشخيص:</strong> {rx.diagnosis}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {(rx.items || []).map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                                    >
                                        <div className="font-extrabold text-slate-900">
                                            {item.medicine_name}
                                        </div>
                                        <div className="text-slate-600 mt-0.5">
                                            {item.dosage}
                                            {item.duration ? ` • ${item.duration}` : ''}
                                        </div>
                                        {item.instructions && (
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                {item.instructions}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Issue Prescription Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-extrabold font-almarai text-slate-900 m-0">
                                إصدار روشتة طبية لمريض
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
                            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">اختر المريض *</label>
                                    <select
                                        required
                                        value={form.patient_key}
                                        onChange={(e) => setForm((p) => ({ ...p, patient_key: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                                    >
                                        <option value="">-- اختر من مرضاك --</option>
                                        {patients.map((pt) => (
                                            <option key={pt.patient_key} value={pt.patient_key}>
                                                {pt.patient_name} ({pt.phone})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الروشتة *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.prescribed_date}
                                        onChange={(e) => setForm((p) => ({ ...p, prescribed_date: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">التشخيص الطبي *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.diagnosis}
                                    onChange={(e) => setForm((p) => ({ ...p, diagnosis: e.target.value }))}
                                    placeholder="مثال: التهاب الشعب الهوائية الحاد"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-extrabold text-slate-800">
                                        الأدوية الموصوفة
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addItemRow}
                                        className="text-xs font-bold text-[#0f6848] cursor-pointer"
                                    >
                                        + إضافة صنف دوائي آخر
                                    </button>
                                </div>

                                {form.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <select
                                                value={item.medicine_id}
                                                onChange={(e) => handleItemChange(idx, 'medicine_id', e.target.value)}
                                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                                            >
                                                <option value="">اختر من صيدلية الموقع (أو اكتب يدوياً)</option>
                                                {catalog.map((med) => (
                                                    <option key={med.id} value={med.id}>
                                                        {med.name} ({med.price} ج.م)
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                required
                                                value={item.medicine_name}
                                                onChange={(e) => handleItemChange(idx, 'medicine_name', e.target.value)}
                                                placeholder="اسم الدواء والتركيز *"
                                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                            <input
                                                type="text"
                                                required
                                                value={item.dosage}
                                                onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                                                placeholder="الجرعة (قرص كل 12 ساعة) *"
                                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                                            />
                                            <input
                                                type="text"
                                                value={item.duration}
                                                onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                                                placeholder="المدة (7 أيام)"
                                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                                            />
                                            <div className="flex gap-1.5">
                                                <input
                                                    type="text"
                                                    value={item.instructions}
                                                    onChange={(e) =>
                                                        handleItemChange(idx, 'instructions', e.target.value)
                                                    }
                                                    placeholder="بعد الأكل"
                                                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                                                />
                                                {form.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItemRow(idx)}
                                                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية للمريض</label>
                                <textarea
                                    rows="2"
                                    value={form.notes}
                                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
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
                                    {submitting ? 'جاري الحفظ...' : 'حفظ وإصدار الروشتة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
