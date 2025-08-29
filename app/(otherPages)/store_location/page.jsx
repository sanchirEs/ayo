
import StoreLocator from "@/components/otherPages/StoreLocator";
import React from "react";

export const metadata = {
  title: "Store Location || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function StoreLocationPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <StoreLocator />
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
