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
      className="aside aside_right overflow-hidden customer-forms "
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
            >
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </button>
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
