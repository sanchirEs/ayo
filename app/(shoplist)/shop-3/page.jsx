import Shop3 from "@/components/shoplist/Shop3";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 3 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage3() {
  return (
    <>
      <Suspense fallback={<div>Loading shop...</div>}>
        <Shop3 />
      </Suspense>
    </>
  );
}
