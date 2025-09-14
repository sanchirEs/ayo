import React, { Suspense } from "react";
import ShopLayoutWrapper from "@/components/shoplist/ShopLayoutWrapper";

export default function ShopPage() {
  return (
    <div className="shop-products">
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="text-primary">Ангилалын бүтээгдэхүүн ачаалж байна...</h6>
        </div>
      </div>
    }>
      <ShopLayoutWrapper 
        categoryId={categoryId}
        initialPage={page}
        initialLimit={limit}
        initialSort={sort}
        initialFilters={urlFilters}
      />
    </Suspense>
  </div>
  );
}
