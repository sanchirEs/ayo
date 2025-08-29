import Shop5 from "@/components/shoplist/Shop5";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 5 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage5() {
  return (
    <>
      <Suspense fallback={<div>Loading shop...</div>}>
        <Shop5 />
      </Suspense>
    </>
  );
}
