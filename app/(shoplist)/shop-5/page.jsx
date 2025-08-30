import Shop5 from "@/components/shoplist/Shop5";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 5 || Ayo eCommerce",
  description: "Ayo eCommerce",
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
