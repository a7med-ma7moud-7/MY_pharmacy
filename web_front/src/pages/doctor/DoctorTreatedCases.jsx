import React, { useState, useEffect, useCallback } from 'react';
import { doctorPortalService, resolveStorageUrl } from '../../services/api';
import {
    Plus,
    Edit2,
    Trash2,
    BriefcaseMedical,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    X,
    Upload,
} from 'lucide-react';

const EMPTY_CASE = {
    title: '',
    specialty: '',
    description: '',
    initial_condition: '',
    treatment_summary: '',
    outcome: '',
    published_at: new Date().toISOString().split('T')[0],
    patient_consent_confirmed: true,
};

export default function DoctorTreatedCases() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState(null);
    const [form, setForm] = useState(EMPTY_CASE);
    const [imageFile, setImageFile] = useState(null);
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const loadCases = useCallback(async () => {
        setLoading(true);
        try {
            const res = await doctorPortalService.getCases(search ? { search } : {});
            if (res.data?.success) {
                setCases(res.data.data || []);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'تعذر تحميل الحالات المعالجة.');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        loadCases();
    }, [loadCases]);

    const openCreate = () => {
        setEditingCase(null);
        setForm(EMPTY_CASE);
        setImageFile(null);
        setAttachmentFile(null);
        setErrorMsg('');
        setModalOpen(true);
    };

    const openEdit = (tc) => {
        setEditingCase(tc);
        setForm({
            title: tc.title || '',
            specialty: tc.specialty || '',
            description: tc.description || '',
            initial_condition: tc.initial_condition || '',
            treatment_summary: tc.treatment_summary || '',
            outcome: tc.outcome || '',
            published_at: tc.published_at || new Date().toISOString().split('T')[0],
            patient_consent_confirmed: true,
        });
        setImageFile(null);
        setAttachmentFile(null);
        setErrorMsg('');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const fd = new FormData();
            fd.append('title', form.title);
            if (form.specialty) fd.append('specialty', form.specialty);
            fd.append('description', form.description);
            fd.append('initial_condition', form.initial_condition);
            fd.append('treatment_summary', form.treatment_summary);
            fd.append('outcome', form.outcome);
            if (form.published_at) fd.append('published_at', form.published_at);
            fd.append('patient_consent_confirmed', form.patient_consent_confirmed ? '1' : '0');
            if (imageFile) fd.append('image', imageFile);
            if (attachmentFile) fd.append('attachment', attachmentFile);

            if (editingCase) {
                await doctorPortalService.updateCase(editingCase.id, fd);
                setNotice('تم تحديث الحالة العلاجية بنجاح!');
            } else {
                await doctorPortalService.createCase(fd);
                setNotice('تم نشر الحالة العلاجية فوراً على ملفك العام بنجاح!');
            }
            setModalOpen(false);
            loadCases();
            setTimeout(() => setNotice(''), 4000);
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : err.response?.data?.message;
            setErrorMsg(msg || 'تعذر حفظ الحالة العلاجية.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await doctorPortalService.deleteCase(deleteTarget.id);
            setDeleteTarget(null);
            setNotice('تم حذف الحالة العلاجية.');
            loadCases();
            setTimeout(() => setNotice(''), 3500);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'تعذر حذف الحالة.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold font-almarai text-slate-900 m-0">
                        إدارة الحالات التي تم علاجها
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 m-0">
                        تُنشر الحالات مباشرة على ملفك العام فور الإضافة دون انتظار موافقة مسبقة، مع الالتزام التام بسرية هوية المريض.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="btn-main px-5 py-3 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>إضافة حالة جديدة</span>
                </button>
            </div>

            {notice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{notice}</span>
                </div>
            )}

            {/* Search */}
            <div className="bg-white/95 rounded-2xl p-4 border border-white shadow-xs">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بعنوان الحالة أو الوصف..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* Cases Grid */}
            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 text-[#0f6848] animate-spin" />
                </div>
            ) : cases.length === 0 ? (
                <div className="bg-white/95 rounded-3xl p-12 text-center border border-white">
                    <BriefcaseMedical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <h3 className="text-base font-extrabold font-almarai text-slate-800 mb-1">
                        لا توجد حالات منشورة بعد
                    </h3>
                    <p className="text-xs text-slate-400 mb-5">
                        شارك أمثلة مهنية للحالات التي قمت بعلاجها لتعريف المرضى بخبرتك السريرية.
                    </p>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="btn-main px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                        إضافة أول حالة علاجية
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {cases.map((tc) => (
                        <div
                            key={tc.id}
                            className="bg-white/95 rounded-3xl border border-white shadow-xs overflow-hidden flex flex-col justify-between"
                        >
                            <div>
                                {tc.image_url && (
                                    <div className="h-44 bg-slate-100 overflow-hidden">
                                        <img
                                            src={resolveStorageUrl(tc.image_url)}
                                            alt={tc.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-[#0f6848]">
                                            {tc.specialty}
                                        </span>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                tc.status === 'published'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}
                                        >
                                            {tc.status === 'published' ? 'منشورة للجمهور' : 'مخفية إدارياً'}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-extrabold font-almarai text-slate-900 mb-1.5">
                                        {tc.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed m-0">
                                        {tc.description}
                                    </p>
                                </div>
                            </div>

                            <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-semibold">{tc.published_at}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(tc)}
                                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0f6848] cursor-pointer"
                                        title="تعديل"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(tc)}
                                        className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                        title="حذف"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-extrabold font-almarai text-slate-900 m-0">
                                {editingCase ? 'تعديل الحالة العلاجية' : 'نشر حالة علاجية جديدة'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-xl bg-slate-100 text-slate-600 cursor-pointer"
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
                                    <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الحالة *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.title}
                                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                        placeholder="مثال: علاج ارتجاع المريء المزمن بنجاح"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الطبي</label>
                                    <input
                                        type="text"
                                        value={form.specialty}
                                        onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
                                        placeholder="يُملأ تلقائياً بتخصصك إن تُرك فارغاً"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">وصف مختصر للحالة *</label>
                                <textarea
                                    rows="2"
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    placeholder="ملخص عام للحالة يظهر في بطاقة العرض..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">الحالة المبدئية والأعراض قبل العلاج *</label>
                                <textarea
                                    rows="2"
                                    required
                                    value={form.initial_condition}
                                    onChange={(e) => setForm((p) => ({ ...p, initial_condition: e.target.value }))}
                                    placeholder="وصف الأعراض والتشخيص الأولي دون ذكر اسم المريض..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">الخطة العلاجية أو الإجراء الطبي المتبع *</label>
                                <textarea
                                    rows="2"
                                    required
                                    value={form.treatment_summary}
                                    onChange={(e) => setForm((p) => ({ ...p, treatment_summary: e.target.value }))}
                                    placeholder="تفاصيل البروتوكول العلاجي أو التدخل الطبي..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">النتيجة النهائية والتحسن *</label>
                                <textarea
                                    rows="2"
                                    required
                                    value={form.outcome}
                                    onChange={(e) => setForm((p) => ({ ...p, outcome: e.target.value }))}
                                    placeholder="نتيجة العلاج ومستوى التعافي..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ النشر</label>
                                    <input
                                        type="date"
                                        value={form.published_at}
                                        onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">صورة توضيحية (اختياري)</label>
                                    <label className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs font-bold text-[#0f6848] flex items-center gap-2 cursor-pointer">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span className="truncate">{imageFile ? imageFile.name : 'رفع صورة توضيحية'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Patient Privacy Safeguard */}
                            <label className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    required
                                    checked={form.patient_consent_confirmed}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, patient_consent_confirmed: e.target.checked }))
                                    }
                                    className="mt-0.5 accent-[#0f6848]"
                                />
                                <span className="leading-relaxed">
                                    <ShieldAlert className="w-3.5 h-3.5 inline ml-1 text-amber-700" />
                                    أقرّ بأن هذه الحالة خالية تماماً من اسم المريض أو رقم هاتفه أو أي بيانات تكشف هويته الشخصية، وأنه تم استيفاء الموافقة المهنية اللازمة للنشر.
                                </span>
                            </label>

                            <div className="flex justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-main px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer"
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{editingCase ? 'حفظ التعديلات' : 'نشر الحالة فوراً'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
                        <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                        <h3 className="text-base font-extrabold font-almarai text-slate-900 mb-1">
                            تأكيد حذف الحالة العلاجية
                        </h3>
                        <p className="text-xs text-slate-500 mb-5">
                            هل أنت متأكد من حذف الحالة «{deleteTarget.title}» نهائياً من ملفك العام؟
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                            >
                                تراجع
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer hover:bg-rose-700"
                            >
                                {deleting ? 'جاري الحذف...' : 'نعم، احذف الحالة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
