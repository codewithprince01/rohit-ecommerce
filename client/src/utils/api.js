import axios from 'axios';
import toast from 'react-hot-toast';

// API base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with secure defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for refresh token cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add access token from memory
api.interceptors.request.use(
  (config) => {
    // Get token from AuthContext (we'll need to access this differently)
    // For now, we'll use a temporary approach
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using refresh token cookie
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (refreshResponse.data.success && refreshResponse.data.data.accessToken) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          
          // Update token in sessionStorage
          sessionStorage.setItem('accessToken', newAccessToken);
          
          // Update original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear token and redirect to login
        sessionStorage.removeItem('accessToken');
        
        // Only redirect if we're on an admin or protected page
        if (window.location.pathname.startsWith('/admin') || 
            window.location.pathname.startsWith('/profile')) {
          window.location.href = '/login';
        }
        
        // Show toast for authentication failure
        toast.error('Session expired. Please login again.');
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other error responses
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Show toast for server errors (5xx) and client errors (4xx except 401/403)
    if (error.response?.status >= 400 && error.response?.status !== 401 && error.response?.status !== 403) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Helper function to set access token (to be called from AuthContext)
export const setAccessToken = (token) => {
  sessionStorage.setItem('accessToken', token);
};

// Helper function to get access token
export const getAccessToken = () => {
  return sessionStorage.getItem('accessToken');
};

// Helper function to clear access token
export const clearAccessToken = () => {
  sessionStorage.removeItem('accessToken');
};

// Helper functions for common API calls
export const apiHelper = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  getSalesAnalytics: (days = 7) => api.get(`/orders/analytics?days=${days}`),
  
  // Products
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Categories
  getCategories: (params) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  
  // Orders
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  getOrderStats: (period) => api.get(`/orders/stats?period=${period}`),
  
  // Inventory
  getInventory: (params) => api.get('/inventory', { params }),
  adjustStock: (productId, data) => api.put(`/inventory/${productId}/adjust`, data),
  getInventoryStats: () => api.get('/inventory/stats'),
  getLowStockAlerts: () => api.get('/inventory/alerts/low-stock'),
  
  // Customers
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  getCustomerStats: () => api.get('/customers/stats'),
  
  // Coupons
  getCoupons: (params) => api.get('/coupons', { params }),
  getCoupon: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  logoutAll: () => api.post('/auth/logout-all'),
  
  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  
  // Contact
  sendContact: (data) => api.post('/contact', data),
  getMessages: (params) => api.get('/contact', { params }),
};

export default api;
