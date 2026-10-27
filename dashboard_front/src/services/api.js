import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1/admin';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Bearer Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and redirect to Login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
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
  login: (credentials) => apiClient.post('/auth/login', credentials),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),

  // Dashboard Overview
  getDashboard: () => apiClient.get('/dashboard'),

  // Doctors
  getDoctors: (params) => apiClient.get('/doctors', { params }),
  getDoctor: (id) => apiClient.get(`/doctors/${id}`),
  createDoctor: (formData) => apiClient.post('/doctors', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateDoctor: (id, formData) => apiClient.post(`/doctors/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDoctor: (id) => apiClient.delete(`/doctors/${id}`),

  // Medicines
  getMedicines: (params) => apiClient.get('/medicines', { params }),
  getMedicine: (id) => apiClient.get(`/medicines/${id}`),
  createMedicine: (formData) => apiClient.post('/medicines', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateMedicine: (id, formData) => apiClient.post(`/medicines/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateMedicineStock: (id, count) => apiClient.patch(`/medicines/${id}/stock`, { count }),
  deleteMedicine: (id) => apiClient.delete(`/medicines/${id}`),

  // Appointments
  getAppointments: (params) => apiClient.get('/appointments', { params }),
  getAppointment: (id) => apiClient.get(`/appointments/${id}`),
  updateAppointmentStatus: (id, status) => apiClient.patch(`/appointments/${id}/status`, { status }),
  deleteAppointment: (id) => apiClient.delete(`/appointments/${id}`),

  // Orders
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
  exportOrders: () => apiClient.get('/orders-export', { responseType: 'blob' }),

  // Reports
  getReports: () => apiClient.get('/reports'),

  // Users
  getUsers: (params) => apiClient.get('/users', { params }),
  getUser: (id) => apiClient.get(`/users/${id}`),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};

export default apiClient;
