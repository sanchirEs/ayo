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
  const { handleFiltersChange } = useFilterContext();

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
        {/* Pass the filter change handler from context to FilterAll */}
        <FilterAll onFiltersChange={handleFiltersChange} />
      </div>
      {/* /.aside-content */}
    </div>
  );
}
