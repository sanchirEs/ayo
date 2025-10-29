"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SearchPopup() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const router = useRouter();

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsPopupOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((query) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Remove search from recent searches
  const removeFromRecentSearches = useCallback((searchToRemove) => {
    const updated = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // ✅ ENHANCED: Search products with cache-aware tracking
  // WHY: Redis caches search results (Tier 3: 5-15min) for faster repeat searches
  const searchProducts = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();
    
    try {
      const response = await api.products.enhanced({
        search: query,
        limit: 8
      });
      
      const products = response?.data?.products || response?.products || [];
      setSearchResults(products);
      
      // ✅ NEW: Log search performance in development
      if (process.env.NODE_ENV === 'development') {
        const searchTime = Date.now() - startTime;
        console.log(`Search for "${query}":`, {
          results: products.length,
          time: `${searchTime}ms`,
          cached: response.performance?.cached
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts]);

  useEffect(() => {
    // Add event listener for clicks
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery);
      const currentPath = window.location.pathname + window.location.search;
      // Use window.location.href instead of router.push for proper navigation
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}&redirect=${encodeURIComponent(currentPath)}`;
      setIsPopupOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Handle search result click
  const handleResultClick = (product) => {
    saveToRecentSearches(searchQuery);
    // Use window.location.href instead of router.push for proper navigation
    window.location.href = `/product1_simple/${product.id}`;
    setIsPopupOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };
  return (
    <div
      ref={containerRef}
      className={`header-tools__item hover-container ${
        isPopupOpen ? "js-content_visible" : ""
      }`}
         style={{ position: 'relative', overflow: 'visible' }}
    >
      <div className="js-hover__open position-relative">
        <a
          onClick={() => {
            setIsPopupOpen((pre) => !pre);
            if (!isPopupOpen) {
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            }
          }}
          className="js-search-popup search-field__actor"
          href="#"
        >
          <svg
            className="d-block"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_search" />
          </svg>
          <i className="btn-icon btn-close-lg"></i>
        </a>
      </div>

             <div className="search-popup js-hidden-content" style={{ 
         top: '100%',
         position: 'absolute',
         zIndex: 1000,
         backgroundColor: 'white',
         boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
         borderRadius: '8px',
         border: '1px solid #eee',
         maxHeight: '400px',
         overflowY: 'auto',

       }}>
        <form
           onSubmit={handleSearchSubmit}
           className="search-field container-fluid px-3"
        >
          <p className="text-uppercase text-secondary fw-medium mb-4">
            Юу хайж байна вэ?
          </p>
          <div className="position-relative">
            <input
              ref={searchInputRef}
              className="search-field__input search-popup__input w-100 fw-medium"
              type="text"
              name="search-keyword"
              placeholder="Бүтээгдэхүүн хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button className="btn-icon search-popup__submit" type="submit">
              <svg
                className="d-block"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_search" />
              </svg>
            </button>
            {searchQuery && (
            <button
              className="btn-icon btn-close-lg search-popup__reset"
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
            ></button>
            )}
          </div>

          <div className="search-popup__results">
             {/* Recent Searches */}
             {!searchQuery && recentSearches.length > 0 && (
               <div className="row">
                 <div className="col-md-8">
                   {/* Quicklinks when no search */}
            <div className="sub-menu search-suggestion">
                     <h6 className="sub-menu__title fs-base">Шуурхай холбоосууд</h6>
              <ul className="sub-menu__list list-unstyled">
                <li className="sub-menu__item">
                         <Link href="/shop" className="menu-link menu-link_us-s">
                           Шинэ бүтээгдэхүүн
                  </Link>
                </li>
                <li className="sub-menu__item">
                         <Link href="/shop" className="menu-link menu-link_us-s">
                           Хямдралтай
                         </Link>
                </li>
                <li className="sub-menu__item">
                         <Link href="/shop" className="menu-link menu-link_us-s">
                           Хамгийн их зарагдсан
                         </Link>
                       </li>
                     </ul>
                   </div>
                 </div>
                                   <div className="col-md-4">
                    <div className="sub-menu search-suggestion">
                      <h6 className="sub-menu__title fs-base">Сүүлийн хайлтууд</h6>
                      <ul className="sub-menu__list list-unstyled">
                        {recentSearches.map((search, index) => (
                          <li key={index} className="sub-menu__item d-flex align-items-center justify-content-between px-2">
                            <button
                              onClick={() => setSearchQuery(search)}
                              className="menu-link menu-link_us-s text-start border-0 bg-transparent flex-grow-1"
                              style={{ cursor: 'pointer' }}
                            >
                              {search}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromRecentSearches(search);
                              }}
                              className="btn btn-sm btn-outline-danger ms-2"
                              style={{ 
                                fontSize: '0.7rem', 
                                padding: '2px 6px',
                                minWidth: 'auto',
                                border: 'none',
                                background: 'transparent',
                                color: '#dc3545'
                              }}
                              title="Устгах"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
               </div>
             )}

                         {/* Search Results */}
             {searchQuery && (
               <div className="search-results">
                 {isSearching ? (
                   <div className="text-center py-3">
                     <div className="spinner-border spinner-border-sm text-primary" role="status">
                       <span className="visually-hidden">Хайж байна...</span>
                     </div>
                     <span className="ms-2 text-muted">Хайж байна...</span>
                   </div>
                 ) : searchResults.length > 0 ? (
                   <div className="search-result-list">
                     <h6 className="sub-menu__title fs-base mb-3">Хайлтын илэрц</h6>
                     <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-2">
                       {searchResults.map((product) => (
                         <div key={product.id} className="col">
                                                        <div 
                               className="search-result-item d-flex flex-column p-2 border rounded cursor-pointer h-100"
                               onClick={() => handleResultClick(product)}
                               style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                               onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'translateY(-2px)';
                                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                               }}
                               onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'translateY(0)';
                                 e.currentTarget.style.boxShadow = 'none';
                               }}
                             >
                               <div className="search-result-image mb-2 text-center">
                                 <img 
                                   src={product.ProductImages?.[0]?.imageUrl || product.images?.[0]?.url || '/assets/images/placeholder.jpg'} 
                                   alt={product.name}
                                   className="rounded"
                                   style={{ 
                                     width: '50px', 
                                     height: '50px', 
                                     objectFit: 'cover',
                                     border: '1px solid #eee'
                                   }}
                                 />
                               </div>
                               <div className="search-result-info flex-grow-1">
                                 <div className="search-result-brand small text-muted mb-1" style={{ fontSize: '0.65rem' }}>
                                   {product.vendor?.businessName || 'Brand'}
                                 </div>
                                 <div className="search-result-title fw-medium text-truncate mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                   {product.name}
                                 </div>
                                 <div className="search-result-description text-muted small mb-2" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>
                                   {product.description?.substring(0, 35)}...
                                 </div>
                                 <div className="search-result-price fw-bold text-primary" style={{ fontSize: '0.8rem' }}>
                                   {product.price?.toLocaleString()} ₮
                                 </div>
                               </div>
                             </div>
                         </div>
                       ))}
                     </div>
                     <div className="text-center mt-4">
                       <button
                         onClick={handleSearchSubmit}
                         className="btn btn-primary btn-sm px-4"
                         style={{
                          backgroundColor: '#495D35',
                      
                         }}
                       >
                         Бүх үр дүнг харах
                       </button>
                     </div>
                   </div>
                 ) : searchQuery.length >= 2 ? (
                   <div className="text-center py-4 text-muted">
                     <div className="mb-2">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     </div>
                     Хайлтын үр дүн олдсонгүй
                   </div>
                 ) : null}
               </div>
             )}

                         {/* Quicklinks when no search and no recent searches */}
             {!searchQuery && recentSearches.length === 0 && (
               <div className="sub-menu search-suggestion">
                 <h6 className="sub-menu__title fs-base">Шуурхай холбоосууд</h6>
                 <ul className="sub-menu__list list-unstyled">
                   <li className="sub-menu__item">
                   <button 
                           className="menu-link menu-link_us-s"
                           onClick={() => {
                            setIsPopupOpen(false);
                            setSearchQuery("");
                            setSearchResults([]);
                             setTimeout(() => {
                               window.location.href = "/shop/1";
                             }, 100);
                           }}
                         >
                           Арьс арчлах
                  </button>
                    
                </li>
                <li className="sub-menu__item">
                <button 
                           className="menu-link menu-link_us-s"
                           onClick={() => {
                            setIsPopupOpen(false);
                            setSearchQuery("");
                            setSearchResults([]);
                             setTimeout(() => {
                               window.location.href = "/shop/14";
                             }, 100);
                           }}
                         >
                       Хямдралтай
                     </button>
                </li>
                {/* <li className="sub-menu__item">
                     <Link href="/shop" className="menu-link menu-link_us-s">
                       Хамгийн их зарагдсан
                     </Link>
                </li> */}
              </ul>
            </div>
             )}
          </div>
        </form>
      </div>
      {/* <!-- /.search-popup --> */}
    </div>
  );
}
