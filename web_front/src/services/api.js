import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const doctorService = {
  getDoctors: (params = {}) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
};

export const medicineService = {
  getMedicines: (params = {}) => api.get('/medicines', { params }),
  getMedicine: (id) => api.get(`/medicines/${id}`),
};

export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  checkOrderStatus: (data) => api.post('/orders/check', data),
};

export const appointmentService = {
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  getAppointment: (id) => api.get(`/appointments/${id}`),
};

export const ratingService = {
  submitRating: (ratingData) => api.post('/ratings', ratingData),
};

export const aiService = {
  askAI: (question) => api.post('/ask-ai', { question }),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
};

export const getDoctors = doctorService.getDoctors;
export const getDoctor = doctorService.getDoctor;
export const getMedicines = medicineService.getMedicines;
export const getMedicine = medicineService.getMedicine;
export const createOrder = orderService.createOrder;
export const checkOrderStatus = orderService.checkOrderStatus;
export const createAppointment = appointmentService.createAppointment;
export const getAppointment = appointmentService.getAppointment;
export const submitRating = ratingService.submitRating;
export const askAi = aiService.askAI;
export const askAI = aiService.askAI;

export default api;
