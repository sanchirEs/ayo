"use client";

import { closeModalUserlogin } from "@/utlis/aside";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerLogin() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const pageOverlay = document.getElementById("pageOverlay");

    pageOverlay.addEventListener("click", closeModalUserlogin);

    return () => {
      pageOverlay.removeEventListener("click", closeModalUserlogin);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login({ identifier, password });
      // Амжилттай нэвтэрсэн бол modal хаах
      closeModalUserlogin();
    } catch (err) {
      setError(err.message || "Нэвтрэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="userAside"
      className="aside aside_right overflow-hidden customer-forms "
    >
      <div className="customer-forms__wrapper d-flex position-relative">
        <div className="customer__login">
          <div className="aside-header d-flex align-items-center">
            <h3 className="text-uppercase fs-6 mb-0">Нэвтрэх</h3>
            <button
              onClick={() => closeModalUserlogin()}
              className="btn-close-lg js-close-aside ms-auto"
            />
          </div>
          <form onSubmit={handleLogin} className="aside-content">
            <div className="form-floating mb-3">
              <input
                name="identifier"
                type="text"
                className="form-control form-control_gray"
                placeholder="Хэрэглэгчийн нэр эсвэл имэйл"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <label>Хэрэглэгчийн нэр эсвэл имэйл *</label>
            </div>
            <div className="pb-3" />
            <div className="form-label-fixed mb-3">
              <label className="form-label">Нууц үг *</label>
              <input
                name="password"
                className="form-control form-control_gray"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-flex align-items-center mb-3 pb-2">
              <div className="form-check mb-0">
                <input
                  name="remember"
                  className="form-check-input form-check-input_fill"
                  type="checkbox"
                  defaultValue
                />
                <label className="form-check-label text-secondary">
                  Намайг сана
                </label>
              </div>
              <Link href="#" className="btn-text ms-auto">
                Нууц үг мартсан?
              </Link>
            </div>
            
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}
            
            <button
              className="btn btn-primary w-100 text-uppercase"
              type="submit"
              disabled={loading}
            >
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </button>
            <div className="customer-option mt-4 text-center">
              <span className="text-secondary">Бүртгэл байхгүй юу?</span>{" "}
              <Link
                href="/login_register#register-tab"
                className="btn-text js-show-register"
              >
                Бүртгүүлэх
              </Link>
            </div>
          </form>
        </div>
        <div className="customer__register">
          <div className="aside-header d-flex align-items-center">
            <h3 className="text-uppercase fs-6 mb-0">Бүртгүүлэх</h3>
            <button className="btn-close-lg js-close-aside btn-close-aside ms-auto" />
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="aside-content">
            <div className="form-floating mb-4">
              <input
                name="username"
                type="text"
                className="form-control form-control_gray"
                placeholder="Хэрэглэгчийн нэр"
              />
              <label>Хэрэглэгчийн нэр</label>
            </div>
            <div className="pb-1" />
            <div className="form-floating mb-4">
              <input
                name="email"
                type="email"
                className="form-control form-control_gray"
                placeholder="user@company.com"
              />
              <label>Имэйл хаяг *</label>
            </div>
            <div className="pb-1" />
            <div className="form-label-fixed mb-4">
              <label className="form-label">Нууц үг *</label>
              <input
                name="password"
                className="form-control form-control_gray"
                type="password"
                placeholder="*******"
              />
            </div>
            <p className="text-secondary mb-4">
              {/* Таны хувийн мэдээлэл энэ вэбсайт дээрх туршлагаа дэмжих, дансанд нэвтрэх эрхийг удирдах болон 
              нууцлалын бодлогод тодорхойлсон бусад зорилгоор ашиглагдах болно. */}
            </p>
            <button
              className="btn btn-primary w-100 text-uppercase"
              type="submit"
            >
              Бүртгүүлэх
            </button>
            <div className="customer-option mt-4 text-center">
              <span className="text-secondary">Аль хэдийн бүртгэлтэй юу?</span>
              <a href="#" className="btn-text js-show-login">
                Нэвтрэх
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
