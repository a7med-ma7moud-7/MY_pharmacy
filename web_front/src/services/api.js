import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || API_BASE_URL
).replace(/\/api(\/v1)?\/?$/, '');

export const AUTH_TOKEN_KEY = 'saydalety_token';

export const resolveStorageUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.replace(/^\/+/, '');
  if (clean.startsWith('storage/') || clean.startsWith('asset/')) {
    return `${BACKEND_URL}/${clean}`;
  }
  return `${BACKEND_URL}/storage/${clean}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const doctorService = {
  getDoctors: (params = {}) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getDoctorCase: (doctorId, caseId) => api.get(`/doctors/${doctorId}/cases/${caseId}`),
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
  askAI: (question, chatId = null, guestSessionToken = null) =>
    api.post('/ask-ai', {
      question,
      ...(chatId ? { chat_id: chatId } : {}),
      ...(!chatId && guestSessionToken ? { guest_session_token: guestSessionToken } : {}),
    }),
  askQuestion: (question, chatId = null, guestSessionToken = null) =>
    api.post('/ask-ai', {
      question,
      ...(chatId ? { chat_id: chatId } : {}),
      ...(!chatId && guestSessionToken ? { guest_session_token: guestSessionToken } : {}),
    }),
  getSuggestedQuestions: (lang = 'ar') =>
    api.get('/ai-suggested-questions', { params: { lang } }),
  getChats: () => api.get('/ai-chats'),
  createChat: (data = {}) => api.post('/ai-chats', data),
  getChat: (id) => api.get(`/ai-chats/${id}`),
  deleteChat: (id) => api.delete(`/ai-chats/${id}`),
  endGuestSession: (guestSessionToken) =>
    api.delete('/ai-guest-session', {
      data: { guest_session_token: guestSessionToken },
    }),
  submitFeedback: (payload) => api.post('/ai-feedback', payload),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
};

export const patientPortalService = {
  getOverview: () => api.get('/patient/overview'),
  getChats: () => api.get('/patient/chats'),
  startChatWithDoctor: (doctorId) => api.post('/patient/chats/start', { doctor_id: doctorId }),
  getChat: (conversationId) => api.get(`/patient/chats/${conversationId}`),
  sendChatMessage: (conversationId, dataOrFormData) =>
    api.post(`/patient/chats/${conversationId}/messages`, dataOrFormData),
};

export const doctorPortalService = {
  // Dashboard & Appointments
  getDashboard: () => api.get('/doctor/dashboard'),
  updateAppointmentStatus: (id, status) =>
    api.patch(`/doctor/appointments/${id}/status`, { status }),

  // Profile
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (formData) => {
    if (formData instanceof FormData) {
      formData.append('_method', 'PUT');
      return api.post('/doctor/profile', formData);
    }
    return api.put('/doctor/profile', formData);
  },

  // Treated Cases
  getCases: (params = {}) => api.get('/doctor/cases', { params }),
  getCase: (id) => api.get(`/doctor/cases/${id}`),
  createCase: (formData) => api.post('/doctor/cases', formData),
  updateCase: (id, formData) => {
    if (formData instanceof FormData) {
      formData.append('_method', 'PUT');
      return api.post(`/doctor/cases/${id}`, formData);
    }
    return api.put(`/doctor/cases/${id}`, formData);
  },
  deleteCase: (id) => api.delete(`/doctor/cases/${id}`),

  // Reviews
  getReviews: (params = {}) => api.get('/doctor/reviews', { params }),
  reportReview: (id, reportReason) =>
    api.post(`/doctor/reviews/${id}/report`, { report_reason: reportReason }),

  // Patients & Scoped Medical Records
  getPatients: (params = {}) => api.get('/doctor/patients', { params }),
  getPatientRecords: (patientKey) =>
    api.get(`/doctor/patients/${encodeURIComponent(patientKey)}/records`),

  // Chat
  getChats: () => api.get('/doctor/chats'),
  startChatWithPatient: (patientUserId) =>
    api.post('/doctor/chats/start', { patient_user_id: patientUserId }),
  getChat: (conversationId) => api.get(`/doctor/chats/${conversationId}`),
  sendChatMessage: (conversationId, dataOrFormData) =>
    api.post(`/doctor/chats/${conversationId}/messages`, dataOrFormData),

  // Prescriptions
  getMedicinesCatalog: (search = '') =>
    api.get('/doctor/medicines-catalog', { params: search ? { search } : {} }),
  getPrescriptions: (params = {}) => api.get('/doctor/prescriptions', { params }),
  getPrescription: (id) => api.get(`/doctor/prescriptions/${id}`),
  createPrescription: (payload) => api.post('/doctor/prescriptions', payload),
  updatePrescriptionStatus: (id, status) =>
    api.patch(`/doctor/prescriptions/${id}/status`, { status }),

  // Follow-ups
  getFollowUps: (params = {}) => api.get('/doctor/follow-ups', { params }),
  createFollowUp: (payload) => api.post('/doctor/follow-ups', payload),
  updateFollowUp: (id, payload) => api.put(`/doctor/follow-ups/${id}`, payload),
  deleteFollowUp: (id) => api.delete(`/doctor/follow-ups/${id}`),
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
