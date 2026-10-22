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
  Loader2
} from 'lucide-react';

const Doctors = () => {
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
    if (searchTerm) newParams.search = searchTerm;
    if (selectedSpecialty && selectedSpecialty !== 'كل التخصصات') newParams.specialty = selectedSpecialty;
    if (selectedLocation) newParams.location = selectedLocation;
    setSearchParams(newParams);
  };

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-main text-white rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-almarai text-gray-900 m-0">قائمة الأطباء المعتمدين</h1>
              <p className="text-gray-500 text-sm mt-1">احجز كشفك الآن مع نخبة من أفضل الأطباء والاستشاريين</p>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">بحث بالاسم أو التخصص</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن طبيب أو تخصص..."
                  className="w-full pr-10 pl-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">التخصص</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="كل التخصصات">كل التخصصات</option>
                {filters.specialties.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">المحافظة</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">كل المحافظات</option>
                {filters.locations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn-main py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span>تطبيق الفلترة والبحث</span>
              </button>
            </div>
          </form>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-main mb-3" />
            <p className="text-sm font-medium">جاري تحميل قائمة الأطباء...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold font-almarai text-gray-700 mb-1">لا توجد نتائج مطابقة للبحث</h3>
            <p className="text-gray-500 text-sm">جرب تغيير معايير البحث أو اختيار تخصص آخر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover flex flex-col">
                {/* Doctor Header Banner */}
                <div className="h-28 bg-gradient-to-r from-[#0f6848] to-[#10ac84] relative">
                  <span className="absolute top-3 left-3 bg-white/90 text-main text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {doctor.specialty}
                  </span>
                </div>

                {/* Avatar and Main Info */}
                <div className="px-6 pb-6 pt-0 flex-1 flex flex-col text-center">
                  <div className="-mt-12 mb-3 mx-auto">
                    <img
                      src={doctor.image_url || '/asset/1.png'}
                      alt={doctor.name}
                      onError={(e) => { e.target.src = '/asset/1.png'; }}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                    />
                  </div>

                  <h3 className="text-xl font-bold font-almarai text-gray-900 mb-1">
                    د. {doctor.name}
                  </h3>
                  <p className="text-sm text-emerald-700 font-semibold mb-2">{doctor.specialty}</p>

                  {/* Ratings */}
                  <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm mb-4">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span className="font-bold text-gray-700 mr-1">
                      {doctor.average_rating || 4.5}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({doctor.ratings_count || 1} تقييم)
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="border-t border-b border-gray-100 py-3 my-2 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">سعر الكشف:</span>
                      <span className="font-bold text-main text-sm">{doctor.price} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">المحافظة:</span>
                      <span className="font-medium text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {doctor.location || 'غير محدد'} {doctor.tow_location ? ` - ${doctor.tow_location}` : ''}
                      </span>
                    </div>
                    {doctor.number && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">الهاتف:</span>
                        <span className="font-medium text-gray-700 flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {doctor.number}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
                    <Link
                      to={`/appointments?doctor_id=${doctor.id}`}
                      className="btn-main py-2 rounded-xl text-xs font-bold"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>حجز موعد</span>
                    </Link>
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="btn-outline-main py-2 rounded-xl text-xs font-bold"
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
