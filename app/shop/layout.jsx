import React, { Suspense } from "react";
import ShopLayoutWrapper from "@/components/shoplist/ShopLayoutWrapper";

export default function ShopLayout({ children }) {
  return (
    <div className="shop-layout" style={{backgroundColor: "#FBFFFC"}}>
      <Suspense fallback={<div>Loading shop...</div>}>
        <ShopLayoutWrapper>
          {children}
        </ShopLayoutWrapper>
      </Suspense>
    </div>
  );
}
