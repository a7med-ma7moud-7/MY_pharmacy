import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';
import {
    X,
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    CheckCircle2,
    ArrowRight,
    Truck,
    Store,
    Loader2,
    PackageSearch,
    Banknote,
    Wallet,
    Gift,
} from 'lucide-react';

const FREE_DELIVERY_THRESHOLD = 300;

const CartModal = () => {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
    } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [orderResult, setOrderResult] = useState(null);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        delivery_method: 'delivery',
        address: '',
        payment_method: 'cash',
        notes: '',
    });

    const handleClose = useCallback(() => {
        setIsCartOpen(false);
        setTimeout(() => {
            setStep(1);
            setError('');
            setOrderResult(null);
        }, 250);
    }, [setIsCartOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isCartOpen) {
                handleClose();
            }
        };
        if (isCartOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCartOpen, handleClose]);

    if (!isCartOpen) return null;

    const effectiveName = formData.customer_name || user?.name || '';
    const effectiveEmail = formData.customer_email || user?.email || '';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                customer_name: effectiveName,
                customer_email: effectiveEmail,
                address:
                    formData.delivery_method === 'pickup'
                        ? 'استلام من فرع الصيدلية'
                        : formData.address,
                cart_items: cartItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: Number(item.price),
                })),
            };

            const res = await orderService.createOrder(payload);
            if (res.data?.success) {
                setOrderResult({
                    orderId: res.data.order?.id ?? res.data.order_id,
                    totalPrice: res.data.order?.total ?? res.data.total_price ?? totalPrice,
                    phone: formData.customer_phone,
                });
                clearCart();
                setStep(3);
            } else {
                setError(res.data?.message || 'حدث خطأ أثناء إرسال الطلب');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'تعذر إتمام الطلب، يرجى مراجعة البيانات والمحاولة مرة أخرى.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const stepsMeta = [
        { num: 1, label: 'سلة المشتريات' },
        { num: 2, label: 'بيانات التوصيل' },
        { num: 3, label: 'تأكيد الطلب' },
    ];

    const freeDeliveryProgress = Math.min(100, Math.round((totalPrice / FREE_DELIVERY_THRESHOLD) * 100));
    const remainingForFreeDelivery = Math.max(0, Math.round(FREE_DELIVERY_THRESHOLD - totalPrice));

    return (
        <div
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 animate-fadeIn"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-scaleIn"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#093d2b] via-[#0f6848] to-[#10ac84] text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base font-almarai m-0 text-white">
                                {step === 1 && 'سلة المشتريات'}
                                {step === 2 && 'إتمام الطلب والتوصيل'}
                                {step === 3 && 'تم تأكيد الطلب بنجاح'}
                            </h3>
                            <p className="text-[11px] text-emerald-100 m-0">خطوة {step} من 3</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Visual Stepper Bar */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                    {stepsMeta.map((s, idx) => {
                        const active = step >= s.num;
                        return (
                            <React.Fragment key={s.num}>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                                            active
                                                ? 'bg-[#0f6848] text-white shadow-sm'
                                                : 'bg-slate-200 text-slate-500'
                                        }`}
                                    >
                                        {s.num}
                                    </span>
                                    <span className={active ? 'font-bold text-[#0f6848]' : 'text-slate-400'}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < stepsMeta.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 rounded transition-colors ${
                                            step > s.num ? 'bg-[#10ac84]' : 'bg-slate-200'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* STEP 1: CART ITEMS */}
                    {step === 1 && (
                        <>
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-10 h-10" />
                                    </div>
                                    <p className="text-slate-800 font-extrabold text-base mb-1">سلة المشتريات فارغة</p>
                                    <p className="text-slate-400 text-xs mb-6">
                                        تصفح صيدليتنا وأضف الأدوية والمستلزمات الطبية إلى سلتك
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleClose();
                                            navigate('/medicines');
                                        }}
                                        className="btn-main px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                        تصفح الأدوية الآن
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Free Delivery Progress */}
                                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="font-bold text-[#0f6848] flex items-center gap-1.5">
                                                <Gift className="w-4 h-4 text-emerald-600" />
                                                {remainingForFreeDelivery === 0
                                                    ? 'مبروك! حصلت على توصيل مجاني لطلبك 🎉'
                                                    : `أضف ${remainingForFreeDelivery} ج.م للحصول على توصيل مجاني`}
                                            </span>
                                            <span className="font-black text-emerald-700">{freeDeliveryProgress}%</span>
                                        </div>
                                        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#0f6848] to-[#10ac84] rounded-full transition-all duration-500"
                                                style={{ width: `${freeDeliveryProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <img
                                                        src={item.image_url || '/asset/1.png'}
                                                        alt={item.name}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/asset/1.png';
                                                        }}
                                                        className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-100 shrink-0"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-bold text-slate-800 text-sm truncate m-0">
                                                            {item.name}
                                                        </h4>
                                                        <span className="text-xs text-[#0f6848] font-bold">
                                                            {item.price} ج.م × {item.quantity} ={' '}
                                                            {Math.round(item.price * item.quantity * 100) / 100} ج.م
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-0.5 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="text-xs font-black w-5 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-0.5 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                                        title="حذف من السلة"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* STEP 2: CHECKOUT FORM */}
                    {step === 2 && (
                        <form id="checkoutForm" onSubmit={handleCheckoutSubmit} className="space-y-4 animate-fadeIn">
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    الاسم بالكامل <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    required
                                    value={effectiveName}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="أدخل اسمك الثلاثي"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        رقم الهاتف <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="customer_phone"
                                        required
                                        value={formData.customer_phone}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="01xxxxxxxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        البريد الإلكتروني (اختياري)
                                    </label>
                                    <input
                                        type="email"
                                        name="customer_email"
                                        value={effectiveEmail}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="example@mail.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة الاستلام</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, delivery_method: 'delivery' }))}
                                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                                            formData.delivery_method === 'delivery'
                                                ? 'border-emerald-600 bg-emerald-50 text-[#0f6848] shadow-sm'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Truck className="w-4 h-4" />
                                        <span>توصيل للمنزل</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, delivery_method: 'pickup' }))}
                                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                                            formData.delivery_method === 'pickup'
                                                ? 'border-emerald-600 bg-emerald-50 text-[#0f6848] shadow-sm'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Store className="w-4 h-4" />
                                        <span>استلام من الصيدلية</span>
                                    </button>
                                </div>
                            </div>

                            {formData.delivery_method === 'delivery' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        عنوان التوصيل بالتفصيل <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        required
                                        rows="2"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="المدينة، الحي، اسم الشارع، رقم العقار والشقة..."
                                    ></textarea>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة الدفع</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, payment_method: 'cash' }))}
                                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                                            formData.payment_method === 'cash'
                                                ? 'border-emerald-600 bg-emerald-50 text-[#0f6848]'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Banknote className="w-4 h-4" />
                                        <span>الدفع عند الاستلام</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, payment_method: 'wallet' }))}
                                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                                            formData.payment_method === 'wallet'
                                                ? 'border-emerald-600 bg-emerald-50 text-[#0f6848]'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Wallet className="w-4 h-4" />
                                        <span>محفظة إلكترونية</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                                <input
                                    type="text"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="أي تعليمات خاصة بالتوصيل..."
                                />
                            </div>
                        </form>
                    )}

                    {/* STEP 3: ORDER SUCCESS */}
                    {step === 3 && orderResult && (
                        <div className="text-center py-6 space-y-4 animate-scaleIn">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-extrabold text-slate-800 font-almarai">
                                شكراً لك! تم استلام طلبك بنجاح
                            </h4>
                            <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                                يمكنك متابعة حالة الطلب في أي وقت باستخدام رقم الطلب ورقم هاتفك.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">رقم الطلب (Order ID):</span>
                                    <span className="font-black text-[#0f6848] font-mono">
                                        #{orderResult.orderId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">الإجمالي المطلوب:</span>
                                    <span className="font-black text-slate-800">{orderResult.totalPrice} ج.م</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 1 && cartItems.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 font-bold">الإجمالي الكلي:</span>
                            <span className="text-xl font-black text-[#0f6848]">{totalPrice} ج.م</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                            >
                                متابعة لإتمام الطلب
                            </button>
                            <button
                                type="button"
                                onClick={clearCart}
                                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                            >
                                إفراغ السلة
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <ArrowRight className="w-4 h-4" />
                            <span>رجوع للسلة</span>
                        </button>
                        <button
                            type="submit"
                            form="checkoutForm"
                            disabled={submitting}
                            className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري تأكيد الطلب...</span>
                                </>
                            ) : (
                                <span>تأكيد الطلب ({totalPrice} ج.م)</span>
                            )}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const id = orderResult?.orderId;
                                const phone = orderResult?.phone;
                                handleClose();
                                navigate(
                                    `/orders/track?order_id=${encodeURIComponent(
                                        id || ''
                                    )}&phone=${encodeURIComponent(phone || '')}`
                                );
                            }}
                            className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <PackageSearch className="w-4 h-4" />
                            <span>تتبع حالة الطلب الآن</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                            إغلاق
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
