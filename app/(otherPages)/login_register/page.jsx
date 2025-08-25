import Footer1 from "@/components/footers/Footer1";

import Header1 from "@/components/headers/Header14";
import LoginRegister from "@/components/otherPages/LoginRegister";
import React from "react";

export const metadata = {
  title: "Login Register || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function LoginPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <LoginRegister />
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
