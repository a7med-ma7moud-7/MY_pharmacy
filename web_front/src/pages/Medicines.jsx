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
  Loader2,
  CheckCircle2
} from 'lucide-react';

const Medicines = () => {
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
    if (searchQuery) params.query = searchQuery;
    if (selectedType && selectedType !== 'all') params.type = selectedType;
    setSearchParams(params);
  };

  const handleAddToCart = (medicine) => {
    addToCart(medicine, 1);
    setAddedItemNotice(medicine.name);
    setTimeout(() => setAddedItemNotice(null), 3000);
  };

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-main text-white rounded-xl">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-almarai text-gray-900 m-0">قائمة الأدوية والمستلزمات</h1>
                <p className="text-gray-500 text-sm mt-1">تصفح صيدليتنا واطلب أدوية علاجك بأمان وسرعة</p>
              </div>
            </div>
          </div>

          {addedItemNotice && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تمت إضافة <strong>{addedItemNotice}</strong> إلى السلة!</span>
            </div>
          )}
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">ابحث عن دواء أو غرض طبي</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم التجاري أو العلمي..."
                  className="w-full pr-10 pl-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">التصنيف الدوائي</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">كل الأنواع والتصنيفات</option>
                {types.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span>بحث في الأدوية</span>
              </button>
            </div>
          </form>
        </div>

        {/* Medicines Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-main mb-3" />
            <p className="text-sm font-medium">جاري تحميل قائمة الأدوية...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold font-almarai text-gray-700 mb-1">لم يتم العثور على أدوية</h3>
            <p className="text-gray-500 text-sm">جرب البحث بكلمات أخرى أو تغيير التصنيف المختار</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover flex flex-col"
              >
                {/* Image and Badges */}
                <div className="relative bg-gray-100 h-48 overflow-hidden flex items-center justify-center">
                  <img
                    src={medicine.image_url || '/asset/1.png'}
                    alt={medicine.name}
                    onError={(e) => { e.target.src = '/asset/1.png'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {medicine.is_in_stock ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {medicine.type || 'عام'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base mb-1 font-almarai line-clamp-1">
                    {medicine.name}
                  </h3>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-main">{medicine.price} ج.م</span>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-yellow-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-1">
                    {medicine.propose || medicine.description || 'دواء معتمد ومسجل بوزارة الصحة.'}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => handleAddToCart(medicine)}
                      disabled={!medicine.is_in_stock}
                      className="w-full btn-main py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{medicine.is_in_stock ? 'أضف للسلة' : 'نفذت الكمية'}</span>
                    </button>

                    <Link
                      to={`/medicines/${medicine.id}`}
                      className="w-full btn-outline-main py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <span>عرض التفاصيل</span>
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
