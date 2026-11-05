import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Check } from 'lucide-react';

export const MedicineCard = ({ medicine, onAddToCart, index = 0 }) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    if (!medicine.is_in_stock) return;
    onAddToCart(medicine);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div
      style={{ animationDelay: `${(index % 8) * 0.06}s` }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 group animate-fadeIn"
    >
      {/* Image and Badges */}
      <div className="relative bg-slate-100 h-48 overflow-hidden flex items-center justify-center">
        <img
          src={medicine.image_url || '/asset/1.png'}
          alt={medicine.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/asset/1.png';
          }}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${
              medicine.is_in_stock
                ? 'bg-emerald-600/90 text-white'
                : 'bg-rose-600/90 text-white'
            }`}
          >
            {medicine.is_in_stock ? 'متوفر بالمخزون' : 'غير متوفر'}
          </span>
        </div>

        <div className="absolute top-2.5 left-2.5">
          <span className="bg-slate-900/70 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {medicine.type || 'عام'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base mb-1 font-almarai line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {medicine.name}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#0f6848]">{medicine.price}</span>
            <span className="text-xs font-bold text-gray-500">ج.م</span>
          </div>
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-1">
          {medicine.propose ||
            medicine.description ||
            'دواء مرخص ومعتمد، يرجى استشارة الصيدلي قبل الاستخدام.'}
        </p>

        {/* Actions */}
        <div className="space-y-2 mt-auto pt-2 border-t border-gray-50">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!medicine.is_in_stock}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'btn-main'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تمت الإضافة للسلة!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{medicine.is_in_stock ? 'أضف للسلة' : 'نفذت الكمية'}</span>
              </>
            )}
          </button>

          <Link
            to={`/medicines/${medicine.id}`}
            className="w-full btn-outline-main py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>تفاصيل الدواء</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;

