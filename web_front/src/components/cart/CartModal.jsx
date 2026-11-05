import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

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

  const [step, setStep] = useState(1); // 1: Cart Items, 2: Checkout Form, 3: Order Confirmed
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: '',
    customer_email: user?.email || '',
    delivery_method: 'delivery',
    address: '',
    payment_method: 'cash',
    notes: '',
  });

  // Sync user info if user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_email: prev.customer_email || user.email || '',
      }));
    }
  }, [user]);

  // Escape key to close modal
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
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setStep(1);
      setError('');
      setOrderResult(null);
    }, 250);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        address:
          formData.delivery_method === 'pickup'
            ? 'استلام من فرع الصيدلية'
            : formData.address,
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await orderService.createOrder(payload);
      if (res.data?.success) {
        setOrderResult({
          orderId: res.data.order_id,
          totalPrice: res.data.total_price,
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

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-scaleIn"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f6848] to-[#10ac84] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-almarai m-0 text-white">
                {step === 1 && 'سلة المشتريات'}
                {step === 2 && 'إتمام الطلب والتوصيل'}
                {step === 3 && 'تم تأكيد الطلب بنجاح'}
              </h3>
              <p className="text-[11px] text-emerald-100 m-0">
                خطوة {step} من 3
              </p>
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
        <div className="px-6 py-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between text-xs">
          {stepsMeta.map((s, idx) => {
            const active = step >= s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      active
                        ? 'bg-[#0f6848] text-white shadow-sm'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s.num}
                  </span>
                  <span className={active ? 'font-bold text-[#0f6848]' : 'text-gray-400'}>
                    {s.label}
                  </span>
                </div>
                {idx < stepsMeta.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded ${
                      step > s.num ? 'bg-[#10ac84]' : 'bg-gray-200'
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
                  <p className="text-gray-700 font-bold text-base mb-1">سلة المشتريات فارغة</p>
                  <p className="text-gray-400 text-xs mb-6">
                    تصفح صيدليتنا وأضف الأدوية والمستلزمات الطبية إلى سلتك
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      navigate('/medicines');
                    }}
                    className="btn-main px-6 py-2.5 rounded-xl text-xs font-bold"
                  >
                    تصفح الأدوية الآن
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={item.image_url || '/asset/1.png'}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = '/asset/1.png';
                          }}
                          className="w-12 h-12 rounded-xl object-cover bg-white border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-800 text-sm truncate m-0">
                            {item.name}
                          </h4>
                          <span className="text-xs text-[#0f6848] font-bold">
                            {item.price} ج.م × {item.quantity} ={' '}
                            {Math.round(item.price * item.quantity * 100) / 100} ج.م
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-0.5 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-0.5 text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
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
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === 2 && (
            <form id="checkoutForm" onSubmit={handleCheckoutSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  الاسم بالكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="أدخل اسمك الثلاثي"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    رقم الهاتف <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">طريقة الاستلام</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, delivery_method: 'delivery' }))}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      formData.delivery_method === 'delivery'
                        ? 'border-emerald-600 bg-emerald-50 text-[#0f6848]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
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
                        ? 'border-emerald-600 bg-emerald-50 text-[#0f6848]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>استلام من الصيدلية</span>
                  </button>
                </div>
              </div>

              {formData.delivery_method === 'delivery' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    عنوان التوصيل بالتفصيل <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="2"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="المدينة، الحي، اسم الشارع، رقم العقار والشقة..."
                  ></textarea>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
              <h4 className="text-xl font-bold text-gray-800 font-almarai">
                شكراً لك! تم استلام طلبك بنجاح
              </h4>
              <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
                يمكنك متابعة حالة الطلب في أي وقت باستخدام رقم الطلب ورقم هاتفك.
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">رقم الطلب (Order ID):</span>
                  <span className="font-bold text-[#0f6848] font-mono">#{orderResult.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الإجمالي المطلوب:</span>
                  <span className="font-bold text-gray-800">{orderResult.totalPrice} ج.م</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 1 && cartItems.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-semibold">الإجمالي الكلي:</span>
              <span className="text-xl font-extrabold text-[#0f6848]">{totalPrice} ج.م</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold"
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
          <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع للسلة</span>
            </button>
            <button
              type="submit"
              form="checkoutForm"
              disabled={submitting}
              className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="p-4 bg-slate-50 border-t border-gray-100 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const id = orderResult?.orderId;
                const phone = orderResult?.phone;
                handleClose();
                navigate(
                  `/orders/track?order_id=${encodeURIComponent(id || '')}&phone=${encodeURIComponent(
                    phone || ''
                  )}`
                );
              }}
              className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <PackageSearch className="w-4 h-4" />
              <span>تتبع حالة الطلب الآن</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold cursor-pointer"
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
