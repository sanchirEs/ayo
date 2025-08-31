import React, { Suspense } from "react";
import ShopLayoutWrapper from "@/components/shoplist/ShopLayoutWrapper";

export default function ShopPage() {
  return (
    <div className="shop-products">
      <Suspense fallback={<div>Loading products...</div>}>
        <ShopLayoutWrapper />
      </Suspense>
    </div>
  );
}
