import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '/storage');

/**
 * Resolves an image URL from a model record or raw path string
 */
export const resolveImageUrl = (itemOrPath, fallback = '') => {
  if (!itemOrPath) return fallback;
  if (typeof itemOrPath === 'object') {
    if (itemOrPath.image_url) return itemOrPath.image_url;
    itemOrPath = itemOrPath.image;
  }
  if (!itemOrPath || typeof itemOrPath !== 'string') return fallback;
  if (itemOrPath.startsWith('http://') || itemOrPath.startsWith('https://')) {
    return itemOrPath;
  }
  const clean = itemOrPath.replace(/^\/+/, '');
  if (clean.startsWith('storage/')) {
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}/${clean}`;
  }
  return `${STORAGE_BASE_URL}/${clean}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  me: () => api.get('/admin/me'),

  // Dashboard & Reports
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: () => api.get('/admin/reports'),

  // Doctors
  getDoctors: (params) => api.get('/admin/doctors', { params }),
  getDoctor: (id) => api.get(`/admin/doctors/${id}`),
  createDoctor: (formData) =>
    api.post('/admin/doctors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateDoctor: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/admin/doctors/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),

  // Medicines
  getMedicines: (params) => api.get('/admin/medicines', { params }),
  getMedicine: (id) => api.get(`/admin/medicines/${id}`),
  createMedicine: (formData) =>
    api.post('/admin/medicines', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMedicine: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/admin/medicines/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateMedicineStock: (id, count) => api.patch(`/admin/medicines/${id}/stock`, { count }),
  deleteMedicine: (id) => api.delete(`/admin/medicines/${id}`),

  // Appointments
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getAppointment: (id) => api.get(`/admin/appointments/${id}`),
  updateAppointmentStatus: (id, status) =>
    api.patch(`/admin/appointments/${id}/status`, { status }),
  deleteAppointment: (id) => api.delete(`/admin/appointments/${id}`),

  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  exportOrders: () => api.get('/admin/orders/export', { responseType: 'blob' }),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
