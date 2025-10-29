"use client";

/**
 * ProductsSkeleton Component
 * Shows a loading skeleton while products are being fetched
 * Provides better UX than a simple "Loading..." text
 */

export default function ProductsSkeleton({ count = 5, title = "Loading..." }) {
  return (
    <section className="products-carousel container">
      {/* Skeleton Header */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-3"></div>
        <div className="h-4 w-96 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Skeleton Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="animate-pulse">
            {/* Product Image Skeleton */}
            <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3"></div>
            
            {/* Product Info Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

