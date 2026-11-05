import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../services/api';
import {
  PackageCheck,
  Search,
  AlertCircle,
  Phone,
  MapPin,
  Loader2,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order_id') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performTrack = useCallback(async (idToTrack, phoneToTrack) => {
    if (!idToTrack || !phoneToTrack) return;
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const res = await orderService.checkOrderStatus({
        order_id: idToTrack,
        phone: phoneToTrack,
      });

      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError('لم يتم العثور على الطلب، يرجى التأكد من رقم الطلب ورقم الهاتف.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'لم يتم العثور على الطلب. يرجى التأكد من صحة البيانات المدخلة.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const qId = searchParams.get('order_id');
    const qPhone = searchParams.get('phone');
    if (qId && qPhone) {
      setOrderId(qId);
      setPhone(qPhone);
      performTrack(qId, qPhone);
    }
  }, [searchParams, performTrack]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    performTrack(orderId, phone);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="bg-emerald-100 text-emerald-800 font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>تم التوصيل بنجاح</span>
          </span>
        );
      case 'processing':
        return (
          <span className="bg-blue-100 text-blue-800 font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>جاري التجهيز والتوصيل</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-700 font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>تم الإلغاء</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-800 font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>قيد المراجعة والانتظار</span>
          </span>
        );
    }
  };

  const getStepIndex = (status) => {
    if (status === 'completed') return 3;
    if (status === 'processing') return 2;
    return 1;
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-[#0f6848] to-[#10ac84] text-white rounded-2xl mb-3 shadow-md">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-almarai text-gray-900 mb-2">
            متابعة وتتبع حالة الطلب
          </h1>
          <p className="text-gray-500 text-sm">
            أدخل رقم طلبك ورقم هاتفك المسجل لمعرفة موعد وتفاصيل التوصيل لحظة بلحظة
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  رقم الطلب (Order ID) <span className="text-rose-500">*</span>
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
                  رقم الهاتف المسجل <span className="text-rose-500">*</span>
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
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 animate-scaleIn">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-mono">الطلب رقم #{order.id}</span>
                <h3 className="text-xl font-bold font-almarai text-gray-800 m-0">
                  بيانات وتفاصيل الشحنة
                </h3>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* Visual Order Timeline */}
            {order.status !== 'cancelled' && (
              <div className="py-4 px-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { step: 1, title: 'تم استلام الطلب', icon: Clock },
                    { step: 2, title: 'جاري التجهيز والشحن', icon: Truck },
                    { step: 3, title: 'تم التسليم بنجاح', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = getStepIndex(order.status) >= item.step;
                    return (
                      <div key={item.step} className="flex flex-col items-center">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 transition-all ${
                            active
                              ? 'bg-gradient-to-br from-[#0f6848] to-[#10ac84] text-white shadow-md scale-105'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            active ? 'text-[#0f6848]' : 'text-gray-400'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-gray-100">
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
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">
                        {item.medicine?.name || 'دواء'}
                      </span>
                      <span className="text-xs text-gray-400 mr-2">×{item.quantity}</span>
                    </div>
                    <span className="font-bold text-main">
                      {item.total || item.price * item.quantity} ج.م
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 text-base font-bold">
                <span className="text-gray-700">المبلغ الإجمالي:</span>
                <span className="text-2xl text-main font-extrabold">{order.total_price} ج.م</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
