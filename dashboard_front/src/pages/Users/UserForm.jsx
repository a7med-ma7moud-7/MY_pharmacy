import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/common/Dialog';
import { adminApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

export const UserForm = ({ isOpen, onClose, user, onSuccess }) => {
  const { showNotification } = useNotification();
  const isEdit = Boolean(user && user.id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.name) newErrors.name = 'اسم المستخدم مطلوب';
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    if (!isEdit && (!formData.password || formData.password.length < 8)) {
      newErrors.password = 'كلمة المرور يجب ألا تقل عن 8 أحرف';
    }
    if (isEdit && formData.password && formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب ألا تقل عن 8 أحرف';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEdit) {
        await adminApi.updateUser(user.id, payload);
        showNotification('تم تحديث بيانات المستخدم بنجاح', 'success');
      } else {
        await adminApi.createUser(payload);
        showNotification('تم إنشاء الحساب بنجاح', 'success');
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
      title={isEdit ? `تعديل المستخدم: ${user?.name}` : 'إضافة مستخدم أو مسؤول جديد'}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label className="form-label required">اسم المستخدم الكامل</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: محمد عبد العزيز"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div>
          <label className="form-label required">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div>
          <label className="form-label required">الدور والصلاحية</label>
          <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
            <option value="user">مستخدم / عميل عادي</option>
            <option value="admin">مسؤول لوحة التحكم (Admin)</option>
          </select>
        </div>

        <div>
          <label className={`form-label ${!isEdit ? 'required' : ''}`}>
            {isEdit ? 'كلمة المرور الجديدة (اتركه فارغاً للإبقاء على الحالية)' : 'كلمة المرور'}
          </label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="•••••••• (8 أحرف على الأقل)"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        {/* Modal Buttons */}
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
            <span>{isEdit ? 'حفظ التعديلات' : 'إنشاء المستخدم'}</span>
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default UserForm;
