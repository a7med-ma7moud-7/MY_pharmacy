import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorService } from '../services/api';
import DoctorCard from '../components/common/DoctorCard';
import {
  Search,
  UserCheck,
  Filter,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

export const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    specialties: [],
    locations: [],
    cities: [],
  });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    searchParams.get('specialty') || 'كل التخصصات'
  );
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get('location') || ''
  );

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

      const res = await doctorService.getDoctors(params);
      if (res.data?.success) {
        setDoctors(res.data.data?.data || []);
        if (res.data.filters) {
          setFilters(res.data.filters);
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchParams]);

  const applyFilters = (nextSpecialty = selectedSpecialty, nextLocation = selectedLocation, nextSearch = searchTerm) => {
    const newParams = {};
    if (nextSearch.trim()) newParams.search = nextSearch.trim();
    if (nextSpecialty && nextSpecialty !== 'كل التخصصات') {
      newParams.specialty = nextSpecialty;
    }
    if (nextLocation) newParams.location = nextLocation;
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleQuickSpecialty = (spec) => {
    setSelectedSpecialty(spec);
    applyFilters(spec, selectedLocation, searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('كل التخصصات');
    setSelectedLocation('');
    setSearchParams({});
  };

  const isFiltered = Boolean(
    searchParams.get('search') ||
      (searchParams.get('specialty') &&
        searchParams.get('specialty') !== 'كل التخصصات') ||
      searchParams.get('location')
  );

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#0f6848] to-[#10ac84] text-white rounded-2xl shadow-md">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-almarai text-gray-900 m-0">
                دليل الأطباء والاستشاريين المعتمدين
              </h1>
              <p className="text-gray-500 text-sm mt-1 m-0">
                احجز كشفك الطبي الآن بسهولة مع نخبة من أفضل الأطباء في مختلف التخصصات
              </p>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                بحث بالاسم أو التخصص
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن اسم الطبيب أو تخصصه..."
                  className="w-full pr-10 pl-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                التخصص الطبي
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
              >
                <option value="كل التخصصات">كل التخصصات</option>
                {filters.specialties.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                المحافظة
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
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
                className="flex-1 btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                <span>بحث</span>
              </button>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer"
                  title="إلغاء الفلترة"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Quick Specialty Pills */}
          {filters.specialties.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => handleQuickSpecialty('كل التخصصات')}
                className={`filter-pill ${
                  selectedSpecialty === 'كل التخصصات' ? 'active' : ''
                }`}
              >
                الكل
              </button>
              {filters.specialties.slice(0, 8).map((spec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSpecialty(spec)}
                  className={`filter-pill ${
                    selectedSpecialty === spec ? 'active' : ''
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}

          {/* Results stats */}
          {!loading && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  تم العثور على <strong>{doctors.length}</strong> طبيب متاح للحجز
                </span>
              </span>
              {isFiltered && (
                <span className="text-emerald-700 font-medium">نتائج مصفاة</span>
              )}
            </div>
          )}
        </div>

        {/* Doctors Grid or Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col animate-pulse"
              >
                <div className="h-24 bg-slate-200 w-full relative">
                  <div className="absolute top-3 left-3 w-16 h-5 bg-slate-300 rounded-full"></div>
                </div>
                <div className="px-6 pb-6 pt-0 flex-1 flex flex-col items-center -mt-12">
                  <div className="w-24 h-24 rounded-full bg-slate-300 border-4 border-white mb-3"></div>
                  <div className="h-5 bg-slate-200 rounded w-36 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-24 mb-4"></div>
                  <div className="w-full space-y-2 py-3 border-t border-b border-gray-100">
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                      <div className="h-3 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-200 rounded w-14"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full pt-4 mt-auto">
                    <div className="h-9 bg-slate-200 rounded-xl"></div>
                    <div className="h-9 bg-slate-100 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <UserCheck className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold font-almarai text-gray-800 mb-1">
              لم نجد أطباء مطابقين لبحثك
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              جرّب تغيير التخصص أو المحافظة أو البحث باسم آخر لتجد الطبيب المناسب.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-main px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>عرض جميع الأطباء</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
