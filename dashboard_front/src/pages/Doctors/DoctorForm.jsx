import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { CustomSelect } from '../../components/common/CustomSelect';
import { adminApi, resolveImageUrl } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Loader2, Upload, Image as ImageIcon, ShieldCheck } from 'lucide-react';

export const DoctorForm = ({ isOpen, onClose, doctor, onSuccess }) => {
  const { showNotification } = useNotification();
  const isEdit = Boolean(doctor && doctor.id);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    price: '300',
    number: '',
    password: '',
    location: 'القاهرة',
    tow_location: '',
    clinic_name: '',
    experience_years: '',
    qualifications: '',
    bio: '',
    status: 'active',
    subscription: 'subscribed',
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [galleryImages, setGalleryImages] = useState({});
  const [galleryPreviews, setGalleryPreviews] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        price: doctor.price ?? '',
        number: doctor.number || '',
        password: '',
        location: doctor.location || '',
        tow_location: doctor.tow_location || '',
        clinic_name: doctor.clinic_name || '',
        experience_years: doctor.experience_years ?? '',
        qualifications: doctor.qualifications || '',
        bio: doctor.bio || '',
        status: doctor.status || 'active',
        subscription: doctor.subscription || 'subscribed',
      });
      if (doctor.image) {
        setMainImagePreview(resolveImageUrl(doctor));
      } else {
        setMainImagePreview('');
      }
      const existingPreviews = {};
      for (let i = 1; i <= 5; i++) {
        const field = `image-${i}`;
        if (doctor[field]) {
          existingPreviews[field] = resolveImageUrl(doctor[field]);
        }
      }
      setGalleryPreviews(existingPreviews);
    } else {
      setFormData({
        name: '',
        specialty: '',
        price: '300',
        number: '',
        password: '',
        location: 'القاهرة',
        tow_location: '',
        clinic_name: '',
        experience_years: '',
        qualifications: '',
        bio: '',
        status: 'active',
        subscription: 'subscribed',
      });
      setMainImage(null);
      setMainImagePreview('');
      setGalleryImages({});
      setGalleryPreviews({});
    }
    setErrors({});
  }, [doctor, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImageChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setGalleryImages((prev) => ({ ...prev, [field]: file }));
      setGalleryPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'اسم الطبيب مطلوب';
    if (!formData.specialty.trim()) newErrors.specialty = 'التخصص الطبي مطلوب';
    if (!formData.number.trim()) newErrors.number = 'رقم الهاتف مطلوب لتسجيل الدخول';
    if (!isEdit && (!formData.password || formData.password.length < 8)) {
      newErrors.password = 'كلمة المرور مطلوبة (8 أحرف على الأقل)';
    }
    if (!formData.price) newErrors.price = 'سعر الكشف مطلوب';
    if (!formData.location.trim()) newErrors.location = 'العنوان / المدينة مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const postData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'password' && isEdit) return;
      if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
        postData.append(key, formData[key]);
      }
    });

    if (mainImage) {
      postData.append('image', mainImage);
    }

    Object.keys(galleryImages).forEach((field) => {
      if (galleryImages[field]) {
        postData.append(field, galleryImages[field]);
      }
    });

    try {
      if (isEdit) {
        await adminApi.updateDoctor(doctor.id, postData);
        showNotification('تم تحديث بيانات الطبيب بنجاح', 'success');
      } else {
        await adminApi.createDoctor(postData);
        showNotification('تم إنشاء حساب الطبيب وملفه المهني بنجاح!', 'success');
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
        showNotification(err.response?.data?.message || 'فشلت العملية، يرجى المحاولة لاحقاً', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `تعديل بيانات الطبيب: ${doctor?.name}` : 'إنشاء حساب طبيب جديد (Admin Created)'}
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {!isEdit && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 172, 132, 0.08)',
              border: '1px solid rgba(16, 172, 132, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
            }}
          >
            <ShieldCheck size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
            <span>
              سيتم إنشاء حساب دخول مباشر للطبيب برقم الهاتف وكلمة المرور المحددين أدناه مع توثيق الحساب تلقائياً كإنشاء إداري.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div>
            <label className="form-label required">اسم الطبيب الكامل</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: د. أحمد المنصوري"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div>
            <label className="form-label required">رقم الهاتف (لتسجيل الدخول)</label>
            <input
              type="text"
              name="number"
              className="form-input"
              value={formData.number}
              onChange={handleChange}
              placeholder="01012345678"
              dir="ltr"
            />
            {errors.number && <span className="field-error">{errors.number}</span>}
          </div>

          {!isEdit && (
            <div>
              <label className="form-label required">كلمة مرور حساب الطبيب</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="8 أحرف أو أرقام على الأقل"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          )}

          <div>
            <label className="form-label required">التخصص الطبي</label>
            <input
              type="text"
              name="specialty"
              className="form-input"
              value={formData.specialty}
              onChange={handleChange}
              placeholder="مثال: استشاري أمراض القلب والباطنة"
            />
            {errors.specialty && <span className="field-error">{errors.specialty}</span>}
          </div>

          <div>
            <label className="form-label required">سعر الكشف (ج.م)</label>
            <input
              type="number"
              step="1"
              min="0"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="300"
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div>
            <label className="form-label required">العنوان الرئيسي / المدينة</label>
            <input
              type="text"
              name="location"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="القاهرة - مدينة نصر"
            />
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>

          <div>
            <label className="form-label">اسم العيادة / المركز</label>
            <input
              type="text"
              name="clinic_name"
              className="form-input"
              value={formData.clinic_name}
              onChange={handleChange}
              placeholder="مثال: عيادة الشفاء التخصصية"
            />
          </div>

          <div>
            <label className="form-label">سنوات الخبرة المهنية</label>
            <input
              type="number"
              min="0"
              name="experience_years"
              className="form-input"
              value={formData.experience_years}
              onChange={handleChange}
              placeholder="مثال: 12"
            />
          </div>

          <div>
            <label className="form-label required">حالة تفعيل الحساب</label>
            <CustomSelect
              value={formData.status}
              onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              options={[
                { value: 'active', label: 'نشط ومفعل للدخول والحجز' },
                { value: 'inactive', label: 'معطل مؤقتاً' },
              ]}
            />
          </div>

          <div>
            <label className="form-label required">حالة الاشتراك</label>
            <CustomSelect
              value={formData.subscription}
              onChange={(val) => setFormData((prev) => ({ ...prev, subscription: val }))}
              options={[
                { value: 'subscribed', label: 'مشترك بالمنظومة' },
                { value: 'not_subscribed', label: 'غير مشترك' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="form-label">المؤهلات العلمية / النبذة المهنية</label>
          <input
            type="text"
            name="qualifications"
            className="form-input"
            value={formData.qualifications}
            onChange={handleChange}
            placeholder="مثال: دكتوراه الأمراض الباطنة - كلية الطب"
          />
        </div>

        {/* Main Profile Image Upload */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <label className="form-label">الصورة الشخصية للطبيب (اختياري)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            {mainImagePreview ? (
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid var(--primary-color)',
                }}
              >
                <img
                  src={mainImagePreview}
                  alt="معاينة"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <ImageIcon size={24} />
              </div>
            )}

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-main)',
              }}
            >
              <Upload size={15} />
              <span>{mainImagePreview ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
              <input type="file" accept="image/*" onChange={handleMainImageChange} style={{ display: 'none' }} />
            </label>
          </div>
          {errors.image && <span className="field-error">{errors.image}</span>}
        </div>

        {/* Clinic Gallery Uploads */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <label className="form-label">صور العيادة (اختياري - حتى 5 صور)</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '10px',
              marginTop: '8px',
            }}
          >
            {[1, 2, 3, 4, 5].map((idx) => {
              const field = `image-${idx}`;
              const preview = galleryPreviews[field];
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  {preview ? (
                    <div style={{ height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '4px' }}>
                      <img src={preview} alt={`صورة ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: '60px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <ImageIcon size={18} />
                      <span style={{ fontSize: '0.68rem', marginTop: '2px' }}>عيادة {idx}</span>
                    </div>
                  )}

                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      color: 'var(--primary-color)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <span>{preview ? 'تغيير' : 'اختيار'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGalleryImageChange(field, e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '14px',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
            إلغاء
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting && <Loader2 size={16} className="spin-animation" />}
            <span>{isEdit ? 'حفظ التعديلات' : 'إنشاء حساب الطبيب'}</span>
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default DoctorForm;
