"use client";

import React from "react";
import Shop4 from "./Shop4";
import FilterAll from "./filter/FilterAll";
import { openModalShopFilter } from "@/utlis/aside";
import { useFilterContext } from "@/context/FilterContext";

/**
 * ShopLayoutWrapper - Manages filter state between FilterAll and Shop4 components
 * This component coordinates the filter state and ensures both components stay in sync
 */
export default function ShopLayoutWrapper({ 
  categoryId = null,
  initialPage = 1,
  initialLimit = 12,
  initialSort = "newest",
  initialFilters = null,
  showSidebar = true,
  ...otherProps 
}) {
  // Use the filter context for shared state
  const { appliedFilters, handleFiltersChange, totalActiveFilters, lastUpdate } = useFilterContext();
  
  // Initialize filters from URL if provided
  React.useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      console.log('🔄 SHOP LAYOUT: Initializing filters from URL:', initialFilters);
      handleFiltersChange(initialFilters);
    }
  }, [initialFilters, handleFiltersChange]);

  return (
    <section className="shop-main container d-flex pt-4 pt-xl-5">

      {/* SIDEBAR WITH FILTERS */}
      {showSidebar && (
        <div className="shop-sidebar side-sticky bg-body">
          <div
            onClick={openModalShopFilter}
            className="aside-header d-flex d-lg-none align-items-center"
          >
            <h3 className="text-uppercase fs-6 mb-0">Filter By</h3>
            <button className="btn-close-lg js-close-aside btn-close-aside ms-auto"></button>
          </div>

          <div className="pt-4 pt-lg-0"></div>

          {/* FILTER COMPONENT - Pass the filter change handler */}
          <FilterAll onFiltersChange={handleFiltersChange} />
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="shop-list flex-grow-1">
        {/* SHOP4 COMPONENT - Pass applied filters and change handler */}
        <Shop4
          categoryId={categoryId}
          initialPage={initialPage}
          initialLimit={initialLimit}
          initialSort={initialSort}
          appliedFilters={appliedFilters}
          onFiltersChange={handleFiltersChange}
          {...otherProps}
        />
      </div>
    </section>
  );
}