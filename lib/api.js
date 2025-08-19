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

    const response = await fetch(url, config);

    if (!response.ok) {
      let payload;
      try { payload = await response.json(); } catch {}
      const msg =
        payload?.message ||
        payload?.error?.message ||
        (Array.isArray(payload?.error) ? payload.error.map(e => e.message).join(", ") : null) ||
        "API request failed";

      throw new Error(msg);
    }
    return await response.json();
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
}

};

export default api;
