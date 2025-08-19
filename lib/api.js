// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token"); // or wherever you store it
}

export const api = {
  // Base fetch function
  fetch: async (endpoint, options = {}) => {
    const {
      auth = "auto",          // 'auto' | true | false
      headers: extraHeaders,
      ...rest
    } = options;

    const url = `${API_BASE_URL}/api/v1${endpoint}`;
    const token = getToken();

    // Decide whether to attach Authorization header
    const shouldAttach =
      auth === true ? true :
      auth === false ? false :
      !!token; // 'auto'

    if (auth === true && !token) {
      throw new Error("Authentication required");
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(shouldAttach && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders || {}),
    };

    const config = {
      headers,
      credentials: 'include', // keep this for your sessionId cookie use-case
      ...rest,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        // Try to parse backend error shape
        let payload;
        try { payload = await response.json(); } catch {}
        const msg =
          payload?.message ||
          payload?.error?.message ||
          (Array.isArray(payload?.error) ? payload.error.map(e => e.message).join(", ") : null) ||
          'API request failed';

        // Optionally, handle 401 globally
        if (response.status === 401) {
          // e.g. auto-logout, or show toast
          // localStorage.removeItem("access_token");
        }

        throw new Error(msg);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // -------------------------
  // Auth endpoints
  // -------------------------
  auth: {
    login: (credentials) => api.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      auth: false, // public
    }),
    register: (userData) => api.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      auth: false, // public
    }),
    logout: () => api.fetch('/auth/logout', {
      method: 'POST',
      auth: 'auto', // either public or protected on your backend; 'auto' is fine
    }),
      changePassword: (payload) => api.fetch('/auth/changepassword', {
    method: 'PUT',
    body: JSON.stringify(payload), // { oldPassword, password }
    auth: true,
  }),
  },

  // -------------------------
  // Product endpoints (public)
  // -------------------------
  products: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/products?${searchParams.toString()}`, { auth: false });
    },
    getById: (id) => api.fetch(`/products/${id}`, { auth: false }),
    getByCategory: (categoryId, params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/products?categoryId=${categoryId}&${searchParams.toString()}`, { auth: false });
    },
    getDetail: (id) => api.fetch(`/products/${id}`, { auth: false }),
  },

  variants: {
    list: (productId, params = {}) => {
      const sp = new URLSearchParams(params);
      const qs = sp.toString() ? `?${sp.toString()}` : '';
      return api.fetch(`/products/${productId}/variants${qs}`, { auth: false });
    },
  },

  // -------------------------
  // Cart endpoints (usually public, server-side uses sessionId cookie)
  // -------------------------
  cart: {
    get: () => api.fetch('/shoppingcart', { auth: false }),
    addItem: (productId, quantity = 1) => api.fetch('/shoppingcart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
      auth: false,
    }),
    updateItem: (itemId, quantity) => api.fetch(`/shoppingcart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
      auth: false,
    }),
    removeItem: (itemId) => api.fetch(`/shoppingcart/${itemId}`, {
      method: 'DELETE',
      auth: false,
    }),
    clear: () => api.fetch('/shoppingcart/clear', { method: 'DELETE', auth: false }),
  },

  // -------------------------
  // Orders (usually protected)
  // -------------------------
  orders: {
    create: (orderData) => api.fetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
      auth: true,
    }),
    getMyOrders: () => api.fetch('/orders/my-orders', { auth: true }),
    getById: (id) => api.fetch(`/orders/${id}`, { auth: true }),
  },

  // -------------------------
  // User (protected)
  // -------------------------
  user: {
    getProfile: () => api.fetch('/users/getuserdetail', { auth: true }),
    updateProfile: (userData) => api.fetch('/users/edituserdetail', {
      method: 'PUT',
      body: JSON.stringify(userData),
      auth: true,
    }),
  },

  // -------------------------
  // Wishlist (protected)
  // -------------------------
  wishlist: {
    get: () => api.fetch('/wishlists', { auth: true }),
    add: (productId) => api.fetch('/wishlists', {
      method: 'POST',
      body: JSON.stringify({ productId }),
      auth: true,
    }),
    remove: (productId) => api.fetch(`/wishlists/${productId}`, {
      method: 'DELETE',
      auth: true,
    }),
  },

  // -------------------------
  // Categories (public)
  // -------------------------
  categories: {
    getAll: () => api.fetch('/categories', { auth: false }),
    getById: (id) => api.fetch(`/categories/${id}`, { auth: false }),
    getTree: () => api.fetch('/categories/tree/all', { auth: false }),
  },

  // -------------------------
  // Reviews
  // -------------------------
  reviews: {
    addOrUpdate: (productId, { rating, review }) =>
      api.fetch(`/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, review }),
        auth: true, // must be logged in
      }),

    getForProduct: (productId, params = {}) => {
      const sp = new URLSearchParams(params);
      const qs = sp.toString() ? `?${sp.toString()}` : "";
      return api.fetch(`/products/${productId}/reviews${qs}`, { auth: false }); // public
    },

    getMine: (params = {}) => {
      const sp = new URLSearchParams(params);
      const qs = sp.toString() ? `?${sp.toString()}` : "";
      return api.fetch(`/reviews/my${qs}`, { auth: true }); // protected
    },

    deleteMy: (productId) =>
      api.fetch(`/products/${productId}/reviews`, { method: "DELETE", auth: true }),
  },
};

export default api;
