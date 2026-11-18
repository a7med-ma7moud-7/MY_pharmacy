import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { CustomSelect } from '../../components/common/CustomSelect';
import { adminApi, resolveImageUrl } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Loader2,
  Upload,
  Store,
  MapPin,
  LocateFixed,
  Link2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

const CITY_PRESETS = [
  { label: 'القاهرة (وسط البلد)', city: 'القاهرة', lat: '30.044420', lng: '31.235712' },
  { label: 'القاهرة (المعادي)', city: 'القاهرة', lat: '29.960245', lng: '31.256913' },
  { label: 'القاهرة (مدينة نصر)', city: 'القاهرة', lat: '30.056113', lng: '31.330108' },
  { label: 'الجيزة (الدقي)', city: 'الجيزة', lat: '30.038451', lng: '31.212234' },
  { label: 'الإسكندرية (سموحة)', city: 'الإسكندرية', lat: '31.215645', lng: '29.955266' },
];

const parseCoordsFromInput = (raw) => {
  if (!raw) return null;
  const str = String(raw).trim();
  // Match @lat,lng or q=lat,lng or ll=lat,lng or plain "lat, lng"
  const patterns = [
    /@(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /[?&](?:q|ll|query)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /^(-?\d+(?:\.\d+)?)\s*[,،\s]\s*(-?\d+(?:\.\d+)?)$/,
  ];
  for (const reg of patterns) {
    const m = str.match(reg);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
      }
    }
  }
  return null;
};

