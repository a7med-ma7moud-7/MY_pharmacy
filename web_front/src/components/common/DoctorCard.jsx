import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Calendar, Star, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { DoctorAvatar, formatDoctorName } from './MedicalMedia';

export const DoctorCard = ({ doctor, index = 0 }) => {
    const rating = Number(doctor.average_rating || 4.8).toFixed(1);
    const ratingsCount = doctor.ratings_count || 1;

    return (
        <div
            style={{ animationDelay: `${(index % 6) * 0.07}s` }}
            className="h-full bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-[#0f6848]/10 hover:-translate-y-1.5 border border-slate-100 hover:border-[#0f6848]/25 overflow-hidden flex flex-col transition-all duration-300 group animate-fadeInUp"
        >
            {/* Doctor Header Banner */}
            <div className="h-28 bg-gradient-to-br from-[#073323] via-[#0f6848] to-[#10ac84] relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 opacity-60 pointer-events-none"></div>
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
                <div className="absolute -left-4 -top-4 w-20 h-20 bg-emerald-300/15 rounded-full pointer-events-none"></div>
                <span className="absolute top-3.5 left-3.5 bg-white/95 text-[#0f6848] text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm backdrop-blur-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {doctor.specialty}
                </span>
                <span className="absolute top-3.5 right-3.5 bg-black/25 text-emerald-100 border border-white/15 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    كشف: {doctor.price} ج.م
                </span>
            </div>

            {/* Avatar and Main Info */}
            <div className="px-6 pb-6 pt-0 flex-1 flex flex-col text-center">
                <div className="-mt-12 mb-3 mx-auto relative z-10">
                    <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg group-hover:shadow-emerald-900/15 transition-shadow">
                        <DoctorAvatar
                            doctor={doctor}
                            size="card"
                            className="w-full h-full rounded-full object-cover bg-slate-50 group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <span
                        className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                        title="طبيب معتمد وموثق"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                </div>

                <Link to={`/doctors/${doctor.id}`}>
                    <h3 className="text-lg font-extrabold font-almarai text-slate-900 mb-0.5 group-hover:text-[#0f6848] transition-colors">
                        {formatDoctorName(doctor.name)}
                    </h3>
                </Link>
                <p className="text-xs text-emerald-700 font-bold mb-2.5">{doctor.specialty}</p>

                {/* Ratings */}
                <div className="inline-flex items-center justify-center gap-1.5 bg-amber-50/80 border border-amber-100 rounded-full px-3 py-1 mx-auto text-amber-500 text-sm mb-3">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                    s <= Math.round(rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="font-black text-slate-800 text-xs">{rating}</span>
                    <span className="text-slate-400 text-[11px]">({ratingsCount})</span>
                </div>

                {/* Details List */}
                <div className="bg-slate-50/90 rounded-2xl px-4 py-3 my-2 space-y-2 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">سعر الكشف</span>
                        <span className="font-black text-[#0f6848] text-sm">{doctor.price} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 font-semibold shrink-0">العنوان</span>
                        <span className="font-bold text-slate-700 flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                                {doctor.location || 'غير محدد'}
                                {doctor.tow_location ? ` - ${doctor.tow_location}` : ''}
                            </span>
                        </span>
                    </div>
                    {doctor.number && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold">الهاتف</span>
                            <span className="font-bold text-slate-700 flex items-center gap-1" dir="ltr">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{doctor.number}</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-auto pt-3">
                    <Link
                        to={`/appointments?doctor_id=${doctor.id}`}
                        className="btn-main py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>حجز موعد</span>
                    </Link>
                    <Link
                        to={`/doctors/${doctor.id}`}
                        className="btn-outline-main py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all group/btn"
                    >
                        <span>التفاصيل</span>
                        <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;
