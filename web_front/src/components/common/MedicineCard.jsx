import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Check, Flame, Eye } from 'lucide-react';
import { MedicineArtwork } from './MedicalMedia';

export const MedicineCard = ({ medicine, onAddToCart, onQuickView, index = 0 }) => {
    const [justAdded, setJustAdded] = useState(false);

    const stockCount = Number(medicine.count ?? 10);
    const isLowStock = medicine.is_in_stock && stockCount > 0 && stockCount <= 5;

    const handleAdd = () => {
        if (!medicine.is_in_stock) return;
        onAddToCart(medicine);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1400);
    };

    return (
        <div
            style={{ animationDelay: `${(index % 8) * 0.06}s` }}
            className="h-full bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-[#0f6848]/12 hover:-translate-y-1.5 border border-slate-100 hover:border-[#0f6848]/30 overflow-hidden flex flex-col transition-all duration-300 group animate-fadeInUp relative"
        >
            {/* Subtle top hover accent bar */}
            <div className="h-1 w-full bg-gradient-to-l from-[#0f6848] via-[#10ac84] to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Image / Artwork and Badges */}
            <div className="relative bg-slate-50 h-48 overflow-hidden flex items-center justify-center">
                <MedicineArtwork
                    medicine={medicine}
                    size="card"
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />

                {onQuickView && (
                    <button
                        type="button"
                        onClick={() => onQuickView(medicine)}
                        title="معاينة سريعة للدواء"
                        aria-label="معاينة سريعة للدواء"
                        className="absolute bottom-3 left-3 z-20 w-9 h-9 rounded-xl bg-white/95 hover:bg-[#0f6848] text-slate-700 hover:text-white border border-slate-200/80 shadow-md flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                )}

                <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
                    <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
                            medicine.is_in_stock
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                        }`}
                    >
                        {medicine.is_in_stock ? 'متوفر بالمخزون' : 'غير متوفر'}
                    </span>
                    {isLowStock && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-sm flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            متبقي {stockCount} فقط
                        </span>
                    )}
                </div>

                <div className="absolute top-3 left-3 z-20">
                    <span className="bg-slate-900/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        {medicine.type || 'عام'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <Link to={`/medicines/${medicine.id}`} className="no-underline">
                    <h3 className="font-extrabold text-slate-900 text-base mb-2 font-almarai line-clamp-1 group-hover:text-[#0f6848] transition-colors">
                        {medicine.name}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#0f6848]">{medicine.price}</span>
                        <span className="text-xs font-bold text-slate-400">ج.م</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                </div>

                <p className="text-slate-500 text-xs line-clamp-2 min-h-[2.4rem] leading-relaxed mb-4 flex-1">
                    {medicine.propose ||
                        medicine.description ||
                        'دواء مرخص ومعتمد، يرجى استشارة الصيدلي قبل الاستخدام.'}
                </p>

                {/* Actions */}
                <div className="space-y-2 mt-auto pt-3.5 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!medicine.is_in_stock}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all cursor-pointer ${
                            justAdded
                                ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                                : 'btn-main'
                        }`}
                    >
                        {justAdded ? (
                            <>
                                <Check className="w-4 h-4 animate-scaleIn" />
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
                        className="w-full btn-outline-main py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all group/btn"
                    >
                        <span>تفاصيل الدواء</span>
                        <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MedicineCard;
