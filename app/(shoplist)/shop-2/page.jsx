import Shop2 from "@/components/shoplist/Shop2";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 2 || Ayo eCommerce",
  description: "Ayo eCommerce",
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
