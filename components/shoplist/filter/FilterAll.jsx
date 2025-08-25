"use client";

// Removed unused imports - now using backend attributes
import { useEffect, useState, useCallback } from "react";
import Slider from "rc-slider";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { sortingOptions } from "@/data/products/productCategories";

export default function FilterAll({ onFiltersChange }) {
  const params = useParams();
  const router = useRouter();
  const currentCategoryId = params?.categoryId ? parseInt(params.categoryId) : null;
  
  // Category tree state
  const [catTree, setCatTree] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Attributes from backend
  const [attributes, setAttributes] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(true);
  const [attributesError, setAttributesError] = useState("");

  // Filter states
  const [activeColors, setActiveColors] = useState([]);
  const [activeSizes, setActiveSizes] = useState([]);
  const [activeBrands, setActiveBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [price, setPrice] = useState([20, 70987]);
  
  // Accordion states
  const [expandedAccordions, setExpandedAccordions] = useState(new Set(['categories', 'colors', 'sizes', 'brands', 'price']));

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
            console.log('Categories data is null, using empty array');
            setCatTree([]);
          }
        }
      } catch (e) {
        console.error('Error loading categories:', e);
        if (alive) {
          // Don't show error for 404, just use empty categories
          if (e.message.includes('404') || e.message.includes('Not Found')) {
            console.log('Categories endpoint not found, using empty categories');
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

  // Load attributes from backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setAttributesLoading(true);
        setAttributesError(null);
        const res = await api.attributes.getAll();
        const payload = res?.data ?? res;
        if (alive) {
          if (Array.isArray(payload)) {
            setAttributes(payload);
          } else if (payload === null) {
            // API returned null data (404 handled by API client)
            console.log('Attributes data is null, using empty array');
            setAttributes([]);
          }
        }
      } catch (e) {
        console.error('Error loading attributes:', e);
        if (alive) {
          // Don't show error for 404, just use empty attributes
          if (e.message.includes('404') || e.message.includes('Not Found')) {
            console.log('Attributes endpoint not found, using empty attributes');
            setAttributes([]);
            return;
          }
          
          let errorMessage = "Шинж чанар ачилт алдаа";
          
          if (e.message.includes('fetch')) {
            errorMessage = "Сүлжээний холболт асуудалтай байна.";
          } else if (e.message.includes('500')) {
            errorMessage = "Серверийн алдаа гарлаа.";
          } else if (e.message) {
            errorMessage = e.message;
          }
          
          setAttributesError(errorMessage);
        }
      } finally {
        if (alive) setAttributesLoading(false);
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

  // Notify parent component when filters change
  const notifyFiltersChange = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange({
        colors: activeColors,
        sizes: activeSizes,
        brands: activeBrands,
        price: price,
        search: searchQuery
      });
    }
  }, [activeColors, activeSizes, activeBrands, price, searchQuery]);

  useEffect(() => {
    notifyFiltersChange();
  }, [activeColors, activeSizes, activeBrands, price, searchQuery]);

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
                // Auto-expand parent if this is a child category
                if (level > 0) {
                  expandParentIfChildSelected(category.id);
                }
                // Simple client-side navigation
                router.push(`/shop-4/${category.id}`, { scroll: false });
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
  const toggleColor = (colorId) => {
    if (activeColors.includes(colorId)) {
      setActiveColors((pre) => [...pre.filter((id) => id !== colorId)]);
    } else {
      setActiveColors((pre) => [...pre, colorId]);
    }
  };

  const toggleSize = (sizeId) => {
    if (activeSizes.includes(sizeId)) {
      setActiveSizes((pre) => [...pre.filter((id) => id !== sizeId)]);
    } else {
      setActiveSizes((pre) => [...pre, sizeId]);
    }
  };

  const toggleBrand = (brandId) => {
    if (activeBrands.includes(brandId)) {
      setActiveBrands((pre) => [...pre.filter((id) => id !== brandId)]);
    } else {
      setActiveBrands((pre) => [...pre, brandId]);
    }
  };

