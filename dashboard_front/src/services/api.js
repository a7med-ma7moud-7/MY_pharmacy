import axios from 'axios';

const RAW_API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080/api/v1/admin';

export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || RAW_API_URL
).replace(/\/api(\/v1)?(\/admin)?\/?$/, '');

const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '').endsWith('/v1/admin')
  ? RAW_API_URL.replace(/\/+$/, '')
  : `${BACKEND_URL}/api/v1/admin`;

export const STORAGE_BASE_URL = `${BACKEND_URL}/storage`;

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
  if (clean.startsWith('storage/') || clean.startsWith('asset/')) {
    return `${BACKEND_URL}/${clean}`;
  }
  return `${STORAGE_BASE_URL}/${clean}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

// Response interceptor: handle 401/403 unauthorized (skip redirect on login endpoint itself)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = error.config?.url || '';
    const isAuthLogin = reqUrl.includes('/auth/login');
    if (
      !isAuthLogin &&
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
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
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),

  // Dashboard & Reports
  getDashboard: () => api.get('/dashboard'),
  getReports: () => api.get('/reports'),

  // Doctors
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  createDoctor: (formData) =>
    api.post('/doctors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateDoctor: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/doctors/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),

  // Medicines
  getMedicines: (params) => api.get('/medicines', { params }),
  getMedicine: (id) => api.get(`/medicines/${id}`),
  createMedicine: (formData) =>
    api.post('/medicines', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMedicine: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/medicines/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateMedicineStock: (id, count) => api.patch(`/medicines/${id}/stock`, { count }),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),

  // Appointments
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  updateAppointmentStatus: (id, status) =>
    api.patch(`/appointments/${id}/status`, { status }),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),

  // Orders
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  exportOrders: () => api.get('/orders-export', { responseType: 'blob' }),

  // Users
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
