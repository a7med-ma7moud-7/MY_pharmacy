import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService, ratingService } from '../services/api';
import { 
  MapPin, 
  Phone, 
  Calendar, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';

const DoctorDetail = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Rating form
  const [ratingVal, setRatingVal] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctor(id);
      if (res.data?.success) {
        const d = res.data.data;
        setDoctor(d.doctor);
        setRatings(d.ratings || []);
        setAverageRating(d.average_rating || 5.0);
        setRatingsCount(d.ratings_count || 0);
      }
    } catch (err) {
      console.error('Failed to load doctor', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);


  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      const res = await ratingService.submitRating({
        doctor_id: id,
        rating: ratingVal,
        comment: comment,
      });
      if (res.data?.success) {
        setRatingSuccess(true);
        setComment('');
        fetchDoctor();
        setTimeout(() => setRatingSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed submitting rating:', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-slate-200 mb-4"></div>
            <div className="h-6 bg-slate-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mb-6"></div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="h-20 bg-slate-100 rounded-2xl"></div>
              <div className="h-20 bg-slate-100 rounded-2xl"></div>
              <div className="h-20 bg-slate-100 rounded-2xl"></div>
            </div>
            <div className="h-12 bg-slate-200 rounded-xl w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <h2 className="text-2xl font-bold font-almarai text-gray-800 mb-2">الطبيب غير موجود</h2>
        <p className="text-gray-500 mb-6">ربما تم حذف هذا الطبيب أو أن الرابط غير صحيح.</p>
        <Link to="/doctors" className="btn-main">العودة لقائمة الأطباء</Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-main mb-6 font-semibold">
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الأطباء</span>
        </Link>

        {/* Doctor Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={doctor.image_url || '/asset/1.png'}
              alt={doctor.name}
              onError={(e) => { e.target.src = '/asset/1.png'; }}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-emerald-50 shadow-md bg-white"
            />

            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="bg-emerald-100 text-main font-bold text-xs px-3 py-1 rounded-full">
                  {doctor.specialty}
                </span>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  معتمد وموثق
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold font-almarai text-gray-900 mb-2">
                د. {doctor.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'fill-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
                <span className="text-sm font-bold text-gray-800 mr-1.5">{averageRating}</span>
                <span className="text-xs text-gray-400">({ratingsCount} تقييمات المرضى)</span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">سعر الكشف:</span>
                  <span className="font-bold text-main text-base">{doctor.price} ج.م</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{doctor.location || 'القاهرة'} {doctor.tow_location ? ` - ${doctor.tow_location}` : ''}</span>
                </div>
                {doctor.number && (
                  <div className="flex items-center gap-2" dir="ltr">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{doctor.number}</span>
                  </div>
                )}
              </div>

              <Link
                to={`/appointments?doctor_id=${doctor.id}`}
                className="btn-main px-8 py-3 rounded-xl text-base font-bold shadow-md inline-flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>احجز موعد كشف الآن</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Rating Submission & Reviews Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Submit Review */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold font-almarai text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>أضف تقييمك ورأيك للطبيب</span>
            </h3>

            {ratingSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>تم إرسال تقييمك بنجاح، شكراً لمشاركتك!</span>
              </div>
            )}

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">اختر عدد النجوم:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingVal(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${s <= ratingVal ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-gray-700 mr-2">({ratingVal} من 5)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">اكتب تعليقك وتجربتك:</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="كيف كانت معاملة الطبيب وجودة الاستشارة؟"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingRating}
                className="btn-main w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
                <span>{submittingRating ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
              </button>
            </form>
          </div>

          {/* Past Reviews List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold font-almarai text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>تقييمات وتجارب المرضى ({ratings.length})</span>
            </h3>

            {ratings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">لا توجد تقييمات سابقة بعد. كن أول من يكتب تقييماً!</p>
            ) : (
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {ratings.map((r, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-gray-800">
                        {r.user?.name || 'مريض معتمد'}
                      </span>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            className={`w-3.5 h-3.5 ${st <= r.rating ? 'fill-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
