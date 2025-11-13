"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useParams } from "next/navigation";

import { useContextElement } from "@/context/Context";
import { useFilterContext } from "@/context/FilterContext";
import { openModalShopFilter } from "@/utlis/aside";
import { sortingOptions } from "@/data/products/productCategories";
import FilterAll from "./filter/FilterAll";
import MobileFilterFooter from "./MobileFilterFooter";
import BreadCumb from "./BreadCumb";
import Star from "../common/Star";
import ColorSelection from "../common/ColorSelection";
import api from "@/lib/api";
import Pagination2 from "../common/Pagination2";

// Grid-ийн боломжит баганын тоо
const itemPerRow = [2, 3, 4];

// Frontend sort → backend sortBy param map (NEW FILTER SYSTEM)
function mapSortToBackend(value) {
  switch (value) {
    case "price-asc":
      return "price_asc";
    case "price-desc":
      return "price_desc";
    case "name-asc":
      return "name_asc";
    case "name-desc":
      return "name_desc";
    case "rating-desc":
      return "rating";
    case "popular":
      return "popular";
    case "oldest":
      return "oldest";
    case "newest":
    default:
      return "newest";
  }
}

/**
 * props:
 * - categoryId? : number (байхгүй бол бүх бүтээгдэхүүн)
 * - initialPage?: number
 * - initialLimit?: number
 * - initialSort?: "newest" | "price-asc" | "price-desc" | "rating-desc"
 */
