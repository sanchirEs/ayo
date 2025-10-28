import ResetPassword from "@/components/otherPages/ResetPassword";
import React from "react";

export const metadata = {
  title: "Reset Password || Ayo eCommerce",
  description: "Ayo eCommerce",
};

export default function ResetPasswordPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <ResetPassword />
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}


