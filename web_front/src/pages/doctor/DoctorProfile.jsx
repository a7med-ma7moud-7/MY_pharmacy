import React, { useState, useEffect } from 'react';
import { doctorPortalService, resolveStorageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Save,
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Lock,
    Image as ImageIcon,
} from 'lucide-react';

export default function DoctorProfile() {
    const { updateAuthState } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        name: '',
        specialty: '',
        price: '',
        number: '',
        email: '',
        location: '',
        tow_location: '',
        clinic_name: '',
        working_hours: '',
        experience_years: '',
        qualifications: '',
        bio: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [galleryFiles, setGalleryFiles] = useState({});
    const [galleryPreviews, setGalleryPreviews] = useState({});

    useEffect(() => {
        doctorPortalService
            .getProfile()
            .then((res) => {
                if (res.data?.success) {
                    const { doctor, account } = res.data.data;
                    setForm((prev) => ({
                        ...prev,
                        name: doctor.name || '',
                        specialty: doctor.specialty || '',
                        price: doctor.price ?? '',
                        number: doctor.number || account?.phone || '',
                        email: account?.display_email || '',
                        location: doctor.location || '',
                        tow_location: doctor.tow_location || '',
                        clinic_name: doctor.clinic_name || '',
                        working_hours: doctor.working_hours || '',
                        experience_years: doctor.experience_years ?? '',
                        qualifications: doctor.qualifications || '',
                        bio: doctor.bio || '',
                    }));
                    if (doctor.image_url) {
                        setImagePreview(resolveStorageUrl(doctor.image_url));
                    }
                    const gp = {};
                    for (let i = 1; i <= 5; i++) {
                        const url = doctor[`image_${i}_url`] || doctor[`image-${i}`];
                        if (url) gp[`image-${i}`] = resolveStorageUrl(url);
                    }
                    setGalleryPreviews(gp);
                }
            })
            .catch((err) => {
                setErrorMsg(err.response?.data?.message || 'تعذر تحميل بيانات الملف المهني.');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const fd = new FormData();
            [
                'name',
                'specialty',
                'price',
                'number',
                'location',
                'tow_location',
                'clinic_name',
                'working_hours',
                'experience_years',
                'qualifications',
                'bio',
            ].forEach((k) => {
                if (form[k] !== '' && form[k] !== null && form[k] !== undefined) {
                    fd.append(k, form[k]);
                }
            });

            if (form.email.trim()) {
                fd.append('email', form.email.trim());
            }

            if (form.new_password) {
                fd.append('current_password', form.current_password);
                fd.append('new_password', form.new_password);
                fd.append('new_password_confirmation', form.new_password_confirmation);
            }

            if (imageFile) {
                fd.append('image', imageFile);
            }

            Object.entries(galleryFiles).forEach(([field, file]) => {
                if (file) fd.append(field, file);
            });

            const res = await doctorPortalService.updateProfile(fd);
            if (res.data?.success) {
                setSuccessMsg(res.data.message || 'تم حفظ التعديلات بنجاح!');
                updateAuthState(res.data.data?.account, res.data.token || null);
                setForm((prev) => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                }));
            }
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : err.response?.data?.message;
            setErrorMsg(msg || 'تعذر حفظ التعديلات.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-[#0f6848] animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Avatar & Basic Professional Info */}
            <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-white shadow-xs space-y-6">
                <h2 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                    المعلومات الشخصية والمهنية
                </h2>

                <div className="flex flex-wrap items-center gap-5 pb-4 border-b border-slate-100">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-emerald-500 bg-slate-50 flex items-center justify-center shrink-0">
                        {imagePreview ? (
                            <img src={imagePreview} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                    <div>
                        <label className="btn-outline-main px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>تغيير الصورة الشخصية</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                        setImageFile(f);
                                        setImagePreview(URL.createObjectURL(f));
                                    }
                                }}
                            />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1.5 m-0">
                            تظهر هذه الصورة مباشرة في ملفك العام بقسم الأطباء.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم الكامل *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">التخصص الطبي *</label>
                        <input
                            type="text"
                            name="specialty"
                            required
                            value={form.specialty}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف *</label>
                        <input
                            type="tel"
                            name="number"
                            dir="ltr"
                            required
                            value={form.number}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-right focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">سعر الكشف (ج.م) *</label>
                        <input
                            type="number"
                            name="price"
                            min="0"
                            required
                            value={form.price}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">سنوات الخبرة</label>
                        <input
                            type="number"
                            name="experience_years"
                            min="0"
                            max="70"
                            value={form.experience_years}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني المهني</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="doctor@example.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">المؤهلات العلمية والشهادات</label>
                    <input
                        type="text"
                        name="qualifications"
                        value={form.qualifications}
                        onChange={handleChange}
                        placeholder="مثال: دكتوراه واستشاري الأمراض الباطنة - زمالة الكلية الملكية"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">النبذة المهنية (Professional Bio)</label>
                    <textarea
                        rows="3"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="اكتب نبذة مختصرة عن خبراتك ومجالات التخصص الدقيق..."
                        className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>

            {/* Clinic Info & Gallery */}
            <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-white shadow-xs space-y-5">
                <h2 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                    بيانات العيادة وصور المقر
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم العيادة / المركز</label>
                        <input
                            type="text"
                            name="clinic_name"
                            value={form.clinic_name}
                            onChange={handleChange}
                            placeholder="مثال: عيادة الشفاء التخصصية"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">مواعيد العمل بالعيادة</label>
                        <input
                            type="text"
                            name="working_hours"
                            value={form.working_hours}
                            onChange={handleChange}
                            placeholder="مثال: السبت إلى الخميس من 4 م إلى 10 م"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">المدينة / المنطقة *</label>
                        <input
                            type="text"
                            name="location"
                            required
                            value={form.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان التفصيلي</label>
                        <input
                            type="text"
                            name="tow_location"
                            value={form.tow_location}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">معرض صور العيادة (حتى 5 صور)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5].map((idx) => {
                            const field = `image-${idx}`;
                            const prev = galleryPreviews[field];
                            return (
                                <label
                                    key={field}
                                    className="p-2.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:border-emerald-400 text-center cursor-pointer flex flex-col items-center justify-center h-28 overflow-hidden"
                                >
                                    {prev ? (
                                        <img src={prev} alt={field} className="w-full h-18 object-cover rounded-xl mb-1" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                                    )}
                                    <span className="text-[10px] font-bold text-[#0f6848]">
                                        {prev ? 'تغيير' : `صورة ${idx}`}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) {
                                                setGalleryFiles((p) => ({ ...p, [field]: f }));
                                                setGalleryPreviews((p) => ({
                                                    ...p,
                                                    [field]: URL.createObjectURL(f),
                                                }));
                                            }
                                        }}
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Optional Password Change */}
            <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-white shadow-xs space-y-4">
                <h2 className="text-base font-extrabold font-almarai text-slate-900 m-0 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#0f6848]" />
                    <span>تغيير كلمة المرور (اختياري)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                        type="password"
                        name="current_password"
                        value={form.current_password}
                        onChange={handleChange}
                        placeholder="كلمة المرور الحالية"
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                    />
                    <input
                        type="password"
                        name="new_password"
                        value={form.new_password}
                        onChange={handleChange}
                        placeholder="كلمة المرور الجديدة"
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                    />
                    <input
                        type="password"
                        name="new_password_confirmation"
                        value={form.new_password_confirmation}
                        onChange={handleChange}
                        placeholder="تأكيد كلمة المرور الجديدة"
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-main px-8 py-3.5 rounded-2xl text-sm font-extrabold flex items-center gap-2 cursor-pointer"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات وتحديث الملف العام'}</span>
                </button>
            </div>
        </form>
    );
}
