"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
  const [user, setUser] = useState(null);
  const [hydrating, setHydrating] = useState(false);
  const inFlight = useRef(false); // давхар дуудлагын хамгаалалт

  const hydrate = useCallback(async () => {
    if (status !== "authenticated") {
      setUser(null);
      return;
    }
    if (inFlight.current) return; // guard
    inFlight.current = true;
    try {
      setHydrating(true);
      // Backend профайл татах (auth:true → токен автоматаар хавсарна)
      const res = await api.user.getProfile();
      const u = res?.data ?? res ?? session?.user ?? null;
      setUser(u);
    } catch {
      // fallback: NextAuth session
      setUser(session?.user ?? null);
    } finally {
      setHydrating(false);
      inFlight.current = false;
    }
  }, [status]); // ✅ Зөвхөн status-д хамааруулна

  useEffect(() => {
    // ✅ status өөрчлөгдөх бүрт нэг удаа л ажиллана
    hydrate();
  }, [status, hydrate]);

  const login = useCallback(async ({ identifier, password }) => {
    const r = await signIn("credentials", { identifier, password, redirect: false });
    if (r?.error) throw new Error(r.error);
    // амжилттай бол status → "authenticated" болж, дээрх effect hydrate-ыг дуудна
  }, []);

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
