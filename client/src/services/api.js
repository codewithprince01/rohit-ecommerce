import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Look for token in session storage (matching utils/api.js)
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true
        });

        const { accessToken } = response.data.data;
        sessionStorage.setItem('accessToken', accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
// Helper to get full image URL
export const getImageUrl = (image) => {
    if (!image) return null;
    
    // If it's an object with a URL property (from some legacy logic)
    const imgSource = typeof image === 'object' ? image.url : image;
    
    if (!imgSource) return null;
    
    // If it's already a full URL
    if (imgSource.startsWith('http')) return imgSource;
    
    // Clean up paths that start with / (prevent double slashes)
    const cleanPath = imgSource.startsWith('/') ? imgSource.slice(1) : imgSource;
    
    // Get base URL from environment (e.g., http://localhost:5000)
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');
    
    return `${baseUrl}/${cleanPath}`;
};

export default api;
