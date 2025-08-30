import Shop3 from "@/components/shoplist/Shop3";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 3 || Ayo eCommerce",
  description: "Ayo eCommerce",
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
