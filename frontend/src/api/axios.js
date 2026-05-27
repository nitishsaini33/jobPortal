import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Axios instance configured with:
 * - Base URL pointing to the Spring Boot backend
 * - Automatic JWT token attachment via request interceptor
 * - Automatic redirect to login on 401 responses
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach JWT token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smarthire_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 (unauthorized) ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smarthire_token');
      localStorage.removeItem('smarthire_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (data) => api.post('/auth/google', data),
};

// ── Jobs API ──
export const jobsAPI = {
  getOpenJobs: (page = 0, size = 10) =>
    api.get(`/jobs?page=${page}&size=${size}`),
  getJob: (id) => api.get(`/jobs/${id}`),
  getMyJobs: (page = 0, size = 10) =>
    api.get(`/jobs/my?page=${page}&size=${size}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  searchJobs: (params) => api.get('/jobs/search', { params }),
};

// ── Applications API ──
export const applicationsAPI = {
  apply: (applicationData, resumeFile) => {
    const formData = new FormData();
    formData.append(
      'application',
      new Blob([JSON.stringify(applicationData)], { type: 'application/json' })
    );
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    return api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMyApplications: (page = 0, size = 10) =>
    api.get(`/applications/my?page=${page}&size=${size}`),
  getApplicationsForJob: (jobId, status, page = 0, size = 10) => {
    let url = `/applications/job/${jobId}?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  updateStatus: (id, data) =>
    api.patch(`/applications/${id}/status`, data),
  downloadResume: (id) =>
    api.get(`/applications/${id}/resume`, { responseType: 'blob' }),
  searchCandidates: (params) =>
    api.get('/applications/search', { params }),
  withdraw: (id) => api.patch(`/applications/${id}/withdraw`),
};

export default api;
