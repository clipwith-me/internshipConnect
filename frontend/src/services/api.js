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
 * ✅ UPDATED: Handle FormData properly by letting browser set Content-Type
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FIX: If data is FormData, delete Content-Type so browser sets it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
 * ✅ FIXED: Added 403 handling, retry limits, proper header updates
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

    // ✅ FIX: Handle 403 Forbidden - only redirect if account is deactivated
    // Don't redirect for role-based access denials (let the component handle it)
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || '';
      // Only redirect to login if account is deactivated
      if (errorMessage.includes('deactivated')) {
        localStorage.clear();
        window.location.href = '/auth/login';
      }
      // ✅ PRODUCTION: Silently reject role-based access denials
      // Components handle these gracefully, no need to pollute console
      return Promise.reject(error);
    }

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

      // ✅ FIX: Mark that we've tried to refresh (retry only once)
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.log('No refresh token available - redirecting to login');
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        console.log('Access token expired - attempting refresh...');

        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;

        // ✅ FIX: Save new token FIRST
        localStorage.setItem('accessToken', accessToken);

        // ✅ FIX: Update headers in correct order
        // 1. Update default headers for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        // 2. Update original request header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        console.log('Token refreshed successfully - retrying original request');

        // ✅ FIX: Process queue BEFORE retrying original request
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry original request with new token
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.data?.message || refreshError.message);
        console.log('Redirecting to login...');

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
  forgotPassword: (data) => api.post('/auth/forgot-password', data), // expects { email }
  resetPassword: (data) => api.post(`/auth/reset-password/${data.token}`, { password: data.password }),
  changePassword: (data) => api.put('/auth/change-password', data), // expects { currentPassword, newPassword }
};

/**
 * Student endpoints
 */
export const studentAPI = {
  getProfile: (config) => api.get('/students/profile', config),
  updateProfile: (data) => api.put('/students/profile', data),
  getRecommendations: () => api.get('/students/recommendations'),
  // ✅ FIX: Applications are under /applications endpoint, not /students/applications
  getApplications: () => api.get('/applications'),
  createApplication: (data) => api.post('/applications', data),
  // ✅ Profile picture upload
  uploadProfilePicture: (formData) => api.post('/students/profile/picture', formData),
  // Search students (for organizations)
  search: (params) => api.get('/students/search', { params }),
  // Toggle featured profile (Pro feature)
  toggleFeatured: (isFeatured) => api.put('/students/featured', { isFeatured }),
};

export const internshipAPI = {
  getAll: (params) => api.get('/internships', { params }),
  getById: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
  publish: (id) => api.patch(`/internships/${id}/publish`),
  // ✅ FIX: Accept config for signal (AbortController)
  getMyInternships: (config) => api.get('/internships/my-internships', config),
};

/**
 * Application endpoints
 */
export const applicationAPI = {
  submit: (data) => api.post('/applications', data),
  // ✅ FIX: Accept config for signal (AbortController)
  getMyApplications: (config) => api.get('/applications', config),
  getInternshipApplications: (internshipId) => api.get(`/applications/internship/${internshipId}`),
  // ✅ OPTIMIZED: Get all org applications in single query with pagination
  getOrganizationApplications: (params = {}) => api.get('/applications/organization', { params }),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  withdraw: (id) => api.delete(`/applications/${id}`),
};

/**
 * Notification endpoints
 */
export const notificationAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  createTest: () => api.post('/notifications/test'),
};

/**
 * Organization endpoints
 */
export const organizationAPI = {
  getProfile: (config) => api.get('/organizations/profile', config),
  updateProfile: (data) => api.put('/organizations/profile', data),
  // ✅ FIX: Organizations get internships via /internships/my-internships
  getInternships: () => api.get('/internships/my-internships'),
  createInternship: (data) => api.post('/internships', data),
  updateInternship: (id, data) => api.put(`/internships/${id}`, data),
  deleteInternship: (id) => api.delete(`/internships/${id}`),
  // ✅ FIX: Corrected applications endpoint
  getApplications: (internshipId) => api.get(`/applications/internship/${internshipId}`),
  // ✅ Logo upload
  uploadLogo: (formData) => api.post('/organizations/profile/logo', formData),
};


