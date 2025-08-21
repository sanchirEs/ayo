"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function HeroDynamic() {
  const [state, setState] = useState({ flash: null, endsAt: null, banners: [] });
  const [now, setNow] = useState(Date.now());
  const active = Boolean(state.flash?.active);

  // tick each second (countdown)
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [activeRes, timerRes] = await Promise.all([
          api.flashSale.active(),
          api.flashSale.timer(),
        ]);
        const flash = activeRes?.data ?? activeRes;
        const endsAt = (timerRes?.data ?? timerRes)?.endsAt ?? null;

        if (flash?.active) {
          if (mounted) setState((s) => ({ ...s, flash, endsAt }));
        } else {
          const banners = (await api.fetch("/banners/homepage", { auth: false })) || [];
          if (mounted) setState({ flash: null, endsAt: null, banners: banners?.data ?? banners });
        }
      } catch {
        // алдаа гарвал зүгээр л баннергүй үлдээнэ
        setState({ flash: null, endsAt: null, banners: [] });
      }
    })();
    return () => { mounted = false; };
  }, []);

  // countdown text
  const timeLeft = useMemo(() => {
    if (!state.endsAt) return null;
    const diff = Math.max(0, new Date(state.endsAt).getTime() - now);
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [state.endsAt, now]);

  // UI
  if (active) {
    return (
      <section className="container py-4 py-lg-5">
        <div className="rounded-3 p-4 p-lg-5 text-center text-white"
             style={{ background: "linear-gradient(135deg,#FF5B84,#FF934F)" }}>
          <div className="badge bg-dark fw-semibold mb-2">FLASH SALE</div>
          <h1 className="display-6 fw-bold mb-2">Limited Time Offer</h1>
          <p className="mb-4">Ends in <span className="fw-bold">{timeLeft ?? "—"}</span></p>
          <Link href="/deals" className="btn btn-light btn-lg text-uppercase fw-semibold">Shop Now</Link>
        </div>
      </section>
    );
  }

  // энгийн banner carousel (client-managed)
  return (
    <section className="container py-4 py-lg-5">
      <div className="rounded-3 p-4 p-lg-5 text-center bg-light">
        <h1 className="display-6 fw-bold mb-2">Welcome</h1>
        <p className="mb-3">Discover today’s picks</p>
        <Link href="/shop-1" className="btn btn-dark btn-lg text-uppercase fw-semibold">Shop Now</Link>
      </div>
    </section>
  );
}
