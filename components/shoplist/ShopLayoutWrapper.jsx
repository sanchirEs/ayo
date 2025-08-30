"use client";

import React, { useState, useCallback } from "react";
import FilterAll from "./filter/FilterAll";
import BreadCumb from "./BreadCumb";

export default function ShopLayoutWrapper({ children }) {
  // Filter state management
  const [filters, setFilters] = useState({
    colors: [],
    sizes: [],
    brands: [],
    price: [20, 70987],
    search: ""
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <>
        <section className="shop-main container d-flex pt-4 pt-xl-5">
{/* Header Section */}
<div className="shop-sidebar side-sticky bg-body">
        {/* <div onClick={openModalShopFilter} className="aside-header d-flex d-lg-none align-items-center">
          <h3 className="text-uppercase fs-6 mb-0">Filter By</h3>
          <button className="btn-close-lg js-close-aside btn-close-aside ms-auto" />
        </div> */}
        <div className="pt-4 pt-lg-0" />
        <FilterAll onFiltersChange={handleFiltersChange} />
      </div>
      <div className="shop-list flex-grow-1">
          {children}
        </div>
{/*       
     <div className="shop-list flex-grow-1">
        <div className="d-flex justify-content-between mb-4 pb-md-2">
       
          <div className="shop-acs d-flex align-items-center justify-content-between justify-content-md-end flex-grow-1">
       
          </div>
          

        </div>
    
      </div> */}
        </section>
      
    </>
  );
}
