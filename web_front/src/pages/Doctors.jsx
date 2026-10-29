import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorService } from '../services/api';
import { 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Star, 
  UserCheck, 
  Filter,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle,
  X
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

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || 'كل التخصصات');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('specialty') && searchParams.get('specialty') !== 'كل التخصصات') {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    if (selectedSpecialty && selectedSpecialty !== 'كل التخصصات') newParams.specialty = selectedSpecialty;
    if (selectedLocation) newParams.location = selectedLocation;
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('كل التخصصات');
    setSelectedLocation('');
    setSearchParams({});
  };

  const isFiltered = Boolean(
    searchParams.get('search') || 
    (searchParams.get('specialty') && searchParams.get('specialty') !== 'كل التخصصات') || 
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
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">بحث بالاسم أو التخصص</label>
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
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">التخصص الطبي</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
              >
                <option value="كل التخصصات">كل التخصصات</option>
                {filters.specialties.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">المحافظة</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
              >
                <option value="">كل المحافظات</option>
                {filters.locations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
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
                <span>تم العثور على <strong>{doctors.length}</strong> طبيب متاح للحجز</span>
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
              <div
                key={doctor.id}
                style={{ animationDelay: `${(index % 6) * 0.08}s` }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 group animate-fadeIn"
              >
                {/* Doctor Header Banner */}
                <div className="h-28 bg-gradient-to-r from-[#0f6848] to-[#10ac84] relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                  <span className="absolute top-3 left-3 bg-white/95 text-[#0f6848] text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                    {doctor.specialty}
                  </span>
                </div>

                {/* Avatar and Main Info */}
                <div className="px-6 pb-6 pt-0 flex-1 flex flex-col text-center">
                  <div className="-mt-12 mb-3 mx-auto relative">
                    <img
                      src={doctor.image_url || '/asset/1.png'}
                      alt={doctor.name}
                      onError={(e) => { e.target.src = '/asset/1.png'; }}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white group-hover:scale-105 transition-transform duration-300"
                    />
                    <span 
                      className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                      title="طبيب معتمد"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-almarai text-gray-900 mb-0.5 group-hover:text-emerald-700 transition-colors">
                    د. {doctor.name}
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold mb-2">{doctor.specialty}</p>

                  {/* Ratings */}
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 text-sm mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 text-xs">
                      {doctor.average_rating || 4.8}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      ({doctor.ratings_count || 1} تقييم)
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="border-t border-b border-gray-100 py-3 my-2 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">سعر الكشف:</span>
                      <span className="font-extrabold text-[#0f6848] text-sm">{doctor.price} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">المكان:</span>
                      <span className="font-medium text-gray-700 flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{doctor.location || 'غير محدد'} {doctor.tow_location ? ` - ${doctor.tow_location}` : ''}</span>
                      </span>
                    </div>
                    {doctor.number && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">الهاتف:</span>
                        <span className="font-medium text-gray-700 flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{doctor.number}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-3">
                    <Link
                      to={`/appointments?doctor_id=${doctor.id}`}
                      className="btn-main py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>حجز موعد</span>
                    </Link>
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="btn-outline-main py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>التفاصيل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
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

export default Doctors;
