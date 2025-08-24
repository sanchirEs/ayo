import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";

import Banner5 from "@/components/shoplist/Banner5";

import Shop7 from "@/components/shoplist/Shop7";
import React from "react";

export const metadata = {
  title: "Shop 7 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage7() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Banner5 />
        <div className="mb-4 pb-lg-3"></div>
        <Shop7 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