export default function Shop4({
  categoryId: propCategoryId = null,
  initialPage = 1,
  initialLimit = 20,
  initialSort = "newest",
  appliedFilters = null, // Filters from ShopLayoutWrapper
  onFiltersChange = null, // Filter change handler from ShopLayoutWrapper
  // Debug props (commented out for production)
  // _debugShopLayout = false,
  // _debugFilterCount = 0,
  // _debugTimestamp = null,
  ...otherProps
}) {


  const params = useParams();
  const urlCategoryId = params?.categoryId ? parseInt(params.categoryId) : null;
  const categoryId = propCategoryId || urlCategoryId;
  

  
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  
  // Get current filters from FilterContext for active filters display
  const { appliedFilters: contextFilters } = useFilterContext();

  const [selectedColView, setSelectedColView] = useState(4);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Selected variants state for each product
  const [selectedVariants, setSelectedVariants] = useState({});

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Handle variant selection change
  const handleVariantChange = useCallback((productId, variantId) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }));
  }, []);

  // ---- products state ----
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: initialPage,
    limit: initialLimit,
  });
  const [sort, setSort] = useState(initialSort);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Enhanced loading states for sophisticated UX (FIXED FOR SSR)
  const [isFilteringActive, setIsFilteringActive] = useState(false);
  const [lastFilterUpdate, setLastFilterUpdate] = useState(0);
  
  // Use filters from context (most up-to-date) or fallback to props or default
  const filters = contextFilters || appliedFilters || {
    brands: [], // Array of brand IDs
    priceMin: null,
    priceMax: null,
    attributes: {}, // { color: ["red", "blue"], size: ["M", "L"] }
    specs: {}, // Add specs support
    tags: [], // Array of tag strings
    inStock: true, // Show only in-stock products by default
    hasDiscount: false,
    minRating: null,
    // Backward compatibility
    colors: [],
    sizes: [],
    price: [20, 70987],
    // Metadata for debugging (commented out for production)
    // _meta: {
    //   totalActiveFilters: 0,
    //   lastUpdate: 0,
    //   filterType: 'default'
    // }
  };

  // Calculate total active filters
  const totalActiveFilters = filters._meta?.totalActiveFilters || 
    (filters.brands?.length || 0) + 
    (filters.priceMin !== null ? 1 : 0) + 
    (filters.priceMax !== null ? 1 : 0) + 
    Object.values(filters.attributes || {}).flat().length +
    Object.values(filters.specs || {}).flat().length +
    (filters.tags?.length || 0) + 
    (filters.hasDiscount ? 1 : 0) + 
    (filters.minRating ? 1 : 0) + 
    (filters.search ? 1 : 0) + 
    (!filters.inStock ? 1 : 0);

  // ---- category state ----
  const [categoryName, setCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // ✅ SIMPLIFIED: Redis handles caching on backend - no local cache needed
  // WHY: Tier 1 Redis cache (6-24h TTL) is more efficient and shared across all users
  useEffect(() => {
    if (categoryId) {
      setCategoryLoading(true);
      api.categories.getById(categoryId)
        .then(response => {
          if (response.success && response.data) {
            setCategoryName(response.data.name);
          } else {
            setCategoryName("Ангилал");
          }
        })
        .catch((error) => {
          // Silently handle 404s with fallback name
          if (error.message.includes('404') || error.message.includes('Not Found')) {
            setCategoryName("Ангилал");
          } else {
            setCategoryName("Ангилал");
          }
        })
        .finally(() => {
          setCategoryLoading(false);
        });
    } else {
      setCategoryName("");
    }
  }, [categoryId]); // Redis caches on backend, simplified dependency array

  // Filter change is now handled by parent component (ShopLayoutWrapper)
  // No need for local handleFiltersChange since we receive onFiltersChange prop

  // ---- ENHANCED load products with sophisticated UX ----
  async function loadProducts({ 
    page = initialPage, 
    limit = initialLimit, 
    sortValue = sort, 
    showLoading = true,
    isFilterChange = false 
  } = {}) {
    
    // Smart loading state management
    if (showLoading) {
      setLoading(true);
    } else if (isFilterChange) {
      setIsFilteringActive(true); // Show subtle filtering indicator
    }
    
    setErr("");
    const requestStartTime = typeof window !== 'undefined' ? Date.now() : 0;
    
    try {
      const sortBy = mapSortToBackend(sortValue);
      
      // Build parameters for new enhanced API
      const params = { 
        page, 
        limit, 
        sortBy,
        fields: "basic", // Basic product info
        include: "variants,inventory", // Include variants and inventory info
      };

      // Add category filter
      if (categoryId) {
        params.categoryId = categoryId;
      }

      // Add brand filters
      if (filters.brands && filters.brands.length > 0) {
        params.brands = filters.brands.join(',');
      }

      // Add price filters
      if (filters.priceMin !== null) {
        params.priceMin = filters.priceMin;
      }
      if (filters.priceMax !== null) {
        params.priceMax = filters.priceMax;
      }

      // Add attribute filters (dynamic attributes from backend)
      if (filters.attributes && Object.keys(filters.attributes).length > 0) {
        const attributeStrings = [];
        Object.entries(filters.attributes).forEach(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            values.forEach(value => {
              // Backend expects format: key:value (single colon)
              attributeStrings.push(`${key}:${value}`);
            });
          }
        });
        if (attributeStrings.length > 0) {
          params.attributes = attributeStrings.join(',');
          // console.log('🔍 DEBUG: Attribute filters being sent:', params.attributes);
        }
      }

      // Add spec filters (specifications from backend)
      if (filters.specs && Object.keys(filters.specs).length > 0) {
        const specStrings = [];
        Object.entries(filters.specs).forEach(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            values.forEach(value => {
              // Backend expects format: key:value (single colon)
              // Don't clean the key - keep it as is from backend
              const specString = `${key}:${value}`;
              specStrings.push(specString);
            });
          }
        });
        if (specStrings.length > 0) {
          params.specs = specStrings.join(',');
        }
      }

      // Add tag filters
      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }



      // Add stock filter
      if (filters.inStock) {
        params.inStock = "true";
      }

      // Add discount filter
      if (filters.hasDiscount) {
        params.hasDiscount = "true";
      }

      // Add rating filter
      if (filters.minRating) {
        params.minRating = filters.minRating;
      }

      // Add delivery filters
      if (filters.deliveryType) {
        params.deliveryType = filters.deliveryType;
      }
      if (filters.isImported) {
        params.isImported = "true";
      }
      if (filters.maxDeliveryDays) {
        params.maxDeliveryDays = filters.maxDeliveryDays;
      }



      // Use new enhanced products API (NOW WITH REDIS CACHING!)
      const res = await api.products.enhanced(params);

      // Handle response structure from new API
      const responseData = res?.data || res;
      const productList = responseData?.products || [];
      const paginationData = responseData?.pagination || {
        total: productList.length,
        totalPages: Math.max(1, Math.ceil(productList.length / limit)),
        page: page,
        limit: limit,
        hasNext: false,
        hasPrev: false
      };
      
      // ✅ Extract filter options from response (NEW!)
      const filterOptions = responseData?.filterOptions || {
        brands: [],
        priceRange: { min: 0, max: 100000 },
        attributes: []
      };
      
      // ✅ Store filter options globally for FilterAll component
      if (typeof window !== 'undefined') {
        window.__shopFilterOptions = filterOptions;
        console.log('🏷️  FilterOptions available:', {
          brands: filterOptions.brands?.length || 0,
          priceRange: filterOptions.priceRange,
          attributes: filterOptions.attributes?.length || 0,
          cached: responseData?.meta?.cached || false
        });
      }

      // Map pagination fields to match current structure
      const mappedPagination = {
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 1,
        currentPage: paginationData.page || page,
        limit: paginationData.limit || limit,
        hasNext: paginationData.hasNext || false,
        hasPrev: paginationData.hasPrev || false
      };

      // Performance tracking
      const requestDuration = typeof window !== 'undefined' ? Date.now() - requestStartTime : 0;
      
      // ✅ Log performance with cache info
      console.log('📊 Shop4 Products Loaded:', {
        products: productList.length,
        total: mappedPagination.total,
        page: `${mappedPagination.currentPage}/${mappedPagination.totalPages}`,
        responseTime: `${requestDuration}ms`,
        cached: responseData?.meta?.cached || false,
        cacheTime: responseData?.meta?.cacheResponseTime || 'N/A'
      });
      
      // Update products with smooth transition
      setProducts(productList);
      setPagination(mappedPagination);
      setLastFilterUpdate(typeof window !== 'undefined' ? Date.now() : 0);
      
      // Set initial selected variants for products with variants
      const initialVariants = {};
      productList.forEach(product => {
        if (product.variants && product.variants.length > 0) {
          const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
          if (defaultVariant) {
            initialVariants[product.id] = defaultVariant.id;
          }
        }
      });
      setSelectedVariants(initialVariants);

    } catch (e) {
      // Sophisticated error handling
      let errorMessage = "Бүтээгдэхүүн ачаалахад алдаа гарлаа.";
      
      if (e.message.includes('fetch') || e.name === 'TypeError') {
        errorMessage = "🌐 Сүлжээний холболт асуудалтай байна. Дахин оролдоно уу.";
      } else if (e.message.includes('500')) {
        errorMessage = "⚠️ Серверийн алдаа гарлаа. Дахин оролдоно уу.";
      } else if (e.message.includes('404')) {
        errorMessage = "🔍 Хүссэн мэдээлэл олдсонгүй.";
      } else if (e.message.includes('timeout')) {
        errorMessage = "⏱️ Хүсэлт удаан байна. Дахин оролдоно уу.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setErr(errorMessage);
      setProducts([]);
      setPagination((p) => ({ ...p, total: 0, totalPages: 1 }));
    } finally {
      // Clean up loading states
      setLoading(false);
      setIsFilteringActive(false);
    }
  }

  

  

  // эхний ачаалт + dependency өөрчлөгдөхөд дахин ачаал
  useEffect(() => {
    // Check if there are URL filters present - if so, let the filter useEffect handle the initial load
    const hasURLFilters = typeof window !== 'undefined' && (() => {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.has('tags') || searchParams.has('brands') || searchParams.has('attributes') || 
             searchParams.has('specs') || searchParams.has('priceMin') || searchParams.has('priceMax') ||
             searchParams.has('hasDiscount') || searchParams.has('search');
    })();
    
    // Clear products when category changes to show loading state
    if (categoryId !== null) {
      setProducts([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    }
    
    // Only load products if there are no URL filters to avoid race condition
    if (!hasURLFilters) {
      // Only show loading for initial load or when categoryId changes from null to a value
      const shouldShowLoading = !products.length || (categoryId && !pagination.total);
      loadProducts({ 
        page: 1, 
        limit: initialLimit, 
        sortValue: initialSort, 
        showLoading: shouldShowLoading 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, initialLimit, initialSort]);

  // sort өөрчлөгдөхөд 1-р хуудаснаас эхлүүлэн дахин ачаал
  useEffect(() => {
    loadProducts({ 
      page: 1, 
      limit: pagination.limit, 
      sortValue: sort, 
      showLoading: false 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // ENHANCED filter change handling
  useEffect(() => {
    // Check if there are URL filters on initial load
    const hasURLFilters = typeof window !== 'undefined' && (() => {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.has('tags') || searchParams.has('brands') || searchParams.has('attributes') || 
             searchParams.has('specs') || searchParams.has('priceMin') || searchParams.has('priceMax') ||
             searchParams.has('hasDiscount') || searchParams.has('search');
    })();
    
    // If there are URL filters but no appliedFilters yet, wait for FilterAll to initialize
    if (hasURLFilters && !appliedFilters) {
      return;
    }
    
    // If no URL filters and no appliedFilters, load products without filters
    if (!hasURLFilters && !appliedFilters) {
      loadProducts({ 
        page: 1, 
        limit: pagination.limit, 
        sortValue: sort, 
        showLoading: !products.length
      });
      return;
    }
    
    // Don't process if appliedFilters is null/undefined (initial state) and there are no URL filters
    if (!appliedFilters && !hasURLFilters) {
      return;
    }
    
    // Check for active filters
    const hasActiveFilters = filters.brands.length > 0 || 
        filters.priceMin || filters.priceMax ||
        Object.keys(filters.attributes || {}).length > 0 ||
        Object.keys(filters.specs || {}).length > 0 ||
        (filters.tags || []).length > 0 || 
        filters.hasDiscount ||
        filters.minRating ||
        !filters.inStock; // inStock false is also a filter

    // Always reload products when filters change (even clearing filters)
    const filterType = filters._meta?.filterType || 'unknown';
    const isInstantFilter = filterType === 'instant';
    
    // For instant filters, show minimal loading; for debounced, show more loading
    const shouldShowFullLoading = !products.length || !isInstantFilter;
    
    loadProducts({ 
      page: 1, 
      limit: pagination.limit, 
      sortValue: sort, 
      showLoading: shouldShowFullLoading,
      isFilterChange: hasActiveFilters
    });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sortDropdown = document.querySelector('.shop-acs__select');
      if (sortDropdown && !sortDropdown.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  // ---- pagination handler ----
  const canPrev = pagination.currentPage > 1;
  const canNext = pagination.currentPage < pagination.totalPages;

  // ENHANCED pagination with smooth transitions
  const goPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    
    loadProducts({ 
      page: p, 
      limit: pagination.limit, 
      sortValue: sort, 
      showLoading: false, // Minimal loading for pagination
      isFilterChange: false 
    });
  };

  // ---- helpers to read fields safely (UPDATED FOR NEW API) ----
  function getTitle(p) {
    return p.name || p.title || `Product #${p.id}`;
  }
  
  function getPrice(p) {
    // New API returns priceRange object or direct price
    if (p.priceRange && typeof p.priceRange === 'object') {
      return p.priceRange.min || p.priceRange.max || 0;
    }
    return typeof p.price === "number" ? p.price : 0;
  }
  
  function getOldPrice(p) {
    // Check for promotional pricing in new API format
    if (p.promotional?.hasDiscount && p.promotional?.discountedPrice) {
      return p.price; // Original price becomes old price
    }
    return null;
  }
  
  function getDiscountedPrice(p) {
    // Get discounted price from promotional object
    if (p.promotional?.hasDiscount && p.promotional?.discountedPrice) {
      return p.promotional.discountedPrice;
    }
    return null;
  }
  
  function getImage(p) {
    return (
      p.primaryImage ||
      p.images?.[0]?.url ||
      p.image ||
      p.thumbnail ||
      "/assets/images/products/p1.jpg"
    );
  }
  
  function getRating(p) {
    if (p.rating && typeof p.rating === 'object') {
      return {
        average: p.rating.average || 0,
        count: p.rating.count || 0
      };
    }
    return {
      average: p.rating || 0,
      count: p.reviewsCount || 0
    };
  }

  return (
    <div className="mb-4 md:mb-0">
      {/* Active Filter Tags Styles */}
      <style jsx>{`
        .active-filters-section {
          // background-color: #f8f9fa;
          padding: 12px 16px;
          border-radius: 8px;
          // border: 1px solid #e9ecef;
        }
        
        .active-filter-tag {
          display: inline-flex;
          align-items: center;
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 20px;
          padding: 4px 8px 4px 12px;
          margin: 2px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .filter-label {
          color: #333;
          font-weight: 500;
          margin-right: 4px;
        }
        
        .filter-value {
          color: #333;
          font-weight: 400;
          margin-right: 6px;
        }
        
        .filter-remove-btn {
          background: none;
          border: none;
          color: #333;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          padding: 0;
          margin: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .filter-remove-btn:hover {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .clear-all-filters-btn {
          background: none;
          border: none;
          color: #dc3545;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          margin-left: 8px;
          transition: all 0.2s ease;
        }
        
        .clear-all-filters-btn:hover {
          color: #a71e2a;
          text-decoration: underline;
        }
      `}</style>
        
        <div className="d-flex justify-content-between pb-md-2">
          <div className="breadcrumb mb-0 d-none d-md-block flex-grow-1">
            <BreadCumb />
          </div>

          <div className="shop-acs d-flex align-items-center justify-content-between justify-content-md-end flex-grow-1">
            {/* Category Title */}
            {categoryId && (
              <div className="category-title me-3">
                {/* <h4 className="mb-0 text-primary">
                  {categoryLoading ? "Ачаалж байна..." : categoryName}
                </h4> */}
                 {pagination.total > 0 ? (
                   <small className="text-muted">
                     {pagination.total} бүтээгдэхүүн олдлоо
                   </small>
                 ) : (
                   <small className="text-muted">
                     {/* Бүтээгдэхүүн олдсонгүй */}
                   </small>
                 )}
              </div>
            )}

            {/* Clear All Filters Button */}
            {/* {totalActiveFilters > 0 && (
              <div className="clear-filters-btn me-3 order-0 order-md-1">
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    if (onFiltersChange) {
                      onFiltersChange({
                        brands: [],
                        priceMin: null,
                        priceMax: null,
                        attributes: {},
                        specs: {},
                        tags: [],
                        inStock: true,
                        hasDiscount: false,
                        minRating: null,
                        search: "",
                        colors: [],
                        sizes: [],
                        price: [20, 70987],
                        _meta: {
                          totalActiveFilters: 0,
                          lastUpdate: Date.now(),
                          filterType: 'clear'
                        }
                      });
                    }
                  }}
                  style={{ 
                    fontSize: '12px',
                    border: '1px solid #495D35',
                    color: '#495D35',
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#495D35';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#495D35';
                  }}
                >
                  🗑️ Clear All ({totalActiveFilters})
                </button>
              </div>
            )} */}

            {/* Sort - Clickable dropdown */}
            <div className="shop-acs__select w-auto border-0 py-0 order-1 order-md-0 position-relative d-none d-lg-block">
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                style={{ 
                  cursor: 'pointer',
                  color: '#6c757d',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  // gap: '8px',
                  // padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  // minWidth: '150px',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{padding: '8px 12px'}}>{sortingOptions.find(opt => opt.value === sort)?.label || 'ЭНГИЙН'}</span>
                <svg 
                  className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{margin: '0px 4px'}}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              
              {showSortDropdown && (
                <div 
                  className="position-absolute top-100 start-0 mt-1 bg-white border rounded shadow-sm"
                  style={{ 
                    zIndex: 1000,
                    minWidth: '100px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
            >
              {sortingOptions.map((option, index) => (
                    <button
                      key={index}
                      className="btn btn-link text-decoration-none w-100 text-start"
                      onClick={() => {
                        setSort(option.value);
                        setShowSortDropdown(false);
                      }}
                      style={{ 
                        border: 'none',
                        borderBottom: index < sortingOptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                        padding: '12px 20px',
                        fontSize: '14px',
                        color: sort === option.value ? '#333' : '#666',
                        backgroundColor: 'transparent',
                        fontWeight: sort === option.value ? '500' : '400',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (sort !== option.value) {
                          e.target.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (sort !== option.value) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {sort === option.value && (
                        <span 
                          style={{
                            position: 'absolute',
                            left: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#dc3545',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                      <span style={{ marginLeft: sort === option.value ? '12px' : '0' }}>
                        {option.label}
                      </span>
                    </button>
              ))}
                </div>
              )}
            </div>

            {/* <div className="shop-asc__seprator mx-3 bg-light d-none d-md-block order-md-0" /> */}

            {/* Grid size */}
            {/* <div className="col-size align-items-center order-1 d-none d-lg-flex">
              <span className="text-uppercase fw-medium me-2">View</span>
              {itemPerRow.map((elm, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColView(elm)}
                  className={`btn-link fw-medium me-2 js-cols-size ${selectedColView == elm ? "btn-link_active" : ""}`}
                >
                  {elm}
                </button>
              ))}
            </div> */}

            {/* Mobile filter open */}
            {/* <div className="shop-filter d-flex align-items-center order-0 order-md-3 d-lg-none">
              <button
                className="btn-link btn-link_f d-flex align-items-center ps-0 js-open-aside"
                onClick={openModalShopFilter}
              >
                <svg className="d-inline-block align-middle me-2" width="14" height="10" viewBox="0 0 14 10">
                  <use href="#icon_filter" />
                </svg>
                <span className="text-uppercase fw-medium d-inline-block align-middle">Filter</span>
              </button>
            </div> */}
          </div>
        </div>

        {/* ACTIVE FILTERS DISPLAY - Web only */}
        {totalActiveFilters > 0 && (
          <div className="active-filters-section mb-0 py-0 d-none d-md-block">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
              {/* Display active attribute filters */}
              {Object.entries(filters.attributes || {}).map(([attrKey, values]) => {
                if (!Array.isArray(values) || values.length === 0) return null;
                return values.map((value, index) => (
                  <div key={`${attrKey}-${value}-${index}`} className="active-filter-tag">
                    <span className="filter-label">{attrKey}:</span>
                    <span className="filter-value">{value}</span>
                    <button
                      className="filter-remove-btn"
                      onClick={() => {
                        if (onFiltersChange) {
                          const newAttributes = { ...filters.attributes };
                          newAttributes[attrKey] = newAttributes[attrKey].filter(v => v !== value);
                          if (newAttributes[attrKey].length === 0) {
                            delete newAttributes[attrKey];
                          }
                          onFiltersChange({
                            ...filters,
                            attributes: newAttributes,
                            _meta: {
                              ...filters._meta,
                              lastUpdate: Date.now(),
                              filterType: 'remove'
                            }
                          });
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ));
              })}

              {/* Display active spec filters */}
              {Object.entries(filters.specs || {}).map(([specKey, values]) => {
                if (!Array.isArray(values) || values.length === 0) return null;
                return values.map((value, index) => (
                  <div key={`${specKey}-${value}-${index}`} className="active-filter-tag">
                    <span className="filter-label">{specKey}:</span>
                    <span className="filter-value">{value}</span>
                    <button
                      className="filter-remove-btn"
                      onClick={() => {
                        if (onFiltersChange) {
                          const newSpecs = { ...filters.specs };
                          newSpecs[specKey] = newSpecs[specKey].filter(v => v !== value);
                          if (newSpecs[specKey].length === 0) {
                            delete newSpecs[specKey];
                          }
                          onFiltersChange({
                            ...filters,
                            specs: newSpecs,
                            _meta: {
                              ...filters._meta,
                              lastUpdate: Date.now(),
                              filterType: 'remove'
                            }
                          });
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ));
              })}

              {/* Display active brand filters */}
              {filters.brands && filters.brands.length > 0 && (
                <div className="active-filter-tag">
                  <span className="filter-label">Брэнд:</span>
                  <span className="filter-value">{filters.brands.join(', ')}</span>
                  <button
                    className="filter-remove-btn"
                    onClick={() => {
                      if (onFiltersChange) {
                        onFiltersChange({
                          ...filters,
                          brands: [],
                          _meta: {
                            ...filters._meta,
                            lastUpdate: Date.now(),
                            filterType: 'remove'
                          }
                        });
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Display active tag filters */}
              {filters.tags && filters.tags.length > 0 && (
                <div className="active-filter-tag">
                  <span className="filter-label">Төрөл:</span>
                  <span className="filter-value">{filters.tags.join(', ')}</span>
                  <button
                    className="filter-remove-btn"
                    onClick={() => {
                      if (onFiltersChange) {
                        onFiltersChange({
                          ...filters,
                          tags: [],
                          _meta: {
                            ...filters._meta,
                            lastUpdate: Date.now(),
                            filterType: 'remove'
                          }
                        });
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Display price range filter */}
              {(filters.priceMin !== null || filters.priceMax !== null) && (
                <div className="active-filter-tag">
                  <span className="filter-label">Үнэ:</span>
                  <span className="filter-value">
                    {filters.priceMin !== null ? `${filters.priceMin.toLocaleString()}₮` : '0₮'} - {filters.priceMax !== null ? `${filters.priceMax.toLocaleString()}₮` : '∞'}
                  </span>
                  <button
                    className="filter-remove-btn"
                    onClick={() => {
                      if (onFiltersChange) {
                        onFiltersChange({
                          ...filters,
                          priceMin: null,
                          priceMax: null,
                          _meta: {
                            ...filters._meta,
                            lastUpdate: Date.now(),
                            filterType: 'remove'
                          }
                        });
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Display stock filter */}
              {filters.inStock === false && (
                <div className="active-filter-tag">
                  <span className="filter-label">Нөөц:</span>
                  <span className="filter-value">Бүх</span>
                  <button
                    className="filter-remove-btn"
                    onClick={() => {
                      if (onFiltersChange) {
                        onFiltersChange({
                          ...filters,
                          inStock: true,
                          _meta: {
                            ...filters._meta,
                            lastUpdate: Date.now(),
                            filterType: 'remove'
                          }
                        });
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Display discount filter */}
              {filters.hasDiscount && (
                <div className="active-filter-tag">
                  <span className="filter-label">Хямдрал:</span>
                  <span className="filter-value">Хямдралтай</span>
                  <button
                    className="filter-remove-btn"
                    onClick={() => {
                      if (onFiltersChange) {
                        onFiltersChange({
                          ...filters,
                          hasDiscount: false,
                          _meta: {
                            ...filters._meta,
                            lastUpdate: Date.now(),
                            filterType: 'remove'
                          }
                        });
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Clear All Button */}
              <button
                className="clear-all-filters-btn"
                onClick={() => {
                  if (onFiltersChange) {
                    onFiltersChange({
                      brands: [],
                      priceMin: null,
                      priceMax: null,
                      attributes: {},
                      specs: {},
                      tags: [],
                      inStock: true,
                      hasDiscount: false,
                      minRating: null,
                      search: "",
                      colors: [],
                      sizes: [],
                      price: [20, 70987],
                      _meta: {
                        totalActiveFilters: 0,
                        lastUpdate: Date.now(),
                        filterType: 'clear'
                      }
                    });
                  }
                }}
              >
                Цэвэрлэх
              </button>
            </div>
          </div>
        )}

        {/* PRODUCTS GRID WITH SOPHISTICATED LOADING */}
        {/* <div
          className={`products-grid row row-cols-2 row-cols-md-3 row-cols-lg-${selectedColView}`}
          id="products-grid"
          style={{
            opacity: isFilteringActive ? 0.7 : 1,
            transition: 'opacity 0.2s ease'
          }}
        > */}
          {loading ? (
            
            <div className="col-12 text-center py-5">
              <div className="d-flex flex-column align-items-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="text-primary mb-2">🔄 Бүтээгдэхүүн ачаалж байна...</h6>
                <small className="text-muted">
                  Бүх бүтээгдэхүүн
                </small>
              </div>
            </div>
          ) : err ? (
            <div className="alert alert-danger">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">{err}</div>
                <button 
                  className="btn btn-sm ms-3"
                  onClick={() => loadProducts()}
                  disabled={loading}
                  style={{ 
                    border: '1px solid #495D35',
                    color: '#495D35',
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#495D35';
                      e.target.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#495D35';
                    }
                  }}
                >
                  {loading ? 'Ачаалж байна...' : 'Дахин оролдох'}
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-12 text-center  ">
              <div className="d-flex flex-column align-items-center">
                <div className="empty-state-icon mb-4 p-4 bg-light rounded-circle">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <h5 className="text-muted mb-2">
                  Бүтээгдэхүүн олдсонгүй
                </h5>
                <p className="text-muted mb-3">
                  Одоогоор энэ ангилалд бүтээгдэхүүн байхгүй байна.
                </p>
              </div>
            </div>
          ) : (
            <div
            className={`products-grid row row-cols-2 row-cols-md-3 row-cols-lg-${selectedColView}`}
            id="products-grid"
            style={{
              opacity: isFilteringActive ? 0.7 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            {products.map((p) => {
              const id = p.id;
              const title = getTitle(p);
              const price = getPrice(p);
              const priceOld = getOldPrice(p);
              const discountedPrice = getDiscountedPrice(p);
              const img1 = getImage(p);
              const img2 = p.images?.[1]?.url || img1; // хоёрыг нь слайдлуулна
              const rating = getRating(p);
              const inStock = p.inStock || true;

              // Determine which price to show
              const displayPrice = discountedPrice || price;
              const showOldPrice = priceOld && discountedPrice;

              return (
                
                <div key={id} className="product-card-wrapper">
                  <div className="product-card mb-3 mb-md-4 mb-xxl-5">
                    <div className="pc__img-wrapper">
                      <Swiper
                        className="swiper-container background-img js-swiper-slider"
                        slidesPerView={1}
                        modules={[Navigation]}
                        navigation={{
                          prevEl: `.prev-${id}`,
                          nextEl: `.next-${id}`,
                        }}
                      >
                        {[img1, img2].map((src, i) => (
                          <SwiperSlide key={i}>
                            <Link href={`/product1_simple/${id}`}>
                              <Image
                                loading="lazy"
                                src={src}
                                width={330}
                                height={400}
                                alt={title}
                                className="pc__img"
                              />
                            </Link>
                          </SwiperSlide>
                        ))}
                        <span className={`cursor-pointer pc__img-prev prev-${id}`}>
                          <svg width="7" height="11" viewBox="0 0 7 11"><use href="#icon_prev_sm" /></svg>
                        </span>
                        <span className={`cursor-pointer pc__img-next next-${id}`}>
                          <svg width="7" height="11" viewBox="0 0 7 11"><use href="#icon_next_sm" /></svg>
                        </span>
                      </Swiper>

                      <button
                        className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                        onClick={() => addProductToCart(id)}
                        title={isAddedToCartProducts(id) ? "Сагсанд нэмэгдсэн" : "Сагсанд нэмэх"}
                        disabled={!inStock}
                      >
                        {!inStock ? "Out of Stock" : isAddedToCartProducts(id) ? "Сагсанд нэмэгдсэн" : "Сагсанд нэмэх"}
                      </button>
                    </div>

                    <div className="pc__info position-relative">
                      <p className="pc__category">{p.brand?.name || p.category?.name || p.categoryName || ""}</p>
                      <h6 className="pc__title pe-4">
                        <Link href={`/product1_simple/${id}`}>{title}</Link>
                      </h6>

                      <div className="product-card__price d-flex">
                        {showOldPrice ? (
                          <>
                            <span className="money price price-old">{priceOld}₮</span>
                            <span className="money price price-sale">{displayPrice}₮</span>
                          </>
                        ) : (
                          <span className="money price">{displayPrice}₮</span>
                        )}
                      </div>

                      {p.variants?.length ? (
                        <div className="d-flex align-items-center mt-1">
                          <ColorSelection 
                            variants={p.variants}
                            selectedVariantId={selectedVariants[id]}
                            onVariantChange={(variantId) => handleVariantChange(id, variantId)}
                          />
                        </div>
                      ) : null}

                      {rating.average > 0 ? (
                        <div className="product-card__review d-flex align-items-center">
                          <div className="reviews-group d-flex"><Star stars={rating.average} /></div>
                          {rating.count > 0 && (
                            <span className="reviews-note text-lowercase text-secondary ms-1">
                              {rating.count}
                            </span>
                          )}
                        </div>
                      ) : null}

                      <button
                        className={`pc__btn-wl position-absolute top-0 end-0 bg-transparent border-0 js-add-wishlist ${
                          isAddedtoWishlist(id) ? "active" : ""
                        }`}
                        onClick={() => toggleWishlist(id)}
                        title="Add To Wishlist"
                        style={{
                          background: 'transparent',
                          border: 'none'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20">
                          <use href="#icon_heart" />
                        </svg>
                      </button>
                    </div>

                    {/* Optional labels from new API */}
                    {p.promotional?.hasDiscount ? (
                      <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                        <div className="pc-labels__right ms-auto">
                          <span className="pc-label pc-label_sale d-block text-white">-{p.promotional.discountPercent}%</span>
                        </div>
                      </div>
                    ) : null}
                    {!inStock ? (
                      <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                        <div className="pc-labels__left">
                          <span className="pc-label pc-label_out-of-stock d-block bg-dark text-white">OUT OF STOCK</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        {/* </div> */}

        {/* Simple pagination */}
        
        <Pagination2
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onChange={goPage}
          syncQuery={true}       // хүсвэл URL-д ?page=2 гэж хадгална
        />
        {/* <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button className="btn btn-outline-secondary btn-sm" disabled={!canPrev} onClick={() => goPage(pagination.currentPage - 1)}>
            Prev
          </button>
          <span className="text-secondary">
            Page {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button className="btn btn-outline-secondary btn-sm" disabled={!canNext} onClick={() => goPage(pagination.currentPage + 1)}>
            Next
          </button>
        </div> */}
        {/* Mobile Filter Footer */}
      <MobileFilterFooter 
        currentSort={sort}
        onSortChange={setSort}
        totalActiveFilters={totalActiveFilters}
      />
      </div>


  );
}
