import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";

import Shop6 from "@/components/shoplist/Shop6";
import React from "react";

export const metadata = {
  title: "Shop 6 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage6() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Shop6 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
