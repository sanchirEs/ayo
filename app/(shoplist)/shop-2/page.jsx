import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";

import Shop2 from "@/components/shoplist/Shop2";
import React from "react";

export const metadata = {
  title: "Shop 2 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage2() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Shop2 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
