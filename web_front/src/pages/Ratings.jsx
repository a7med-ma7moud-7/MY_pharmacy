import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle2, AlertCircle, User, ArrowRight, Loader2, Send } from 'lucide-react';
import { getDoctors, submitRating } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Ratings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryDoctorId = searchParams.get('doctor_id') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(queryDoctorId);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setDoctors(list);
        if (!selectedDoctorId && list.length > 0 && !queryDoctorId) {
          setSelectedDoctorId(list[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load doctors list:', err);
      });
  }, [queryDoctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('يرجى اختيار الطبيب المراد تقييمه');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await submitRating({
        doctor_id: selectedDoctorId,
        user_id: user?.id || 1,
        rating: Number(rating),
        comment: comment.trim(),
      });
      setSuccess('تم إرسال تقييمك بنجاح! شكراً لمشاركتك رأيك القَيّم.');
      setComment('');
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.response?.data?.message || err.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  const ratingDescriptions = {
    5: 'ممتاز جداً 🌟🌟🌟🌟🌟',
    4: 'جيد جداً 🌟🌟🌟🌟',
    3: 'جيد 🌟🌟🌟',
    2: 'مقبول 🌟🌟',
    1: 'ضعيف 🌟',
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        {/* Back Link */}
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-main mb-4 font-semibold transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الأطباء</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f6848] to-[#10ac84] p-6 text-center text-white relative">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
              <Star className="w-7 h-7 text-yellow-300 fill-yellow-300" />
            </div>
            <h2 className="text-2xl font-extrabold font-almarai text-white mb-1">
              إضافة تقييم للطبيب
            </h2>
            <p className="text-white/80 text-xs">
              رأيك يساعدنا ويساعد المرضى الآخرين في الحصول على أفضل رعاية صحية
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Doctor Select */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  اختر الطبيب المراد تقييمه <span className="text-red-500">*</span>
                </label>
                <select
                  id="doctorSelect"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="">-- اضغط لاختيار الطبيب --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      د. {doc.name} {doc.specialty ? `(${doc.specialty})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Preview Card */}
              {selectedDoctor && (
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-main text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-0.5">د. {selectedDoctor.name}</h4>
                    <span className="text-xs text-gray-500">
                      {selectedDoctor.specialty || 'طبيب استشاري'} {selectedDoctor.address ? `• ${selectedDoctor.address}` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Star Rating Section */}
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 text-center">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  درجة التقييم
                </label>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            active
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-bold text-emerald-700 mt-2">
                  {ratingDescriptions[hoverRating || rating]}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  تعليقك وملاحظاتك (اختياري)
                </label>
                <textarea
                  rows="3"
                  maxLength={255}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="اكتب ملاحظاتك حول تجربتك مع الطبيب والخدمة الطبية..."
                  className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                ></textarea>
                <div className="text-left text-xs text-gray-400 mt-1 font-mono">
                  {comment.length}/255 حرف
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedDoctorId}
                className="w-full btn-main py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إرسال التقييم...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 rtl:rotate-180" />
                    <span>إرسال التقييم الآن</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
