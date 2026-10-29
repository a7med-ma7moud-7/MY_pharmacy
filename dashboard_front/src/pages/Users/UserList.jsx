import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
import { useNotification } from '../../context/NotificationContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { UserForm } from './UserForm';

export const UserList = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
      };
      const res = await adminApi.getUsers(params);
      if (res.data.success) {
        setUsers(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      showNotification('فشل تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchTerm, roleFilter]);

  const handleOpenAdd = () => {
    setSelectedUserForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUserForEdit(user);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = (user) => {
    if (currentAdmin && currentAdmin.id === user.id) {
      showNotification('لا يمكنك حذف حسابك الشخصي المسجل به حالياً', 'warning');
      return;
    }
    setUserToDelete(user);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(userToDelete.id);
      showNotification(`تم حذف المستخدم (${userToDelete.name}) بنجاح`, 'success');
      setUserToDelete(null);
      fetchUsers(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'فشل حذف المستخدم', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
            إدارة المستخدمين والمسؤولين
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            إجمالي الحسابات المسجلة: <strong style={{ color: 'var(--primary-color)' }}>{total}</strong> حساب
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Filters Box */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          >
            <Search size={18} />
          </div>
          <input
            type="text"
            className="form-input"
            style={{ paddingRight: '38px' }}
            placeholder="البحث باسم المستخدم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">جميع الصلاحيات والأدوار</option>
            <option value="admin">المسؤولين (Admins)</option>
            <option value="user">العملاء والمستخدمين (Users)</option>
          </select>
        </div>

        <button
          onClick={() => fetchUsers(currentPage)}
          className="btn btn-outline"
          title="تحديث البيانات"
          style={{ padding: '9px 12px' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Main Users Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner variant="skeleton-table" />
        ) : users.length === 0 ? (
          <EmptyState
            title="لا يوجد مستخدمون مطابقون"
            description="لم يتم العثور على أي حسابات وفق معايير البحث الحالية."
            actionText="إضافة مستخدم جديد"
            onAction={handleOpenAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الصلاحية</th>
                  <th>تاريخ التسجيل</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = currentAdmin && currentAdmin.id === u.id;

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: u.role === 'admin' ? '#0f172a' : 'var(--primary-color)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                                  (أنت)
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                      <td>
                        <Badge variant={u.role === 'admin' ? 'purple' : 'info'}>
                          {u.role === 'admin' ? 'مسؤول (Admin)' : 'مستخدم عادي'}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="btn btn-outline"
                            style={{ padding: '6px 8px', color: 'var(--info-color)' }}
                            title="تعديل المستخدم"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(u)}
                            className="btn btn-outline"
                            disabled={isCurrent}
                            style={{
                              padding: '6px 8px',
                              color: isCurrent ? 'var(--text-muted)' : 'var(--danger-color)',
                              cursor: isCurrent ? 'not-allowed' : 'pointer',
                              opacity: isCurrent ? 0.4 : 1,
                            }}
                            title={isCurrent ? 'لا يمكنك حذف حسابك' : 'حذف المستخدم'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              onPageChange={(page) => fetchUsers(page)}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={selectedUserForEdit}
        onSuccess={() => fetchUsers(currentPage)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title="تأكيد حذف المستخدم"
        maxWidth="440px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger-color)', margin: '0 auto 16px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
            هل أنت متأكد من رغبتك في حذف هذا الحساب؟
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            سيتم حذف بيانات المستخدم <strong style={{ color: 'var(--text-main)' }}>{userToDelete?.name}</strong> (
            {userToDelete?.email}) من المنظومة بشكل نهائي.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setUserToDelete(null)}
              className="btn btn-outline"
              disabled={deleting}
            >
              إلغاء التراجع
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={deleting}
              style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}
            >
              {deleting ? 'جاري الحذف...' : 'نعم، احذف المستخدم'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserList;
