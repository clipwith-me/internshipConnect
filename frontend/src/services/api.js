// frontend/src/services/api.js
import axios from 'axios';

/**
 * 🎓 LEARNING: Axios API Client
 * 
 * Axios is an HTTP client for making API requests.
 * We configure it once and use throughout the app.
 * 
 * Features:
 * - Base URL configuration
 * - Automatic token attachment
 * - Token refresh on 401 errors
 * - Request/response interceptors
 * - Error handling
 */

// ═══════════════════════════════════════════════════════════
// API CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// ═══════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR
// ═══════════════════════════════════════════════════════════

/**
 * Automatically attach access token to requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR
// ═══════════════════════════════════════════════════════════

/**
 * Handle token refresh on 401 errors
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }
      
      try {
        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        );
        
        const { accessToken } = response.data.data;
        
        // Save new token
        localStorage.setItem('accessToken', accessToken);
        
        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        
        isRefreshing = false;
        
        // Retry original request
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.clear();
        window.location.href = '/auth/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Return other errors
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// API METHODS
// ═══════════════════════════════════════════════════════════

/**
 * Authentication endpoints
 */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

/**
 * Student endpoints
 */
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getRecommendations: () => api.get('/students/recommendations'),
  getApplications: () => api.get('/students/applications'),
  createApplication: (data) => api.post('/students/applications', data),
};

/**
 * Organization endpoints
 */
export const organizationAPI = {
  getProfile: () => api.get('/organizations/profile'),
  updateProfile: (data) => api.put('/organizations/profile', data),
  getInternships: () => api.get('/organizations/internships'),
  createInternship: (data) => api.post('/organizations/internships', data),
  updateInternship: (id, data) => api.put(`/organizations/internships/${id}`, data),
  deleteInternship: (id) => api.delete(`/organizations/internships/${id}`),
  getApplications: (internshipId) => api.get(`/organizations/internships/${internshipId}/applications`),
};

/**
 * Internship endpoints (public)
 */
export const internshipAPI = {
  getAll: (params) => api.get('/internships', { params }),
  getById: (id) => api.get(`/internships/${id}`),
  apply: (id, data) => api.post(`/internships/${id}/apply`, data),
  search: (query) => api.get('/internships/search', { params: { q: query } }),
};

/**
 * Resume endpoints
 */
export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  generateAI: (data) => api.post('/resumes/ai-generate', data),
  delete: (id) => api.delete(`/resumes/${id}`),
};

/**
 * Payment endpoints
 */
export const paymentAPI = {
  getHistory: () => api.get('/payments'),
  createCheckout: (data) => api.post('/payments/checkout', data),
  verifyPayment: (id) => api.get(`/payments/verify/${id}`),
};

export default api;

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Import specific API
 * import { authAPI } from './services/api';
 * 
 * // Login
 * try {
 *   const response = await authAPI.login({ email, password });
 *   const { user, tokens } = response.data.data;
 *   
 *   // Save tokens
 *   localStorage.setItem('accessToken', tokens.accessToken);
 *   localStorage.setItem('refreshToken', tokens.refreshToken);
 * } catch (error) {
 *   console.error('Login failed:', error.response?.data?.message);
 * }
 * 
 * // Get current user
 * const response = await authAPI.getMe();
 * const user = response.data.data.user;
 * 
 * // Search internships
 * const response = await internshipAPI.search('software engineer');
 * const internships = response.data.data;
 */