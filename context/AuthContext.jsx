"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // logged-in user (safe fields only)
  const [loading, setLoading] = useState(true);

  // Профайлаа бэлэн болмогц авч, Context-д тавина
  const hydrate = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.user.getProfile(); // GET /api/v1/users/profile
      // backend { success, user } гэж буцаадаг бол:
      const u = res?.data ?? res;
      setUser(u || null);

      // (заавал биш) зөвхөн non-sensitive мэдээллийг localStorage-д хадгалж болно
      if (u) {
        const { id, username, firstName, lastName, image, email } = u;
        localStorage.setItem("user_meta", JSON.stringify({ id, username, firstName, lastName, image, email }));
      } else {
        localStorage.removeItem("user_meta");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("user_meta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Нэвтрэх
// AuthProvider.jsx
const login = useCallback(async ({ identifier, password }) => {
  const res = await api.auth.login({ identifier, password });
  console.log("res in login: ", res)
  const data = res?.data ?? res;
  if (data?.accessToken) {
    localStorage.setItem("access_token", data.accessToken);
  }
  await hydrate();
}, [hydrate]);


  // Гарах
  const logout = useCallback(async () => {
    try { await api.auth.logout(); } catch {}
    setUser(null);
    localStorage.removeItem("user_meta");
  }, []);

  const value = { user, setUser, loading, login, logout, refresh: hydrate };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
