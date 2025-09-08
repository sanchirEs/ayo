// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/** Client-д token авах */
async function getAccessTokenClient() {
  if (typeof window === "undefined") return null;
  const { getSession } = await import("next-auth/react");
  const s = await getSession();
  return s?.user?.accessToken || null;
}

/** Server-д token авах */
async function getAccessTokenServer() {
  if (typeof window !== "undefined") return null;
  const { auth } = await import("@/auth");
  const s = await auth();
  return s?.user?.accessToken || null;
}

export const api = {
  // -------- Base fetch ----------
  fetch: async (endpoint, options = {}) => {
    // ✅ default-ыг false болгов
    const {
      auth = false,                 // 'false' | true
      headers: extraHeaders,
      retries = 2,                  // Retry count for network errors
      retryDelay = 1000,            // Delay between retries in ms
      ...rest
    } = options;

    const url = `${API_BASE_URL}/api/v1${endpoint}`;

    // ✅ Токен зөвхөн auth === true үед л авна
    let token = null;
    if (auth === true) {
      token = typeof window === "undefined"
        ? await getAccessTokenServer()
        : await getAccessTokenClient();

        if (!token) {
        throw new Error("Authentication required");
      }
    }

    const headers = {
      "Content-Type": "application/json",
      ...(auth === true ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders || {}),
    };

    const config = {
      headers,
      // ✅ Protected үед cookie бүү дагуул (optional, илүү цэвэр)
      credentials: auth === true ? "omit" : "include",
      ...rest,
    };

    // Retry mechanism for network errors
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          let payload;
          try { 
            payload = await response.json(); 
          } catch (parseError) {
            // If JSON parsing fails, use status text
            payload = { message: response.statusText || `HTTP ${response.status}` };
          }
          
          const msg =
            payload?.message ||
            payload?.error?.message ||
            (Array.isArray(payload?.error) ? payload.error.map(e => e.message).join(", ") : null) ||
            `HTTP ${response.status}: ${response.statusText}`;

          // For 401/403 errors, provide specific authentication error message
          if (response.status === 401 || response.status === 403) {
            throw new Error("Invalid TOKEN");
          }
          
          // For 404 errors, provide more specific error message but don't throw for certain endpoints
          if (response.status === 404) {
            // Don't throw error for category and attribute endpoints, just return empty data
            if (endpoint.includes('/categories/') || endpoint.includes('/attributes') || endpoint.includes('/products')) {
              console.log(`Endpoint not found: ${endpoint}, returning empty data`);
              return { success: true, data: { products: [], pagination: { total: 0, totalPages: 1, currentPage: 1, limit: 10 } } };
            }
            throw new Error(`Not Found: ${endpoint}`);
          }

          throw new Error(msg);
        }
        
        const data = await response.json();
        return data || { success: true, data: [] };
      } catch (error) {
        lastError = error;
        
        // Only retry on network errors, not HTTP errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          // Network error - retry
          if (attempt < retries) {
            console.warn(`API request failed (attempt ${attempt + 1}/${retries + 1}):`, error.message);
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
            continue;
          }
        }
        
        // For HTTP errors or max retries reached, throw immediately
        break;
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("API request failed");
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

  flashSale: {
  active: () => api.fetch('/flash-sale/active', { auth: false }),
  timer:  () => api.fetch('/flash-sale/timer',  { auth: false }),
  products: (params = {}) => {
    const sp = new URLSearchParams(params);
    return api.fetch(`/flash-sale/products?${sp.toString()}`, { auth: false });
  },
},

  // -------------------------
  // Homepage (public)
  // -------------------------
  homepage: {
    bundled: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/homepage/bundled?${searchParams.toString()}`, { auth: false });
    },
    context: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/homepage/context?${searchParams.toString()}`, { auth: false });
    }
  },

  // -------------------------
  // Product endpoints (public)
  // -------------------------
  products: {
    // New enhanced products API - replaces old getAll and getByCategory
    enhanced: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/products/enhanced?${searchParams.toString()}`, { auth: false });
    },
    getById: (id) => api.fetch(`/products/${id}`, { auth: false }),
    getDetail: (id) => api.fetch(`/products/${id}`, { auth: false }),
    new: (params = {}) => {
      const sp = new URLSearchParams(params);
      return api.fetch(`/products/new?${sp.toString()}`, { auth: false });
    },
    discounted: (params = {}) => {
      const sp = new URLSearchParams(params);
      return api.fetch(`/products/discounted?${sp.toString()}`, { auth: false });
    },
    // Additional new endpoints from filter system
    byIds: (productIds, fields = 'basic') => api.fetch('/products/by-ids', {
      method: 'POST',
      body: JSON.stringify({ productIds, fields }),
      auth: false,
    }),
    related: (productId, params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/products/${productId}/related?${searchParams.toString()}`, { auth: false });
    },
    compare: (productIds) => api.fetch('/products/compare', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
      auth: false,
    }),
    filterPreview: (filters) => api.fetch('/products/filter-preview', {
      method: 'POST',
      body: JSON.stringify(filters),
      auth: false,
    }),
    trending: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/products/trending?${searchParams.toString()}`, { auth: false });
    },
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
    get: () => api.fetch('/shoppingcart/getcartitems', { auth: false }),
    addItem: (item) => api.fetch('/shoppingcart/addtocart', {
      method: 'POST',
      body: JSON.stringify(item),
      auth: false,
    }),
    updateItem: (itemId, quantity) => {
      // Backend doesn't have update endpoint, so we'll delete and re-add
      console.warn('Cart update not supported by backend, using local state only');
      return Promise.resolve({ success: true });
    },
    removeItem: (itemId) => api.fetch(`/shoppingcart/delete/${itemId}`, {
      method: 'DELETE',
      auth: false,
    }),
    clear: () => {
      // Backend doesn't have clear endpoint
      console.warn('Cart clear not supported by backend, using local state only');
      return Promise.resolve({ success: true });
    },
  },

  // -------------------------
  // Orders (usually protected)
  // -------------------------
  orders: {
    createWithPayment: (orderData) => api.fetch('/orders/createorder-with-payment', {
      method: 'POST',
      body: JSON.stringify(orderData),
      auth: true,
    }),
    create: (orderData) => api.fetch('/orders/createorder', {
      method: 'POST',
      body: JSON.stringify(orderData),
      auth: true,
    }),
    getMyOrders: (params = {}) => api.fetch(`/orders?${new URLSearchParams(params)}`, { auth: true }),
    getOrderDetails: (orderId) => api.fetch(`/orders/getorder/${orderId}`, { auth: true }),
    cancelOrder: (orderId, reason = 'User cancellation') => api.fetch(`/orders/cancelorder/${orderId}`, { 
      method: 'PUT', 
      body: JSON.stringify({ reason }),
      auth: true 
    }),
    getById: (id) => api.fetch(`/orders/getorder/${id}`, { auth: true }),
  },

  // -------------------------
  // Payments (protected)
  // -------------------------
  payments: {
    create: (paymentData) => api.fetch('/payments/create', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      auth: true,
    }),
    getStatus: (paymentId) => api.fetch(`/payments/status/${paymentId}`, { auth: true }),
    cancel: (paymentId) => api.fetch(`/payments/cancel/${paymentId}`, {
      method: 'PUT',
      auth: true,
    }),
    checkWithProvider: (paymentId) => api.fetch(`/payments/check/${paymentId}`, { auth: true }),
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
    remove: (productId) => api.fetch('/wishlists', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
      auth: true,
    }),
  },

  // -------------------------
  // User Addresses (protected)
  // -------------------------
  userAddresses: {
    getAll: (userId) => api.fetch(`/user-addresses/user/${userId}`, { auth: true }),
    getById: (id) => api.fetch(`/user-addresses/${id}`, { auth: true }),
    create: (addressData) => api.fetch('/user-addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
      auth: true,
    }),
    update: (id, addressData) => api.fetch(`/user-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
      auth: true,
    }),
    delete: (id) => api.fetch(`/user-addresses/${id}`, {
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
    main: () => api.fetch('/categories/main', { auth: false })
  },

  // -------------------------
  // Payments (protected)
  // -------------------------
  payments: {
    create: (paymentData) => api.fetch('/payment/create', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      auth: true,
    }),
    getStatus: (paymentId) => api.fetch(`/payment/${paymentId}/status`, { auth: true }),
    checkWithProvider: (paymentId) => api.fetch(`/payment/${paymentId}/check`, {
      method: 'POST',
      auth: true,
    }),
    cancel: (paymentId) => api.fetch(`/payment/${paymentId}/cancel`, {
      method: 'POST',
      auth: true,
    }),
    getHistory: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/payment/history?${searchParams.toString()}`, { auth: true });
    },
  },

  // -------------------------
  // NEW FILTER SYSTEM ENDPOINTS
  // -------------------------
  filters: {
    getOptions: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/filters?${searchParams.toString()}`, { auth: false });
    },
    getPopular: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return api.fetch(`/filters/popular?${searchParams.toString()}`, { auth: false });
    },
    getSortOptions: () => api.fetch('/filters/sort-options', { auth: false }),
  },

  // -------------------------
  // Attributes (public) - for filters (DEPRECATED - keeping for fallback)
  // -------------------------
  attributes: {
    getAll: () => api.fetch('/attributes', { auth: false }),
    getById: (id) => api.fetch(`/attributes/${id}`, { auth: false }),
    getOptions: (attributeId) => api.fetch(`/attributes/${attributeId}/options`, { auth: false }),
  },

  // -------------------------
  // Reviews
  // -------------------------
reviews: {
  addOrUpdate: (productId, body) =>
    api.fetch(`/reviews/${productId}`, { method: "POST", body: JSON.stringify(body), auth: true }),

  getForProduct: (productId, params={}) => {
    const qs = new URLSearchParams(params).toString();
    return api.fetch(`/reviews/${productId}${qs ? `?${qs}` : ""}`, { auth: true });
  },

  getMine: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.fetch(`/reviews/my${qs ? `?${qs}` : ""}`, { auth: true });
  },

  deleteMy: (productId) =>
    api.fetch(`/reviews/${productId}`, { method: "DELETE", auth: true }),
},

bundles: {
  featured: () => api.fetch('/bundles/featured', { auth: false }),
},
brands: {
  featured: () => api.fetch('/brands/featured', { auth: false }),
},
brandProducts: (brandId, params = {}) => {
  const sp = new URLSearchParams(params);
  return api.fetch(`/products/by-brand/${brandId}?${sp.toString()}`, { auth: false });
},

};

export default api;
