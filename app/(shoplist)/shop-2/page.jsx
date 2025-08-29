import Shop2 from "@/components/shoplist/Shop2";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 2 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage2() {
  return (
    <>
      <Suspense fallback={<div>Loading shop...</div>}>
        <Shop2 />
      </Suspense>
    </>
  );
}
