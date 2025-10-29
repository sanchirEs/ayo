"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Slider from "rc-slider";
import { api } from "@/lib/api";

/**
 * FilterAll - Comprehensive filter component for shop pages
 * Manages all filter types: brands, price, attributes, specs, tags, etc.
 * Syncs with external filter state via props
 */
export default function FilterAll({ onFiltersChange, externalFilters }) {
  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    brands: [],
    priceMin: null,
    priceMax: null,
    attributes: {},
    specs: {},
    tags: [],
    inStock: true,
    hasDiscount: false,
    minRating: null,
  });

  // Dynamic data from API
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Price range state
  const [priceRange, setPriceRange] = useState([0, 100000]);

  // Sync local filters with external filters
  useEffect(() => {
    if (externalFilters) {
      setLocalFilters({
        brands: externalFilters.brands || [],
        priceMin: externalFilters.priceMin,
        priceMax: externalFilters.priceMax,
        attributes: externalFilters.attributes || {},
        specs: externalFilters.specs || {},
        tags: externalFilters.tags || [],
        inStock: externalFilters.inStock !== undefined ? externalFilters.inStock : true,
        hasDiscount: externalFilters.hasDiscount || false,
        minRating: externalFilters.minRating || null,
      });

      // Update price range if external filters have price values
      if (externalFilters.priceMin !== null || externalFilters.priceMax !== null) {
        setPriceRange([
          externalFilters.priceMin || 0,
          externalFilters.priceMax || 100000
        ]);
      }
    }
  }, [externalFilters]);

  // ✅ OPTIMIZED: Only fetch filter options on shop pages
  // Prevents unnecessary API calls on homepage/other pages
  useEffect(() => {
    // Check if we're on a shop page
    if (typeof window === 'undefined') return;
    const isShopPage = window.location.pathname.includes('/shop');
    
    if (!isShopPage) {
      // Not on shop page, don't load filters yet
      setLoading(false);
      return;
    }

    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const startTime = Date.now();
        
        // Fetch all brands for filter (Redis Tier 1: 6-24h cache)
        // WHY: Brands rarely change, perfect for long-term caching
        const brandsRes = await api.brands.getAll();
        if (brandsRes?.success && brandsRes?.data) {
          setBrands(brandsRes.data);
        }

        // Fetch attributes (optional - may not be needed if dynamic from products)
        try {
          const attrsRes = await api.attributes.getAll();
          if (attrsRes?.success && attrsRes?.data) {
            setAttributes(attrsRes.data);
          }
        } catch (err) {
          // Attributes endpoint may not exist - that's okay
          if (process.env.NODE_ENV === 'development') {
            console.log("Attributes endpoint not available");
          }
        }

        // Specs and tags can be loaded dynamically or from product data
        
        const loadTime = Date.now() - startTime;
        
        // ✅ NEW: Log cache performance in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Filter options loaded in ${loadTime}ms`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Handle brand toggle
  const toggleBrand = useCallback((brandId) => {
    setLocalFilters(prev => {
      const newBrands = prev.brands.includes(brandId)
        ? prev.brands.filter(id => id !== brandId)
        : [...prev.brands, brandId];
      
      const updated = { ...prev, brands: newBrands };
      
      // Calculate total active filters
      const totalActive = calculateActiveFilters(updated);
      const withMeta = {
        ...updated,
        _meta: {
          totalActiveFilters: totalActive,
          lastUpdate: Date.now(),
          filterType: 'brand'
        }
      };
      
      // Notify parent
      if (onFiltersChange) {
        onFiltersChange(withMeta);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Handle attribute toggle
  const toggleAttribute = useCallback((attributeName, value) => {
    setLocalFilters(prev => {
      const currentValues = prev.attributes[attributeName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      const newAttributes = { ...prev.attributes };
      if (newValues.length > 0) {
        newAttributes[attributeName] = newValues;
      } else {
        delete newAttributes[attributeName];
      }
      
      const updated = { ...prev, attributes: newAttributes };
      
      const totalActive = calculateActiveFilters(updated);
      const withMeta = {
        ...updated,
        _meta: {
          totalActiveFilters: totalActive,
          lastUpdate: Date.now(),
          filterType: 'attribute'
        }
      };
      
      if (onFiltersChange) {
        onFiltersChange(withMeta);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Handle spec toggle
  const toggleSpec = useCallback((specType, value) => {
    setLocalFilters(prev => {
      const currentValues = prev.specs[specType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      const newSpecs = { ...prev.specs };
      if (newValues.length > 0) {
        newSpecs[specType] = newValues;
      } else {
        delete newSpecs[specType];
      }
      
      const updated = { ...prev, specs: newSpecs };
      
      const totalActive = calculateActiveFilters(updated);
      const withMeta = {
        ...updated,
        _meta: {
          totalActiveFilters: totalActive,
          lastUpdate: Date.now(),
          filterType: 'spec'
        }
      };
      
      if (onFiltersChange) {
        onFiltersChange(withMeta);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Handle price range change
  const handlePriceChange = useCallback((value) => {
    setPriceRange(value);
  }, []);

  // Apply price range when user releases slider
  const handlePriceChangeComplete = useCallback((value) => {
    setLocalFilters(prev => {
      const updated = {
        ...prev,
        priceMin: value[0],
        priceMax: value[1]
      };
      
      const totalActive = calculateActiveFilters(updated);
      const withMeta = {
        ...updated,
        _meta: {
          totalActiveFilters: totalActive,
          lastUpdate: Date.now(),
          filterType: 'price'
        }
      };
      
      if (onFiltersChange) {
        onFiltersChange(withMeta);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Handle checkbox filters (inStock, hasDiscount)
  const toggleCheckbox = useCallback((field) => {
    setLocalFilters(prev => {
      const updated = { ...prev, [field]: !prev[field] };
      
      const totalActive = calculateActiveFilters(updated);
      const withMeta = {
        ...updated,
        _meta: {
          totalActiveFilters: totalActive,
          lastUpdate: Date.now(),
          filterType: field
        }
      };
      
      if (onFiltersChange) {
        onFiltersChange(withMeta);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Calculate total active filters
  const calculateActiveFilters = (filters) => {
    let count = 0;
    if (filters.brands?.length) count += filters.brands.length;
    if (filters.priceMin !== null || filters.priceMax !== null) count += 1;
    if (filters.attributes) {
      count += Object.values(filters.attributes).flat().length;
    }
    if (filters.specs) {
      count += Object.values(filters.specs).flat().length;
    }
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.hasDiscount) count += 1;
    if (filters.minRating) count += 1;
    if (!filters.inStock) count += 1; // Count as filter if NOT showing in-stock only
    return count;
  };

  return (
    <div className="accordion" id="filters-accordion">
      
      {/* BRANDS FILTER */}
      {brands.length > 0 && (
        <div className="accordion-item mb-4 pb-3">
          <h5 className="accordion-header" id="accordion-heading-brand">
            <button
              className="accordion-button p-0 border-0 fs-5 text-uppercase"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#accordion-filter-brand"
              aria-expanded="true"
              aria-controls="accordion-filter-brand"
            >
              Брэнд
              <svg
                className="accordion-button__icon type2"
                viewBox="0 0 10 6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g aria-hidden="true" stroke="none" fillRule="evenodd">
                  <path d="M5.35668 0.159286C5.16235 -0.053094 4.83769 -0.0530941 4.64287 0.159286L0.147611 5.05963C-0.0492049 5.27473 -0.049205 5.62357 0.147611 5.83813C0.344427 6.05323 0.664108 6.05323 0.860924 5.83813L5 1.32706L9.13858 5.83867C9.33589 6.05378 9.65507 6.05378 9.85239 5.83867C10.0492 5.62357 10.0492 5.27473 9.85239 5.06018L5.35668 0.159286Z" />
                </g>
              </svg>
            </button>
          </h5>
          <div
            id="accordion-filter-brand"
            className="accordion-collapse collapse show border-0"
            aria-labelledby="accordion-heading-brand"
            data-bs-parent="#filters-accordion"
          >
            <div className="accordion-body px-0 pb-0 pt-3">
              <ul className="list list-unstyled mb-0">
                {brands.map((brand) => (
                  <li key={brand.id} className="list-item mb-2">
                    <label className="d-flex align-items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="me-2"
                        checked={localFilters.brands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                      />
                      <span>{brand.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PRICE FILTER */}
      <div className="accordion-item mb-4 pb-3">
        <h5 className="accordion-header" id="accordion-heading-price">
          <button
            className="accordion-button p-0 border-0 fs-5 text-uppercase"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#accordion-filter-price"
            aria-expanded="true"
            aria-controls="accordion-filter-price"
          >
            Үнэ
            <svg
              className="accordion-button__icon type2"
              viewBox="0 0 10 6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g aria-hidden="true" stroke="none" fillRule="evenodd">
                <path d="M5.35668 0.159286C5.16235 -0.053094 4.83769 -0.0530941 4.64287 0.159286L0.147611 5.05963C-0.0492049 5.27473 -0.049205 5.62357 0.147611 5.83813C0.344427 6.05323 0.664108 6.05323 0.860924 5.83813L5 1.32706L9.13858 5.83867C9.33589 6.05378 9.65507 6.05378 9.85239 5.83867C10.0492 5.62357 10.0492 5.27473 9.85239 5.06018L5.35668 0.159286Z" />
              </g>
            </svg>
          </button>
        </h5>
        <div
          id="accordion-filter-price"
          className="accordion-collapse collapse show border-0"
          aria-labelledby="accordion-heading-price"
          data-bs-parent="#filters-accordion"
        >
          <div className="accordion-body px-0 pb-0 pt-3">
            <Slider
              range
              min={0}
              max={100000}
              step={1000}
              value={priceRange}
              onChange={handlePriceChange}
              onChangeComplete={handlePriceChangeComplete}
            />
            <div className="price-range__info d-flex align-items-center mt-3">
              <div className="me-auto">
                <span className="text-secondary">Доод: </span>
                <span className="price-range__min">₮{priceRange[0].toLocaleString()}</span>
              </div>
              <div>
                <span className="text-secondary">Дээд: </span>
                <span className="price-range__max">₮{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IN STOCK FILTER */}
      <div className="accordion-item mb-4 pb-3">
        <div className="accordion-body px-0 pb-0">
          <label className="d-flex align-items-center cursor-pointer">
            <input
              type="checkbox"
              className="me-2"
              checked={localFilters.inStock}
              onChange={() => toggleCheckbox('inStock')}
            />
            <span>Зөвхөн нөөцтэй бараа</span>
          </label>
        </div>
      </div>

      {/* DISCOUNT FILTER */}
      <div className="accordion-item mb-4 pb-3">
        <div className="accordion-body px-0 pb-0">
          <label className="d-flex align-items-center cursor-pointer">
            <input
              type="checkbox"
              className="me-2"
              checked={localFilters.hasDiscount}
              onChange={() => toggleCheckbox('hasDiscount')}
            />
            <span>Хямдралтай бараа</span>
          </label>
        </div>
      </div>

    </div>
  );
}
