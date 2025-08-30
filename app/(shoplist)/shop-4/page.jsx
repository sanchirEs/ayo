import Shop4 from "@/components/shoplist/Shop4";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 4 || Ayo eCommerce",
  description: "Ayo eCommerce",
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
