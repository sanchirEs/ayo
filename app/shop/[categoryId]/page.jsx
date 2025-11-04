import React, { Suspense } from "react";
import ShopLayoutWrapper from "@/components/shoplist/ShopLayoutWrapper";

export default async function ShopCategoryPage({ params, searchParams }) {
  // Fix Next.js 15 async params issue
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categoryId = parseInt(resolvedParams?.categoryId);
  
  // URL: /shop/123?page=2&limit=12&sort=price-asc&brands=1,2&priceMin=10000&priceMax=50000
  const page = Number(resolvedSearchParams?.page || 1);
  const limit = Number(resolvedSearchParams?.limit || 20);
  const sort = String(resolvedSearchParams?.sortBy || resolvedSearchParams?.sort || "newest");
  
  // Extract filter parameters from URL
  const urlFilters = {
    brands: resolvedSearchParams?.brands ? resolvedSearchParams.brands.split(',').map(Number) : [],
    priceMin: resolvedSearchParams?.priceMin ? Number(resolvedSearchParams.priceMin) : null,
    priceMax: resolvedSearchParams?.priceMax ? Number(resolvedSearchParams.priceMax) : null,
    attributes: resolvedSearchParams?.attributes ? parseAttributesFromUrl(resolvedSearchParams.attributes) : {},
    specs: resolvedSearchParams?.specs ? parseSpecsFromUrl(resolvedSearchParams.specs) : {},
    tags: resolvedSearchParams?.tags ? resolvedSearchParams.tags.split(',') : [],
    inStock: resolvedSearchParams?.inStock !== 'false',
    hasDiscount: resolvedSearchParams?.hasDiscount === 'true',
    minRating: resolvedSearchParams?.minRating ? Number(resolvedSearchParams.minRating) : null,
    search: resolvedSearchParams?.search || "",
    // Backward compatibility
    colors: resolvedSearchParams?.colors ? resolvedSearchParams.colors.split(',') : [],
    sizes: resolvedSearchParams?.sizes ? resolvedSearchParams.sizes.split(',') : [],
    price: resolvedSearchParams?.price ? resolvedSearchParams.price.split(',').map(Number) : [20, 70987]
  };
  
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

// Helper function to parse attributes from URL
function parseAttributesFromUrl(attributesString) {
  const attributes = {};
  if (!attributesString) return attributes;
  
  const pairs = attributesString.split(',');
  pairs.forEach(pair => {
    const [key, value] = pair.split(':');
    if (key && value) {
      if (!attributes[key]) {
        attributes[key] = [];
      }
      attributes[key].push(value);
    }
  });
  
  return attributes;
}

// Helper function to parse specs from URL
function parseSpecsFromUrl(specsString) {
  const specs = {};
  if (!specsString) return specs;
  
  const pairs = specsString.split(',');
  pairs.forEach(pair => {
    const [key, value] = pair.split('::');
    if (key && value) {
      if (!specs[key]) {
        specs[key] = [];
      }
      specs[key].push(value);
    }
  });
  
  return specs;
}
