import api from './api';

// Auth Services
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// Category Services
export const categoryService = {
  // Get all categories
  getAll: async (includeInactive = false) => {
    const response = await api.get(`/categories?includeInactive=${includeInactive}`);
    return response.data;
  },

  // Get category hierarchy
  getHierarchy: async () => {
    const response = await api.get('/categories/hierarchy');
    return response.data;
  },

  // Get category by slug
  getBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // Get subcategories by category
  getSubcategories: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}/subcategories`);
    return response.data;
  },

  // Get subcategory by slug
  getSubcategoryBySlug: async (slug) => {
    const response = await api.get(`/subcategories/slug/${slug}`);
    return response.data;
  },

  // Get sub-subcategories
  getSubSubCategories: async (subcategoryId) => {
    const response = await api.get(`/subcategories/${subcategoryId}/subsubcategories`);
    return response.data;
  },

  // Get sub-subcategory by slug
  getSubSubCategoryBySlug: async (slug) => {
    const response = await api.get(`/subsubcategories/slug/${slug}`);
    return response.data;
  },

  // Admin: Create category
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin: Update category
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin: Delete category
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Product Services
export const productService = {
  // Get all products with filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },

  // Get product by slug
  getBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get related products
  getRelated: async (id) => {
    const response = await api.get(`/products/${id}/related`);
    return response.data;
  },

  // Get featured products
  getFeatured: async (limit = 8) => {
    const response = await api.get(`/products/featured?limit=${limit}`);
    return response.data;
  },

  // Search products
  search: async (query, filters = {}) => {
    const params = { search: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },

  // Admin: Get product stats
  getStats: async () => {
    const response = await api.get('/products/admin/stats');
    return response.data;
  },

  // Admin: Create product
  create: async (productData) => {
    const response = await api.post('/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin: Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin: Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Admin: Delete product image
  deleteImage: async (id, imagePath) => {
    const response = await api.delete(`/products/${id}/images`, {
      data: { imagePath }
    });
    return response.data;
  },

  // Admin: Toggle product status
  toggleStatus: async (id) => {
    const response = await api.patch(`/products/${id}/toggle-status`);
    return response.data;
  },
};

// Contact Services
export const contactService = {
  // Submit contact form
  submit: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },

  // Admin: Get all messages
  getAll: async () => {
    const response = await api.get('/contact');
    return response.data;
  },

  // Admin: Delete message
  delete: async (id) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },
};

// Order Services
export const orderService = {
  // Log WhatsApp order
  logOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Admin: Get all orders
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders?${queryString}`);
    return response.data;
  },

  // Admin: Get order by ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

// Settings Services
export const settingsService = {
  // Get settings
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Admin: Update settings
  update: async (settingsData) => {
    const response = await api.put('/settings', settingsData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

export default {
  auth: authService,
  category: categoryService,
  product: productService,
  contact: contactService,
  order: orderService,
  settings: settingsService,
};
