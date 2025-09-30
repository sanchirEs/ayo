"use client";

import { closeModalUserlogin } from "@/utlis/aside";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "@/lib/api";

export default function CustomerLogin() {
  const { login, user } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // ---- Yup schema (Register) ----
  const RegisterSchema = Yup.object({
    firstName: Yup.string().trim().required("Нэр заавал шаардлагатай"),
    lastName: Yup.string().trim().required("Овог заавал шаардлагатай"),
    username: Yup.string()
      .trim()
      .min(3, "Хэрэглэгчийн нэр хамгийн багадаа 3 тэмдэгт")
      .required("Хэрэглэгчийн нэр заавал шаардлагатай"),
    email: Yup.string()
      .trim()
      .email("И-мэйл буруу байна")
      .required("И-мэйл заавал шаардлагатай"),
    telephone: Yup.string()
      .trim()
      .matches(/^[0-9+\-\s()]+$/, "Утасны дугаар зөвхөн тоо, +, -, (, ), хоосон зай агуулж болно")
      .min(8, "Утасны дугаар хамгийн багадаа 8 тэмдэгт")
      .required("Утасны дугаар заавал шаардлагатай"),
    password: Yup.string()
      .min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт")
      .matches(/[A-Z]/, "Нууц үг дор хаяж 1 том үсэгтэй байх ёстой")
      .matches(/\d/, "Нууц үг дор хаяж 1 тоотой байх ёстой")
      .matches(/[^A-Za-z0-9]/, "Нууц үг дор хаяж 1 тусгай тэмдэгттэй байх ёстой")
      .required("Нууц үг шаардлагатай"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Нууц үг хоорондоо таарахгүй байна")
      .required("Баталгаажуулах нууц үг шаардлагатай"),
  });

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

  const handleShowRegister = () => {
    setShowRegister(true);
    setError("");
  };

  const handleShowLogin = () => {
    setShowRegister(false);
    setError("");
  };

  // Нэвтэрсэн хэрэглэгч modal нээхэд хаах
  useEffect(() => {
    if (user) {
      closeModalUserlogin();
    }
  }, [user]);

  return (
    <div
      id="userAside"
      className="aside aside_right overflow-hidden customer-forms h-100"
    >
      <div 
        className="customer-forms__wrapper d-flex position-relative"
        style={{ transform: showRegister ? 'translateX(-100%)' : 'translateX(0)' }}
      >
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
                style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
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
                style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
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
              {/* <Link href="#" className="btn-text ms-auto">
                Нууц үг мартсан?
              </Link> */}
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
              style={{backgroundColor: "#495D35", height: '45px'}}
            >
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </button>
            
            {/* OAuth Login Buttons */}
            <div className="mt-3">
              <div className="text-center mb-3">
                <span className="text-secondary">эсвэл</span>
              </div>
              
              <div className="d-grid gap-2">
                <a 
                  href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google`}
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                  style={{ 
                    height: '45px',
                    color: "#F76D6D", 
                    borderColor: "#F76D6D",
                    backgroundColor: "transparent",
                    transition: "all 0.3s ease",
                    // borderRadius: "8px",
                    fontWeight: "500",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#F76D6D";
                    e.target.style.color = "#ffffff";
                    e.target.style.borderColor = "#F76D6D";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(247, 109, 109, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#F76D6D";
                    e.target.style.borderColor = "#F76D6D";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <svg className="me-2" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google-ээр нэвтрэх
                </a>
                
                <a 
                  href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/facebook`}
                  className="btn d-flex align-items-center justify-content-center"
                  style={{ 
                    height: '45px', 
                    color: "#1877F2", 
                    borderColor: "#1877F2",
                    backgroundColor: "transparent",
                    transition: "all 0.3s ease",
                    // borderRadius: "8px",
                    fontWeight: "500",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#1976d2";
                    e.target.style.color = "#ffffff";
                    e.target.style.borderColor = "#1976d2";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#1877F2";
                    e.target.style.borderColor = "#1877F2";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <svg className="me-2" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook-ээр нэвтрэх
                </a>
              </div>
            </div>
            
            <div className="customer-option mt-4 text-center">
              <span className="text-secondary">Бүртгэл байхгүй юу?</span>{" "}
              <button
                type="button"
                onClick={handleShowRegister}
                className="btn-text js-show-register"
              >
                Бүртгүүлэх
              </button>
            </div>
          </form>
        </div>
        <div className="customer__register">
          <div className="aside-header d-flex align-items-center">
            <h3 className="text-uppercase fs-6 mb-0">Бүртгүүлэх</h3>
            <button 
              onClick={() => closeModalUserlogin()}
              className="btn-close-lg js-close-aside btn-close-aside ms-auto" 
            />
          </div>
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              username: "",
              email: "",
              telephone: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={RegisterSchema}
            onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
              setStatus({ error: "", success: "", serverErrors: [] });
              try {
                await api.auth.register({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  username: values.username,
                  email: values.email,
                  telephone: values.telephone,
                  password: values.password,
                });
                setStatus({
                  success: "Бүртгэл амжилттай. Одоо нэвтэрч орно уу.",
                  serverErrors: [],
                });
                // resetForm(); // хүсвэл цэвэрлэж болно
              } catch (err) {
                // backend-ээс ирсэн массив алдааг дэмжинэ
                const serverList = err.details || err.errors || err.error;
                setStatus({
                  error: err.message || "Бүртгүүлэхэд алдаа гарлаа.",
                  serverErrors: Array.isArray(serverList)
                    ? serverList.map((e) => e.message || String(e))
                    : [],
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              status,
            }) => (
              <form onSubmit={handleSubmit} className="aside-content needs-validation">
                {/* First name and Last name in one row */}
                <div className="row g-1 mb-2">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        name="lastName"
                        type="text"
                        className={
                          "form-control form-control_gray" +
                          (touched.lastName && errors.lastName ? " is-invalid" : "")
                        }
                        placeholder="Овог *"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
                      />
                      <label>Овог *</label>
                      {touched.lastName && errors.lastName && (
                        <div className="invalid-feedback d-block">{errors.lastName}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        name="firstName"
                        type="text"
                        className={
                          "form-control form-control_gray" +
                          (touched.firstName && errors.firstName ? " is-invalid" : "")
                        }
                        placeholder="Нэр *"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
                      />
                      <label>Нэр *</label>
                      {touched.firstName && errors.firstName && (
                        <div className="invalid-feedback d-block">{errors.firstName}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="form-floating mb-2">
                  <input
                    name="username"
                    type="text"
                    className={
                      "form-control form-control_gray" +
                      (touched.username && errors.username ? " is-invalid" : "")
                    }
                    id="customerNameRegisterInput"
                    placeholder="Хэрэглэгчийн нэр *"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
                  />
                  <label htmlFor="customerNameRegisterInput">Хэрэглэгчийн нэр *</label>
                  {touched.username && errors.username && (
                    <div className="invalid-feedback d-block">{errors.username}</div>
                  )}
                </div>

                {/* Email and Telephone in one row */}
                <div className="row g-1 mb-2">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        name="email"
                        type="email"
                        className={
                          "form-control form-control_gray" +
                          (touched.email && errors.email ? " is-invalid" : "")
                        }
                        id="customerEmailRegisterInput"
                        placeholder="Имэйл хаяг *"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
                      />
                      <label htmlFor="customerEmailRegisterInput">
                        Имэйл хаяг *
                      </label>
                      {touched.email && errors.email && (
                        <div className="invalid-feedback d-block">{errors.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        name="telephone"
                        type="text"
                        className={
                          "form-control form-control_gray" +
                          (touched.telephone && errors.telephone ? " is-invalid" : "")
                        }
                        id="customerTelephoneRegisterInput"
                        placeholder="Утасны дугаар *"
                        value={values.telephone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
                      />
                      <label htmlFor="customerTelephoneRegisterInput">Утасны дугаар *</label>
                      {touched.telephone && errors.telephone && (
                        <div className="invalid-feedback d-block">{errors.telephone}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="form-floating mb-2">
                  <input
                    name="password"
                    type="password"
                    className={
                      "form-control form-control_gray" +
                      (touched.password && errors.password ? " is-invalid" : "")
                    }
                    id="customerPasswodRegisterInput"
                    placeholder="Нууц үг *"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
                  />
                  <label htmlFor="customerPasswodRegisterInput">Нууц үг *</label>
                  {touched.password && errors.password && (
                    <div className="invalid-feedback d-block">{errors.password}</div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-floating mb-2">
                  <input
                    name="confirmPassword"
                    type="password"
                    className={
                      "form-control form-control_gray" +
                      (touched.confirmPassword && errors.confirmPassword
                        ? " is-invalid"
                        : "")
                    }
                    placeholder="Нууц үг баталгаажуулах *"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ height: '45px', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}
                  />
                  <label>Нууц үг баталгаажуулах *</label>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className="invalid-feedback d-block">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Server error list (backend) */}
                {status?.error && (
                  <div className="alert alert-danger mb-2" role="alert">
                    {status.error}
                    {Array.isArray(status.serverErrors) && status.serverErrors.length > 0 && (
                      <ul className="mt-2 mb-0 ps-3">
                        {status.serverErrors.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {status?.success && (
                  <div className="alert alert-success mb-2" role="alert">
                    {status.success}
                  </div>
                )}

                <button
                  className="btn btn-primary w-100 text-uppercase"
                  type="submit"
                  disabled={isSubmitting}
                  style={{backgroundColor: "#495D35", height: '45px'}}
                >
                  {isSubmitting ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
                </button>
                
                {/* OAuth Register Buttons */}
                <div className="mt-3">
                  <div className="text-center mb-3">
                    <span className="text-secondary">эсвэл</span>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <a 
                      href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google`}
                      className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                      style={{ 
                        height: '45px',
                        color: "#F76D6D", 
                        borderColor: "#F76D6D",
                        backgroundColor: "transparent",
                        transition: "all 0.3s ease",
                        // borderRadius: "8px",
                        fontWeight: "500",
                        textDecoration: "none"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#F76D6D";
                        e.target.style.color = "#ffffff";
                        e.target.style.borderColor = "#F76D6D";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(247, 109, 109, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#F76D6D";
                        e.target.style.borderColor = "#F76D6D";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <svg className="me-2" width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google-ээр нэвтрэх
                    </a>
                    
                    <a 
                      href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/facebook`}
                      className="btn d-flex align-items-center justify-content-center"
                      style={{ 
                        height: '45px', 
                        color: "#1877F2", 
                        borderColor: "#1877F2",
                        backgroundColor: "transparent",
                        transition: "all 0.3s ease",
                        // borderRadius: "8px",
                        fontWeight: "500",
                        textDecoration: "none"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#1976d2";
                        e.target.style.color = "#ffffff";
                        e.target.style.borderColor = "#1976d2";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#1877F2";
                        e.target.style.borderColor = "#1877F2";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <svg className="me-2" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook-ээр нэвтрэх
                    </a>
                  </div>
                </div>
                
                <div className="customer-option mt-4 text-center">
                  <span className="text-secondary">Аль хэдийн бүртгэлтэй юу?</span>
                  <button
                    type="button"
                    onClick={handleShowLogin}
                    className="btn-text js-show-login"
                  >
                    Нэвтрэх
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
