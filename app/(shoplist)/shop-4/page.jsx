import ShopLayoutWrapper from "@/components/shoplist/ShopLayoutWrapper";
import React, { Suspense } from "react";

export const metadata = {
  title: "Shop 4 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function ShopPage4() {
  return (
    <>
      <Suspense fallback={<div>Loading shop...</div>}>
        <ShopLayoutWrapper />
      </Suspense>
    </>
  );
}
