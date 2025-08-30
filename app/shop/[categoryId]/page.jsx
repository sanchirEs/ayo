import React, { Suspense } from "react";
import Shop4 from "@/components/shoplist/Shop4";

export default function ShopCategoryPage({ params, searchParams }) {
  const categoryId = parseInt(params?.categoryId);
  
  // URL: /shop/123?page=2&limit=12&sort=price-asc
  const page = Number(searchParams?.page || 1);
  const limit = Number(searchParams?.limit || 12);
  const sort = String(searchParams?.sort || "newest");
  
  return (
    <div className="shop-products">
      <Suspense fallback={<div>Loading category products...</div>}>
        <Shop4 
          categoryId={categoryId}
          initialPage={page}
          initialLimit={limit}
          initialSort={sort}
        />
      </Suspense>
    </div>
  );
}
