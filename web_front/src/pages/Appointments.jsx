import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { appointmentService, doctorService } from '../services/api';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  Sparkles,
  Stethoscope
} from 'lucide-react';

export const Appointments = () => {
  const [searchParams] = useSearchParams();
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
    appointment_date: '',
    appointment_time: '18:00',
    notes: '',
  });

  const fetchDoctorsList = async () => {
    try {
      const res = await doctorService.getDoctors({ per_page: 100 });
      if (res.data?.success) {
        setDoctors(res.data.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load doctors list', err);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  useEffect(() => {
    if (preselectedDoctorId) {
      setFormData((prev) => ({ ...prev, doctor_id: preselectedDoctorId }));
    }
  }, [preselectedDoctorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedDoctor = doctors.find((d) => String(d.id) === String(formData.doctor_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await appointmentService.createAppointment(formData);
      if (res.data?.success) {
        setConfirmedAppointment(res.data.data);
      } else {
        setErrorMessage(res.data?.message || 'تعذر حجز الموعد.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'حدث خطأ أثناء حجز الموعد، يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-[#0f6848] to-[#10ac84] text-white rounded-2xl mb-3 shadow-md">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-almarai text-gray-900 mb-2">
            حجز موعد كشف طبي
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto m-0">
            احجز موعدك بسهولة مع نخبة من الاستشاريين وسيتم التواصل معك لتأكيد الحضور
          </p>
        </div>

        {/* Success Screen */}
        {confirmedAppointment ? (
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center animate-scaleIn">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold font-almarai text-gray-900 mb-2">
              تم حجز موعدك بنجاح!
            </h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              تم تسجيل بيانات الحجز بنجاح في المنظومة، وسيقوم فريق العيادة بالتواصل معك لتأكيد الموعد.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100 text-right space-y-3 text-sm mb-8">
              <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                <span className="text-gray-500">رقم الحجز التأكيدي:</span>
                <span className="font-bold text-[#0f6848] font-mono text-base">#{confirmedAppointment.appointment_id || confirmedAppointment.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                <span className="text-gray-500">اسم المريض:</span>
                <span className="font-semibold text-gray-800">{confirmedAppointment.patient_name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                <span className="text-gray-500">تاريخ الموعد:</span>
                <span className="font-semibold text-gray-800">{confirmedAppointment.appointment_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">وقت الموعد:</span>
                <span className="font-bold text-emerald-700">{confirmedAppointment.appointment_time}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setConfirmedAppointment(null)}
                className="btn-main px-8 py-3 rounded-xl font-bold shadow-md"
              >
                حجز موعد إضافي
              </button>
              <Link to="/doctors" className="btn-outline-main px-6 py-3 rounded-xl font-bold">
                تصفح باقي الأطباء
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Doctor Selected Banner */}
            {selectedDoctor && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-4 animate-fadeIn">
                <img
                  src={selectedDoctor.image_url || '/asset/1.png'}
                  alt={selectedDoctor.name}
                  onError={(e) => { e.target.src = '/asset/1.png'; }}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm bg-white"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-gray-900 text-sm m-0">د. {selectedDoctor.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600 m-0 mt-0.5">{selectedDoctor.specialty}</p>
                  <p className="text-xs text-emerald-800 font-bold m-0 mt-0.5">قيمة الكشف: {selectedDoctor.price} ج.م</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    اسم المريض بالكامل <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                    <input
                      type="text"
                      name="patient_name"
                      required
                      value={formData.patient_name}
                      onChange={handleInputChange}
                      placeholder="اسم المريض الثلاثي"
                      className="w-full pr-10 pl-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    رقم الهاتف للتواصل <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01xxxxxxxxx"
                      className="w-full pr-10 pl-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="patient@example.com"
                      className="w-full pr-10 pl-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    اختر الطبيب المعالج <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="doctor_id"
                    required
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
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
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    تاريخ الموعد المطلوب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="appointment_date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    الوقت المفضل للكشف <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="appointment_time"
                    required
                    value={formData.appointment_time}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ملاحظات أو الأعراض التي تشعر بها
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="اكتب هنا أي تفاصيل تود إبلاغ الطبيب بها مسبقاً..."
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-main py-3.5 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-98 transition-all"
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
        )}
      </div>
    </div>
  );
};

export default Appointments;
