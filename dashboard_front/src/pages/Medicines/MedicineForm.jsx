import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { adminApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

export const MedicineForm = ({ isOpen, onClose, medicine, onSuccess }) => {
  const { showNotification } = useNotification();
  const isEdit = Boolean(medicine && medicine.id);

  const [formData, setFormData] = useState({
    name: '',
    propose: '',
    price: '',
    type: 'أقراص',
    count: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        propose: medicine.propose || '',
        price: medicine.price || '',
        type: medicine.type || 'أقراص',
        count: medicine.count !== undefined ? medicine.count : '',
      });
      if (medicine.image) {
        setImagePreview(
          medicine.image.startsWith('http')
            ? medicine.image
            : `http://localhost:8080/storage/${medicine.image}`
        );
      }
    } else {
      setFormData({
        name: '',
        propose: '',
        price: '',
        type: 'أقراص',
        count: '',
      });
      setImageFile(null);
      setImagePreview('');
    }
    setErrors({});
  }, [medicine, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.name) newErrors.name = 'اسم الدواء مطلوب';
    if (!formData.propose) newErrors.propose = 'الغرض أو دواعي الاستعمال مطلوبة';
    if (!formData.price) newErrors.price = 'السعر مطلوب';
    if (!formData.type) newErrors.type = 'الشكل الصيدلاني مطلوب';
    if (formData.count === '' || formData.count < 0) newErrors.count = 'كمية المخزون مطلوبة';
    if (!isEdit && !imageFile) newErrors.image = 'صورة عبوة الدواء مطلوبة';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const postData = new FormData();
    Object.keys(formData).forEach((key) => {
      postData.append(key, formData[key]);
    });

    if (imageFile) {
      postData.append('image', imageFile);
    }

    try {
      if (isEdit) {
        await adminApi.updateMedicine(medicine.id, postData);
        showNotification('تم تحديث بيانات الدواء بنجاح', 'success');
      } else {
        await adminApi.createMedicine(postData);
        showNotification('تمت إضافة صنف الدواء بنجاح إلى المخزون', 'success');
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
      title={isEdit ? `تعديل صنف الدواء: ${medicine?.name}` : 'إضافة صنف دواء جديد'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label className="form-label required">اسم الدواء التجاري / العلمي</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: بانادول إكسترا - Panadol Extra"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div>
          <label className="form-label required">دواعي الاستعمال والغرض الطبي</label>
          <input
            type="text"
            name="propose"
            className="form-input"
            value={formData.propose}
            onChange={handleChange}
            placeholder="مثال: مسكن للآلام وخافض للحرارة والصداع الشديد"
          />
          {errors.propose && <span className="field-error">{errors.propose}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label required">الشكل الدوائي (النوع)</label>
            <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
              <option value="أقراص">أقراص (Tablets)</option>
              <option value="كبسولات">كبسولات (Capsules)</option>
              <option value="شراب">شراب (Syrup)</option>
              <option value="حقن">حقن (Injections)</option>
              <option value="مرهم / كريم">مرهم / كريم (Ointment)</option>
              <option value="قطرات">قطرات (Drops)</option>
              <option value="بخاخ">بخاخ (Spray)</option>
              <option value="فوار">فوار (Effervescent)</option>
              <option value="أخرى">أخرى</option>
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          <div>
            <label className="form-label required">السعر (ر.س)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="مثال: 24.50"
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>
        </div>

        <div>
          <label className="form-label required">الكمية المتوفرة في المخزن (عبوة)</label>
          <input
            type="number"
            min="0"
            name="count"
            className="form-input"
            value={formData.count}
            onChange={handleChange}
            placeholder="مثال: 50"
          />
          {errors.count && <span className="field-error">{errors.count}</span>}
        </div>

        {/* Medicine Box Image */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <label className={`form-label ${!isEdit ? 'required' : ''}`}>صورة عبوة الدواء</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            {imagePreview ? (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid var(--primary-color)',
                }}
              >
                <img
                  src={imagePreview}
                  alt="معاينة الدواء"
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
              <span>{imagePreview ? 'تغيير الصورة' : 'رفع صورة الدواء'}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>
          {errors.image && <span className="field-error">{errors.image}</span>}
        </div>

        {/* Modal Buttons */}
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
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting && <Loader2 size={16} className="spin-animation" />}
            <span>{isEdit ? 'حفظ التعديلات' : 'إضافة الدواء'}</span>
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default MedicineForm;
