"use client";
import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

/** Профайл формын Yup */
const ProfileSchema = Yup.object({
  firstName: Yup.string().trim().required("Нэр шаардлагатай"),
  lastName: Yup.string().trim().required("Овог шаардлагатай"),
  username: Yup.string().trim().min(3, "Хэрэглэгчийн нэр хамгийн багадаа 3 тэмдэгт"),
  currentPassword: Yup.string().required("Одоогийн нууц үгээ оруулна уу"),
});

/** Нууц үг солих формын Yup — бүртгэлийнхтэй ижил бодлого хэрэглэв */
const ChangePassSchema = Yup.object({
  oldPassword: Yup.string().required("Одоогийн нууц үгээ оруулна уу"),
  newPassword: Yup.string()
    .min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт")
    .matches(/[A-Z]/, "Нууц үг дор хаяж 1 том үсэгтэй байх ёстой")
    .matches(/\d/, "Нууц үг дор хаяж 1 тоотой байх ёстой")
    .matches(/[^A-Za-z0-9]/, "Нууц үг дор хаяж 1 тусгай тэмдэгттэй байх ёстой")
    .required("Шинэ нууц үг шаардлагатай"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Нууц үг хоорондоо таарахгүй байна")
    .required("Шинэ нууц үгээ давтан оруулна уу"),
});

export default function EditAccount() {
  const { user, loading, refresh } = useAuth();

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="page-content my-account__edit">
          <div className="py-5 text-center">Түр хүлээнэ үү…</div>
        </div>
      </div>
    );
  }

  // Хэрэв нэвтрээгүй бол
  if (!user) {
    return (
      <div className="col-lg-9">
        <div className="page-content my-account__edit">
          <div className="alert alert-warning">Профайл засахын тулд нэвтэрнэ үү.</div>
        </div>
      </div>
    );
  }

  const safeEmail = user?.email || "";

  return (
    <div className="col-12 col-lg-9">
      <div className="page-content my-account__edit">
        {/* ============== Профайл мэдээлэл шинэчлэх ============== */}
        <div className="my-account__edit-form mb-5">
          <h5 className="text-uppercase mb-3">Профайл мэдээлэл</h5>
          <Formik
            enableReinitialize
            initialValues={{
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              username: user.username || "",
              email: safeEmail, // зөвхөн харах, өөрчлөхгүй
              currentPassword: "",
            }}
            validationSchema={ProfileSchema}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setStatus({ error: "", success: "" });
              try {
                await api.user.updateProfile({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  username: values.username,
                  // backend editUserDetails require "password" as current password:
                  password: values.currentPassword,
                });
                toast.success("Мэдээлэл амжилттай шинэчлэгдлээ.");
                setStatus({ success: "Мэдээлэл амжилттай шинэчлэгдлээ." });
                await refresh(); // context дахин унших
              } catch (err) {
                const serverList = err.details || err.errors || err.error;
                toast.error("Шинэчлэхэд алдаа гарлаа.")
                setStatus({
                  error: err.message || "Шинэчлэхэд алдаа гарлаа.",
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
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating my-3">
                      <input
                        type="text"
                        className={
                          "form-control" +
                          (touched.firstName && errors.firstName ? " is-invalid" : "")
                        }
                        id="account_first_name"
                        placeholder="First Name"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      <label htmlFor="account_first_name">First Name</label>
                      {touched.firstName && errors.firstName && (
                        <div className="invalid-feedback d-block">{errors.firstName}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-floating my-3">
                      <input
                        type="text"
                        className={
                          "form-control" +
                          (touched.lastName && errors.lastName ? " is-invalid" : "")
                        }
                        id="account_last_name"
                        placeholder="Last Name"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      <label htmlFor="account_last_name">Last Name</label>
                      {touched.lastName && errors.lastName && (
                        <div className="invalid-feedback d-block">{errors.lastName}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="text"
                        className={
                          "form-control" +
                          (touched.username && errors.username ? " is-invalid" : "")
                        }
                        id="account_display_name"
                        placeholder="Username"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      <label htmlFor="account_display_name">Username</label>
                      {touched.username && errors.username && (
                        <div className="invalid-feedback d-block">{errors.username}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="email"
                        className="form-control"
                        id="account_email"
                        placeholder="Email Address"
                        name="email"
                        value={values.email}
                        disabled
                      />
                      <label htmlFor="account_email">Email Address</label>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="password"
                        className={
                          "form-control" +
                          (touched.currentPassword && errors.currentPassword
                            ? " is-invalid"
                            : "")
                        }
                        id="account_current_password_for_profile"
                        placeholder="Current password"
                        name="currentPassword"
                        value={values.currentPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      <label htmlFor="account_current_password_for_profile">
                        Одоогийн нууц үг (баталгаажуулалт)
                      </label>
                      {touched.currentPassword && errors.currentPassword && (
                        <div className="invalid-feedback d-block">
                          {errors.currentPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Server messages */}
                  {status?.error && (
                    <div className="col-md-12">
                      <div className="alert alert-danger" role="alert">
                        {status.error}
                        {Array.isArray(status.serverErrors) && status.serverErrors.length > 0 && (
                          <ul className="mt-2 mb-0 ps-3">
                            {status.serverErrors.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                  {status?.success && (
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        {status.success}
                      </div>
                    </div>
                  )}

                  <div className="col-md-12">
                    <div className="my-3">
                      <button className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? "Өөрчилж байна..." : "Өөрчлөлтийг хадгалах"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>

        {/* ============== Нууц үг солих ============== */}
        <div className="my-account__edit-form">
          <h5 className="text-uppercase mb-3">Нууц үг солих</h5>
          <Formik
            initialValues={{
              oldPassword: "",
              newPassword: "",
              confirmNewPassword: "",
            }}
            validationSchema={ChangePassSchema}
            onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
              setStatus({ error: "", success: "" });
              try {
                await api.auth.changePassword({
                  oldPassword: values.oldPassword,
                  password: values.newPassword,
                });
                toast.success("Нууц үг амжилттай шинэчлэгдлээ.")
                setStatus({ success: "Нууц үг амжилттай шинэчлэгдлээ." });
                resetForm();
              } catch (err) {
                const serverList = err.details || err.errors || err.error;
                setStatus({
                  error: err.message || "Нууц үг солиход алдаа гарлаа.",
                  serverErrors: Array.isArray(serverList)
                    ? serverList.map((e) => e.message || String(e))
                    : [],
                });
                toast.error("Нууц үг солиход алдаа гарлаа.");
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
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="password"
                        className={
                          "form-control" +
                          (touched.oldPassword && errors.oldPassword ? " is-invalid" : "")
                        }
                        id="account_current_password"
                        placeholder="Current password"
                        name="oldPassword"
                        value={values.oldPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      <label htmlFor="account_current_password">Current password</label>
                      {touched.oldPassword && errors.oldPassword && (
                        <div className="invalid-feedback d-block">{errors.oldPassword}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="password"
                        className={
                          "form-control" +
                          (touched.newPassword && errors.newPassword ? " is-invalid" : "")
                        }
                        id="account_new_password"
                        placeholder="New password"
                        name="newPassword"
                        value={values.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      <label htmlFor="account_new_password">New password</label>
                      {touched.newPassword && errors.newPassword && (
                        <div className="invalid-feedback d-block">{errors.newPassword}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="password"
                        className={
                          "form-control" +
                          (touched.confirmNewPassword && errors.confirmNewPassword
                            ? " is-invalid"
                            : "")
                        }
                        id="account_confirm_password"
                        placeholder="Confirm new password"
                        name="confirmNewPassword"
                        value={values.confirmNewPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      <label htmlFor="account_confirm_password">Confirm new password</label>
                      {touched.confirmNewPassword && errors.confirmNewPassword && (
                        <div className="invalid-feedback d-block">
                          {errors.confirmNewPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Server messages */}
                  {status?.error && (
                    <div className="col-md-12">
                      <div className="alert alert-danger" role="alert">
                        {status.error}
                        {Array.isArray(status.serverErrors) && status.serverErrors.length > 0 && (
                          <ul className="mt-2 mb-0 ps-3">
                            {status.serverErrors.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                  {status?.success && (
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        {status.success}
                      </div>
                    </div>
                  )}

                  <div className="col-md-12">
                    <div className="my-3">
                      <button className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? "Өөрчилж байна..." : "Өөрчлөлтийг хадгалах"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