/**
 * Resume endpoints
 */
export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  generate: (data) => api.post('/resumes/generate', data),
  generateAI: (data) => api.post('/resumes/ai-generate', data),
  delete: (id) => api.delete(`/resumes/${id}`),
  // Organization viewing applicant profile
  viewApplicant: (applicationId) => api.get(`/resumes/applicant/${applicationId}`),
};

/**
 * Premium features endpoints
 */
export const premiumAPI = {
  // Get overall premium features status and usage
  getFeatures: () => api.get('/premium/features'),

  // Resume optimization tips (Premium/Pro)
  getResumeTips: (resumeId) => api.get(`/premium/resume-tips/${resumeId}`),

  // Interview preparation guide (Premium/Pro)
  getInterviewGuide: (internshipId) => api.get(`/premium/interview-guide/${internshipId}`),

  // Priority support eligibility
  checkPrioritySupport: () => api.get('/premium/priority-support/check'),

  // Priority badge data
  getPriorityBadge: () => api.get('/premium/priority-badge'),
};

/**
 * Messaging endpoints (Pro Feature)
 */
export const messagingAPI = {
  // Get all conversations for current user
  getConversations: () => api.get('/messages/conversations'),

  // Start new conversation with organization
  startConversation: (data) => api.post('/messages/conversations', data),
  // data: { recipientId, internshipId?, initialMessage }

  // Get messages in a conversation
  getMessages: (conversationId, params = {}) =>
    api.get(`/messages/conversations/${conversationId}`, { params }),
  // params: { page, limit }

  // Send message in conversation
  sendMessage: (conversationId, data) =>
    api.post(`/messages/conversations/${conversationId}/messages`, data),
  // data: { content, attachments? }

  // Archive conversation
  archiveConversation: (conversationId) =>
    api.delete(`/messages/conversations/${conversationId}`),

  // Get unread message count
  getUnreadCount: () => api.get('/messages/unread-count'),
};

/**
 * Payment/Subscription endpoints
 */
export const paymentAPI = {
  // Subscription management
  createCheckout: (plan, billingPeriod = 'monthly') =>
    api.post('/payments/create-checkout', { plan, billingPeriod }),
  getSubscription: () => api.get('/payments/subscription'),
  getPlans: () => api.get('/payments/plans'),
  createPortal: () => api.post('/payments/portal'),
  cancelSubscription: () => api.post('/payments/cancel'),

  // Payment history
  getHistory: () => api.get('/payments'),
  verifyPayment: (id) => api.get(`/payments/verify/${id}`),
};

/**
 * Analytics endpoints (Organizations only)
 */
export const analyticsAPI = {
  // Get organization overview analytics with time range
  getOverview: (timeRange = '30d') =>
    api.get(`/analytics/organization?timeRange=${timeRange}`),

  // Get quick summary for dashboard
  getSummary: () =>
    api.get('/analytics/summary'),

  // Get analytics for specific internship
  getInternshipAnalytics: (internshipId) =>
    api.get(`/analytics/internship/${internshipId}`)
};

/**
 * AI Matching endpoints
 */
export const matchingAPI = {
  getRecommendations: (limit = 10) => api.get(`/matching/recommendations?limit=${limit}`),
  getMatchScore: (internshipId) => api.get(`/matching/score/${internshipId}`),
};

/**
 * Admin endpoints
 */
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: (timeRange = '30d') => api.get(`/admin/analytics?timeRange=${timeRange}`),
  getRecentActivity: (limit = 10) => api.get(`/admin/activity?limit=${limit}`),
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