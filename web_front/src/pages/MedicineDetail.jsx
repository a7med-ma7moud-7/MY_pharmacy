import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { medicineService } from '../services/api';
import { useCart } from '../context/CartContext';
import MedicineCard from '../components/common/MedicineCard';
import { MedicineArtwork } from '../components/common/MedicalMedia';
import Reveal from '../components/common/Reveal';
import {
    Pill,
    ShoppingCart,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Plus,
    Minus,
    Star,
    Truck,
    Banknote,
    Bot,
} from 'lucide-react';

const MedicineDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [medicine, setMedicine] = useState(null);
    const [related, setRelated] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addedNotice, setAddedNotice] = useState(false);

    useEffect(() => {
        let active = true;
        medicineService
            .getMedicine(id)
            .then((res) => {
                if (active && res.data?.success) {
                    setMedicine(res.data.data.medicine);
                    setRelated(res.data.data.related || []);
                    setQuantity(1);
                }
            })
            .catch((err) => {
                console.error('Failed fetching medicine details:', err);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [id]);

    const maxStock = Number(medicine?.count) > 0 ? Number(medicine.count) : 99;

    const handleAddToCart = () => {
        if (!medicine) return;
        addToCart(medicine, quantity);
        setAddedNotice(true);
        setTimeout(() => setAddedNotice(false), 3000);
    };

    if (loading) {
        return (
            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-80 skeleton-shimmer rounded-2xl w-full"></div>
                        <div className="space-y-4">
                            <div className="h-6 skeleton-shimmer rounded w-1/3"></div>
                            <div className="h-8 skeleton-shimmer rounded w-3/4"></div>
                            <div className="h-10 skeleton-shimmer rounded w-1/2"></div>
                            <div className="h-24 skeleton-shimmer rounded-2xl w-full"></div>
                            <div className="h-12 skeleton-shimmer rounded-xl w-full mt-6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!medicine) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center px-4">
                <h2 className="text-2xl font-bold font-almarai text-slate-800 mb-4">الدواء غير موجود</h2>
                <Link to="/medicines" className="btn-main px-6 py-3 rounded-xl inline-block">
                    العودة لقائمة الأدوية
                </Link>
            </div>
        );
    }

    return (
        <div className="py-10 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    to="/medicines"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0f6848] mb-6 font-bold transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة لقائمة الأدوية</span>
                </Link>

                {addedNotice && (
                    <div className="mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-slideDown">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>
                                تمت إضافة <strong>{medicine.name}</strong> ({quantity} عبوة) إلى السلة بنجاح!
                            </span>
                        </div>
                    </div>
                )}

                {/* Medicine Main Card */}
                <Reveal direction="up">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Image */}
                            <div className="bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 group overflow-hidden relative min-h-[280px]">
                                <MedicineArtwork
                                    medicine={medicine}
                                    size="detail"
                                    className="max-h-72 object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="bg-emerald-100 text-[#0f6848] text-xs font-extrabold px-3 py-1 rounded-full">
                                        {medicine.type || 'أدوية عامة'}
                                    </span>
                                    <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>دواء أصلي ومعتمد</span>
                                    </span>
                                </div>

                                <h1 className="text-3xl font-extrabold font-almarai text-slate-900 mb-2">
                                    {medicine.name}
                                </h1>

                                <div className="flex items-center gap-1.5 text-amber-400 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                    <span className="text-slate-400 text-xs font-semibold mr-2">
                                        (منتج موثوق ومعتمد)
                                    </span>
                                </div>

                                <div className="text-3xl font-black text-[#0f6848] mb-5">
                                    {medicine.price}{' '}
                                    <span className="text-base font-bold text-slate-400">ج.م</span>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-2.5 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-semibold">حالة التوفر:</span>
                                        <span
                                            className={`font-extrabold ${
                                                medicine.is_in_stock ? 'text-emerald-600' : 'text-rose-600'
                                            }`}
                                        >
                                            {medicine.is_in_stock
                                                ? `متوفر بالمخزون (${medicine.count ?? 'متاح'})`
                                                : 'غير متوفر حالياً'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-semibold">التصنيف الدوائي:</span>
                                        <span className="font-bold text-slate-800">{medicine.type || 'عام'}</span>
                                    </div>
                                </div>

                                {/* Quantity Stepper & Add To Cart */}
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <div className="flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-2xl border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            className="text-slate-600 hover:text-rose-500 cursor-pointer"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-black text-base text-slate-800 w-6 text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                                            className="text-slate-600 hover:text-emerald-600 cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={!medicine.is_in_stock}
                                        className="flex-1 btn-main py-3.5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>
                                            أضف للسلة ({Math.round(medicine.price * quantity * 100) / 100} ج.م)
                                        </span>
                                    </button>
                                </div>

                                {/* Trust Strip */}
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-600 text-center">
                                    <div className="p-2 rounded-xl bg-emerald-50/60 flex flex-col items-center gap-1">
                                        <ShieldCheck className="w-4 h-4 text-[#0f6848]" />
                                        <span>أصلي 100%</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-emerald-50/60 flex flex-col items-center gap-1">
                                        <Truck className="w-4 h-4 text-[#0f6848]" />
                                        <span>شحن آمن وسريع</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-emerald-50/60 flex flex-col items-center gap-1">
                                        <Banknote className="w-4 h-4 text-[#0f6848]" />
                                        <span>دفع عند الاستلام</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Medical Usage & AI Pharmacist Banner */}
                <Reveal direction="up">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                            <h3 className="text-xl font-extrabold font-almarai text-slate-900 m-0 flex items-center gap-2">
                                <Pill className="w-5 h-5 text-[#0f6848]" />
                                <span>دواعي الاستعمال والإرشادات الطبية</span>
                            </h3>
                            <Link
                                to="/ai-chat"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6848] bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors self-start"
                            >
                                <Bot className="w-4 h-4" />
                                <span>اسأل الصيدلي الذكي عن الجرعة</span>
                            </Link>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line m-0">
                            {medicine.propose ||
                                medicine.description ||
                                'يرجى مراجعة الصيدلي أو الطبيب المختص قبل تناول الدواء وقراءة النشرة الداخلية بعناية.'}
                        </p>
                    </div>
                </Reveal>

                {/* Related Medicines */}
                {related.length > 0 && (
                    <div>
                        <h3 className="text-xl font-extrabold font-almarai text-slate-900 mb-6">
                            أدوية مشابهة من نفس التصنيف
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {related.map((item, idx) => (
                                <MedicineCard
                                    key={item.id}
                                    medicine={item}
                                    onAddToCart={(med) => addToCart(med, 1)}
                                    index={idx}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicineDetail;