export const PharmacyForm = ({ isOpen, onClose, pharmacy, onSuccess }) => {
  const { showNotification } = useNotification();
  const isEdit = Boolean(pharmacy && pharmacy.id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: 'القاهرة',
    address: '',
    latitude: '',
    longitude: '',
    working_hours: '24 ساعة',
    license_number: '',
    is_active: true,
  });

  const [mapsLinkInput, setMapsLinkInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        email: pharmacy.login_email || pharmacy.email || pharmacy.user?.email || '',
        phone: pharmacy.login_phone || pharmacy.phone || pharmacy.user?.phone || '',
        password: '',
        city: pharmacy.city || 'القاهرة',
        address: pharmacy.address || '',
        latitude: pharmacy.latitude !== undefined && pharmacy.latitude !== null ? String(pharmacy.latitude) : '',
        longitude: pharmacy.longitude !== undefined && pharmacy.longitude !== null ? String(pharmacy.longitude) : '',
        working_hours: pharmacy.working_hours || '',
        license_number: pharmacy.license_number || '',
        is_active: pharmacy.is_active !== undefined ? Boolean(pharmacy.is_active) : true,
      });
      setImagePreview(pharmacy.image ? resolveImageUrl(pharmacy) : '');
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        city: 'القاهرة',
        address: '',
        latitude: '',
        longitude: '',
        working_hours: '24 ساعة',
        license_number: '',
        is_active: true,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setMapsLinkInput('');
    setErrors({});
  }, [pharmacy, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleExtractMapLink = (val) => {
    setMapsLinkInput(val);
    const parsed = parseCoordsFromInput(val);
    if (parsed) {
      setFormData((prev) => ({
        ...prev,
        latitude: parsed.lat,
        longitude: parsed.lng,
      }));
      setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
      showNotification('تم استخراج إحداثيات الموقع (Lat & Long) تلقائياً', 'success');
    }
  };

  const handleDetectCurrentGps = () => {
    if (!navigator.geolocation) {
      showNotification('المتصفح لا يدعم تحديد الموقع الجغرافي تلقائياً', 'error');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
        setLocatingGps(false);
        showNotification('تم التقاط إحداثيات موقعك الحالي بنجاح', 'success');
      },
      () => {
        setLocatingGps(false);
        showNotification('تعذر الوصول إلى GPS، يمكنك إدخال الإحداثيات أو لصق رابط الخريطة', 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'اسم الصيدلية مطلوب';
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني لتسجيل الدخول مطلوب';
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'كلمة المرور مطلوبة (6 أحرف على الأقل)';
    }
    if (isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف';
    }

    const latNum = parseFloat(formData.latitude);
    const lngNum = parseFloat(formData.longitude);
    if (formData.latitude === '' || Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.latitude = 'يرجى إدخال خط عرض صحيح (Latitude بين -90 و 90)';
    }
    if (formData.longitude === '' || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      newErrors.longitude = 'يرجى إدخال خط طول صحيح (Longitude بين -180 و 180)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const postData = new FormData();
    postData.append('name', formData.name.trim());
    postData.append('email', formData.email.trim());
    postData.append('phone', formData.phone.trim());
    if (formData.password) {
      postData.append('password', formData.password);
    }
    postData.append('city', formData.city);
    postData.append('address', formData.address);
    postData.append('latitude', String(latNum));
    postData.append('longitude', String(lngNum));
    postData.append('working_hours', formData.working_hours);
    postData.append('license_number', formData.license_number);
    postData.append('is_active', formData.is_active ? '1' : '0');

    if (imageFile) {
      postData.append('image', imageFile);
    }

    try {
      if (isEdit) {
        await adminApi.updatePharmacy(pharmacy.id, postData);
        showNotification('تم تحديث بيانات الصيدلية وإحداثياتها بنجاح', 'success');
      } else {
        await adminApi.createPharmacy(postData);
        showNotification('تم إضافة الصيدلية وإنشاء حساب الداشبورد الخاص بها بنجاح!', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        Object.keys(serverErrors).forEach((key) => {
          mapped[key] = serverErrors[key][0];
        });
        setErrors(mapped);
      } else {
        showNotification(err.response?.data?.message || 'فشلت العملية، يرجى التحقق من البيانات', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const validPreviewCoords =
    formData.latitude !== '' &&
    formData.longitude !== '' &&
    !Number.isNaN(parseFloat(formData.latitude)) &&
    !Number.isNaN(parseFloat(formData.longitude)) &&
    Math.abs(parseFloat(formData.latitude)) <= 90 &&
    Math.abs(parseFloat(formData.longitude)) <= 180;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `تعديل بيانات الصيدلية: ${pharmacy?.name}` : 'إضافة صيدلية معتمدة جديدة'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Provisioning Policy Notice */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--primary-700)',
          }}
        >
          <ShieldCheck size={18} style={{ flexShrink: 0, color: 'var(--primary-600)' }} />
          <span>
            يُنشئ السوبر أدمن حساب الصيدلية حصرياً، وستتمكن الصيدلية من الدخول للداشبورد لإدارة مخزون أدويتها وطلباتها الواردة فقط.
          </span>
        </div>

        {/* Basic Pharmacy Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div>
            <label className="form-label required">اسم الصيدلية</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: صيدلية الشفاء المركزية"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div>
            <label className="form-label">رقم الترخيص الصيدلي</label>
            <input
              type="text"
              name="license_number"
              className="form-input"
              value={formData.license_number}
              onChange={handleChange}
              placeholder="مثال: PH-CAI-1042"
            />
          </div>
        </div>

        {/* Login Credentials Section */}
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            بيانات دخول الصيدلية إلى الداشبورد
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label className="form-label required">البريد الإلكتروني للدخول</label>
              <input
                type="email"
                name="email"
                className="form-input"
                dir="ltr"
                value={formData.email}
                onChange={handleChange}
                placeholder="branch@pharmacy.com"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div>
              <label className="form-label">رقم الهاتف (يصلح للدخول أيضاً)</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                dir="ltr"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01012345678"
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div>
              <label className={`form-label ${!isEdit ? 'required' : ''}`}>
                {isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  dir="ltr"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEdit ? 'اتركه فارغاً للإبقاء على الحالية' : '••••••••'}
                  style={{ paddingLeft: '38px', paddingRight: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <label className="form-label">المحافظة / المدينة</label>
            <CustomSelect
              value={formData.city}
              onChange={(val) => setFormData((prev) => ({ ...prev, city: val }))}
              options={[
                { value: 'القاهرة', label: 'القاهرة' },
                { value: 'الجيزة', label: 'الجيزة' },
                { value: 'الإسكندرية', label: 'الإسكندرية' },
                { value: 'المنصورة', label: 'المنصورة' },
                { value: 'طنطا', label: 'طنطا' },
                { value: 'أسيوط', label: 'أسيوط' },
              ]}
            />
          </div>

          <div>
            <label className="form-label">مواعيد العمل</label>
            <input
              type="text"
              name="working_hours"
              className="form-input"
              value={formData.working_hours}
              onChange={handleChange}
              placeholder="مثال: 24 ساعة طوال الأسبوع"
            />
          </div>
        </div>

        <div>
          <label className="form-label">العنوان التفصيلي للفرع</label>
          <input
            type="text"
            name="address"
            className="form-input"
            value={formData.address}
            onChange={handleChange}
            placeholder="مثال: شارع 9 الرئيسي، بجوار محطة مترو المعادي"
          />
        </div>

        {/* Geographic Coordinates (Lat & Long) Section */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'var(--slate-50)',
            border: '1.5px solid var(--primary-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: 'var(--primary-600)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                الإحداثيات الجغرافية للصيدلية (Latitude & Longitude)
              </span>
            </div>

            <button
              type="button"
              onClick={handleDetectCurrentGps}
              disabled={locatingGps}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: '999px', fontSize: '0.75rem' }}
            >
              {locatingGps ? <Loader2 size={14} className="spin-animation" /> : <LocateFixed size={14} />}
              <span>تحديد موقعي الحالي (GPS)</span>
            </button>
          </div>

          {/* Quick Google Maps URL / Pair Extractor */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              dir="ltr"
              className="form-input"
              value={mapsLinkInput}
              onChange={(e) => handleExtractMapLink(e.target.value)}
              placeholder="الصق رابط Google Maps أو الإحداثيات (مثال: 30.0444, 31.2357) للاستخراج التلقائي..."
              style={{ fontSize: '0.8rem', paddingLeft: '36px' }}
            />
            <Link2
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>نقاط سريعة:</span>
            {CITY_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    city: preset.city,
                    latitude: preset.lat,
                    longitude: preset.lng,
                  }));
                  setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
                }}
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--slate-200)',
                  color: 'var(--primary-600)',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label required">خط العرض (Latitude)</label>
              <input
                type="number"
                step="any"
                name="latitude"
                dir="ltr"
                className="form-input"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="مثال: 30.044420"
              />
              {errors.latitude && <span className="field-error">{errors.latitude}</span>}
            </div>

            <div>
              <label className="form-label required">خط الطول (Longitude)</label>
              <input
                type="number"
                step="any"
                name="longitude"
                dir="ltr"
                className="form-input"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="مثال: 31.235712"
              />
              {errors.longitude && <span className="field-error">{errors.longitude}</span>}
            </div>
          </div>

          {validPreviewCoords && (
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--slate-200)',
                height: '155px',
                backgroundColor: 'var(--surface-card)',
              }}
            >
              <iframe
                title="معاينة موقع الصيدلية"
                width="100%"
                height="155"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  parseFloat(formData.longitude) - 0.008
                }%2C${parseFloat(formData.latitude) - 0.005}%2C${
                  parseFloat(formData.longitude) + 0.008
                }%2C${parseFloat(formData.latitude) + 0.005}&layer=mapnik&marker=${parseFloat(
                  formData.latitude
                )}%2C${parseFloat(formData.longitude)}`}
              />
            </div>
          )}
        </div>

        {/* Logo & Active Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="شعار الصيدلية"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '2px solid var(--primary-color)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <Store size={22} />
              </div>
            )}

            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={14} />
              <span>{imagePreview ? 'تغيير الشعار' : 'رفع شعار الصيدلية'}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              style={{ accentColor: 'var(--primary-600)', width: '16px', height: '16px' }}
            />
            <span>تفعيل حساب الصيدلية للدخول الفوري</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting && <Loader2 size={16} className="spin-animation" />}
            <span>{isEdit ? 'حفظ تعديلات الصيدلية' : 'إنشاء الصيدلية وحساب الدخول'}</span>
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default PharmacyForm;
