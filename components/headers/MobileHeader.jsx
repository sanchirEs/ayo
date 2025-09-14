"use client";
import { currencyOptions, languageOptions } from "@/data/footer";

import { socialLinks } from "@/data/socials";

import React, { useEffect, useState, useCallback, useRef } from "react";
import CartLength from "./components/CartLength";
import { openCart } from "@/utlis/openCart";
import MobileNav from "./components/MobileNav";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import User from "./components/User";
import { openModalUserlogin } from "@/utlis/aside";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function MobileHeader() {
  const [scrollDirection, setScrollDirection] = useState("down");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 250) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down
          setScrollDirection("down");
        } else {
          // Scrolling up
          setScrollDirection("up");
        }
      } else {
        // Below 250px
        setScrollDirection("down");
      }

      lastScrollY.current = currentScrollY;
    };

    const lastScrollY = { current: window.scrollY };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  // Search products with debounce
  const searchProducts = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.products.enhanced({
        search: query,
        limit: 6
      });
      
      const products = response?.data?.products || response?.products || [];
      setSearchResults(products);
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

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if clicking inside search input or dropdown
      if (searchInputRef.current?.contains(event.target) || 
          searchDropdownRef.current?.contains(event.target)) {
        return; // Don't close if clicking inside search area
      }
      
      // Close search if clicking outside
      setIsSearchOpen(false);
    };

    if (isSearchOpen) {
      // Use setTimeout to avoid immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {};
  }, [isSearchOpen]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery);
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}&redirect=${encodeURIComponent(currentPath)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      // Scroll to top when navigating to shop page
      window.scrollTo(0, 0);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (search) => {
    saveToRecentSearches(search);
    const currentPath = window.location.pathname + window.location.search;
    router.push(`/shop?search=${encodeURIComponent(search)}&redirect=${encodeURIComponent(currentPath)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    // Scroll to top when navigating to shop page
    window.scrollTo(0, 0);
  };

  // Handle search result click
  const handleResultClick = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    saveToRecentSearches(searchQuery);
    router.push(`/product1_simple/${product.id}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div
      className={`header-mobile header_sticky ${
        scrollDirection == "up" ? "header_sticky-active" : "position-absolute"
      } `}
      style={{ backgroundColor: "#F4F7F5" }}
    >
      <div className="container d-flex align-items-center h-100">
        <a className="mobile-nav-activator d-block position-relative" href="#">
          <svg
            className="nav-icon"
            width="25"
            height="18"
            viewBox="0 0 25 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_nav" />
          </svg>
          <span className="btn-close-lg position-absolute top-0 start-0 w-100"></span>
        </a>

        <div className="logo">
          <a href="/">
            <Image
              src="/assets/images/logoReal.png"
              width={112}
              height={28}
                              alt="Ayo"
              className="logo__image d-block"
            />
          </a>
        </div>
        {/* <!-- /.logo --> */}

        <a
          onClick={() => openCart()}
          className="header-tools__item header-tools__cart js-open-aside"
        >
          <svg
            className="d-block"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_cart" />
          </svg>
          <span className="cart-amount d-block position-absolute js-cart-items-count">
            <CartLength />
          </span>
        </a>
      </div>
      {/* <!-- /.container --> */}

      <nav className="header-mobile__navigation navigation d-flex flex-column w-100 position-absolute top-100 bg-body overflow-auto" style={{ display: 'none' }}>
        <div className="container" style={{ backgroundColor: "#F4F7F5" }}>
          <form
            onSubmit={handleSearchSubmit}
            className="search-field position-relative mt-4 mb-3"
          >
            <div className="position-relative">
              <input
                ref={searchInputRef}
                className="search-field__input w-100 border rounded-1"
                type="text"
                name="search-keyword"
                placeholder="Бүтээгдэхүүн хайх"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                autoComplete="off"
              />
              <button
                className="btn-icon search-popup__submit pb-0 me-2"
                type="submit"
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
              </button>
              {searchQuery && (
              <button
                className="btn-icon btn-close-lg search-popup__reset pb-0 me-2"
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    searchInputRef.current?.focus();
                  }}
              ></button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && (
              <div 
                ref={searchDropdownRef}
                className="position-absolute start-0 top-100 m-0 w-100 bg-white border rounded-3 shadow-lg"
                style={{ 
                  zIndex: 1000,
                  maxHeight: '500px',
                  overflowY: 'auto',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}
              >
                <div className="p-4">
                  {/* Recent Searches */}
                  {!searchQuery && recentSearches.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-semibold text-dark mb-3 d-flex align-items-center">
                        <svg width="16" height="16" className="me-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Сүүлийн хайлтууд
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {recentSearches.map((search, index) => (
                          <div key={index} className="d-flex align-items-center bg-light rounded-pill px-3 py-2 border">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRecentSearchClick(search);
                              }}
                              className="btn btn-link p-0 text-start text-decoration-none"
                              style={{ 
                                fontSize: '0.85rem',
                                color: '#495057',
                                fontWeight: '500'
                              }}
                            >
                              {search}
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFromRecentSearches(search);
                              }}
                              className="btn btn-link p-0 ms-2"
                              style={{ 
                                fontSize: '0.7rem', 
                                color: '#6c757d',
                                minWidth: 'auto',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Устгах"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results */}
                  {searchQuery && (
                    <div>
                      {isSearching ? (
                        <div className="text-center py-4">
                          <div className="spinner-border text-primary mb-2" role="status" style={{ width: '2rem', height: '2rem' }}>
                            <span className="visually-hidden">Хайж байна...</span>
                          </div>
                          <p className="text-muted mb-0">Хайж байна...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div>
                          <h6 className="fw-semibold text-dark mb-3 d-flex align-items-center">
                            <svg width="16" height="16" className="me-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Хайлтын илэрц
                          </h6>
                          <div className="row g-3">
                            {searchResults.map((product) => (
                              <div key={product.id} className="col-6">
                                <div 
                                  className="search-result-item d-flex flex-column p-3 border rounded-3 h-100"
                                  onClick={(e) => handleResultClick(product, e)}
                                  style={{ 
                                    cursor: 'pointer', 
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#fff',
                                    border: '1px solid #e9ecef'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.borderColor = '#007bff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = '#e9ecef';
                                  }}
                                >
                                  <div className="search-result-image text-center mb-3">
                                    <img 
                                      src={product.ProductImages?.[0]?.imageUrl || product.images?.[0]?.url || '/assets/images/placeholder.jpg'} 
                                      alt={product.name}
                                      className="rounded-3"
                                      style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        objectFit: 'cover',
                                        border: '2px solid #f8f9fa'
                                      }}
                                    />
                                  </div>
                                  <div className="search-result-info text-center">
                                    <div className="search-result-title fw-semibold text-dark mb-2" style={{ 
                                      fontSize: '0.8rem', 
                                      lineHeight: '1.3',
                                      minHeight: '2.6rem',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}>
                                      {product.name}
                                    </div>
                                    <div className="search-result-price fw-bold text-primary" style={{ 
                                      fontSize: '0.9rem',
                                      color: '#007bff !important'
                                    }}>
                                      {product.price?.toLocaleString()} ₮
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-center mt-4">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSearchSubmit(e);
                              }}
                              className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
                              style={{
                                backgroundColor: '#495D35',
                                border: 'none',
                                fontSize: '0.9rem',
                                minWidth: '160px'
                              }}
                            >
                              Бүх үр дүнг харах
                            </button>
                          </div>
                        </div>
                      ) : searchQuery.length >= 2 ? (
                        <div className="text-center py-5">
                          <div className="mb-3">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#6c757d' }}>
                              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h6 className="text-muted mb-2">Хайлтын үр дүн олдсонгүй</h6>
                          <p className="text-muted small mb-0">Өөр түлхүүр үгээр хайж үзээрэй</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Quicklinks when no search and no recent searches */}
                  {!searchQuery && recentSearches.length === 0 && (
                    <div>
                      <h6 className="fw-semibold text-dark mb-3 d-flex align-items-center">
                        <svg width="16" height="16" className="me-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Шуурхай холбоосууд
                      </h6>
                      <div className="d-flex flex-column gap-2">
                        <Link 
                          href="/shop" 
                          className="btn  text-start fw-medium py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSearchOpen(false);
                            window.scrollTo(0, 0);
                          }}
                        >
                       
                          Шинэ бүтээгдэхүүн
                        </Link>
                        <Link 
                          href="/shop" 
                          className="btn  text-start fw-medium py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSearchOpen(false);
                            window.scrollTo(0, 0);
                          }}
                        >
                      
                          Хямдралтай
                        </Link>
                        <Link 
                          href="/shop" 
                          className="btn  text-start fw-medium py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSearchOpen(false);
                            window.scrollTo(0, 0);
                          }}
                        >
                      
                          Хамгийн их зарагдсан
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
            </div>
            )}
          </form>
          {/* <!-- /.header-search --> */}
        </div>
        {/* <!-- /.container --> */}

        <div className="container" style={{ backgroundColor: "#F4F7F5" }}>
          <div className="overflow-hidden">
            <ul className="navigation__list list-unstyled position-relative">
              <MobileNav />
            </ul>
            {/* <!-- /.navigation__list --> */}
          </div>
          {/* <!-- /.overflow-hidden --> */}
        </div>
        {/* <!-- /.container --> */}

        <div className="border-top mt-auto pb-2">
          </div>
        {/* <div className="border-top mt-auto pb-2">
          <div className="customer-links container mt-4 mb-2 pb-1">
            <svg
              className="d-inline-block align-middle"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <use href="#icon_user" />
            </svg>
            <span className="d-inline-block ms-2 text-uppercase align-middle fw-medium">
              My Account
            </span>
          </div>

          <div className="container d-flex align-items-center">
            <label className="me-2 text-secondary">Language</label>
            <select
              className="form-select form-select-sm bg-transparent border-0"
              aria-label="Default select example"
              name="store-language"
            >
              {languageOptions.map((option, index) => (
                <option
                  key={index}
                  className="footer-select__option"
                  value={option.value}
                >
                  {option.text}
                </option>
              ))}
            </select>
          </div>

          <div className="container d-flex align-items-center">
            <label className="me-2 text-secondary">Currency</label>
            <select
              className="form-select form-select-sm bg-transparent border-0"
              aria-label="Default select example"
              name="store-language"
              defaultValue={"fghgjhgj"}
            >
              {currencyOptions.map((option, index) => (
                <option
                  key={index}
                  className="footer-select__option"
                  value={option.value}
                >
                  {option.text}
                </option>
              ))}
            </select>
          </div>

          <ul className="container social-links list-unstyled d-flex flex-wrap mb-0">
            {socialLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="footer__social-link d-block color-white"
                >
                  <svg
                    className={link.className}
                    width={link.width}
                    height={link.height}
                    viewBox={link.viewBox}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <use href={link.icon} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div> */}
      </nav>
      {/* <!-- /.navigation --> */}
    </div>
  );
}
