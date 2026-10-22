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
  Loader2
} from 'lucide-react';

const Appointments = () => {
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


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-main text-white rounded-2xl mb-3 shadow-md">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-almarai text-gray-900 mb-2">
            حجز موعد كشف طبي
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            احجز موعدك بسهولة مع نخبة من الاستشاريين وسيتم التواصل معك لتأكيد الحضور
          </p>
        </div>

        {/* Success Screen */}
        {confirmedAppointment ? (
          <div className="bg-white rounded-2xl p-8 border border-emerald-100 shadow-md text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-almarai text-gray-800 mb-2">
              تم حجز موعدك بنجاح!
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              تم تسجيل بيانات الحجز بنجاح، وسيصلك اتصال أو رسالة تأكيد قبل موعد الكشف.
            </p>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-right space-y-2.5 text-sm mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">رقم الحجز:</span>
                <span className="font-bold text-main font-mono">#{confirmedAppointment.appointment_id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">اسم المريض:</span>
                <span className="font-semibold text-gray-800">{confirmedAppointment.patient_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">تاريخ الموعد:</span>
                <span className="font-semibold text-gray-800">{confirmedAppointment.appointment_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">وقت الموعد:</span>
                <span className="font-bold text-emerald-700">{confirmedAppointment.appointment_time}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmedAppointment(null)}
                className="btn-main px-6 py-2.5"
              >
                حجز موعد آخر
              </button>
              <Link to="/doctors" className="btn-outline-main px-6 py-2.5">
                تصفح الأطباء
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    الاسم بالكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      name="patient_name"
                      required
                      value={formData.patient_name}
                      onChange={handleInputChange}
                      placeholder="اسم المريض الثلاثي"
                      className="w-full pr-10 pl-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    رقم الهاتف للتواصل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01xxxxxxxxx"
                      className="w-full pr-10 pl-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="patient@example.com"
                      className="w-full pr-10 pl-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    اختر الطبيب المعالج <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="doctor_id"
                    required
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    تاريخ الموعد المطلوب <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="appointment_date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    الوقت المفضل للكشف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="appointment_time"
                    required
                    value={formData.appointment_time}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-main py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
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
