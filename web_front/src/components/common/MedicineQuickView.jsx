import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    X,
    ShoppingCart,
    Check,
    Star,
    ShieldCheck,
    Truck,
    Plus,
    Minus,
    ArrowLeft,
    Sparkles,
} from 'lucide-react';
import { MedicineArtwork } from './MedicalMedia';

export const MedicineQuickView = ({ medicine, onClose, onAddToCart }) => {
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!medicine) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [medicine, onClose]);

    if (!medicine) return null;

    const maxQty = Math.max(Number(medicine.count ?? 10), 1);

    const handleAdd = () => {
        if (!medicine.is_in_stock) return;
        onAddToCart(medicine, qty);
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 900);
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative animate-scaleIn"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="إغلاق المعاينة"
                    className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Artwork Column */}
                <div className="md:col-span-5 bg-slate-50 relative min-h-[240px] flex items-center justify-center">
                    <MedicineArtwork
                        medicine={medicine}
                        size="detail"
                        className="w-full h-full object-contain p-6"
                    />
                    <span
                        className={`absolute top-4 right-4 z-20 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm ${
                            medicine.is_in_stock
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                        }`}
                    >
                        {medicine.is_in_stock ? 'متوفر بالمخزون' : 'غير متوفر حالياً'}
                    </span>
                </div>

                {/* Details Column */}
                <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0f6848] bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3" />
                                {medicine.type || 'مستحضر صيدلاني'}
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                        </div>

                        <h3 className="text-xl font-extrabold font-almarai text-slate-900 mb-2 leading-snug">
                            {medicine.name}
                        </h3>

                        <div className="flex items-baseline gap-1.5 mb-4">
                            <span className="text-3xl font-black text-[#0f6848]">{medicine.price}</span>
                            <span className="text-xs font-bold text-slate-400">ج.م / العبوة</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4">
                            {medicine.propose ||
                                medicine.description ||
                                'مستحضر دوائي أصلي ومرخص من وزارة الصحة، يُحفظ في درجة حرارة الغرفة بعيداً عن متناول الأطفال.'}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-5 text-[11px] font-bold text-slate-600">
                            <div className="flex items-center gap-1.5 bg-emerald-50/60 px-3 py-2 rounded-xl border border-emerald-100/80">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>منتج أصلي وموثق 100%</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-sky-50/60 px-3 py-2 rounded-xl border border-sky-100/80">
                                <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                                <span>توصيل سريع لباب المنزل</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                        {medicine.is_in_stock && (
                            <div className="flex items-center justify-between gap-3">
                                <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        className="w-8 h-8 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-9 text-center font-black text-sm text-slate-800">
                                        {qty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                                        className="w-8 h-8 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        added ? 'bg-emerald-600 text-white' : 'btn-main'
                                    }`}
                                >
                                    {added ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>تمت الإضافة للسلة!</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>أضف للسلة ({medicine.price * qty} ج.م)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <Link
                            to={`/medicines/${medicine.id}`}
                            onClick={onClose}
                            className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-[#0f6848] hover:bg-emerald-50/60 flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <span>فتح الصفحة الكاملة للدواء والبدائل</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineQuickView;

