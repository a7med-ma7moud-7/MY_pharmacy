import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { medicineService } from '../services/api';
import { useCart } from '../context/CartContext';
import MedicineCard from '../components/common/MedicineCard';
import PaginationBar from '../components/common/PaginationBar';
import Reveal from '../components/common/Reveal';
import {
    Pill,
    Search,
    Filter,
    X,
    Sparkles,
    RotateCcw,
    ArrowUpDown,
} from 'lucide-react';

export const Medicines = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const [medicines, setMedicines] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
    const [sortBy, setSortBy] = useState('default');
    const [inStockOnly, setInStockOnly] = useState(false);

    useEffect(() => {
        let active = true;
        const fetchMedicines = async () => {
            setLoading(true);
            try {
                const params = {};
                if (searchParams.get('query')) params.search = searchParams.get('query');
                if (searchParams.get('type') && searchParams.get('type') !== 'all') {
                    params.type = searchParams.get('type');
                }
                if (searchParams.get('page')) params.page = searchParams.get('page');

                const res = await medicineService.getMedicines(params);
                if (active && res.data?.success) {
                    const pageObj = res.data.data || {};
                    setMedicines(pageObj.data || []);
                    setPagination({
                        currentPage: pageObj.current_page || 1,
                        lastPage: pageObj.last_page || 1,
                        total: pageObj.total || (pageObj.data || []).length,
                    });
                    if (res.data.types) {
                        setTypes(res.data.types);
                    }
                }
            } catch (err) {
                console.error('Error fetching medicines:', err);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchMedicines();
        return () => {
            active = false;
        };
    }, [searchParams]);

    const applyFilter = (nextType = selectedType, nextQuery = searchQuery, nextPage = 1) => {
        const params = {};
        if (nextQuery.trim()) params.query = nextQuery.trim();
        if (nextType && nextType !== 'all') params.type = nextType;
        if (nextPage > 1) params.page = String(nextPage);
        setSearchParams(params);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilter(selectedType, searchQuery, 1);
    };

    const handleQuickType = (typeVal) => {
        setSelectedType(typeVal);
        applyFilter(typeVal, searchQuery, 1);
    };

    const handlePageChange = (page) => {
        applyFilter(selectedType, searchQuery, page);
    };

    const handleClearFilter = () => {
        setSearchQuery('');
        setSelectedType('all');
        setSortBy('default');
        setInStockOnly(false);
        setSearchParams({});
    };

    const handleAddToCart = (medicine) => {
        addToCart(medicine, 1);
    };

    const displayedMedicines = useMemo(() => {
        let list = [...medicines];
        if (inStockOnly) {
            list = list.filter((m) => m.is_in_stock);
        }
        if (sortBy === 'price_asc') {
            list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        } else if (sortBy === 'price_desc') {
            list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        } else if (sortBy === 'name') {
            list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ar'));
        }
        return list;
    }, [medicines, inStockOnly, sortBy]);

    const isFiltered = Boolean(
        searchParams.get('query') ||
            (searchParams.get('type') && searchParams.get('type') !== 'all') ||
            inStockOnly
    );

    return (
        <div className="pb-16 bg-slate-50 min-h-screen">
            {/* Hero Banner */}
            <div className="hero-mesh text-white py-12 mb-8 relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/15 backdrop-blur-md border border-white/25 text-emerald-200 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                            <Pill className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold font-almarai text-white m-0">
                                صيدلية الأدوية والمستلزمات
                            </h1>
                            <p className="text-emerald-100/90 text-sm mt-1 m-0">
                                تصفح صيدليتنا واطلب أدويتك الأصلية والمرخصة مع توصيل سريع ومضمون
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Filter Card */}
                <Reveal direction="up">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 mb-8">
                        <form
                            onSubmit={handleFilterSubmit}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end"
                        >
                            <div className="md:col-span-6">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    بحث عن دواء
                                </label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ابحث بالاسم التجاري، العلمي، أو الغرض الطبي..."
                                        className="w-full pr-10 pl-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    التصنيف الدوائي
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
                                >
                                    <option value="all">كل الأنواع والتصنيفات</option>
                                    {types.map((type, idx) => (
                                        <option key={idx} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3 flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>بحث</span>
                                </button>

                                {isFiltered && (
                                    <button
                                        type="button"
                                        onClick={handleClearFilter}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer"
                                        title="إلغاء الفلترة"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Quick Category Pills */}
                        {types.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
                                <button
                                    type="button"
                                    onClick={() => handleQuickType('all')}
                                    className={`filter-pill ${selectedType === 'all' ? 'active' : ''}`}
                                >
                                    الكل
                                </button>
                                {types.map((t, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleQuickType(t)}
                                        className={`filter-pill ${selectedType === t ? 'active' : ''}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Results stats + Controls */}
                        {!loading && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                        إجمالي الأدوية المتاحة: <strong>{pagination.total}</strong> دواء
                                    </span>
                                </span>

                                <div className="flex flex-wrap items-center gap-4">
                                    <label className="inline-flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={inStockOnly}
                                            onChange={(e) => setInStockOnly(e.target.checked)}
                                            className="w-4 h-4 accent-[#0f6848] rounded cursor-pointer"
                                        />
                                        <span>المتوفر بالمخزون فقط</span>
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="default">الترتيب الافتراضي</option>
                                            <option value="price_asc">الأقل سعراً</option>
                                            <option value="price_desc">الأعلى سعراً</option>
                                            <option value="name">أبجدياً (أ - ي)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Reveal>

                {/* Medicines Grid or Skeleton Loader */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-3xl border border-slate-100 overflow-hidden p-0 shadow-sm flex flex-col"
                            >
                                <div className="skeleton-shimmer h-48 w-full"></div>
                                <div className="p-5 flex-1 flex flex-col space-y-3">
                                    <div className="h-5 skeleton-shimmer rounded-md w-3/4"></div>
                                    <div className="h-6 skeleton-shimmer rounded-md w-24"></div>
                                    <div className="h-10 skeleton-shimmer rounded w-full"></div>
                                    <div className="pt-2 space-y-2 mt-auto">
                                        <div className="h-10 skeleton-shimmer rounded-xl w-full"></div>
                                        <div className="h-9 skeleton-shimmer rounded-xl w-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayedMedicines.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Pill className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold font-almarai text-slate-800 mb-1">
                            لم يتم العثور على أدوية مطابقة
                        </h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                            جرّب البحث بكلمات أخرى، أو إزالة الفلترة، أو تصفح كل الأدوية المتاحة في الصيدلية.
                        </p>
                        {isFiltered && (
                            <button
                                type="button"
                                onClick={handleClearFilter}
                                className="btn-main px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>عرض كل الأدوية</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {displayedMedicines.map((medicine, index) => (
                                <MedicineCard
                                    key={medicine.id}
                                    medicine={medicine}
                                    onAddToCart={handleAddToCart}
                                    index={index}
                                />
                            ))}
                        </div>

                        <PaginationBar
                            currentPage={pagination.currentPage}
                            lastPage={pagination.lastPage}
                            total={pagination.total}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Medicines;
