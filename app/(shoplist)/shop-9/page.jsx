import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";
import Banner1 from "@/components/shoplist/Banner1";
import Shop1 from "@/components/shoplist/Shop1";
import Shop9 from "@/components/shoplist/Shop9";
import React from "react";

export const metadata = {
  title: "Shop 9 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage9() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Banner1 />
        <div className="mb-4 pb-lg-3"></div>
        <Shop9 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
