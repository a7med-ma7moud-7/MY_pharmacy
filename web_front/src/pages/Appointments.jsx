import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { appointmentService, doctorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DoctorAvatar, formatDoctorName } from '../components/common/MedicalMedia';
import Reveal from '../components/common/Reveal';
import {
    Calendar,
    User,
    Phone,
    Mail,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Clock,
    Stethoscope,
    MapPin,
    ShieldCheck,
} from 'lucide-react';

const QUICK_TIMES = ['12:00', '14:00', '16:00', '18:00', '20:00', '21:30'];
const TODAY_ISO = new Date().toISOString().split('T')[0];

export const Appointments = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const preselectedDoctorId = searchParams.get('doctor_id') || '';

    const [doctors, setDoctors] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmedAppointment, setConfirmedAppointment] = useState(null);

    const [formData, setFormData] = useState({
        patient_name: '',
        phone: '',
        email: '',
        doctor_id: preselectedDoctorId,
        appointment_date: TODAY_ISO,
        appointment_time: '18:00',
        notes: '',
    });

    useEffect(() => {
        let active = true;
        const fetchDoctorsList = async () => {
            try {
                const res = await doctorService.getDoctors({ per_page: 100 });
                if (active && res.data?.success) {
                    setDoctors(res.data.data?.data || []);
                }
            } catch (err) {
                console.error('Failed to load doctors list', err);
            }
        };
        fetchDoctorsList();
        return () => {
            active = false;
        };
    }, []);

    const effectiveName = formData.patient_name || user?.name || '';
    const effectiveEmail = formData.email || user?.email || '';
    const effectiveDoctorId = formData.doctor_id || preselectedDoctorId;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const selectedDoctor = doctors.find(
        (d) => String(d.id) === String(effectiveDoctorId)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                patient_name: effectiveName,
                email: effectiveEmail,
                doctor_id: effectiveDoctorId,
            };
            const res = await appointmentService.createAppointment(payload);
            if (res.data?.success) {
                setConfirmedAppointment(res.data.data);
            } else {
                setErrorMessage(res.data?.message || 'تعذر حجز الموعد.');
            }
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                    'حدث خطأ أثناء حجز الموعد، يرجى المحاولة مرة أخرى.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pb-16 bg-slate-50 min-h-screen">
            {/* Hero Header */}
            <div className="hero-mesh text-white py-12 mb-10 relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex p-3.5 bg-white/15 backdrop-blur-md border border-white/25 text-emerald-200 rounded-2xl mb-3 shadow-lg">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold font-almarai text-white mb-2">
                        حجز موعد كشف طبي
                    </h1>
                    <p className="text-emerald-100/90 text-sm max-w-md mx-auto m-0">
                        احجز موعدك بسهولة مع نخبة من الاستشاريين وسيتم التواصل معك لتأكيد الحضور
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Ticket Screen */}
                {confirmedAppointment ? (
                    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-emerald-100 shadow-2xl text-center animate-scaleIn">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner animate-bounce">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-extrabold font-almarai text-slate-900 mb-2">
                            تم حجز موعدك بنجاح!
                        </h3>
                        <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                            احتفظ برقم الحجز التأكيدي أدناه، وسيقوم فريق العيادة بالتواصل معك لتأكيد الحضور.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-dashed border-emerald-300 text-right space-y-3 text-sm mb-8">
                            <div className="flex justify-between border-b border-slate-200/70 pb-2.5">
                                <span className="text-slate-500">رقم تذكرة الحجز:</span>
                                <span className="font-black text-[#0f6848] font-mono text-base">
                                    #{confirmedAppointment.appointment_id || confirmedAppointment.id}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/70 pb-2.5">
                                <span className="text-slate-500">اسم المريض:</span>
                                <span className="font-bold text-slate-800">
                                    {confirmedAppointment.patient_name}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/70 pb-2.5">
                                <span className="text-slate-500">تاريخ الموعد:</span>
                                <span className="font-bold text-slate-800">
                                    {confirmedAppointment.appointment_date}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">وقت الموعد:</span>
                                <span className="font-black text-emerald-700">
                                    {confirmedAppointment.appointment_time}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmedAppointment(null)}
                                className="btn-main px-8 py-3 rounded-xl font-bold shadow-md cursor-pointer"
                            >
                                حجز موعد إضافي
                            </button>
                            <Link to="/doctors" className="btn-outline-main px-6 py-3 rounded-xl font-bold">
                                تصفح باقي الأطباء
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* 2-Column Booking Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Form Column */}
                        <Reveal className="lg:col-span-8">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                                {errorMessage && (
                                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold flex items-center gap-2.5 animate-fadeIn">
                                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                اسم المريض بالكامل <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                                <input
                                                    type="text"
                                                    name="patient_name"
                                                    required
                                                    value={effectiveName}
                                                    onChange={handleInputChange}
                                                    placeholder="اسم المريض الثلاثي"
                                                    className="w-full pr-10 pl-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                رقم الهاتف للتواصل <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="01xxxxxxxxx"
                                                    className="w-full pr-10 pl-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                البريد الإلكتروني (اختياري)
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={effectiveEmail}
                                                    onChange={handleInputChange}
                                                    placeholder="patient@example.com"
                                                    className="w-full pr-10 pl-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                اختر الطبيب المعالج <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                name="doctor_id"
                                                required
                                                value={effectiveDoctorId}
                                                onChange={handleInputChange}
                                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
                                            >
                                                <option value="">-- اضغط لاختيار الطبيب --</option>
                                                {doctors.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        د. {d.name} ({d.specialty}) - {d.price} ج.م
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                تاريخ الموعد المطلوب <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="appointment_date"
                                                required
                                                min={TODAY_ISO}
                                                value={formData.appointment_date}
                                                onChange={handleInputChange}
                                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                الوقت المفضل للكشف <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                name="appointment_time"
                                                required
                                                value={formData.appointment_time}
                                                onChange={handleInputChange}
                                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Time Slots */}
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>أوقات الكشف السريعة المتاحة:</span>
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {QUICK_TIMES.map((timeVal) => (
                                                <button
                                                    key={timeVal}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            appointment_time: timeVal,
                                                        }))
                                                    }
                                                    className={`filter-pill ${
                                                        formData.appointment_time === timeVal ? 'active' : ''
                                                    }`}
                                                >
                                                    {timeVal}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            ملاحظات أو الأعراض التي تشعر بها
                                        </label>
                                        <textarea
                                            name="notes"
                                            rows="3"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="اكتب هنا أي تفاصيل تود إبلاغ الطبيب بها مسبقاً..."
                                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full btn-main py-3.5 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>جاري معالجة وتأكيد الحجز...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>تأكيد حجز الموعد الآن</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </Reveal>

                        {/* Live Sticky Summary Card */}
                        <Reveal delay={120} className="lg:col-span-4 lg:sticky lg:top-24">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#093d2b] to-[#0f6848] text-white p-5">
                                    <h3 className="text-base font-extrabold font-almarai m-0 text-white flex items-center gap-2">
                                        <Stethoscope className="w-5 h-5 text-emerald-300" />
                                        <span>ملخص تذكرة الموعد</span>
                                    </h3>
                                </div>

                                <div className="p-6 space-y-5">
                                    {selectedDoctor ? (
                                        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                                <DoctorAvatar
                                                    doctor={selectedDoctor}
                                                    size="md"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 text-base">
                                                    {formatDoctorName(selectedDoctor.name)}
                                                </h4>
                                                <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                                                    {selectedDoctor.specialty}
                                                </span>
                                                {selectedDoctor.location && (
                                                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3 text-emerald-600" />
                                                        {selectedDoctor.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-400 font-semibold">
                                            اختر الطبيب من القائمة لعرض تفاصيل الكشف هنا
                                        </div>
                                    )}

                                    <div className="space-y-3 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-semibold">التاريخ المختار:</span>
                                            <span className="font-bold text-slate-800">
                                                {formData.appointment_date || '—'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-semibold">الموعد المختار:</span>
                                            <span className="font-bold text-slate-800">
                                                {formData.appointment_time || '—'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-slate-100 text-sm">
                                            <span className="text-slate-600 font-bold">قيمة الكشف:</span>
                                            <span className="font-black text-[#0f6848] text-lg">
                                                {selectedDoctor ? `${selectedDoctor.price} ج.م` : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-900">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>الدفع نقداً في العيادة عند الحضور، بدون أي رسوم حجز إضافية.</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
