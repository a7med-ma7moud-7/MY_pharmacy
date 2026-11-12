import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService, ratingService, resolveStorageUrl } from '../services/api';
import Reveal from '../components/common/Reveal';
import {
    MapPin,
    Phone,
    Calendar,
    Star,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
    Send,
    AlertCircle,
    Images,
    X,
    Award,
} from 'lucide-react';

const DoctorDetail = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [averageRating, setAverageRating] = useState(5.0);
    const [ratingsCount, setRatingsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lightboxImg, setLightboxImg] = useState(null);

    // Rating form
    const [ratingVal, setRatingVal] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState(false);
    const [ratingError, setRatingError] = useState('');

    const fetchDoctor = useCallback(async () => {
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
    }, [id]);

    useEffect(() => {
        let active = true;
        doctorService
            .getDoctor(id)
            .then((res) => {
                if (active && res.data?.success) {
                    const d = res.data.data;
                    setDoctor(d.doctor);
                    setRatings(d.ratings || []);
                    setAverageRating(d.average_rating || 5.0);
                    setRatingsCount(d.ratings_count || 0);
                }
            })
            .catch((err) => {
                console.error('Failed to load doctor', err);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [id]);

    const galleryImages = useMemo(() => {
        if (!doctor) return [];
        const candidates = [
            doctor.image_1_url,
            doctor.image_2_url,
            doctor.image_3_url,
            doctor.image_4_url,
            doctor.image_5_url,
            doctor['image-1'],
            doctor['image-2'],
            doctor['image-3'],
            doctor['image-4'],
            doctor['image-5'],
        ]
            .filter(Boolean)
            .map((src) => resolveStorageUrl(src));
        return [...new Set(candidates)];
    }, [doctor]);

    const ratingBreakdown = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratings.forEach((r) => {
            const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
            counts[star] += 1;
        });
        const total = ratings.length || 1;
        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: counts[star],
            percent: ratings.length ? Math.round((counts[star] / total) * 100) : star === 5 ? 100 : 0,
        }));
    }, [ratings]);

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setSubmittingRating(true);
        setRatingError('');
        try {
            const res = await ratingService.submitRating({
                doctor_id: id,
                rating: ratingVal,
                comment: comment.trim(),
            });
            if (res.data?.success) {
                setRatingSuccess(true);
                setComment('');
                fetchDoctor();
                setTimeout(() => setRatingSuccess(false), 4000);
            }
        } catch (err) {
            setRatingError(
                err.response?.data?.message || 'حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً.'
            );
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-28 h-28 rounded-3xl skeleton-shimmer mb-4"></div>
                        <div className="h-6 skeleton-shimmer rounded w-48 mb-2"></div>
                        <div className="h-4 skeleton-shimmer rounded w-32 mb-6"></div>
                        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="h-20 skeleton-shimmer rounded-2xl"></div>
                            <div className="h-20 skeleton-shimmer rounded-2xl"></div>
                            <div className="h-20 skeleton-shimmer rounded-2xl"></div>
                        </div>
                        <div className="h-12 skeleton-shimmer rounded-xl w-48"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center px-4">
                <h2 className="text-2xl font-bold font-almarai text-slate-800 mb-2">الطبيب غير موجود</h2>
                <p className="text-slate-500 mb-6">ربما تم حذف هذا الطبيب أو أن الرابط غير صحيح.</p>
                <Link to="/doctors" className="btn-main px-6 py-3 rounded-xl inline-block">
                    العودة لقائمة الأطباء
                </Link>
            </div>
        );
    }

    return (
        <div className="py-10 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    to="/doctors"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0f6848] mb-6 font-bold transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة لقائمة الأطباء</span>
                </Link>

                {/* Doctor Header Card */}
                <Reveal direction="up">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        <div className="h-28 hero-mesh relative">
                            <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                        </div>

                        <div className="px-6 md:px-10 pb-8 -mt-14 relative z-10">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-6">
                                <div className="relative">
                                    <img
                                        src={doctor.image_url || '/asset/1.png'}
                                        alt={doctor.name}
                                        onError={(e) => {
                                            e.currentTarget.src = '/asset/1.png';
                                        }}
                                        className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                                    />
                                    <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-white shadow">
                                        <Award className="w-4 h-4" />
                                    </span>
                                </div>

                                <div className="flex-1 text-center md:text-right">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                        <span className="bg-emerald-100 text-[#0f6848] font-extrabold text-xs px-3 py-1 rounded-full">
                                            {doctor.specialty}
                                        </span>
                                        <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1 rounded-full">
                                            طبيب معتمد وموثق
                                        </span>
                                    </div>

                                    <h1 className="text-2xl md:text-3xl font-extrabold font-almarai text-slate-900 mb-1">
                                        د. {doctor.name}
                                    </h1>

                                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-400">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${
                                                    star <= Math.round(averageRating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-200'
                                                }`}
                                            />
                                        ))}
                                        <span className="text-sm font-black text-slate-800 mr-1.5">
                                            {Number(averageRating).toFixed(1)}
                                        </span>
                                        <span className="text-xs text-slate-400 font-semibold">
                                            ({ratingsCount} تقييمات المرضى)
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    to={`/appointments?doctor_id=${doctor.id}`}
                                    className="btn-main px-7 py-3.5 rounded-2xl text-sm font-extrabold shadow-lg inline-flex items-center gap-2 shrink-0"
                                >
                                    <Calendar className="w-5 h-5" />
                                    <span>احجز موعد كشف الآن</span>
                                </Link>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600 bg-slate-50/90 p-5 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-xs text-slate-400 font-bold block mb-1">سعر الكشف</span>
                                    <span className="font-black text-[#0f6848] text-lg">{doctor.price} ج.م</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-bold block mb-1">عنوان العيادة</span>
                                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>
                                            {doctor.location || 'القاهرة'}
                                            {doctor.tow_location ? ` - ${doctor.tow_location}` : ''}
                                        </span>
                                    </span>
                                </div>
                                {doctor.number && (
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold block mb-1">رقم العيادة</span>
                                        <span
                                            className="font-bold text-slate-800 flex items-center gap-1.5"
                                            dir="ltr"
                                        >
                                            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{doctor.number}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Clinic Photo Gallery */}
                {galleryImages.length > 0 && (
                    <Reveal direction="up" className="mb-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-extrabold font-almarai text-slate-900 mb-4 flex items-center gap-2">
                                <Images className="w-5 h-5 text-[#0f6848]" />
                                <span>صور العيادة والتجهيزات الطبية</span>
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {galleryImages.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setLightboxImg(imgUrl)}
                                        className="h-28 rounded-2xl overflow-hidden border border-slate-100 group relative cursor-pointer"
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`عيادة د. ${doctor.name} ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                            تكبير
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                )}

                {/* Lightbox Modal */}
                {lightboxImg && (
                    <div
                        onClick={() => setLightboxImg(null)}
                        className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
                    >
                        <div className="relative max-w-3xl w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={() => setLightboxImg(null)}
                                className="absolute -top-12 left-0 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <img
                                src={lightboxImg}
                                alt="معاينة العيادة"
                                className="w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl bg-black"
                            />
                        </div>
                    </div>
                )}

                {/* Rating Submission & Reviews Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Submit Review + Rating Breakdown */}
                    <Reveal className="md:col-span-5 space-y-6">
                        {/* Rating Distribution Bars */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                                        ملخص تقييمات المرضى
                                    </h3>
                                    <p className="text-xs text-slate-400 m-0 mt-0.5">
                                        بناءً على {ratingsCount} تقييم حقيقي
                                    </p>
                                </div>
                                <div className="text-center bg-amber-50 border border-amber-100 px-3.5 py-2 rounded-2xl">
                                    <span className="text-2xl font-black text-amber-600 block leading-none">
                                        {Number(averageRating).toFixed(1)}
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-700">من 5</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {ratingBreakdown.map((item) => (
                                    <div key={item.star} className="flex items-center gap-2.5 text-xs">
                                        <span className="w-10 font-bold text-slate-600 flex items-center gap-1">
                                            {item.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        </span>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-left text-slate-400 font-semibold">
                                            {item.percent}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Review Form */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-extrabold font-almarai text-slate-900 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                <span>أضف تقييمك للطبيب</span>
                            </h3>

                            {ratingSuccess && (
                                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>تم إرسال تقييمك بنجاح، شكراً لمشاركتك!</span>
                                </div>
                            )}

                            {ratingError && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{ratingError}</span>
                                </div>
                            )}

                            <form onSubmit={handleRatingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">
                                        اختر عدد النجوم:
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((s) => {
                                            const active = (hoverRating || ratingVal) >= s;
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRatingVal(s)}
                                                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                                                >
                                                    <Star
                                                        className={`w-7 h-7 transition-colors ${
                                                            active
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-slate-200'
                                                        }`}
                                                    />
                                                </button>
                                            );
                                        })}
                                        <span className="text-xs font-bold text-slate-600 mr-2">
                                            ({hoverRating || ratingVal} من 5)
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        اكتب تعليقك وتجربتك:
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="كيف كانت معاملة الطبيب وجودة الاستشارة؟"
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingRating}
                                    className="btn-main w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Send className="w-4 h-4 rtl:rotate-180" />
                                    <span>{submittingRating ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
                                </button>
                            </form>
                        </div>
                    </Reveal>

                    {/* Past Reviews List */}
                    <Reveal className="md:col-span-7">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-full">
                            <h3 className="text-lg font-extrabold font-almarai text-slate-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#0f6848]" />
                                <span>آراء وتجارب المرضى ({ratings.length})</span>
                            </h3>

                            {ratings.length === 0 ? (
                                <div className="text-center py-16">
                                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm font-semibold m-0">
                                        لا توجد تقييمات سابقة بعد. كن أول من يشارك تجربته!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3.5 max-h-[540px] overflow-y-auto pl-1">
                                    {ratings.map((r, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-slate-50/90 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0f6848] font-black text-xs flex items-center justify-center">
                                                        {(r.user?.name || 'م').charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-800">
                                                        {r.user?.name || 'مريض معتمد'}
                                                    </span>
                                                </div>
                                                <div className="flex text-amber-400">
                                                    {[1, 2, 3, 4, 5].map((st) => (
                                                        <Star
                                                            key={st}
                                                            className={`w-3.5 h-3.5 ${
                                                                st <= r.rating
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-slate-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {r.comment && (
                                                <p className="text-xs text-slate-600 leading-relaxed m-0 pr-10">
                                                    {r.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetail;
