import React, { useState, useEffect, useCallback } from 'react';
import { doctorPortalService } from '../../services/api';
import { Star, Flag, Loader2, MessageSquare, CheckCircle2, X } from 'lucide-react';

export default function DoctorReviews() {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({
        average_rating: 0,
        total_reviews: 0,
        distribution: [],
    });
    const [starFilter, setStarFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [notice, setNotice] = useState('');

    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await doctorPortalService.getReviews(
                starFilter ? { rating: starFilter } : {}
            );
            if (res.data?.success) {
                setReviews(res.data.data || []);
                if (res.data.summary) {
                    setSummary(res.data.summary);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [starFilter]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleReport = async (e) => {
        e.preventDefault();
        if (!reportTarget || !reportReason.trim()) return;
        setSubmittingReport(true);
        try {
            await doctorPortalService.reportReview(reportTarget.id, reportReason.trim());
            setReportTarget(null);
            setReportReason('');
            setNotice('تم إرسال البلاغ للإدارة لمراجعة التقييم.');
            loadReviews();
            setTimeout(() => setNotice(''), 4000);
        } finally {
            setSubmittingReport(false);
        }
    };

    return (
        <div className="space-y-6">
            {notice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{notice}</span>
                </div>
            )}

            {/* Rating Summary & Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 bg-white/95 rounded-3xl p-6 border border-white shadow-xs flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-slate-900">
                        {summary.total_reviews > 0 ? Number(summary.average_rating).toFixed(1) : '—'}
                    </span>
                    <div className="flex items-center gap-1 my-2 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                className={`w-5 h-5 ${
                                    summary.total_reviews > 0 && s <= Math.round(summary.average_rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        إجمالي {summary.total_reviews} تقييم فعلي من المرضى
                    </span>
                </div>

                <div className="md:col-span-8 bg-white/95 rounded-3xl p-6 border border-white shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-extrabold font-almarai text-slate-900 m-0">
                            توزيع التقييمات
                        </h3>
                        {starFilter && (
                            <button
                                type="button"
                                onClick={() => setStarFilter('')}
                                className="text-xs font-bold text-[#0f6848] cursor-pointer"
                            >
                                عرض جميع التقييمات
                            </button>
                        )}
                    </div>
                    {(summary.distribution || []).map((d) => (
                        <button
                            key={d.star}
                            type="button"
                            onClick={() => setStarFilter(String(d.star))}
                            className="w-full flex items-center gap-3 text-xs hover:bg-slate-50 p-1 rounded-lg cursor-pointer"
                        >
                            <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                                {d.star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-400 rounded-full"
                                    style={{ width: `${d.percent}%` }}
                                />
                            </div>
                            <span className="w-16 text-left text-slate-500 font-semibold">
                                {d.count} ({d.percent}%)
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white/95 rounded-3xl p-6 border border-white shadow-xs">
                <h3 className="text-base font-extrabold font-almarai text-slate-900 mb-4">
                    تعليقات وآراء المرضى
                </h3>

                {loading ? (
                    <div className="py-16 flex justify-center">
                        <Loader2 className="w-7 h-7 text-[#0f6848] animate-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-16 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 m-0">
                            لا توجد تقييمات مطابقة للعرض حالياً.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {reviews.map((rev) => (
                            <div
                                key={rev.id}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="text-xs font-extrabold text-slate-900">
                                            {rev.user?.name || 'مريض معتمد'}
                                        </span>
                                        <span className="text-amber-500 text-xs font-black">
                                            {'★'.repeat(rev.rating)}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            {rev.created_at
                                                ? new Date(rev.created_at).toLocaleDateString('ar-EG')
                                                : ''}
                                        </span>
                                        {rev.appointment && (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#0f6848] text-[10px] font-bold">
                                                موعد #{rev.appointment.id} ({rev.appointment.appointment_date})
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed m-0">
                                        {rev.comment || 'تقييم بدون تعليق نصي'}
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    {rev.report_reason ? (
                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                                            تم الإبلاغ للإدارة
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setReportTarget(rev)}
                                            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer"
                                            title="الإبلاغ عن تعليق مسيء للإدارة"
                                        >
                                            <Flag className="w-3.5 h-3.5" />
                                            <span>إبلاغ</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {reportTarget && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={handleReport}
                        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-extrabold font-almarai text-slate-900 m-0">
                                إبلاغ الإدارة عن تقييم مخالف
                            </h3>
                            <button
                                type="button"
                                onClick={() => setReportTarget(null)}
                                className="p-1.5 rounded-xl bg-slate-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 m-0">
                            لا يمكن للطبيب تعديل أو حذف تقييم المريض مباشرة، ولكن ستراجع الإدارة بلاغك في حال وجود إساءة لفظية أو مخالفة لسياسة المنصة.
                        </p>
                        <textarea
                            rows="3"
                            required
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="اذكر سبب الإبلاغ بوضوح..."
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setReportTarget(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={submittingReport}
                                className="btn-main px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                {submittingReport ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
