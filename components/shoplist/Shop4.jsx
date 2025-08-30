"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useParams } from "next/navigation";

import { useContextElement } from "@/context/Context";
import { openModalShopFilter } from "@/utlis/aside";
import { sortingOptions } from "@/data/products/productCategories";
import FilterAll from "./filter/FilterAll";
import BreadCumb from "./BreadCumb";
import Star from "../common/Star";
import ColorSelection from "../common/ColorSelection";
import api from "@/lib/api";
import Pagination2 from "../common/Pagination2";

// Grid-ийн боломжит баганын тоо
const itemPerRow = [2, 3, 4];

// Frontend sort → backend params map
function mapSortToParams(value) {
  switch (value) {
    case "price-asc":
      return { sortField: "price", sortOrder: "asc" };
    case "price-desc":
      return { sortField: "price", sortOrder: "desc" };
    case "name-asc":
      return { sortField: "name", sortOrder: "asc" };
    case "name-desc":
      return { sortField: "name", sortOrder: "desc" };
    case "rating-desc":
      return { sortField: "rating", sortOrder: "desc" };
    case "popular":
      return { sortField: "popularity", sortOrder: "desc" };
    case "oldest":
      return { sortField: "createdAt", sortOrder: "asc" };
    case "newest":
    default:
      return { sortField: "createdAt", sortOrder: "desc" };
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
  initialLimit = 12,
  initialSort = "newest",
}) {
  const params = useParams();
  const urlCategoryId = params?.categoryId ? parseInt(params.categoryId) : null;
  const categoryId = propCategoryId || urlCategoryId;
  
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  const [selectedColView, setSelectedColView] = useState(4);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
  
  // Filter states
  const [filters, setFilters] = useState({
    colors: [],
    sizes: [],
    brands: [],
    price: [20, 70987],
    search: ""
  });

  // ---- category state ----
  const [categoryName, setCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // ---- global category name cache ----
  const [categoryCache, setCategoryCache] = useState(() => {
    // Use global cache if available, otherwise create new
    if (typeof window !== 'undefined' && window.__categoryCache) {
      return window.__categoryCache;
    }
    return new Map();
  });

  // ---- load category name with caching ----
  useEffect(() => {
    if (categoryId) {
      // Check cache first
      if (categoryCache.has(categoryId)) {
        setCategoryName(categoryCache.get(categoryId));
        return;
      }

      // Load from API if not in cache
      setCategoryLoading(true);
      api.categories.getById(categoryId)
        .then(response => {
          if (response.success && response.data) {
            const name = response.data.name;
            setCategoryName(name);
            // Cache the result globally
            setCategoryCache(prev => {
              const newCache = new Map(prev).set(categoryId, name);
              if (typeof window !== 'undefined') {
                window.__categoryCache = newCache;
              }
              return newCache;
            });
          } else if (response.success && response.data === null) {
            // API returned null data (404 handled by API client)
            console.log('Category data is null, using fallback name');
            setCategoryName("Ангилал");
            // Cache the fallback
            setCategoryCache(prev => {
              const newCache = new Map(prev).set(categoryId, "Ангилал");
              if (typeof window !== 'undefined') {
                window.__categoryCache = newCache;
              }
              return newCache;
            });
          }
        })
        .catch(error => {
          console.error('Error fetching category:', error);
          // Don't show error for 404, just use fallback name
          if (error.message.includes('404') || error.message.includes('Not Found')) {
            console.log('Category endpoint not found, using fallback name');
            setCategoryName("Ангилал");
            // Cache the fallback to prevent repeated API calls
            setCategoryCache(prev => {
              const newCache = new Map(prev).set(categoryId, "Ангилал");
              if (typeof window !== 'undefined') {
                window.__categoryCache = newCache;
              }
              return newCache;
            });
            return;
          }
          // Set a fallback name if API fails
          setCategoryName("Ангилал");
        })
        .finally(() => {
          setCategoryLoading(false);
        });
    } else {
      setCategoryName("");
    }
  }, [categoryId, categoryCache]);

  // Filter change handler
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // ---- load products from backend ----
  async function loadProducts({ page = initialPage, limit = initialLimit, sortValue = sort, showLoading = true } = {}) {
    if (showLoading) {
    setLoading(true);
    }
    setErr("");
    try {
      const { sortField, sortOrder } = mapSortToParams(sortValue);
      const params = { 
        page, 
        limit, 
        sortField, 
        sortOrder,
        // Add filter parameters
        ...(filters.colors.length > 0 && { colors: filters.colors.join(',') }),
        ...(filters.sizes.length > 0 && { sizes: filters.sizes.join(',') }),
        ...(filters.brands.length > 0 && { brands: filters.brands.join(',') }),
        ...(filters.price[0] !== 20 && { minPrice: filters.price[0] }),
        ...(filters.price[1] !== 70987 && { maxPrice: filters.price[1] }),
        ...(filters.search && { search: filters.search })
      };

      const res = categoryId
        ? await api.products.getByCategory(categoryId, params)
        : await api.products.getAll(params);

      const payload = res?.data ?? res; // {success, data, pagination} эсвэл шууд массив
      const list =
        Array.isArray(payload?.data) ? payload.data :
        Array.isArray(payload?.products) ? payload.products :
        Array.isArray(payload) ? payload : 
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.products) ? res.products :
        Array.isArray(res) ? res : [];

      const pg = payload?.pagination || res?.pagination || {
        total: list.length,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
        currentPage: page,
        limit,
      };

      setProducts(list);
      setPagination(pg);
    } catch (e) {
      console.error('Error loading products:', e);
      
      // Handle different types of errors
      let errorMessage = "Бүтээгдэхүүн ачаалахад алдаа гарлаа.";
      
      if (e.message.includes('fetch')) {
        errorMessage = "Сүлжээний холболт асуудалтай байна. Дахин оролдоно уу.";
      } else if (e.message.includes('500')) {
        errorMessage = "Серверийн алдаа гарлаа. Дахин оролдоно уу.";
      } else if (e.message.includes('404')) {
        errorMessage = "Хүссэн мэдээлэл олдсонгүй.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setErr(errorMessage);
      setProducts([]);
      setPagination((p) => ({ ...p, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }

  

  

  // эхний ачаалт + dependency өөрчлөгдөхөд дахин ачаал
  useEffect(() => {
    // Only show loading for initial load or when categoryId changes from null to a value
    const shouldShowLoading = !products.length || (categoryId && !pagination.total);
    loadProducts({ 
      page: 1, 
      limit: initialLimit, 
      sortValue: initialSort, 
      showLoading: shouldShowLoading 
    });
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

  // filters өөрчлөгдөхөд 1-р хуудаснаас эхлүүлэн дахин ачаал
  useEffect(() => {
    // Skip initial load when filters are empty
    if (filters.colors.length === 0 && filters.sizes.length === 0 && filters.brands.length === 0 && 
        filters.price[0] === 20 && filters.price[1] === 70987 && !filters.search) {
      return;
    }
    
    loadProducts({ 
      page: 1, 
      limit: pagination.limit, 
      sortValue: sort, 
      showLoading: false 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.colors, filters.sizes, filters.brands, filters.price, filters.search]);

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

 const goPage = (p) => {
  if (p < 1 || p > pagination.totalPages) return;
  loadProducts({ 
    page: p, 
    limit: pagination.limit, 
    sortValue: sort, 
    showLoading: false 
  });
};

  // ---- helpers to read fields safely ----
  function getTitle(p) {
    return p.title || p.name || `Product #${p.id}`;
  }
  function getPrice(p) {
    return typeof p.price === "number" ? p.price : p.salePrice ?? p.finalPrice ?? 0;
  }
  function getOldPrice(p) {
    return p.priceOld ?? p.compareAtPrice ?? null;
  }
  function getImage(p) {
    return (
      p.images?.[0]?.url ||
      p.image ||
      p.thumbnail ||
      "/assets/images/products/p1.jpg"
    );
  }

  return (

    
      <div >
        <div className="d-flex justify-content-between mb-4 pb-md-2">
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
                <small className="text-muted">
                  {pagination.total} бүтээгдэхүүн
                </small>
              </div>
            )}

            {/* Sort - Clickable dropdown */}
            <div className="shop-acs__select  w-auto border-0 py-0 order-1 order-md-0 position-relative">
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
                  gap: '8px',
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
                    minWidth: '150px',
                    maxHeight: '300px',
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
                        borderBottom: index < sortingOptions.length - 1 ? '1px solid #f8f9fa' : 'none',
                        padding: '10px 12px',
                        fontSize: '14px',
                        color: sort === option.value ? '#007bff' : '#212529',
                        backgroundColor: sort === option.value ? '#f8f9fa' : 'transparent',
                        fontWeight: sort === option.value ? '500' : '400',
                        transition: 'all 0.2s ease'
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
                  {option.label}
                    </button>
              ))}
                </div>
              )}
            </div>

            <div className="shop-asc__seprator mx-3 bg-light d-none d-md-block order-md-0" />

            {/* Grid size */}
            <div className="col-size align-items-center order-1 d-none d-lg-flex">
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
            </div>

            {/* Mobile filter open */}
            <div className="shop-filter d-flex align-items-center order-0 order-md-3 d-lg-none">
              <button
                className="btn-link btn-link_f d-flex align-items-center ps-0 js-open-aside"
                onClick={openModalShopFilter}
              >
                <svg className="d-inline-block align-middle me-2" width="14" height="10" viewBox="0 0 14 10">
                  <use href="#icon_filter" />
                </svg>
                <span className="text-uppercase fw-medium d-inline-block align-middle">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div
          className={`products-grid row row-cols-2 row-cols-md-3 row-cols-lg-${selectedColView}`}
          id="products-grid"
        >
          {loading ? (
            <div className="text-secondary p-3">Loading…</div>
          ) : err ? (
            <div className="alert alert-danger">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">{err}</div>
                <button 
                  className="btn btn-outline-danger btn-sm ms-3"
                  onClick={() => loadProducts()}
                  disabled={loading}
                >
                  {loading ? 'Ачаалж байна...' : 'Дахин оролдох'}
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="d-flex flex-column align-items-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted mb-3">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <h5 className="text-muted mb-2">Бүтээгдэхүүн олдсонгүй</h5>
                <p className="text-muted mb-0">Одоогоор энэ ангилалд бүтээгдэхүүн байхгүй байна.</p>
              </div>
            </div>
          ) : (
            products.map((p) => {
              const id = p.id;
              const title = getTitle(p);
              const price = getPrice(p);
              const priceOld = getOldPrice(p);
              const img1 = getImage(p);
              const img2 = p.images?.[1]?.url || img1; // хоёрыг нь слайдлуулна

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
                        title={isAddedToCartProducts(id) ? "Already Added" : "Add to Cart"}
                      >
                        {isAddedToCartProducts(id) ? "Already Added" : "Add To Cart"}
                      </button>
                    </div>

                    <div className="pc__info position-relative">
                      <p className="pc__category">{p.category?.name || p.categoryName || ""}</p>
                      <h6 className="pc__title">
                        <Link href={`/product1_simple/${id}`}>{title}</Link>
                      </h6>

                      <div className="product-card__price d-flex">
                        {priceOld ? (
                          <>
                            <span className="money price price-old">${priceOld}</span>
                            <span className="money price price-sale">${price}</span>
                          </>
                        ) : (
                          <span className="money price">${price}</span>
                        )}
                      </div>

                      {p.colors?.length ? (
                        <div className="d-flex align-items-center mt-1"><ColorSelection /></div>
                      ) : null}

                      {typeof p.rating === "number" ? (
                        <div className="product-card__review d-flex align-items-center">
                          <div className="reviews-group d-flex"><Star stars={p.rating} /></div>
                          {typeof p.reviewsCount === "number" && (
                            <span className="reviews-note text-lowercase text-secondary ms-1">
                              {p.reviewsCount}
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

                    {/* Optional labels */}
                    {p.discont ? (
                      <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                        <div className="pc-labels__right ms-auto">
                          <span className="pc-label pc-label_sale d-block text-white">-{p.discont}%</span>
                        </div>
                      </div>
                    ) : null}
                    {p.isNew ? (
                      <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                        <div className="pc-labels__left">
                          <span className="pc-label pc-label_new d-block bg-white">NEW</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

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
      </div>
  
  );
}
