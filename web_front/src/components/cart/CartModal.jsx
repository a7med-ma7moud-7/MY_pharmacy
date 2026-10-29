import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/api';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Package
} from 'lucide-react';

const CartModal = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [step, setStep] = useState('review'); // 'review' | 'delivery' | 'success'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    address: '',
    delivery_method: 'delivery',
    notes: '',
  });

  if (!isCartOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === 'success') {
      setStep('review');
      setCreatedOrder(null);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        cart_items: cart,
      };

      const res = await orderService.createOrder(payload);
      if (res.data?.success) {
        setCreatedOrder(res.data.order);
        clearCart();
        setStep('success');
      } else {
        setErrorMessage(res.data?.message || 'حدث خطأ أثناء حفظ الطلب.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'تعذر إتمام الطلب، يرجى التأكد من البيانات والمحاولة مجدداً.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-main text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="text-lg font-bold font-almarai m-0">
              {step === 'review' && 'مراجعة سلة الأدوية'}
              {step === 'delivery' && 'بيانات التوصيل وإكمال الطلب'}
              {step === 'success' && 'تم تأكيد الطلب بنجاح'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: REVIEW */}
          {step === 'review' && (
            <div>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-lg">سلة الأدوية فارغة حالياً</p>
                  <p className="text-gray-400 text-sm mt-1">تصفح قائمة الأدوية وأضف ما تحتاجه لسلتك</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {cart.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/50">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-base mb-1">{item.name}</h4>
                          <span className="text-sm text-main font-semibold">{item.price} ج.م</span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-600 hover:text-red-500 p-0.5"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-600 hover:text-emerald-600 p-0.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-left font-bold text-gray-800 min-w-[70px]">
                          {item.total} ج.م
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="bg-light-theme p-4 rounded-xl flex items-center justify-between border border-emerald-100">
                    <span className="font-bold text-gray-700">المجموع الكلي:</span>
                    <span className="text-2xl font-bold text-main">{totalPrice} ج.م</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setStep('delivery')}
                      className="btn-main px-6 py-2.5 text-base flex items-center gap-2"
                    >
                      <span>متابعة إدخال بيانات التوصيل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DELIVERY INFO */}
          {step === 'delivery' && (
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="مثال: محمد أحمد"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    طريقة الاستلام <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="delivery_method"
                    value={formData.delivery_method}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="delivery">توصيل منزلي سريع</option>
                    <option value="pickup">استلام من الصيدلية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  العنوان بالتفصيل <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="المحافظة، المدينة، الشارع، رقم العقار والشقة"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ملاحظات إضافية للصيدلي أو المندوب
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أي تعليمات خاصة بالوصفة أو التسليم"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="btn-outline-main flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة للسلة</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-main px-6 py-2.5 font-bold flex items-center gap-2"
                >
                  {loading ? (
                    <span>جاري تأكيد الطلب...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>تأكيد الطلب الآن ({totalPrice} ج.م)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && createdOrder && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold font-almarai text-gray-800 mb-2">تم استلام طلبك بنجاح!</h4>
              <p className="text-gray-500 text-sm mb-6">
                سيقوم فريق الصيدلية بتجهيز أدويتك والتواصل معك لتأكيد التوصيل.
              </p>

              <div className="bg-gray-50 p-4 rounded-xl text-right border border-gray-200 text-sm space-y-2 mb-6">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">رقم الطلب (Order ID):</span>
                  <span className="font-bold text-main font-mono text-base">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">اسم العميل:</span>
                  <span className="font-semibold text-gray-800">{createdOrder.customer_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">رقم الهاتف:</span>
                  <span className="font-semibold text-gray-800" dir="ltr">{createdOrder.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">إجمالي المبلغ:</span>
                  <span className="font-bold text-emerald-600 text-base">{createdOrder.total} ج.م</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn-main px-8 py-2.5 mx-auto"
              >
                تم، متابعة التصفح
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
