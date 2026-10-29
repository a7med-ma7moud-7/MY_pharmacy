import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { medicineService } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  Pill, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Plus,
  Minus,
  Star,
  Loader2
} from 'lucide-react';

const MedicineDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [medicine, setMedicine] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  const fetchMedicine = async () => {
    setLoading(true);
    try {
      const res = await medicineService.getMedicine(id);
      if (res.data?.success) {
        setMedicine(res.data.data.medicine);
        setRelated(res.data.data.related || []);
      }
    } catch (err) {
      console.error('Failed fetching medicine details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicine();
  }, [id]);

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
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80 bg-slate-200 rounded-2xl w-full"></div>
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-8 bg-slate-300 rounded w-3/4"></div>
              <div className="h-10 bg-slate-200 rounded w-1/2"></div>
              <div className="space-y-2 py-4">
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </div>
              <div className="h-12 bg-slate-200 rounded-xl w-full mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <h2 className="text-2xl font-bold font-almarai text-gray-800 mb-2">الدواء غير موجود</h2>
        <Link to="/medicines" className="btn-main">العودة لقائمة الأدوية</Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/medicines" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-main mb-6 font-semibold">
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الأدوية</span>
        </Link>

        {addedNotice && (
          <div className="mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>تمت إضافة <strong>{medicine.name}</strong> ({quantity} عبوة) إلى السلة بنجاح!</span>
            </div>
          </div>
        )}

        {/* Medicine Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center border border-gray-100">
              <img
                src={medicine.image_url || '/asset/1.png'}
                alt={medicine.name}
                onError={(e) => { e.target.src = '/asset/1.png'; }}
                className="max-h-72 object-contain"
              />
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-main text-xs font-bold px-3 py-1 rounded-full">
                  {medicine.type || 'أدوية عامة'}
                </span>
                <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>دواء أصلي ومعتمد</span>
                </span>
              </div>

              <h1 className="text-3xl font-extrabold font-almarai text-gray-900 mb-2">
                {medicine.name}
              </h1>

              <div className="flex items-center gap-2 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400" />
                ))}
                <span className="text-gray-400 text-xs mr-2">(تقييم العملاء الممتاز)</span>
              </div>

              <div className="text-3xl font-bold text-main mb-6">
                {medicine.price} <span className="text-lg font-normal text-gray-500">ج.م</span>
              </div>

              <div className="border-t border-b border-gray-100 py-4 mb-6 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">حالة التوفر:</span>
                  <span className="font-semibold text-emerald-600">
                    {medicine.is_in_stock ? 'متوفر بالمخزون' : 'غير متوفر حالياً'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">التصنيف:</span>
                  <span className="font-semibold text-gray-800">{medicine.type}</span>
                </div>
              </div>

              {/* Quantity Stepper & Add To Cart */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-gray-600 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-base text-gray-800 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-gray-600 hover:text-emerald-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!medicine.is_in_stock}
                  className="flex-1 btn-main py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>أضف إلى السلة ({medicine.price * quantity} ج.م)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Usage & Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-10">
          <h3 className="text-xl font-bold font-almarai text-gray-900 mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-main" />
            <span>دواعي الاستعمال والإرشادات</span>
          </h3>
          <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
            {medicine.propose || medicine.description || 'يرجى مراجعة الصيدلي أو الطبيب المختص قبل تناول الدواء وقراءة النشرة الداخلية بعناية.'}
          </p>
        </div>

        {/* Related Medicines */}
        {related.length > 0 && (
          <div>
            <h3 className="text-xl font-bold font-almarai text-gray-900 mb-6">
              أدوية مشابهة من نفس التصنيف
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/medicines/${item.id}`}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm card-hover text-center block text-decoration-none"
                >
                  <img
                    src={item.image_url || '/asset/1.png'}
                    alt={item.name}
                    onError={(e) => { e.target.src = '/asset/1.png'; }}
                    className="w-full h-32 object-contain mb-3"
                  />
                  <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{item.name}</h4>
                  <span className="text-main font-bold text-sm">{item.price} ج.م</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineDetail;
