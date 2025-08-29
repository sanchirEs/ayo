
import Faq from "@/components/otherPages/Faq";
import React from "react";

export const metadata = {
  title: "Faq || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function FaqPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <Faq />
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
