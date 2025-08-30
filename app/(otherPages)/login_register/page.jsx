
import LoginRegister from "@/components/otherPages/LoginRegister";
import React, { Suspense } from "react";

export const metadata = {
  title: "Login Register || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function LoginPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginRegister />
        </Suspense>
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
