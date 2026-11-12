import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorService } from '../services/api';
import DoctorCard from '../components/common/DoctorCard';
import PaginationBar from '../components/common/PaginationBar';
import Reveal from '../components/common/Reveal';
import {
    Search,
    UserCheck,
    Filter,
    RotateCcw,
    Sparkles,
    X,
    ArrowUpDown,
} from 'lucide-react';

export const Doctors = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
    const [filters, setFilters] = useState({
        specialties: [],
        locations: [],
        cities: [],
    });
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('default');

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedSpecialty, setSelectedSpecialty] = useState(
        searchParams.get('specialty') || 'كل التخصصات'
    );
    const [selectedLocation, setSelectedLocation] = useState(
        searchParams.get('location') || ''
    );

    useEffect(() => {
        let active = true;
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const params = {};
                if (searchParams.get('search')) params.search = searchParams.get('search');
                if (
                    searchParams.get('specialty') &&
                    searchParams.get('specialty') !== 'كل التخصصات'
                ) {
                    params.specialty = searchParams.get('specialty');
                }
                if (searchParams.get('location')) params.location = searchParams.get('location');
                if (searchParams.get('page')) params.page = searchParams.get('page');

                const res = await doctorService.getDoctors(params);
                if (active && res.data?.success) {
                    const pageObj = res.data.data || {};
                    setDoctors(pageObj.data || []);
                    setPagination({
                        currentPage: pageObj.current_page || 1,
                        lastPage: pageObj.last_page || 1,
                        total: pageObj.total || (pageObj.data || []).length,
                    });
                    if (res.data.filters) {
                        setFilters(res.data.filters);
                    }
                }
            } catch (err) {
                console.error('Error fetching doctors:', err);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDoctors();
        return () => {
            active = false;
        };
    }, [searchParams]);

    const applyFilters = (
        nextSpecialty = selectedSpecialty,
        nextLocation = selectedLocation,
        nextSearch = searchTerm,
        nextPage = 1
    ) => {
        const newParams = {};
        if (nextSearch.trim()) newParams.search = nextSearch.trim();
        if (nextSpecialty && nextSpecialty !== 'كل التخصصات') {
            newParams.specialty = nextSpecialty;
        }
        if (nextLocation) newParams.location = nextLocation;
        if (nextPage > 1) newParams.page = String(nextPage);
        setSearchParams(newParams);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(selectedSpecialty, selectedLocation, searchTerm, 1);
    };

    const handleQuickSpecialty = (spec) => {
        setSelectedSpecialty(spec);
        applyFilters(spec, selectedLocation, searchTerm, 1);
    };

    const handlePageChange = (page) => {
        applyFilters(selectedSpecialty, selectedLocation, searchTerm, page);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedSpecialty('كل التخصصات');
        setSelectedLocation('');
        setSortBy('default');
        setSearchParams({});
    };

    const sortedDoctors = useMemo(() => {
        const list = [...doctors];
        if (sortBy === 'rating') {
            return list.sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0));
        }
        if (sortBy === 'price_asc') {
            return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        }
        if (sortBy === 'price_desc') {
            return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        }
        return list;
    }, [doctors, sortBy]);

    const isFiltered = Boolean(
        searchParams.get('search') ||
        (searchParams.get('specialty') &&
            searchParams.get('specialty') !== 'كل التخصصات') ||
        searchParams.get('location')
    );

    return (
        <div className="pb-16 bg-slate-50 min-h-screen">
            {/* Hero Banner */}
            <div className="hero-mesh text-white py-12 mb-8 relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/15 backdrop-blur-md border border-white/25 text-emerald-200 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                            <UserCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold font-almarai text-white m-0">
                                دليل الأطباء والاستشاريين المعتمدين
                            </h1>
                            <p className="text-emerald-100/90 text-sm mt-1 m-0">
                                احجز كشفك الطبي الآن بسهولة مع نخبة من أفضل الأطباء في مختلف التخصصات
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
                            onSubmit={handleSearchSubmit}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end"
                        >
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    بحث بالاسم أو التخصص
                                </label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="ابحث عن اسم الطبيب أو تخصصه..."
                                        className="w-full pr-10 pl-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                            className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    التخصص الطبي
                                </label>
                                <select
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
                                >
                                    <option value="كل التخصصات">كل التخصصات</option>
                                    {filters.specialties.map((s, idx) => (
                                        <option key={idx} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    المحافظة
                                </label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
                                >
                                    <option value="">كل المحافظات</option>
                                    {filters.locations.map((loc, idx) => (
                                        <option key={idx} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 flex items-center gap-2">
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
                                        onClick={handleClearFilters}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer"
                                        title="إلغاء الفلترة"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Quick Specialty Pills */}
                        {filters.specialties.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
                                <button
                                    type="button"
                                    onClick={() => handleQuickSpecialty('كل التخصصات')}
                                    className={`filter-pill ${selectedSpecialty === 'كل التخصصات' ? 'active' : ''
                                        }`}
                                >
                                    الكل
                                </button>
                                {filters.specialties.slice(0, 8).map((spec, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleQuickSpecialty(spec)}
                                        className={`filter-pill ${selectedSpecialty === spec ? 'active' : ''
                                            }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Results stats + Sort */}
                        {!loading && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                        إجمالي الأطباء المتاحين: <strong>{pagination.total}</strong> طبيب
                                    </span>
                                </span>

                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-bold text-slate-600">ترتيب حسب:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="default">الافتراضي</option>
                                        <option value="rating">الأعلى تقييماً</option>
                                        <option value="price_asc">الأقل سعر كشف</option>
                                        <option value="price_desc">الأعلى سعر كشف</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </Reveal>

                {/* Doctors Grid or Skeleton Loader */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col"
                            >
                                <div className="h-28 skeleton-shimmer w-full"></div>
                                <div className="px-6 pb-6 pt-0 flex-1 flex flex-col items-center -mt-12">
                                    <div className="w-24 h-24 rounded-full skeleton-shimmer border-4 border-white mb-3"></div>
                                    <div className="h-5 skeleton-shimmer rounded w-36 mb-2"></div>
                                    <div className="h-4 skeleton-shimmer rounded w-24 mb-4"></div>
                                    <div className="w-full h-20 skeleton-shimmer rounded-2xl mb-4"></div>
                                    <div className="grid grid-cols-2 gap-2 w-full pt-2 mt-auto">
                                        <div className="h-10 skeleton-shimmer rounded-xl"></div>
                                        <div className="h-10 skeleton-shimmer rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedDoctors.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <UserCheck className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold font-almarai text-slate-800 mb-1">
                            لم نجد أطباء مطابقين لبحثك
                        </h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                            جرّب تغيير التخصص أو المحافظة أو البحث باسم آخر لتجد الطبيب المناسب.
                        </p>
                        {isFiltered && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="btn-main px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>عرض جميع الأطباء</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedDoctors.map((doctor, index) => (
                                <DoctorCard key={doctor.id} doctor={doctor} index={index} />
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

export default Doctors;
