"use client";

// Enhanced filter component with sophisticated UX
import { useEffect, useState, useCallback, useMemo } from "react";
import Slider from "rc-slider";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { sortingOptions } from "@/data/products/productCategories";
import { useContextElement } from "@/context/Context";

// Smart debounce hook for price and search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function FilterAll({ onFiltersChange }) {
  const params = useParams();
  const router = useRouter();
  const { setCurrentCategory } = useContextElement();
  const currentCategoryId = params?.categoryId ? parseInt(params.categoryId) : null;
  
  // Get URL search params for filter initialization
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  
  // Helper functions for URL parsing (moved before usage)
  const parseAttributesFromURL = (attributesString) => {
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
  };

  const parseSpecsFromURL = (specsString) => {
    const specs = {};
    if (!specsString) return specs;
    
    const pairs = specsString.split(',');
    pairs.forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        if (!specs[key]) {
          specs[key] = [];
        }
        specs[key].push(value);
      }
    });
    
    return specs;
  };
  
  // Category tree state
  const [catTree, setCatTree] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Filter options from backend API (UPDATED FOR REAL STRUCTURE)
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    priceRanges: [],
    attributes: {}, // Dynamic attributes like "үнэртэн", "color", "size"
    specs: {}, // Specifications like "Хэмжээ:"
    tags: { simple: [], hierarchical: [] }
  });
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState("");

  // Initialize filter states from URL parameters
  const initializeFiltersFromURL = () => {
    const urlBrands = searchParams.get('brands') ? searchParams.get('brands').split(',').map(Number) : [];
    const urlPriceMin = searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : null;
    const urlPriceMax = searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : null;
    const urlAttributes = parseAttributesFromURL(searchParams.get('attributes'));
    const urlSpecs = parseSpecsFromURL(searchParams.get('specs'));
    const urlTags = searchParams.get('tags') ? searchParams.get('tags').split(',') : [];
    const urlInStock = searchParams.get('inStock') === 'true';
    const urlHasDiscount = searchParams.get('hasDiscount') === 'true';
    const urlSearch = searchParams.get('search') || '';
    const urlPrice = searchParams.get('price') ? searchParams.get('price').split(',').map(Number) : [20, 70987];
    
    return {
      brands: urlBrands,
      attributes: urlAttributes,
      specs: urlSpecs,
      tags: urlTags,
      search: urlSearch,
      price: urlPrice,
      inStock: urlInStock,
      hasDiscount: urlHasDiscount
    };
  };

  // Filter states (ENHANCED FOR INSTANT RESPONSE) - Initialize from URL
  const urlFilters = initializeFiltersFromURL();
  const [activeBrands, setActiveBrands] = useState(urlFilters.brands);
  const [activeAttributes, setActiveAttributes] = useState(urlFilters.attributes);
  const [activeSpecs, setActiveSpecs] = useState(urlFilters.specs);
  const [activeTags, setActiveTags] = useState(urlFilters.tags);
  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [price, setPrice] = useState(urlFilters.price);
  const [inStock, setInStock] = useState(urlFilters.inStock);
  const [hasDiscount, setHasDiscount] = useState(urlFilters.hasDiscount);

  // Debounced values for smooth UX (only for continuous inputs)
  const debouncedSearch = useDebounce(searchQuery, 300); // 300ms delay for search
  const debouncedPrice = useDebounce(price, 500); // 500ms delay for price slider

  // URL synchronization function
  const updateURL = useCallback((filters) => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    
    // Clear existing filter params
    ['brands', 'priceMin', 'priceMax', 'attributes', 'specs', 'tags', 'inStock', 'hasDiscount', 'search', 'price'].forEach(param => {
      params.delete(param);
    });
    
    // Add new filter params
    if (filters.brands && filters.brands.length > 0) {
      params.set('brands', filters.brands.join(','));
    }
    if (filters.priceMin !== null) {
      params.set('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax !== null) {
      params.set('priceMax', filters.priceMax.toString());
    }
    if (filters.attributes && Object.keys(filters.attributes).length > 0) {
      const attributeStrings = [];
      Object.entries(filters.attributes).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach(value => {
            attributeStrings.push(`${key}:${value}`);
          });
        }
      });
      if (attributeStrings.length > 0) {
        params.set('attributes', attributeStrings.join(','));
      }
    }
    if (filters.specs && Object.keys(filters.specs).length > 0) {
      const specStrings = [];
      Object.entries(filters.specs).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach(value => {
            specStrings.push(`${key}:${value}`);
          });
        }
      });
      if (specStrings.length > 0) {
        params.set('specs', specStrings.join(','));
      }
    }
    if (filters.tags && filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }
    if (filters.inStock !== true) {
      params.set('inStock', filters.inStock.toString());
    }
    if (filters.hasDiscount) {
      params.set('hasDiscount', filters.hasDiscount.toString());
    }
    if (filters.search) {
      params.set('search', filters.search);
    }
    if (filters.price && (filters.price[0] !== 20 || filters.price[1] !== 70987)) {
      params.set('price', filters.price.join(','));
    }
    
    // Update URL without page reload
    const newUrl = `${url.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, []);
  
  // Accordion states (DYNAMIC BASED ON AVAILABLE FILTERS)
  const [expandedAccordions, setExpandedAccordions] = useState(new Set(['categories', 'brands', 'price']));

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
          } else if (payload === null) {
            // API returned null data (404 handled by API client)
                    setCatTree([]);
      }
    }
  } catch (e) {
    if (alive) {
      // Don't show error for 404, just use empty categories
      if (e.message.includes('404') || e.message.includes('Not Found')) {
        setCatTree([]);
        return;
      }
          
          let errorMessage = "Ангилал ачилт алдаа";
          
          if (e.message.includes('fetch')) {
            errorMessage = "Сүлжээний холболт асуудалтай байна.";
          } else if (e.message.includes('500')) {
            errorMessage = "Серверийн алдаа гарлаа.";
          } else if (e.message) {
            errorMessage = e.message;
          }
          
          setCatError(errorMessage);
        }
      } finally {
        if (alive) setCatLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load filter options from new API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setFiltersLoading(true);
        setFiltersError(null);
        
        // Determine context based on current category (matching backend expectations)
        const context = currentCategoryId ? 'category' : 'homepage';
        const params = {
          context,
          include: 'all' // Get all filter types
        };
        
        // Add categoryId if present
        if (currentCategoryId) {
          params.categoryId = currentCategoryId;
        }
        
        const res = await api.filters.getOptions(params);
        const payload = res?.data ?? res;
        
        if (alive) {
          if (payload && payload.filters) {
            const newFilterOptions = {
              brands: payload.filters.brands || [],
              priceRanges: payload.filters.priceRanges || [],
              attributes: payload.filters.attributes || {},
              specs: payload.filters.specs || {}, // Add specs support
              tags: payload.filters.tags || { simple: [], hierarchical: [] }
            };
            
            setFilterOptions(newFilterOptions);
            
            // Auto-expand accordions for available filter types
            setExpandedAccordions(prev => {
              const newSet = new Set(prev);
              newSet.add('categories');
              newSet.add('brands');
              newSet.add('price');
              
              // Auto-expand attribute accordions
              Object.keys(newFilterOptions.attributes).forEach(key => {
                newSet.add(`attribute-${key}`);
              });
              
              // Auto-expand spec accordions
              Object.keys(newFilterOptions.specs).forEach(key => {
                newSet.add(`spec-${key}`);
              });
              
              // Auto-expand tags if available
              if (newFilterOptions.tags.simple?.length > 0 || newFilterOptions.tags.hierarchical?.length > 0) {
                newSet.add('tags');
              }
              
              // Always expand advanced filters (stock, discount toggles)
              newSet.add('advanced');
              
              return newSet;
            });
            
                  } else {
          // Fallback to empty structure
          setFilterOptions({
            brands: [],
            priceRanges: [],
            attributes: {},
            specs: {},
            tags: { simple: [], hierarchical: [] }
          });
        }
      }
    } catch (e) {
      if (alive) {
        // Don't show error for 404, just use empty filters
        if (e.message.includes('404') || e.message.includes('Not Found')) {
          setFilterOptions({
            brands: [],
            priceRanges: [],
            attributes: {},
            tags: { simple: [], hierarchical: [] }
          });
          return;
        }
          
          let errorMessage = "Шүүлтүүр ачиахад алдаа гарлаа";
          
          if (e.message.includes('fetch')) {
            errorMessage = "Сүлжээний холболт асуудалтай байна.";
          } else if (e.message.includes('500')) {
            errorMessage = "Серверийн алдаа гарлаа.";
          } else if (e.message) {
            errorMessage = e.message;
          }
          
          setFiltersError(errorMessage);
        }
      } finally {
        if (alive) setFiltersLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentCategoryId]);

  // Auto-expand parent when URL changes to a child category
  useEffect(() => {
    if (currentCategoryId && catTree.length > 0) {
      expandParentIfChildSelected(currentCategoryId);
    }
  }, [currentCategoryId, catTree]);

  // Calculate total active filters for sophisticated UX
  const totalActiveFilters = useMemo(() => {
    return activeBrands.length + 
           Object.values(activeAttributes).flat().length +
           Object.values(activeSpecs).flat().length +
           activeTags.length +
           (debouncedPrice[0] !== 20 || debouncedPrice[1] !== 70987 ? 1 : 0) +
           (debouncedSearch ? 1 : 0) +
           (!inStock ? 1 : 0) +
           (hasDiscount ? 1 : 0);
  }, [activeBrands, activeAttributes, activeSpecs, activeTags, debouncedPrice, debouncedSearch, inStock, hasDiscount]);

  // INSTANT filter notification (for immediate filters)
  const notifyInstantFilters = useCallback(() => {
    if (onFiltersChange) {
      const filterData = {
        brands: activeBrands,
        attributes: activeAttributes,
        specs: activeSpecs, 
        tags: activeTags,
        inStock: inStock,
        hasDiscount: hasDiscount,
        // Use current values for instant filters, debounced for continuous inputs
        priceMin: debouncedPrice[0] !== 20 ? debouncedPrice[0] : null,
        priceMax: debouncedPrice[1] !== 70987 ? debouncedPrice[1] : null,
        search: debouncedSearch,
        // Keep old format for backward compatibility
        colors: activeAttributes.color || [],
        sizes: activeAttributes.size || [],
        price: debouncedPrice,
        // Add metadata for sophisticated UX (FIXED FOR SSR)
        _meta: {
          totalActiveFilters,
          lastUpdate: typeof window !== 'undefined' ? Date.now() : 0,
          filterType: 'instant'
        }
      };
      
      onFiltersChange(filterData);
      updateURL(filterData); // Update URL when filters change
    }
  }, [activeBrands, activeAttributes, activeSpecs, activeTags, inStock, hasDiscount, debouncedPrice, debouncedSearch, totalActiveFilters, onFiltersChange, updateURL]);

  // DEBOUNCED filter notification (for search and price)
  const notifyDebouncedFilters = useCallback(() => {
    if (onFiltersChange) {
      const filterData = {
        brands: activeBrands,
        attributes: activeAttributes,
        specs: activeSpecs,
        tags: activeTags,
        inStock: inStock,
        hasDiscount: hasDiscount,
        priceMin: debouncedPrice[0] !== 20 ? debouncedPrice[0] : null,
        priceMax: debouncedPrice[1] !== 70987 ? debouncedPrice[1] : null,
        search: debouncedSearch,
        // Keep old format for backward compatibility
        colors: activeAttributes.color || [],
        sizes: activeAttributes.size || [],
        price: debouncedPrice,
        // Add metadata (FIXED FOR SSR)
        _meta: {
          totalActiveFilters,
          lastUpdate: typeof window !== 'undefined' ? Date.now() : 0,
          filterType: 'debounced'
        }
      };
      
      onFiltersChange(filterData);
      updateURL(filterData); // Update URL when filters change
    }
  }, [activeBrands, activeAttributes, activeSpecs, activeTags, inStock, hasDiscount, debouncedPrice, debouncedSearch, totalActiveFilters, onFiltersChange, updateURL]);

  // Instant updates for immediate filters (brands, attributes, specs, tags, toggles)
  useEffect(() => {
    notifyInstantFilters();
  }, [activeBrands, activeAttributes, activeSpecs, activeTags, inStock, hasDiscount]);

  // Debounced updates for continuous filters (search, price)
  useEffect(() => {
    notifyDebouncedFilters();
  }, [debouncedSearch, debouncedPrice]);

  // Toggle category expansion - keep parent open when child is selected
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        // If already expanded, close it
        newSet.delete(categoryId);
      } else {
        // If not expanded, open this one (don't close others)
        newSet.add(categoryId);
      }
      return newSet;
    });
  };



  // Check if category is active (current or has active child)
  const isCategoryActive = (category) => {
    if (category.id === currentCategoryId) return true;
    if (category.children) {
      return category.children.some(child => isCategoryActive(child));
    }
    return false;
  };

  // Auto-expand parent when child is selected
  const expandParentIfChildSelected = (categoryId) => {
    // Find parent category that contains this child
    const findParent = (categories, targetId) => {
      for (const category of categories) {
        if (category.children) {
          for (const child of category.children) {
            if (child.id === targetId) {
              return category.id;
            }
            // Check deeper levels
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
    const paddingLeft = level * 16; // 16px per level

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
            {hasChildren && (
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={`me-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              >
                <path d="M9 18l6-6-6-6"/>
              </svg>
            )}
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
                
                // Auto-expand parent if this is a child category
                if (level > 0) {
                  expandParentIfChildSelected(category.id);
                }
                // Simple client-side navigation
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

  // Filter functions
  // Toggle functions for DYNAMIC FILTER SYSTEM
  const toggleAttribute = (attributeKey, attributeValue) => {
    setActiveAttributes((prev) => {
      const currentValues = prev[attributeKey] || [];
      const isRemoving = currentValues.includes(attributeValue);
      
      let newState;
      if (isRemoving) {
        // Remove value
        const newValues = currentValues.filter(v => v !== attributeValue);
        if (newValues.length === 0) {
          // Remove the entire attribute key if no values left
          const { [attributeKey]: removed, ...rest } = prev;
          newState = rest;
        } else {
          newState = { ...prev, [attributeKey]: newValues };
        }
      } else {
        // Add value
        newState = { ...prev, [attributeKey]: [...currentValues, attributeValue] };
      }
      
      return newState;
    });
  };

  const toggleSpec = (specKey, specValue) => {
    // Clean the spec key to remove double colons that come from backend
    const cleanSpecKey = specKey.replace(/::+/g, '').trim();
    
    setActiveSpecs((prev) => {
      const currentValues = prev[cleanSpecKey] || [];
      if (currentValues.includes(specValue)) {
        // Remove value
        const newValues = currentValues.filter(v => v !== specValue);
        if (newValues.length === 0) {
          // Remove the entire spec key if no values left
          const { [cleanSpecKey]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [cleanSpecKey]: newValues };
      } else {
        // Add value
        return { ...prev, [cleanSpecKey]: [...currentValues, specValue] };
      }
    });
  };

  const toggleBrand = (brandId) => {
    if (activeBrands.includes(brandId)) {
      setActiveBrands((prev) => prev.filter((id) => id !== brandId));
    } else {
      setActiveBrands((prev) => [...prev, brandId]);
    }
  };

  const toggleTag = (tagValue) => {
    if (activeTags.includes(tagValue)) {
      setActiveTags((prev) => prev.filter((value) => value !== tagValue));
    } else {
      setActiveTags((prev) => [...prev, tagValue]);
    }
  };

  // SOPHISTICATED filter clear functions
  const clearAllFilters = useCallback(() => {
    setActiveBrands([]);
    setActiveAttributes({});
    setActiveSpecs({});
    setActiveTags([]);
    setSearchQuery("");
    setPrice([20, 70987]);
    setInStock(true);
    setHasDiscount(false);
    
    // Clear URL parameters
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      const params = new URLSearchParams(url.search);
      ['brands', 'priceMin', 'priceMax', 'attributes', 'specs', 'tags', 'inStock', 'hasDiscount', 'search', 'price'].forEach(param => {
        params.delete(param);
      });
      const newUrl = `${url.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  }, []);

  const clearFilterType = useCallback((filterType) => {
    switch (filterType) {
      case 'brands':
        setActiveBrands([]);
        break;
      case 'attributes':
        setActiveAttributes({});
        break;
      case 'specs':
        setActiveSpecs({});
        break;
      case 'tags':
        setActiveTags([]);
        break;
      case 'price':
        setPrice([20, 70987]);
        break;
      case 'search':
        setSearchQuery("");
        break;
    }
  }, []);

// Removed unused useEffect - search is now handled in render

  const handleOnChange = (value) => {
    setPrice(value);
  };

  // Toggle accordion
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

  // Get filter options from backend API structure (UPDATED FOR REAL DATA)
  const getBrandOptions = () => {
    return filterOptions.brands || [];
  };
  
  const getAttributeOptions = () => {
    return filterOptions.attributes || {};
  };
  
  const getSpecOptions = () => {
    return filterOptions.specs || {};
  };
  
  const getTagOptions = () => {
    return filterOptions.tags?.simple || [];
  };

  const getPriceRanges = () => {
    return filterOptions.priceRanges || [];
  };

  // Get current filter options
  const brandOptions = getBrandOptions();
  const attributeOptions = getAttributeOptions();
  const specOptions = getSpecOptions();
  const tagOptions = getTagOptions();
  const priceRanges = getPriceRanges();

  return (
    <>


      
      <div className="accordion" id="categories-list">
        <div className="accordion-item mb-4">
          <h5 className="accordion-header" id="accordion-heading-11">
            <button
              className="accordion-button p-0 border-0 fs-5 text-uppercase"
              type="button"
              onClick={() => toggleAccordion('categories')}
              aria-expanded={expandedAccordions.has('categories')}
            >
              АНГИЛАЛ
              <svg 
                className={`accordion-button__icon transition-transform ${expandedAccordions.has('categories') ? 'rotate-180' : ''}`} 
                viewBox="0 0 14 14"
              >
                <g aria-hidden="true" stroke="none" fillRule="evenodd">
                  <path
                    className="svg-path-vertical"
                    d="M14,6 L14,8 L0,8 L0,6 L14,6"
                  />
                  <path
                    className="svg-path-horizontal"
                    d="M14,6 L14,8 L0,8 L0,6 L14,6"
                  />
                </g>
              </svg>
            </button>
          </h5>
          <div
            className={`accordion-collapse border-0 ${expandedAccordions.has('categories') ? 'show' : 'collapse'}`}
            aria-labelledby="accordion-heading-11"
            style={{
              transition: 'all 0.3s ease',
              maxHeight: expandedAccordions.has('categories') ? '500px' : '0',
              overflow: 'hidden'
            }}
          >
            <div className="accordion-body px-0 pb-0">
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
        {/* /.accordion-item */}
      </div>
      {/* /.accordion-item */}

      {/* DYNAMIC ATTRIBUTES SECTION - Renders all attributes from backend */}
      {Object.keys(attributeOptions).map((attributeKey) => {
        const attribute = attributeOptions[attributeKey];
        const attributeId = `attribute-${attributeKey}`;
        const isExpanded = expandedAccordions.has(attributeId);
        const currentValues = activeAttributes[attributeKey] || [];
        
        return (
          <div key={attributeKey} className="accordion" id={`${attributeKey}-filters`}>
            <div className="accordion-item mb-4">
              <h5 className="accordion-header">
                <button
                  className="accordion-button p-0 border-0 fs-5 text-uppercase"
                  type="button"
                  onClick={() => toggleAccordion(attributeId)}
                  aria-expanded={isExpanded}
                >
                  {attribute.name || attributeKey}
                  <svg 
                    className={`accordion-button__icon transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    viewBox="0 0 14 14"
                  >
                    <g aria-hidden="true" stroke="none" fillRule="evenodd">
                      <path
                        className="svg-path-vertical"
                        d="M14,6 L14,8 L0,8 L0,6 L14,6"
                      />
                      <path
                        className="svg-path-horizontal"
                        d="M14,6 L14,8 L0,8 L0,6 L14,6"
                      />
                    </g>
                  </svg>
                </button>
              </h5>
              <div
                className={`accordion-collapse border-0 ${isExpanded ? 'show' : 'collapse'}`}
                style={{
                  transition: 'all 0.3s ease',
                  maxHeight: isExpanded ? '300px' : '0',
                  overflow: 'hidden'
                }}
              >
                <div className="accordion-body px-0 pb-0">
                  {filtersLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filtersError ? (
                    <div className="text-danger small py-2">{filtersError}</div>
                  ) : attribute.options?.length > 0 ? (
                    <div className="d-flex flex-wrap">
                      <div className="mb-2 w-100">
                        <div className="d-flex flex-wrap">
                                                     {attribute.options.map((option, index) => (
                             <button
                               key={option.id || index}
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 toggleAttribute(attributeKey, option.value);
                               }}
                               className={`btn btn-sm mb-2 me-2 js-filter`}
                               style={{
                                 border: '1px solid #495D35',
                                 color: currentValues.includes(option.value) ? 'white' : '#495D35',
                                 backgroundColor: currentValues.includes(option.value) ? '#495D35' : 'transparent',
                                 transition: 'all 0.3s ease'
                               }}
                               onMouseEnter={(e) => {
                                 if (!currentValues.includes(option.value)) {
                                   e.target.style.backgroundColor = '#495D35';
                                   e.target.style.color = 'white';
                                 }
                               }}
                               onMouseLeave={(e) => {
                                 if (!currentValues.includes(option.value)) {
                                   e.target.style.backgroundColor = 'transparent';
                                   e.target.style.color = '#495D35';
                                 }
                               }}
                             >
                               {option.value} {option.count ? `(${option.count})` : ''}
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted small py-2">{attribute.name || attributeKey} байхгүй</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* DYNAMIC SPECS SECTION - Renders all specs from backend */}
      {Object.keys(specOptions).map((specKey) => {
        const spec = specOptions[specKey];
        const specId = `spec-${specKey}`;
        const isExpanded = expandedAccordions.has(specId);
        const currentValues = activeSpecs[specKey] || [];
        
        return (
          <div key={specKey} className="accordion" id={`${specKey}-filters`}>
            <div className="accordion-item mb-4">
              <h5 className="accordion-header">
                <button
                  className="accordion-button p-0 border-0 fs-5 text-uppercase"
                  type="button"
                  onClick={() => toggleAccordion(specId)}
                  aria-expanded={isExpanded}
                >
                  {spec.type || specKey}
                  <svg 
                    className={`accordion-button__icon transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    viewBox="0 0 14 14"
                  >
                    <g aria-hidden="true" stroke="none" fillRule="evenodd">
                      <path
                        className="svg-path-vertical"
                        d="M14,6 L14,8 L0,8 L0,6 L14,6"
                      />
                      <path
                        className="svg-path-horizontal"
                        d="M14,6 L14,8 L0,8 L0,6 L14,6"
                      />
                    </g>
                  </svg>
                </button>
              </h5>
              <div
                className={`accordion-collapse border-0 ${isExpanded ? 'show' : 'collapse'}`}
                style={{
                  transition: 'all 0.3s ease',
                  maxHeight: isExpanded ? '300px' : '0',
                  overflow: 'hidden'
                }}
              >
                <div className="accordion-body px-0 pb-0">
                  {filtersLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filtersError ? (
                    <div className="text-danger small py-2">{filtersError}</div>
                  ) : spec.values?.length > 0 ? (
                    <div className="d-flex flex-wrap">
                      <div className="mb-2 w-100">
                        <div className="d-flex flex-wrap">
                          {spec.values.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => toggleSpec(specKey, option.value)}
                              className={`btn btn-sm mb-2 me-2 js-filter`}
                              style={{
                                border: '1px solid #495D35',
                                color: currentValues.includes(option.value) ? 'white' : '#495D35',
                                backgroundColor: currentValues.includes(option.value) ? '#495D35' : 'transparent',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!currentValues.includes(option.value)) {
                                  e.target.style.backgroundColor = '#495D35';
                                  e.target.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!currentValues.includes(option.value)) {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#495D35';
                                }
                              }}
                            >
                              {option.value} {option.count ? `(${option.count})` : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted small py-2">{spec.type || specKey} байхгүй</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="accordion" id="brand-filters">
        <div className="accordion-item mb-4">
          <h5 className="accordion-header" id="accordion-heading-brand">
            <button
              className="accordion-button p-0 border-0 fs-5 text-uppercase"
              type="button"
              onClick={() => toggleAccordion('brands')}
              aria-expanded={expandedAccordions.has('brands')}
            >
              Brands
              <svg 
                className={`accordion-button__icon transition-transform ${expandedAccordions.has('brands') ? 'rotate-180' : ''}`} 
                viewBox="0 0 14 14"
              >
                <g aria-hidden="true" stroke="none" fillRule="evenodd">
                  <path
                    className="svg-path-vertical"
                    d="M14,6 L14,8 L0,8 L0,6 L14,6"
                  />
                  <path
                    className="svg-path-horizontal"
                    d="M14,6 L14,8 L0,8 L0,6 L14,6"
                  />
                </g>
              </svg>
            </button>
          </h5>
          <div
            className={`accordion-collapse border-0 ${expandedAccordions.has('brands') ? 'show' : 'collapse'}`}
            aria-labelledby="accordion-heading-brand"
            style={{
              transition: 'all 0.3s ease',
              maxHeight: expandedAccordions.has('brands') ? '400px' : '0',
              overflow: 'hidden'
            }}
          >
            <div className="search-field multi-select accordion-body px-0 pb-0">
              <div className="search-field__input-wrapper mb-3">
                <input
                  type="text"
                  name="search_text"
                  className="search-field__input form-control form-control-sm border-light border-2"
                  placeholder="SEARCH"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filtersLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filtersError ? (
                <div className="text-danger small py-2">{filtersError}</div>
              ) : brandOptions.length > 0 ? (
                <ul className="multi-select__list list-unstyled">
                  {brandOptions
                    .filter((brand) =>
                      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((brand) => (
                                             <li
                         key={brand.id}
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           toggleBrand(brand.id);
                         }}
                         className={`search-suggestion__item multi-select__item text-primary js-search-select js-multi-select ${
                           activeBrands.includes(brand.id)
                             ? "mult-select__item_selected"
                             : ""
                         }`}
                         style={{ cursor: 'pointer' }}
                       >
                         <span className="me-auto">{brand.name}</span>
                         <span className="text-muted small">({brand.count || 0})</span>
                       </li>
                    ))}
                </ul>
              ) : (
                <div className="text-muted small py-2">Брэнд байхгүй</div>
              )}
            </div>
          </div>
        </div>
        {/* /.accordion-item */}
      </div>
      {/* /.accordion */}
      <div className="accordion" id="price-filters">
        <div className="accordion-item mb-4">
          <h5 className="accordion-header mb-2" id="accordion-heading-price">
            <button
              className="accordion-button p-0 border-0 fs-5 text-uppercase"
              type="button"
              onClick={() => toggleAccordion('price')}
              aria-expanded={expandedAccordions.has('price')}
            >
              Price
              <svg 
                className={`accordion-button__icon transition-transform ${expandedAccordions.has('price') ? 'rotate-180' : ''}`} 
                viewBox="0 0 14 14"
              >
                <g aria-hidden="true" stroke="none" fillRule="evenodd">
                  <path
                    className="svg-path-vertical"
                    d="M14,6 L14,8 L0,8 L0,6 L14,6"
                  />
                  <path
                    className="svg-path-horizontal"
                    d="M14,6 L14,8 L0,8 L0,6 L14,6"
                  />
                </g>
              </svg>
            </button>
          </h5>
          <div
            className={`accordion-collapse border-0 ${expandedAccordions.has('price') ? 'show' : 'collapse'}`}
            aria-labelledby="accordion-heading-price"
            style={{
              transition: 'all 0.3s ease',
              maxHeight: expandedAccordions.has('price') ? '200px' : '0',
              overflow: 'hidden'
            }}
          >

            {/* Show predefined price ranges if available, otherwise show slider */}
            {priceRanges.length > 0 ? (
              <div className="price-ranges">
                {priceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setPrice([range.min, range.max]);
                    }}
                    className={`btn btn-sm w-100 mb-2 text-start`}
                    style={{
                      border: '1px solid #495D35',
                      color: (price[0] === range.min && price[1] === range.max) ? 'white' : '#495D35',
                      backgroundColor: (price[0] === range.min && price[1] === range.max) ? '#495D35' : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!(price[0] === range.min && price[1] === range.max)) {
                        e.target.style.backgroundColor = '#495D35';
                        e.target.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(price[0] === range.min && price[1] === range.max)) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#495D35';
                      }
                    }}
                  >
                    {range.label} ({range.count})
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="mt-2">
                  <Slider
                    range
                    formatLabel={() => ``}
                    max={100000}
                    min={0}
                    defaultValue={price}
                    onChange={(value) => handleOnChange(value)}
                    id="slider"
                  />
                </div>
                
                <div className="price-range__info d-flex align-items-center mt-2">
                  <div className="me-auto">
                    <span className="text-secondary">Min Price: </span>
                    <span className="price-range__min">${price[0]}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Max Price: </span>
                    <span className="price-range__max">${price[1]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* /.accordion-item */}
      </div>
      {/* /.accordion */}

             {/* TAGS SECTION - If tags are available */}
       {tagOptions.length > 0 && (
         <div className="accordion" id="tag-filters">
           <div className="accordion-item mb-4">
             <h5 className="accordion-header">
               <button
                 className="accordion-button p-0 border-0 fs-5 text-uppercase"
                 type="button"
                 onClick={() => toggleAccordion('tags')}
                 aria-expanded={expandedAccordions.has('tags')}
               >
                 🏷️ TAGS
                 <svg 
                   className={`accordion-button__icon transition-transform ${expandedAccordions.has('tags') ? 'rotate-180' : ''}`} 
                   viewBox="0 0 14 14"
                 >
                   <g aria-hidden="true" stroke="none" fillRule="evenodd">
                     <path
                       className="svg-path-vertical"
                       d="M14,6 L14,8 L0,8 L0,6 L14,6"
                     />
                     <path
                       className="svg-path-horizontal"
                       d="M14,6 L14,8 L0,8 L0,6 L14,6"
                     />
                   </g>
                 </svg>
               </button>
             </h5>
             <div
               className={`accordion-collapse border-0 ${expandedAccordions.has('tags') ? 'show' : 'collapse'}`}
               style={{
                 transition: 'all 0.3s ease',
                 maxHeight: expandedAccordions.has('tags') ? '300px' : '0',
                 overflow: 'hidden'
               }}
             >
               <div className="accordion-body px-0 pb-0">
                 <div className="d-flex flex-wrap">
                   {tagOptions.map((tag, index) => (
                     <button
                       key={tag.id || index}
                       onClick={() => toggleTag(tag.value || tag.name || tag.tag || tag)}
                       className={`btn btn-sm mb-2 me-2 js-filter`}
                       style={{
                         border: '1px solid #495D35',
                         color: activeTags.includes(tag.value || tag.name || tag.tag || tag) ? 'white' : '#495D35',
                         backgroundColor: activeTags.includes(tag.value || tag.name || tag.tag || tag) ? '#495D35' : 'transparent',
                         transition: 'all 0.3s ease'
                       }}
                       onMouseEnter={(e) => {
                         if (!activeTags.includes(tag.value || tag.name || tag.tag || tag)) {
                           e.target.style.backgroundColor = '#495D35';
                           e.target.style.color = 'white';
                         }
                       }}
                       onMouseLeave={(e) => {
                         if (!activeTags.includes(tag.value || tag.name || tag.tag || tag)) {
                           e.target.style.backgroundColor = 'transparent';
                           e.target.style.color = '#495D35';
                         }
                       }}
                     >
                       {tag.name || tag.value || tag.tag || tag} {tag.count ? `(${tag.count})` : ''}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* STOCK & DISCOUNT TOGGLES - Professional toggles */}
       <div className="accordion" id="advanced-filters">
         <div className="accordion-item mb-4">
           <h5 className="accordion-header">
             <button
               className="accordion-button p-0 border-0 fs-5 text-uppercase"
               type="button"
               onClick={() => toggleAccordion('advanced')}
               aria-expanded={expandedAccordions.has('advanced')}
             >
               ⚙️ НЭМЭЛТ ШҮҮЛТҮҮР
               <svg 
                 className={`accordion-button__icon transition-transform ${expandedAccordions.has('advanced') ? 'rotate-180' : ''}`} 
                 viewBox="0 0 14 14"
               >
                 <g aria-hidden="true" stroke="none" fillRule="evenodd">
                   <path
                     className="svg-path-vertical"
                     d="M14,6 L14,8 L0,8 L0,6 L14,6"
                   />
                   <path
                     className="svg-path-horizontal"
                     d="M14,6 L14,8 L0,8 L0,6 L14,6"
                   />
                 </g>
               </svg>
             </button>
           </h5>
           <div
             className={`accordion-collapse border-0 ${expandedAccordions.has('advanced') ? 'show' : 'collapse'}`}
             style={{
               transition: 'all 0.3s ease',
               maxHeight: expandedAccordions.has('advanced') ? '200px' : '0',
               overflow: 'hidden'
             }}
           >
             <div className="accordion-body px-0 pb-0">
               <div className="row g-3">
                 <div className="col-6">
                   <div className="form-check form-switch">
                     <input
                       className="form-check-input"
                       type="checkbox"
                       checked={inStock}
                       onChange={(e) => setInStock(e.target.checked)}
                       id="inStockSwitch"
                       style={{
                         backgroundColor: inStock ? '#495D35' : '#ccc',
                         borderColor: inStock ? '#495D35' : '#ccc',
                         boxShadow: inStock ? '0 0 0 0.2rem rgba(73, 93, 53, 0.25)' : 'none'
                       }}
                     />
                     <label className="form-check-label fw-medium" htmlFor="inStockSwitch">
                       📦 Нөөцтэй
                     </label>
                   </div>
                 </div>
                 <div className="col-6">
                   <div className="form-check form-switch">
                     <input
                       className="form-check-input"
                       type="checkbox"
                       checked={hasDiscount}
                       onChange={(e) => setHasDiscount(e.target.checked)}
                       id="hasDiscountSwitch"
                       style={{
                         backgroundColor: hasDiscount ? '#495D35' : '#ccc',
                         borderColor: hasDiscount ? '#495D35' : '#ccc',
                         boxShadow: hasDiscount ? '0 0 0 0.2rem rgba(73, 93, 53, 0.25)' : 'none'
                       }}
                     />
                     <label className="form-check-label fw-medium" htmlFor="hasDiscountSwitch">
                       🏷️ Хямдралтай
                     </label>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
      
      {/* Sorting Filter - Removed, now handled in Shop4 component */}
             

    </>
  );
}
