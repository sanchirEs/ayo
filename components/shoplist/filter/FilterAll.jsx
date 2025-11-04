"use client";

import React, { useState, useEffect, useCallback } from "react";
import Slider from "rc-slider";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useContextElement } from "@/context/Context";

/**
 * FilterAll - Enhanced to use filterOptions from backend response
 * Now supports Redis-cached filter options from /products/enhanced
 * WITH CATEGORY TREE NAVIGATION
 */
export default function FilterAll({ onFiltersChange, externalFilters }) {
  const params = useParams();
  const router = useRouter();
  const { setCurrentCategory } = useContextElement();
  const currentCategoryId = params?.categoryId ? parseInt(params.categoryId) : null;
  
  // Category tree state (for category navigation at top)
  const [catTree, setCatTree] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
  // Accordion states for filter sections
  const [expandedAccordions, setExpandedAccordions] = useState(new Set(['categories', 'brands', 'price']));
  
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

  // Filter options from backend (will be populated by Shop4)
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [priceRangeLimits, setPriceRangeLimits] = useState({ min: 0, max: 100000 });
  const [loading, setLoading] = useState(false);

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

  // Load category tree from backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCatLoading(true);
        setCatError(null);
        const res = await api.categories.getTree();
        const payload = res?.data ?? res;
        if (alive) {
          if (Array.isArray(payload)) {
            setCatTree(payload);
            console.log('✅ Categories loaded:', payload.length);
          } else if (payload === null) {
            setCatTree([]);
          }
        }
      } catch (e) {
        if (alive) {
          if (e.message.includes('404') || e.message.includes('Not Found')) {
            setCatTree([]);
            return;
          }
          setCatError("Ангилал ачаалахад алдаа гарлаа");
        }
      } finally {
        if (alive) setCatLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  
  // Auto-expand parent when URL changes to a child category
  useEffect(() => {
    if (currentCategoryId && catTree.length > 0) {
      expandParentIfChildSelected(currentCategoryId);
    }
  }, [currentCategoryId, catTree]);

  // Get filter options from window (Shop4 stores them there)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.__shopFilterOptions) {
        const filterOpts = window.__shopFilterOptions;
        
        console.log('✅ FilterAll: Received filterOptions from Shop4:', {
          brands: filterOpts.brands?.length,
          attributes: filterOpts.attributes?.length,
          priceRange: filterOpts.priceRange
        });
        
        // Set brands
        if (filterOpts.brands && Array.isArray(filterOpts.brands)) {
          setBrands(filterOpts.brands);
        }
        
        // Set attributes (convert array to object for easier rendering)
        if (filterOpts.attributes && Array.isArray(filterOpts.attributes)) {
          setAttributes(filterOpts.attributes);
        }
        
        // Set price range limits
        if (filterOpts.priceRange) {
          const min = parseInt(filterOpts.priceRange.min) || 0;
          const max = parseInt(filterOpts.priceRange.max) || 100000;
          setPriceRangeLimits({ min, max });
          
          // Update slider if not already set by user
          if (priceRange[0] === 0 && priceRange[1] === 100000) {
            setPriceRange([min, max]);
          }
        }
        
        setLoading(false);
        clearInterval(checkInterval);
      }
    }, 100);
    
    // Stop checking after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      setLoading(false);
    }, 5000);
    
    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Handle brand toggle
  const toggleBrand = useCallback((brandId) => {
    setLocalFilters(prev => {
      const newBrands = prev.brands.includes(brandId)
        ? prev.brands.filter(id => id !== brandId)
        : [...prev.brands, brandId];
      
      const updated = { ...prev, brands: newBrands };
      
      // Notify parent
      if (onFiltersChange) {
        setTimeout(() => {
          onFiltersChange({
            ...updated,
            _meta: {
              totalActiveFilters: calculateActiveFilters(updated),
              lastUpdate: Date.now(),
              filterType: 'brand'
            }
          });
        }, 0);
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
      
      if (onFiltersChange) {
        setTimeout(() => {
          onFiltersChange({
            ...updated,
            _meta: {
              totalActiveFilters: calculateActiveFilters(updated),
              lastUpdate: Date.now(),
              filterType: 'attribute'
            }
          });
        }, 0);
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
      
      if (onFiltersChange) {
        setTimeout(() => {
          onFiltersChange({
            ...updated,
            _meta: {
              totalActiveFilters: calculateActiveFilters(updated),
              lastUpdate: Date.now(),
              filterType: 'price'
            }
          });
        }, 0);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Handle checkbox filters (inStock, hasDiscount)
  const toggleCheckbox = useCallback((field) => {
    setLocalFilters(prev => {
      const updated = { ...prev, [field]: !prev[field] };
      
      if (onFiltersChange) {
        setTimeout(() => {
          onFiltersChange({
            ...updated,
            _meta: {
              totalActiveFilters: calculateActiveFilters(updated),
              lastUpdate: Date.now(),
              filterType: field
            }
          });
        }, 0);
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
    if (!filters.inStock) count += 1;
    return count;
  };
  
  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };
  
  // Check if category is active
  const isCategoryActive = (category) => {
    if (category.id === currentCategoryId) return true;
    if (category.children) {
      return category.children.some(child => isCategoryActive(child));
    }
    return false;
  };
  
  // Auto-expand parent when child is selected
  const expandParentIfChildSelected = (categoryId) => {
    const findParent = (categories, targetId) => {
      for (const category of categories) {
        if (category.children) {
          for (const child of category.children) {
            if (child.id === targetId) {
              return category.id;
            }
            const deeperParent = findParent([child], targetId);
            if (deeperParent) return deeperParent;
          }
        }
      }
      return null;
    };

    const parentId = findParent(catTree, categoryId);
    if (parentId) {
      setExpandedCategories(prev => {
        const newSet = new Set(prev);
        newSet.add(parentId);
        return newSet;
      });
    }
  };
  
  // Render category recursively
  const renderCategory = (category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const isActive = isCategoryActive(category);
    const hasChildren = category.children && category.children.length > 0;
    const paddingLeft = level * 16;

    return (
      <li key={category.id} className="category-item">
        <div 
          className={`category-row d-flex align-items-center justify-content-between py-1 ${
            isActive ? `category-active ${level === 0 ? 'parent-category' : ''}` : ''
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div 
            className="d-flex align-items-center flex-grow-1"
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleCategory(category.id);
              }
            }}
            style={{ cursor: hasChildren ? 'pointer' : 'default' }}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className={`me-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              style={{ opacity: hasChildren ? 1 : 0.3 }}
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <div
              className={`category-link text-decoration-none flex-grow-1 cursor-pointer ${
                isActive ? 'text-primary fw-medium' : 'text-dark'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Save category info to context
                setCurrentCategory({
                  id: category.id,
                  name: category.name
                });
                
                // Navigate to category
                router.push(`/shop/${category.id}`, { scroll: false });
              }}
            >
              {category.name}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <ul className="subcategories list-unstyled mb-0">
            {category.children.map(child => renderCategory(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };
  
  // Toggle accordion sections
  const toggleAccordion = (accordionId) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accordionId)) {
        newSet.delete(accordionId);
      } else {
        newSet.add(accordionId);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Category Tree Styles */}
      <style jsx>{`
        .category-item {
          list-style: none;
        }
        
        .category-row {
          transition: all 0.2s ease;
          border-radius: 4px;
          padding: 4px 8px;
        }
        
        .category-row:hover {
          background-color: #f8f9fa;
        }
        
        .category-active {
          background-color: #e8f5e9;
          font-weight: 500;
        }
        
        .parent-category {
          border-left: 3px solid #495D35;
        }
        
        .category-link {
          padding: 4px 0;
          transition: color 0.2s ease;
        }
        
        .category-link:hover {
          color: #495D35 !important;
        }
        
        .subcategories {
          margin-top: 4px;
        }
        
        .transition-transform {
          transition: transform 0.2s ease;
        }
        
        .rotate-90 {
          transform: rotate(90deg);
        }
      `}</style>
      
      {/* CATEGORY TREE SECTION - Navigation at the top */}
      <div className="accordion" id="categories-list">
        <div className="accordion-item mb-4">
          <h5 className="accordion-header" id="accordion-heading-categories">
            <button
              className="accordion-button p-0 border-0 fs-5 text-uppercase"
              type="button"
              onClick={() => toggleAccordion('categories')}
              aria-expanded={expandedAccordions.has('categories')}
            >
              Бүх Ангилал
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
            className={`accordion-collapse border-0 ${expandedAccordions.has('categories') ? 'show' : 'collapse'}`}
            aria-labelledby="accordion-heading-categories"
          >
            <div className="accordion-body px-0 pb-0 pt-3">
              {catLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : catError ? (
                <div className="text-danger small py-2">{catError}</div>
              ) : (
                <ul className="categories-list list-unstyled mb-0">
                  {catTree.map(category => renderCategory(category))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      
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
              {localFilters.brands.length > 0 && (
                <span className="badge bg-primary ms-2">{localFilters.brands.length}</span>
              )}
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
                      {brand.productCount > 0 && (
                        <span className="ms-auto text-muted small">({brand.productCount})</span>
                      )}
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
              min={priceRangeLimits.min}
              max={priceRangeLimits.max}
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
            <small className="text-muted d-block mt-2">
              Range: ₮{priceRangeLimits.min.toLocaleString()} - ₮{priceRangeLimits.max.toLocaleString()}
            </small>
          </div>
        </div>
      </div>

      {/* ATTRIBUTES FILTER - Dynamically rendered from backend */}
      {attributes.length > 0 && attributes.map((attribute) => {
        const currentValues = localFilters.attributes[attribute.name] || [];
        
        return (
          <div key={attribute.name} className="accordion-item mb-4 pb-3">
            <h5 className="accordion-header">
              <button
                className="accordion-button p-0 border-0 fs-5 text-uppercase"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#accordion-filter-${attribute.name.replace(/\s+/g, '-')}`}
                aria-expanded="true"
              >
                {attribute.name}
                {currentValues.length > 0 && (
                  <span className="badge bg-primary ms-2">{currentValues.length}</span>
                )}
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
              id={`accordion-filter-${attribute.name.replace(/\s+/g, '-')}`}
              className="accordion-collapse collapse show border-0"
            >
              <div className="accordion-body px-0 pb-0 pt-3">
                <ul className="list list-unstyled mb-0">
                  {attribute.values && attribute.values.map((value, idx) => (
                    <li key={`${value}-${idx}`} className="list-item mb-2">
                      <label className="d-flex align-items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="me-2"
                          checked={currentValues.includes(value)}
                          onChange={() => toggleAttribute(attribute.name, value)}
                        />
                        <span>{value}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

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
    </>
  );
}
