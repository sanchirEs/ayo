"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
  const [user, setUser] = useState(null);
  const [hydrating, setHydrating] = useState(false);

  // --- профайл татах ---
  const hydrate = useCallback(async () => {
    if (status !== "authenticated") {
      setUser(null);
      return;
    }
    try {
      setHydrating(true);
      // Backend профайл татах
      const res = await api.user.getProfile();
      const u = res?.data ?? res ?? session?.user ?? null;
      setUser(u);
    } catch {
      setUser(session?.user ?? null);
    } finally {
      setHydrating(false);
    }
  }, [status, session]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // --- нэвтрэх ---
  const login = useCallback(async ({ identifier, password }) => {
    const r = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });
    if (r?.error) throw new Error(r.error);
    // signIn амжилттай бол session шинэчлэгдэнэ → hydrate автоматаар дуудна
  }, []);

  // --- гарах ---
  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    setUser(null);
  }, []);

  const value = {
    user,
    setUser,
    loading: status === "loading" || hydrating,
    login,
    logout,
    refresh: hydrate,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
