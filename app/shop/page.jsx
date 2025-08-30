import React, { Suspense } from "react";
import Shop4 from "@/components/shoplist/Shop4";

export default function ShopPage() {
  return (
    <div className="shop-products">
      <Suspense fallback={<div>Loading products...</div>}>
        <Shop4 />
      </Suspense>
    </div>
  );
}
