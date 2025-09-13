"use client";

import { createContext, useContext, useState, useCallback } from "react";

// Create the filter context
const FilterContext = createContext(null);

// Filter provider component
export function FilterProvider({ children }) {
  // Centralized filter state - this is the single source of truth
  const [appliedFilters, setAppliedFilters] = useState({
    brands: [], // Array of brand IDs
    priceMin: null,
    priceMax: null,
    attributes: {}, // { color: ["red", "blue"], size: ["M", "L"] }
    specs: {}, // { "Хэмжээ:": ["3 г"] }
    tags: [], // Array of tag strings
    search: "",
    inStock: true, // Show only in-stock products by default
    hasDiscount: false,
    minRating: null,
    // Backward compatibility
    colors: [],
    sizes: [],
    price: [20, 70987],
    // Metadata for sophisticated UX
    _meta: {
      totalActiveFilters: 0,
      lastUpdate: 0,
      filterType: 'initial'
    }
  });

  // Filter change handler - called when filters change
  const handleFiltersChange = useCallback((newFilters) => {
    console.log('🔄 FILTER CONTEXT: Filter change received:', newFilters);
    console.log('📊 FILTER CONTEXT: Previous filters:', appliedFilters);
    
    // Ensure the new filters have proper structure
    const validatedFilters = {
      ...newFilters,
      brands: newFilters.brands || [],
      attributes: newFilters.attributes || {},
      specs: newFilters.specs || {},
      tags: newFilters.tags || [],
      _meta: {
        ...newFilters._meta,
        lastUpdate: Date.now()
      }
    };
    
    console.log('🔄 FILTER CONTEXT: Validated filters:', validatedFilters);
    
    // Update the centralized filter state
    setAppliedFilters(validatedFilters);
    
    console.log('✅ FILTER CONTEXT: Filters updated successfully');
  }, [appliedFilters]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    console.log('🗑️ FILTER CONTEXT: Clearing all filters');
    const clearedFilters = {
      brands: [],
      priceMin: null,
      priceMax: null,
      attributes: {},
      specs: {},
      tags: [],
      search: "",
      inStock: true,
      hasDiscount: false,
      minRating: null,
      colors: [],
      sizes: [],
      price: [20, 70987],
      _meta: {
        totalActiveFilters: 0,
        lastUpdate: Date.now(),
        filterType: 'clear'
      }
    };
    setAppliedFilters(clearedFilters);
    
    // Also trigger the filter change handler to notify FilterAll component
    // This ensures the mobile filter component gets the cleared state
    setTimeout(() => {
      handleFiltersChange(clearedFilters);
    }, 0);
  }, [handleFiltersChange]);

  const value = {
    appliedFilters,
    handleFiltersChange,
    clearAllFilters,
    // Computed values
    hasActiveFilters: appliedFilters._meta?.totalActiveFilters > 0,
    totalActiveFilters: appliedFilters._meta?.totalActiveFilters || 0,
    lastUpdate: appliedFilters._meta?.lastUpdate || 0
  };

  console.log('🔍 FILTER CONTEXT: Providing value:', {
    hasAppliedFilters: !!appliedFilters,
    totalActiveFilters: value.totalActiveFilters,
    hasHandler: !!handleFiltersChange
  });

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

// Hook to use the filter context
export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    console.warn('🚨 useFilterContext must be used within a FilterProvider');
    // Return default values to prevent crashes
    return {
      appliedFilters: {
        brands: [],
        priceMin: null,
        priceMax: null,
        attributes: {},
        specs: {},
        tags: [],
        search: "",
        inStock: true,
        hasDiscount: false,
        minRating: null,
        colors: [],
        sizes: [],
        price: [20, 70987],
        _meta: { totalActiveFilters: 0, lastUpdate: 0, filterType: 'initial' }
      },
      handleFiltersChange: () => console.warn('No filter handler available'),
      clearAllFilters: () => console.warn('No clear handler available'),
      hasActiveFilters: false,
      totalActiveFilters: 0,
      lastUpdate: 0
    };
  }
  return context;
}
