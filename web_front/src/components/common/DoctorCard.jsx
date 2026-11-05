import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Calendar, Star, ArrowLeft, CheckCircle } from 'lucide-react';

export const DoctorCard = ({ doctor, index = 0 }) => {
  const rating = Number(doctor.average_rating || 4.8).toFixed(1);
  const ratingsCount = doctor.ratings_count || 1;

  return (
    <div
      style={{ animationDelay: `${(index % 6) * 0.07}s` }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 group animate-fadeIn"
    >
      {/* Doctor Header Banner */}
      <div className="h-28 bg-gradient-to-r from-[#0f6848] to-[#10ac84] relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute -left-4 -top-4 w-16 h-16 bg-white/10 rounded-full pointer-events-none"></div>
        <span className="absolute top-3 left-3 bg-white/95 text-[#0f6848] text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
          {doctor.specialty}
        </span>
      </div>

      {/* Avatar and Main Info */}
      <div className="px-6 pb-6 pt-0 flex-1 flex flex-col text-center">
        <div className="-mt-12 mb-3 mx-auto relative">
          <img
            src={doctor.image_url || '/asset/1.png'}
            alt={doctor.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/asset/1.png';
            }}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white group-hover:scale-105 transition-transform duration-300"
          />
          <span
            className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"
            title="طبيب معتمد وموثق"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </span>
        </div>

        <h3 className="text-xl font-bold font-almarai text-gray-900 mb-0.5 group-hover:text-emerald-700 transition-colors">
          د. {doctor.name}
        </h3>
        <p className="text-xs text-emerald-700 font-semibold mb-2">{doctor.specialty}</p>

        {/* Ratings */}
        <div className="flex items-center justify-center gap-1.5 text-amber-400 text-sm mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-gray-800 text-xs">{rating}</span>
          <span className="text-gray-400 text-[11px]">({ratingsCount} تقييم)</span>
        </div>

        {/* Details List */}
        <div className="border-t border-b border-gray-100 py-3 my-2 space-y-2 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">سعر الكشف:</span>
            <span className="font-extrabold text-[#0f6848] text-sm">{doctor.price} ج.م</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">المكان:</span>
            <span className="font-medium text-gray-700 flex items-center gap-1 truncate max-w-[180px]">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                {doctor.location || 'غير محدد'}
                {doctor.tow_location ? ` - ${doctor.tow_location}` : ''}
              </span>
            </span>
          </div>
          {doctor.number && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">الهاتف:</span>
              <span className="font-medium text-gray-700 flex items-center gap-1" dir="ltr">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{doctor.number}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-3">
          <Link
            to={`/appointments?doctor_id=${doctor.id}`}
            className="btn-main py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>حجز موعد</span>
          </Link>
          <Link
            to={`/doctors/${doctor.id}`}
            className="btn-outline-main py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;

