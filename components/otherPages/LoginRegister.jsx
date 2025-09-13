"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";

export default function LoginRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();

  // ---- Login form state ----
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  // URL-аас redirect parameter-ийг авах
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    }
  }, [searchParams]);

  // Нэвтэрсэн хэрэглэгч login хуудас руу оролдвол home руу redirect
  useEffect(() => {
    if (user) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    }
  }, [user, redirectUrl, router]);

  // Loading state - нэвтэрсэн хэрэглэгч redirect хийх хүртэл
  if (user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary">Уучлаарай, та аль хэдийн нэвтэрсэн байна...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr("");
    setLoginLoading(true);
    try {
      // await api.auth.login({ identifier, password: loginPassword });
      await login({ identifier, password: loginPassword });
      
      // Redirect logic
      if (redirectUrl) {
        // URL-аас ирсэн redirect parameter байвал тэр хуудас руу шилжих
        router.push(redirectUrl);
      } else {
        // Redirect parameter байхгүй бол өмнөх хуудас руу буцах
        const prev = document.referrer;
        const sameOrigin = prev && (() => {
          try { return new URL(prev).origin === window.location.origin; }
          catch { return false; }
        })();

        if (sameOrigin) router.back();
        else router.push('/');
      }
    } catch (err) {
      setLoginErr(err.message || "Нэвтрэхэд алдаа гарлаа.");
    } finally {
      setLoginLoading(false);
    }
  };

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

  return (
    <section className="login-register container">
      <h2 className="d-none">Login & Register</h2>

      <ul className="nav nav-tabs mb-5" id="login_register" role="tablist">
        <li className="nav-item" role="presentation">
          <a
            className="nav-link nav-link_underscore active"
            id="login-tab"
            data-bs-toggle="tab"
            href="#tab-item-login"
            role="tab"
            aria-controls="tab-item-login"
            aria-selected="true"
          >
            Нэвтрэх
          </a>
        </li>
        <li className="nav-item" role="presentation">
          <a
            className="nav-link nav-link_underscore"
            id="register-tab"
            data-bs-toggle="tab"
            href="#tab-item-register"
            role="tab"
            aria-controls="tab-item-register"
            aria-selected="false"
          >
            Бүртгүүлэх
          </a>
        </li>
      </ul>

      <div className="tab-content pt-2" id="login_register_tab_content">
        {/* ---------- LOGIN TAB ---------- */}
        <div
          className="tab-pane fade show active"
          id="tab-item-login"
          role="tabpanel"
          aria-labelledby="login-tab"
        >
          <div className="login-form">
            <form onSubmit={handleLogin} className="needs-validation">
              <div className="form-floating mb-3">
                <input
                  name="login_identifier"
                  type="text"
                  className="form-control form-control_gray"
                  placeholder="Имэйл эсвэл хэрэглэгчийн нэр *"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <label>Имэйл эсвэл хэрэглэгчийн нэр *</label>
              </div>

              <div className="pb-3"></div>

              <div className="form-floating mb-3">
                <input
                  name="login_password"
                  type="password"
                  className="form-control form-control_gray"
                  id="customerPasswodInput"
                  placeholder="Нууц үг *"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <label htmlFor="customerPasswodInput">Нууц үг *</label>
              </div>

              <div className="d-flex align-items-center mb-3 pb-2">
                <div className="form-check mb-0">
                  <input
                    name="remember"
                    className="form-check-input form-check-input_fill"
                    type="checkbox"
                    defaultValue=""
                  />
                  <label className="form-check-label text-secondary">
                    Намайг сана
                  </label>
                </div>
                {/* <Link href="#" className="btn-text ms-auto">
                  Нууц үг мартсан?
                </Link> */}
              </div>

              {loginErr && (
                <div className="alert alert-danger mb-3" role="alert">
                  {loginErr}
                </div>
              )}

              <button
                className="btn btn-primary w-100 text-uppercase"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? "Нэвтэрч байна..." : "Нэвтрэх"}
              </button>

              <div className="customer-option mt-4 text-center">
                <span className="text-secondary">Бүртгэл байхгүй юу?</span>{" "}
                <a
                  href="#register-tab"
                  className="btn-text js-show-register"
                  data-bs-toggle="tab"
                >
                  Бүртгүүлэх
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* ---------- REGISTER TAB (Formik + Yup) ---------- */}
        <div
          className="tab-pane fade"
          id="tab-item-register"
          role="tabpanel"
          aria-labelledby="register-tab"
        >
          <div className="register-form">
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
                <form onSubmit={handleSubmit} className="needs-validation">
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
                  >
                    {isSubmitting ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
                  </button>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </section>
  );
}
