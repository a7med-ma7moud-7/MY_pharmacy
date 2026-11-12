import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Check, Flame } from 'lucide-react';

export const MedicineCard = ({ medicine, onAddToCart, index = 0 }) => {
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
            className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-[#0f6848]/10 hover:-translate-y-2 border border-slate-100 hover:border-[#0f6848]/25 overflow-hidden flex flex-col transition-all duration-400 group animate-fadeInUp"
        >
            {/* Image and Badges */}
            <div className="relative bg-gradient-to-b from-slate-50 to-slate-100/80 h-48 overflow-hidden flex items-center justify-center">
                <img
                    src={medicine.image_url || '/asset/1.png'}
                    alt={medicine.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = '/asset/1.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
                            medicine.is_in_stock
                                ? 'bg-emerald-600/95 text-white'
                                : 'bg-rose-600/95 text-white'
                        }`}
                    >
                        {medicine.is_in_stock ? 'متوفر بالمخزون' : 'غير متوفر'}
                    </span>
                    {isLowStock && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/95 text-white shadow-sm flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            متبقي {stockCount} فقط
                        </span>
                    )}
                </div>

                <div className="absolute top-3 left-3">
                    <span className="bg-slate-900/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        {medicine.type || 'عام'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <Link to={`/medicines/${medicine.id}`}>
                    <h3 className="font-extrabold text-slate-900 text-base mb-1.5 font-almarai line-clamp-1 group-hover:text-[#0f6848] transition-colors">
                        {medicine.name}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#0f6848]">{medicine.price}</span>
                        <span className="text-xs font-bold text-slate-400">ج.م</span>
                    </div>
                    <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                </div>

                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-1">
                    {medicine.propose ||
                        medicine.description ||
                        'دواء مرخص ومعتمد، يرجى استشارة الصيدلي قبل الاستخدام.'}
                </p>

                {/* Actions */}
                <div className="space-y-2 mt-auto pt-3 border-t border-slate-100">
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
