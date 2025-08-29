import Shop4 from "@/components/shoplist/Shop4";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 4 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage4() {
  return (
    <>
      <Suspense fallback={<div>Loading shop...</div>}>
        <Shop4 />
      </Suspense>
    </>
  );
}
