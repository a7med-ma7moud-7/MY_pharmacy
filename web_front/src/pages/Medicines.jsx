import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { medicineService } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  Pill, 
  Search, 
  ShoppingCart, 
  ArrowLeft, 
  Filter, 
  Star,
  CheckCircle2,
  X,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const Medicines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [medicines, setMedicines] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [addedItemNotice, setAddedItemNotice] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.get('query')) params.search = searchParams.get('query');
      if (searchParams.get('type') && searchParams.get('type') !== 'all') {
        params.type = searchParams.get('type');
      }

      const res = await medicineService.getMedicines(params);
      if (res.data?.success) {
        setMedicines(res.data.data?.data || []);
        if (res.data.types) {
          setTypes(res.data.types);
        }
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (searchQuery.trim()) params.query = searchQuery.trim();
    if (selectedType && selectedType !== 'all') params.type = selectedType;
    setSearchParams(params);
  };

  const handleClearFilter = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSearchParams({});
  };

  const handleAddToCart = (medicine) => {
    addToCart(medicine, 1);
    setAddedItemNotice(medicine.name);
    setTimeout(() => setAddedItemNotice(null), 3000);
  };

  const isFiltered = Boolean(searchParams.get('query') || (searchParams.get('type') && searchParams.get('type') !== 'all'));

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-[#0f6848] to-[#10ac84] text-white rounded-2xl shadow-md">
                <Pill className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-almarai text-gray-900 m-0">
                  صيدلية الأدوية والمستلزمات
                </h1>
                <p className="text-gray-500 text-sm mt-1 m-0">
                  تصفح صيدليتنا واطلب أدويتك الأصلية والمرخصة مع توصيل سريع ومضمون
                </p>
              </div>
            </div>
          </div>

          {addedItemNotice && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2 shadow-sm animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تمت إضافة <strong>{addedItemNotice}</strong> إلى سلتك!</span>
            </div>
          )}
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">بحث عن دواء</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم التجاري، العلمي، أو الغرض الطبي..."
                  className="w-full pr-10 pl-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">التصنيف الدوائي</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
              >
                <option value="all">كل الأنواع والتصنيفات</option>
                {types.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                <span>بحث</span>
              </button>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold flex items-center justify-center transition-colors"
                  title="إلغاء الفلترة"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Results stats */}
          {!loading && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>تم العثور على <strong>{medicines.length}</strong> دواء متاح</span>
              </span>
              {isFiltered && (
                <span className="text-emerald-700 font-medium">تم تطبيق معايير التصفية</span>
              )}
            </div>
          )}
        </div>

        {/* Medicines Grid or Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-0 shadow-sm flex flex-col animate-pulse"
              >
                {/* Image Placeholder */}
                <div className="bg-slate-200 h-48 w-full relative">
                  <div className="absolute top-3 right-3 w-14 h-5 bg-slate-300 rounded-full"></div>
                  <div className="absolute top-3 left-3 w-16 h-5 bg-slate-300 rounded-full"></div>
                </div>

                {/* Content Placeholder */}
                <div className="p-4 flex-1 flex flex-col space-y-3">
                  <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-slate-200 rounded-md w-20"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-16"></div>
                  </div>
                  <div className="space-y-1.5 py-1">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                  </div>
                  <div className="pt-2 space-y-2 mt-auto">
                    <div className="h-9 bg-slate-200 rounded-xl w-full"></div>
                    <div className="h-8 bg-slate-100 rounded-xl w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : medicines.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Pill className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold font-almarai text-gray-800 mb-1">
              لم يتم العثور على أدوية مطابقة
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              جرّب البحث بكلمات أخرى، أو إزالة الفلترة، أو تصفح كل الأدوية المتاحة في الصيدلية.
            </p>
            {isFiltered && (
              <button
                onClick={handleClearFilter}
                className="btn-main px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>عرض كل الأدوية</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {medicines.map((medicine, index) => (
              <div
                key={medicine.id}
                style={{ animationDelay: `${(index % 8) * 0.06}s` }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 group animate-fadeIn"
              >
                {/* Image and Badges */}
                <div className="relative bg-slate-100 h-48 overflow-hidden flex items-center justify-center">
                  <img
                    src={medicine.image_url || '/asset/1.png'}
                    alt={medicine.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = '/asset/1.png'; }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${
                      medicine.is_in_stock
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-rose-600/90 text-white'
                    }`}>
                      {medicine.is_in_stock ? 'متوفر بالمخزون' : 'غير متوفر'}
                    </span>
                  </div>

                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-slate-900/70 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {medicine.type || 'عام'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base mb-1 font-almarai line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {medicine.name}
                  </h3>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-[#0f6848]">{medicine.price}</span>
                      <span className="text-xs font-bold text-gray-500">ج.م</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-1">
                    {medicine.propose || medicine.description || 'دواء مرخص ومعتمد، يرجى استشارة الصيدلي قبل الاستخدام.'}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2 mt-auto pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handleAddToCart(medicine)}
                      disabled={!medicine.is_in_stock}
                      className="w-full btn-main py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{medicine.is_in_stock ? 'أضف للسلة' : 'نفذت الكمية'}</span>
                    </button>

                    <Link
                      to={`/medicines/${medicine.id}`}
                      className="w-full btn-outline-main py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>تفاصيل الدواء</span>
                      <ArrowLeft className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicines;
