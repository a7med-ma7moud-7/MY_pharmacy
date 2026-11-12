import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../services/api';
import Reveal from '../components/common/Reveal';
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
    Pill,
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
        if (!qId || !qPhone) return;

        let active = true;
        orderService
            .checkOrderStatus({ order_id: qId, phone: qPhone })
            .then((res) => {
                if (!active) return;
                if (res.data?.success && res.data?.order) {
                    setOrder(res.data.order);
                    setError('');
                } else {
                    setError('لم يتم العثور على الطلب، يرجى التأكد من رقم الطلب ورقم الهاتف.');
                }
            })
            .catch((err) => {
                if (!active) return;
                setError(
                    err.response?.data?.message ||
                        'لم يتم العثور على الطلب. يرجى التأكد من صحة البيانات المدخلة.'
                );
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [searchParams]);

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
                    <span className="bg-sky-100 text-sky-800 font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
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

    const stepIdx = order ? getStepIndex(order.status) : 1;
    const progressPercent = stepIdx === 3 ? 100 : stepIdx === 2 ? 50 : 12;

    return (
        <div className="pb-16 bg-slate-50 min-h-screen">
            {/* Hero Banner */}
            <div className="hero-mesh text-white py-12 mb-10 relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <div className="inline-flex p-3.5 bg-white/15 backdrop-blur-md border border-white/25 text-emerald-200 rounded-2xl mb-3 shadow-lg">
                        <PackageCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold font-almarai text-white mb-2">
                        متابعة وتتبع حالة الطلب
                    </h1>
                    <p className="text-emerald-100/90 text-sm m-0">
                        أدخل رقم طلبك ورقم هاتفك المسجل لمعرفة موعد وتفاصيل التوصيل لحظة بلحظة
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Search Form */}
                <Reveal direction="up">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-8">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fadeIn">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleTrackSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        رقم الطلب (Order ID) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        placeholder="مثال: 12"
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        رقم الهاتف المسجل <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="01xxxxxxxxx"
                                            className="w-full pr-10 pl-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-main py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
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
                </Reveal>

                {/* Order Details Display */}
                {order && (
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 space-y-6 animate-scaleIn">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-xs text-slate-400 font-mono">الطلب رقم #{order.id}</span>
                                <h3 className="text-xl font-extrabold font-almarai text-slate-800 m-0">
                                    بيانات وتفاصيل الشحنة
                                </h3>
                            </div>
                            <div>{getStatusBadge(order.status)}</div>
                        </div>

                        {/* Connected Animated Visual Order Timeline */}
                        {order.status !== 'cancelled' && (
                            <div className="py-5 px-2 relative">
                                <div className="absolute top-10 right-[16%] left-[16%] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-l from-[#0f6848] to-[#10ac84] rounded-full transition-all duration-700"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                                    {[
                                        { step: 1, title: 'تم استلام الطلب', icon: Clock },
                                        { step: 2, title: 'جاري التجهيز والشحن', icon: Truck },
                                        { step: 3, title: 'تم التسليم بنجاح', icon: CheckCircle2 },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        const active = stepIdx >= item.step;
                                        return (
                                            <div key={item.step} className="flex flex-col items-center">
                                                <div
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 border-4 border-white transition-all ${
                                                        active
                                                            ? 'bg-gradient-to-br from-[#0f6848] to-[#10ac84] text-white shadow-lg scale-105'
                                                            : 'bg-slate-100 text-slate-400'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span
                                                    className={`text-xs font-extrabold ${
                                                        active ? 'text-[#0f6848]' : 'text-slate-400'
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div>
                                <span className="text-slate-400 block text-xs font-bold mb-0.5">اسم العميل:</span>
                                <span className="font-extrabold text-slate-800">{order.customer_name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs font-bold mb-0.5">طريقة الاستلام:</span>
                                <span className="font-extrabold text-slate-800">
                                    {order.delivery_method === 'delivery' ? 'توصيل للمنزل' : 'استلام من الصيدلية'}
                                </span>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-slate-400 block text-xs font-bold mb-0.5">عنوان التوصيل:</span>
                                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                    <MapPin className="w-4 h-4 text-[#0f6848] shrink-0" />
                                    {order.address}
                                </span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div>
                            <h4 className="font-extrabold text-sm text-slate-800 mb-3">الأدوية داخل الطلب:</h4>
                            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                                {order.items?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0f6848] flex items-center justify-center shrink-0">
                                                <Pill className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-800">
                                                    {item.medicine?.name || 'دواء'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 mr-2">
                                                    ×{item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-black text-[#0f6848]">
                                            {item.total || item.price * item.quantity} ج.م
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 text-base font-bold">
                                <span className="text-slate-700">المبلغ الإجمالي:</span>
                                <span className="text-2xl text-[#0f6848] font-black">
                                    {order.total_price} ج.م
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
