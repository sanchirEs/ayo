import React, { Suspense } from "react";
import ShopLayoutWrapper from "@/components/shoplist/ShopLayoutWrapper";

export default async function ShopCategoryPage({ params, searchParams }) {
  // Fix Next.js 15 async params issue
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categoryId = parseInt(resolvedParams?.categoryId);
  
  // URL: /shop/123?page=2&limit=12&sort=price-asc
  const page = Number(resolvedSearchParams?.page || 1);
  const limit = Number(resolvedSearchParams?.limit || 12);
  const sort = String(resolvedSearchParams?.sort || "newest");
  
  return (
    <div className="shop-products">
      <Suspense fallback={<div>Loading category products...</div>}>
        <ShopLayoutWrapper 
          categoryId={categoryId}
          initialPage={page}
          initialLimit={limit}
          initialSort={sort}
        />
      </Suspense>
    </div>
  );
}
