import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";
import Banner6 from "@/components/shoplist/Banner6";
import Shop10 from "@/components/shoplist/shop10/Shop10";
import React from "react";

export const metadata = {
  title: "Shop 10 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage10() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Banner6 />
        <div className="mb-4 pb-lg-3"></div>
        <Shop10 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
