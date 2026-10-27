import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { adminApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

export const DoctorForm = ({ isOpen, onClose, doctor, onSuccess }) => {
  const { showNotification } = useNotification();
  const isEdit = Boolean(doctor && doctor.id);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    price: '',
    number: '',
    location: '',
    tow_location: '',
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
        price: doctor.price || '',
        number: doctor.number || '',
        location: doctor.location || '',
        tow_location: doctor.tow_location || '',
        status: doctor.status || 'active',
        subscription: doctor.subscription || 'subscribed',
      });
      if (doctor.image) {
        setMainImagePreview(doctor.image.startsWith('http') ? doctor.image : `http://localhost:8080/storage/${doctor.image}`);
      }
      const existingPreviews = {};
      for (let i = 1; i <= 5; i++) {
        const field = `image-${i}`;
        if (doctor[field]) {
          existingPreviews[field] = doctor[field].startsWith('http') ? doctor[field] : `http://localhost:8080/storage/${doctor[field]}`;
        }
      }
      setGalleryPreviews(existingPreviews);
    } else {
      setFormData({
        name: '',
        specialty: '',
        price: '',
        number: '',
        location: '',
        tow_location: '',
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
    if (!formData.name) newErrors.name = 'اسم الطبيب مطلوب';
    if (!formData.specialty) newErrors.specialty = 'التخصص مطلوب';
    if (!formData.price) newErrors.price = 'سعر الكشف مطلوب';
    if (!formData.number) newErrors.number = 'رقم الهاتف مطلوب';
    if (!formData.location) newErrors.location = 'العنوان / المدينة مطلوب';
    if (!isEdit && !mainImage) newErrors.image = 'الصورة الشخصية مطلوبة';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const postData = new FormData();
    Object.keys(formData).forEach((key) => {
      postData.append(key, formData[key]);
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
        showNotification('تم إضافة الطبيب بنجاح إلى المنظومة', 'success');
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
      title={isEdit ? `تعديل بيانات الطبيب: ${doctor?.name}` : 'إضافة طبيب جديد'}
      maxWidth="750px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
            <label className="form-label required">سعر الكشف (ر.س)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="مثال: 150"
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div>
            <label className="form-label required">رقم الهاتف / التواصل</label>
            <input
              type="text"
              name="number"
              className="form-input"
              value={formData.number}
              onChange={handleChange}
              placeholder="مثال: 0501234567"
              dir="ltr"
            />
            {errors.number && <span className="field-error">{errors.number}</span>}
          </div>

          <div>
            <label className="form-label required">العنوان الرئيسي / المدينة</label>
            <input
              type="text"
              name="location"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="مثال: الرياض - حي الملز"
            />
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>

          <div>
            <label className="form-label">العنوان الثانوي / تفاصيل العيادة</label>
            <input
              type="text"
              name="tow_location"
              className="form-input"
              value={formData.tow_location}
              onChange={handleChange}
              placeholder="مثال: مبنى النخبة الطبي، الطابق الثاني"
            />
          </div>

          <div>
            <label className="form-label required">حالة الطبيب</label>
            <select name="status" className="form-input" value={formData.status} onChange={handleChange}>
              <option value="active">نشط (متاح للحجز)</option>
              <option value="inactive">غير نشط (معطل مؤقتاً)</option>
            </select>
          </div>

          <div>
            <label className="form-label required">حالة الاشتراك</label>
            <select name="subscription" className="form-input" value={formData.subscription} onChange={handleChange}>
              <option value="subscribed">مشترك بالمنظومة</option>
              <option value="not_subscribed">غير مشترك</option>
            </select>
          </div>
        </div>

        {/* Main Profile Image Upload */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <label className={`form-label ${!isEdit ? 'required' : ''}`}>الصورة الشخصية الرئيسية للطبيب</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            {mainImagePreview ? (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid var(--primary-color)',
                  position: 'relative',
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
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <ImageIcon size={28} />
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
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-main)',
              }}
            >
              <Upload size={16} />
              <span>{mainImagePreview ? 'تغيير الصورة' : 'رفع صورة'}</span>
              <input type="file" accept="image/*" onChange={handleMainImageChange} style={{ display: 'none' }} />
            </label>
          </div>
          {errors.image && <span className="field-error">{errors.image}</span>}
        </div>

        {/* Clinic Gallery Uploads (image-1 to image-5) */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <label className="form-label">صور العيادة والمرفقات (اختياري - حتى 5 صور)</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px',
              marginTop: '10px',
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
                    padding: '8px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-main)',
                    position: 'relative',
                  }}
                >
                  {preview ? (
                    <div style={{ height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '6px' }}>
                      <img src={preview} alt={`صورة ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: '70px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <ImageIcon size={20} />
                      <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>عيادة {idx}</span>
                    </div>
                  )}

                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
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

        {/* Form Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            marginTop: '8px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={submitting}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting && <Loader2 size={16} className="spin-animation" />}
            <span>{isEdit ? 'حفظ التعديلات' : 'إضافة الطبيب'}</span>
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default DoctorForm;