// Removed unused useEffect - search is now handled in render

  const handleOnChange = (value) => {
    setPrice(value);
  };

  // Toggle accordion
  const toggleAccordion = (accordionId) => {
    console.log('Toggling accordion:', accordionId);
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accordionId)) {
        newSet.delete(accordionId);
      } else {
        newSet.add(accordionId);
      }
      console.log('New expanded accordions:', Array.from(newSet));
      return newSet;
    });
  };

  // Group attributes by type
  const getAttributesByType = (type) => {
    return attributes.filter(attr => attr.type === type);
  };

  // Get color attributes
  const colorAttributes = getAttributesByType('color');
  const sizeAttributes = getAttributesByType('size');
  const brandAttributes = getAttributesByType('brand');

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
      <div className="accordion" id="color-filters">
        <div className="accordion-item mb-4">
          <h5 className="accordion-header" id="accordion-heading-1">
            <button
              className="accordion-button p-0 border-0 fs-5 text-uppercase"
              type="button"
              onClick={() => toggleAccordion('colors')}
              aria-expanded={expandedAccordions.has('colors')}
            >
              Color
              <svg 
                className={`accordion-button__icon transition-transform ${expandedAccordions.has('colors') ? 'rotate-180' : ''}`} 
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
            className={`accordion-collapse border-0 ${expandedAccordions.has('colors') ? 'show' : 'collapse'}`}
            aria-labelledby="accordion-heading-1"
            style={{
              transition: 'all 0.3s ease',
              maxHeight: expandedAccordions.has('colors') ? '300px' : '0',
              overflow: 'hidden'
            }}
          >
            <div className="accordion-body px-0 pb-0">
              {attributesLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : attributesError ? (
                <div className="text-danger small py-2">{attributesError}</div>
              ) : colorAttributes.length > 0 ? (
                <div className="d-flex flex-wrap">
                  {colorAttributes.map((attribute) => (
                    <div key={attribute.id} className="mb-2">
                      <h6 className="text-muted small mb-2">{attribute.name}</h6>
              <div className="d-flex flex-wrap">
                        {attribute.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => toggleColor(option.id)}
                            className={`swatch-color js-filter me-2 mb-2 ${
                              activeColors.includes(option.id) ? "swatch_active" : ""
                            }`}
                            style={{ 
                              backgroundColor: option.value,
                              border: '1px solid #ddd'
                            }}
                            title={option.value}
                  />
                ))}
              </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small py-2">Өнгө байхгүй</div>
              )}
            </div>
          </div>
        </div>
        {/* /.accordion-item */}
      </div>
      {/* /.accordion */}
      <div className="accordion" id="size-filters">
        <div className="accordion-item mb-4">
          <h5 className="accordion-header" id="accordion-heading-size">
            <button
              className="accordion-button p-0 border-0 fs-5 text-uppercase"
              type="button"
              onClick={() => toggleAccordion('sizes')}
              aria-expanded={expandedAccordions.has('sizes')}
            >
              Sizes
              <svg 
                className={`accordion-button__icon transition-transform ${expandedAccordions.has('sizes') ? 'rotate-180' : ''}`} 
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
            className={`accordion-collapse border-0 ${expandedAccordions.has('sizes') ? 'show' : 'collapse'}`}
            aria-labelledby="accordion-heading-size"
            style={{
              transition: 'all 0.3s ease',
              maxHeight: expandedAccordions.has('sizes') ? '300px' : '0',
              overflow: 'hidden'
            }}
          >
            <div className="accordion-body px-0 pb-0">
              {attributesLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : attributesError ? (
                <div className="text-danger small py-2">{attributesError}</div>
              ) : sizeAttributes.length > 0 ? (
                <div className="d-flex flex-wrap">
                  {sizeAttributes.map((attribute) => (
                    <div key={attribute.id} className="mb-2">
                      <h6 className="text-muted small mb-2">{attribute.name}</h6>
              <div className="d-flex flex-wrap">
                        {attribute.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => toggleSize(option.id)}
                            className={`swatch-size btn btn-sm btn-outline-light mb-2 me-2 js-filter ${
                              activeSizes.includes(option.id) ? "swatch_active" : ""
                            }`}
                          >
                            {option.value}
                          </button>
                ))}
              </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small py-2">Хэмжээ байхгүй</div>
              )}
            </div>
          </div>
        </div>
        {/* /.accordion-item */}
      </div>
      {/* /.accordion */}
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
              {attributesLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : attributesError ? (
                <div className="text-danger small py-2">{attributesError}</div>
              ) : brandAttributes.length > 0 ? (
              <ul className="multi-select__list list-unstyled">
                  {brandAttributes.map((attribute) => (
                    <div key={attribute.id} className="mb-3">
                      <h6 className="text-muted small mb-2">{attribute.name}</h6>
                      {attribute.options
                        .filter((option) =>
                          option.value.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((option) => (
                          <li
                            key={option.id}
                            onClick={() => toggleBrand(option.id)}
                      className={`search-suggestion__item multi-select__item text-primary js-search-select js-multi-select ${
                              activeBrands.includes(option.id)
                          ? "mult-select__item_selected"
                          : ""
                      }`}
                    >
                            <span className="me-auto">{option.value}</span>
                    </li>
                        ))}
                    </div>
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
        </div>
        {/* /.accordion-item */}
      </div>
      {/* /.accordion */}
      
      {/* Sorting Filter - Removed, now handled in Shop4 component */}
      
      <div className="filter-active-tags pt-2">
        {/* Active color filters */}
        {activeColors.map((colorId) => {
          const colorAttribute = colorAttributes.find(attr => 
            attr.options.some(opt => opt.id === colorId)
          );
          const colorOption = colorAttribute?.options.find(opt => opt.id === colorId);
          return colorOption ? (
            <button
              key={`color-${colorId}`}
              onClick={() => toggleColor(colorId)}
              className="filter-tag d-inline-flex align-items-center mb-3 me-3 text-uppercase js-filter"
            >
              <i className="btn-close-xs d-inline-block" />
              <span className="ms-2">Өнгө: {colorOption.value}</span>
            </button>
          ) : null;
        })}

        {/* Active size filters */}
        {activeSizes.map((sizeId) => {
          const sizeAttribute = sizeAttributes.find(attr => 
            attr.options.some(opt => opt.id === sizeId)
          );
          const sizeOption = sizeAttribute?.options.find(opt => opt.id === sizeId);
          return sizeOption ? (
            <button
              key={`size-${sizeId}`}
              onClick={() => toggleSize(sizeId)}
              className="filter-tag d-inline-flex align-items-center mb-3 me-3 text-uppercase js-filter"
            >
              <i className="btn-close-xs d-inline-block" />
              <span className="ms-2">Хэмжээ: {sizeOption.value}</span>
            </button>
          ) : null;
        })}

        {/* Active brand filters */}
        {activeBrands.map((brandId) => {
          const brandAttribute = brandAttributes.find(attr => 
            attr.options.some(opt => opt.id === brandId)
          );
          const brandOption = brandAttribute?.options.find(opt => opt.id === brandId);
          return brandOption ? (
            <button
              key={`brand-${brandId}`}
              onClick={() => toggleBrand(brandId)}
              className="filter-tag d-inline-flex align-items-center mb-3 me-3 text-uppercase js-filter"
            >
              <i className="btn-close-xs d-inline-block" />
              <span className="ms-2">Брэнд: {brandOption.value}</span>
            </button>
          ) : null;
        })}

        {/* Price range filter */}
        {(price[0] !== 20 || price[1] !== 70987) && (
          <button
            onClick={() => setPrice([20, 70987])}
            className="filter-tag d-inline-flex align-items-center mb-3 me-3 text-uppercase js-filter"
          >
            <i className="btn-close-xs d-inline-block" />
            <span className="ms-2">Үнэ: ${price[0]} - ${price[1]}</span>
          </button>
        )}

        {/* Sorting filter - Removed, now handled in Shop4 component */}
      </div>
    </>
  );
}
