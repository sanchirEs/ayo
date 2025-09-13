"use client";

import { useEffect } from "react";

import { closeModalShopFilter } from "@/utlis/aside";

import FilterAll from "../shoplist/filter/FilterAll";
import { useFilterContext } from "@/context/FilterContext";

export default function ShopFilter() {
  useEffect(() => {
    const pageOverlay = document.getElementById("pageOverlay");

    pageOverlay.addEventListener("click", closeModalShopFilter);

    return () => {
      pageOverlay.removeEventListener("click", closeModalShopFilter);
    };
  }, []);

  // Use the filter context for shared state
  const { appliedFilters, handleFiltersChange, clearAllFilters } = useFilterContext();

  console.log('🚨 SHOP FILTER (Mobile): Component rendered with context handler:', !!handleFiltersChange);

  return (
    <div className="aside-filters aside aside_right" id="shopFilterAside">
      <div className="aside-header d-flex align-items-center">
        <h3 className="text-uppercase fs-6 mb-0">Filter By</h3>
        <button
          onClick={() => closeModalShopFilter()}
          className="btn-close-lg js-close-aside btn-close-aside ms-auto"
        />
      </div>
      {/* /.aside-header */}
      <div className="aside-content">
        {/* Pass the filter change handler and external filters from context to FilterAll */}
        <FilterAll onFiltersChange={handleFiltersChange} externalFilters={appliedFilters} />
      </div>
      {/* /.aside-content */}
      
      {/* Filter Action Buttons */}
      <div className="aside-footer" style={{
        borderTop: '1px solid #e9ecef',
        padding: '16px',
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white'
      }}>
        <div className="d-flex gap-3">
          <button
            className="btn btn-outline-secondary flex-fill"
            style={{
              border: '1px solid #6c757d',
              color: '#6c757d',
              backgroundColor: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: '500'
            }}
            onClick={() => {
              // Clear all filters
              clearAllFilters();
              console.log('Clear filters clicked');
            }}
          >
            Цэвэрлэх
          </button>
          <button
            className="btn btn-dark flex-fill"
            style={{
              backgroundColor: '#212529',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              fontWeight: '500',
              border: 'none'
            }}
            onClick={() => {
              // Done logic here
              console.log('Done clicked');
              closeModalShopFilter();
            }}
          >
            Шүүх
          </button>
        </div>
      </div>
    </div>
  );
}
