import axios from 'axios';
import toast from 'react-hot-toast';

// API base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor - handle errors and refresh token
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
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true
        });

        // Save new token
        const { accessToken } = response.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're on an admin page
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other error responses
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Don't show toast for certain errors
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      // Toast is optional here, components can handle errors themselves
    }

    return Promise.reject(error);
  }
);

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
  getProfile: () => api.get('/auth/profile'),
  
  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  
  // Contact
  sendContact: (data) => api.post('/contact', data),
  getMessages: (params) => api.get('/contact', { params }),
};

export default api;
