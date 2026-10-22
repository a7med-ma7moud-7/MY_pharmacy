import React, { useState } from 'react';
import { orderService } from '../services/api';
import { 
  PackageCheck, 
  Search, 
  AlertCircle,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const res = await orderService.checkOrderStatus({
        order_id: orderId,
        phone: phone,
      });

      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError('لم يتم العثور على الطلب، يرجى التأكد من رقم الطلب ورقم الهاتف.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'لم يتم العثور على الطلب. يرجى التأكد من صحة البيانات المدخلة.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">تم التوصيل بنجاح</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">جاري التجهيز والتوصيل</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full text-xs">تم الإلغاء</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">قيد المراجعة والانتظار</span>;
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-main text-white rounded-2xl mb-3 shadow-md">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-almarai text-gray-900 mb-2">
            متابعة وتتبع حالة الطلب
          </h1>
          <p className="text-gray-500 text-sm">
            أدخل رقم طلبك ورقم هاتفك المسجل لمعرفة موعد وتفاصيل التوصيل
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  رقم الطلب (Order ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="مثال: 12"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  رقم الهاتف المسجل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full pr-10 pl-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-main py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري البحث عن بيانات الطلب...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>تتبع حالة الطلب</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details Display */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-mono">الطلب رقم #{order.id}</span>
                <h3 className="text-xl font-bold font-almarai text-gray-800">بيانات وتفاصيل الشحنة</h3>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 block text-xs">اسم العميل:</span>
                <span className="font-semibold text-gray-800">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">طريقة الاستلام:</span>
                <span className="font-semibold text-gray-800">
                  {order.delivery_method === 'delivery' ? 'توصيل منزلي' : 'استلام من الصيدلية'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-400 block text-xs">عنوان التوصيل:</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-main" />
                  {order.address}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-3">الأدوية داخل الطلب:</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-gray-800">{item.medicine?.name || 'دواء'}</span>
                      <span className="text-xs text-gray-400 mr-2">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-main">{item.total || (item.price * item.quantity)} ج.م</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 text-base font-bold">
                <span className="text-gray-700">المبلغ الإجمالي:</span>
                <span className="text-2xl text-main font-bold">{order.total_price} ج.م</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
