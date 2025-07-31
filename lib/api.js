// API client for storefront
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const api = {
  // Base fetch function
  fetch: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: (credentials) => api.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (userData) => api.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    logout: () => api.fetch('/auth/logout', { method: 'POST' }),
  },

  // Product endpoints
  products: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/products?${searchParams.toString()}`);
    },
    getById: (id) => api.fetch(`/products/${id}`),
    getByCategory: (categoryId, params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/products?categoryId=${categoryId}&${searchParams.toString()}`);
    },
  },

  // Cart endpoints
  cart: {
    get: () => api.fetch('/shoppingcart'),
    addItem: (productId, quantity = 1) => api.fetch('/shoppingcart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
    updateItem: (itemId, quantity) => api.fetch(`/shoppingcart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
    removeItem: (itemId) => api.fetch(`/shoppingcart/${itemId}`, {
      method: 'DELETE',
    }),
    clear: () => api.fetch('/shoppingcart/clear', { method: 'DELETE' }),
  },

  // Order endpoints
  orders: {
    create: (orderData) => api.fetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
    getMyOrders: () => api.fetch('/orders/my-orders'),
    getById: (id) => api.fetch(`/orders/${id}`),
  },

  // User endpoints
  user: {
    getProfile: () => api.fetch('/users/profile'),
    updateProfile: (userData) => api.fetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  },

  // Wishlist endpoints
  wishlist: {
    get: () => api.fetch('/wishlists'),
    add: (productId) => api.fetch('/wishlists', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
    remove: (productId) => api.fetch(`/wishlists/${productId}`, {
      method: 'DELETE',
    }),
  },

  // Category endpoints
  categories: {
    getAll: () => api.fetch('/categories'),
    getById: (id) => api.fetch(`/categories/${id}`),
  },
};

export default api; 