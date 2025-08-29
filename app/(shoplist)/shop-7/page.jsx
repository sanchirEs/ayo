import Banner5 from "@/components/shoplist/Banner5";
import Shop7 from "@/components/shoplist/Shop7";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 7 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage7() {
  return (
    <>
      <Banner5 />
      <div className="mb-4 pb-lg-3"></div>
      <Suspense fallback={<div>Loading shop...</div>}>
        <Shop7 />
      </Suspense>
    </>
  );
}
