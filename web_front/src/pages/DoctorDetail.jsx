import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService, ratingService, resolveStorageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DoctorAvatar, formatDoctorName } from '../components/common/MedicalMedia';
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
    BriefcaseMedical,
    Clock,
    GraduationCap,
    Sparkles,
} from 'lucide-react';

const DoctorDetail = () => {
    const { id } = useParams();
    const { user, isDoctor } = useAuth();

    const [doctor, setDoctor] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [treatedCases, setTreatedCases] = useState([]);
    const [viewerEligibility, setViewerEligibility] = useState({
        authenticated: false,
        can_chat: false,
        can_review: false,
        eligible_appointments: [],
    });
    const [averageRating, setAverageRating] = useState(0);
    const [ratingsCount, setRatingsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);

    // Rating form
    const [ratingVal, setRatingVal] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedApptId, setSelectedApptId] = useState('');
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState(false);
    const [ratingError, setRatingError] = useState('');

    const applyDoctorPayload = useCallback((d) => {
        setDoctor(d.doctor);
        setRatings(d.ratings || []);
        setTreatedCases(d.treated_cases || []);
        setAverageRating(Number(d.average_rating ?? 0));
        setRatingsCount(Number(d.ratings_count ?? 0));
        const elig = d.viewer_eligibility || {
            authenticated: false,
            can_chat: false,
            can_review: false,
            eligible_appointments: [],
        };
        setViewerEligibility(elig);
        if (elig.eligible_appointments?.length > 0) {
            setSelectedApptId(String(elig.eligible_appointments[0].id));
        } else {
            setSelectedApptId('');
        }
    }, []);

    const fetchDoctor = useCallback(async () => {
        try {
            const res = await doctorService.getDoctor(id);
            if (res.data?.success) {
                applyDoctorPayload(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load doctor', err);
        } finally {
            setLoading(false);
        }
    }, [id, applyDoctorPayload]);

    useEffect(() => {
        let active = true;
        doctorService
            .getDoctor(id)
            .then((res) => {
                if (active && res.data?.success) {
                    applyDoctorPayload(res.data.data);
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
    }, [id, user?.id, applyDoctorPayload]);

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
        const total = ratings.length;
        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: counts[star],
            percent: total > 0 ? Math.round((counts[star] / total) * 100) : 0,
        }));
    }, [ratings]);

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setSubmittingRating(true);
        setRatingError('');
        try {
            const res = await ratingService.submitRating({
                doctor_id: id,
                ...(selectedApptId ? { appointment_id: Number(selectedApptId) } : {}),
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
            <div className="py-12 bg-transparent min-h-screen">
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
                <p className="text-slate-500 mb-6">ربما تم حذف هذا الطبيب أو أن الحساب غير متاح حالياً.</p>
                <Link to="/doctors" className="btn-main px-6 py-3 rounded-xl inline-block">
                    العودة لقائمة الأطباء
                </Link>
            </div>
        );
    }

    return (
        <div className="py-10 bg-transparent min-h-screen">
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
                                    <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden">
                                        <DoctorAvatar
                                            doctor={doctor}
                                            size="xl"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
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
                                        {doctor.experience_years > 0 && (
                                            <span className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                                                خبرة {doctor.experience_years} سنوات
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="text-2xl md:text-3xl font-extrabold font-almarai text-slate-900 mb-1">
                                        {formatDoctorName(doctor.name)}
                                    </h1>

                                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-400">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${
                                                    ratingsCount > 0 && star <= Math.round(averageRating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-200'
                                                }`}
                                            />
                                        ))}
                                        <span className="text-sm font-black text-slate-800 mr-1.5">
                                            {Number(ratingsCount > 0 ? averageRating : 0).toFixed(1)}
                                        </span>
                                        <span className="text-xs text-slate-400 font-semibold">
                                            ({ratingsCount} تقييم فعلي)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                                    {viewerEligibility.can_chat && !isDoctor && (
                                        <Link
                                            to={`/my-chats?doctor_id=${doctor.id}`}
                                            className="btn-outline-main px-5 py-3.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span>مراسلة الطبيب</span>
                                        </Link>
                                    )}
                                    <Link
                                        to={`/appointments?doctor_id=${doctor.id}`}
                                        className="btn-main px-7 py-3.5 rounded-2xl text-sm font-extrabold shadow-lg inline-flex items-center gap-2"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span>احجز موعد كشف الآن</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Professional Bio & Qualifications */}
                            {(doctor.bio || doctor.qualifications || doctor.clinic_name || doctor.working_hours) && (
                                <div className="mb-5 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 space-y-2.5 text-xs text-slate-700 leading-relaxed">
                                    {doctor.bio && <p className="m-0 font-medium">{doctor.bio}</p>}
                                    <div className="flex flex-wrap gap-4 pt-1">
                                        {doctor.qualifications && (
                                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                                                <GraduationCap className="w-4 h-4 text-[#0f6848]" />
                                                <span>{doctor.qualifications}</span>
                                            </span>
                                        )}
                                        {doctor.clinic_name && (
                                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                                                <BriefcaseMedical className="w-4 h-4 text-[#0f6848]" />
                                                <span>{doctor.clinic_name}</span>
                                            </span>
                                        )}
                                        {doctor.working_hours && (
                                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                                                <Clock className="w-4 h-4 text-[#0f6848]" />
                                                <span>{doctor.working_hours}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span dir="ltr">
                                                {/^1[0125]\d{8}$/.test(String(doctor.number))
                                                    ? `0${doctor.number}`
                                                    : doctor.number}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Treated Cases Section (Published Directly by Doctor) */}
                {treatedCases.length > 0 && (
                    <Reveal direction="up" className="mb-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#0f6848] bg-emerald-50 px-3 py-1 rounded-full mb-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>الخبرة السريرية الموثقة</span>
                                    </span>
                                    <h2 className="text-xl font-extrabold font-almarai text-slate-900 m-0">
                                        الحالات التي تم علاجها ({treatedCases.length})
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {treatedCases.map((tc) => (
                                    <div
                                        key={tc.id}
                                        onClick={() => setSelectedCase(tc)}
                                        className="group rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer"
                                    >
                                        {tc.image_url && (
                                            <div className="h-44 overflow-hidden bg-slate-100">
                                                <img
                                                    src={resolveStorageUrl(tc.image_url)}
                                                    alt={tc.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className="text-[11px] font-extrabold text-[#0f6848] bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                                                        {tc.specialty || doctor.specialty}
                                                    </span>
                                                    {tc.published_at && (
                                                        <span className="text-[11px] text-slate-400 font-semibold">
                                                            {tc.published_at}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-extrabold font-almarai text-slate-900 mb-1.5 group-hover:text-[#0f6848] transition-colors">
                                                    {tc.title}
                                                </h3>
                                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0">
                                                    {tc.description}
                                                </p>
                                            </div>
                                            <span className="mt-4 text-xs font-extrabold text-[#0f6848] inline-flex items-center gap-1">
                                                <span>عرض تفاصيل الحالة والنتيجة العلاجية</span>
                                                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                )}

                {/* Treated Case Detail Modal */}
                {selectedCase && (
                    <div
                        onClick={() => setSelectedCase(null)}
                        className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 animate-scaleIn"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <span className="text-xs font-extrabold text-[#0f6848] bg-emerald-50 px-3 py-1 rounded-full">
                                        {selectedCase.specialty || doctor.specialty}
                                    </span>
                                    <h3 className="text-xl font-extrabold font-almarai text-slate-900 mt-2 mb-1">
                                        {selectedCase.title}
                                    </h3>
                                    {selectedCase.published_at && (
                                        <span className="text-xs text-slate-400">
                                            تاريخ النشر: {selectedCase.published_at}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCase(null)}
                                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {selectedCase.image_url && (
                                <div className="mb-5 rounded-2xl overflow-hidden border border-slate-100 max-h-72 bg-slate-50">
                                    <img
                                        src={resolveStorageUrl(selectedCase.image_url)}
                                        alt={selectedCase.title}
                                        className="w-full h-full object-contain max-h-72 mx-auto"
                                    />
                                </div>
                            )}

                            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <strong className="block text-slate-900 mb-1 font-almarai">
                                        ملخص الحالة:
                                    </strong>
                                    <p className="m-0 whitespace-pre-line">{selectedCase.description}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                                    <strong className="block text-amber-950 mb-1 font-almarai">
                                        الحالة المبدئية قبل العلاج:
                                    </strong>
                                    <p className="m-0 whitespace-pre-line">{selectedCase.initial_condition}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                                    <strong className="block text-sky-950 mb-1 font-almarai">
                                        الإجراء الطبي أو الخطة العلاجية:
                                    </strong>
                                    <p className="m-0 whitespace-pre-line">{selectedCase.treatment_summary}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                                    <strong className="block text-emerald-950 mb-1 font-almarai">
                                        النتيجة النهائية والتعافي:
                                    </strong>
                                    <p className="m-0 whitespace-pre-line">{selectedCase.outcome}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                        <div
                            className="relative max-w-3xl w-full animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        >
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
                    <Reveal className="md:col-span-5 space-y-6">
                        {/* Rating Distribution Bars */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                                        ملخص تقييمات المرضى
                                    </h3>
                                    <p className="text-xs text-slate-400 m-0 mt-0.5">
                                        بناءً على {ratingsCount} تقييم فعلي موثق
                                    </p>
                                </div>
                                <div className="text-center bg-amber-50 border border-amber-100 px-3.5 py-2 rounded-2xl">
                                    <span className="text-2xl font-black text-amber-600 block leading-none">
                                        {Number(ratingsCount > 0 ? averageRating : 0).toFixed(1)}
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

                        {/* Submit Review Form (Appointment-Eligible Patients) */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-extrabold font-almarai text-slate-900 mb-3 flex items-center gap-2">
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

                            {!user ? (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-3">
                                    <p className="m-0 leading-relaxed">
                                        إضافة التقييم متاحة للمرضى المسجلين الذين أتمّوا موعد كشف مع الطبيب لضمان مصداقية التقييمات.
                                    </p>
                                    <Link
                                        to="/login"
                                        className="btn-outline-main px-4 py-2 rounded-xl text-xs font-bold inline-block"
                                    >
                                        تسجيل الدخول للتقييم
                                    </Link>
                                </div>
                            ) : !viewerEligibility.can_review ? (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                                    يُتاح التقييم بعد إتمام موعد كشف فعلي مع الطبيب (تقييم واحد لكل زيارة مكتملة).
                                </div>
                            ) : (
                                <form onSubmit={handleRatingSubmit} className="space-y-4">
                                    {viewerEligibility.eligible_appointments.length > 1 && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                الموعد المرتبط بالتقييم:
                                            </label>
                                            <select
                                                value={selectedApptId}
                                                onChange={(e) => setSelectedApptId(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                                            >
                                                {viewerEligibility.eligible_appointments.map((ap) => (
                                                    <option key={ap.id} value={ap.id}>
                                                        موعد رقم #{ap.id} — {ap.appointment_date}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

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
                                        <Send className="w-4 h-4 -scale-x-100" />
                                        <span>{submittingRating ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
                                    </button>
                                </form>
                            )}
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
                                        لا توجد تقييمات منشورة لهذا الطبيب بعد.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3.5 max-h-[540px] overflow-y-auto pl-1">
                                    {ratings.map((r, idx) => (
                                        <div
                                            key={r.id || idx}
                                            className="p-4 bg-slate-50/90 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0f6848] font-black text-xs flex items-center justify-center">
                                                        {(r.user?.name || 'م').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm text-slate-800 block">
                                                            {r.user?.name || 'مريض معتمد'}
                                                        </span>
                                                        {r.created_at && (
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(r.created_at).toLocaleDateString('ar-EG')}
                                                            </span>
                                                        )}
                                                    </div>
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
