"use client";

import React, { useMemo, useState } from "react";
import ProductSlider1 from "./sliders/ProductSlider1";
import BreadCumb from "./BreadCumb";
import Star from "../common/Star";
import Colors from "./Colors";
import Size from "./Size";
import AdditionalInfo from "./AdditionalInfo";
import Reviews from "./Reviews";
import ShareComponent from "../common/ShareComponent";
import { useContextElement } from "@/context/Context";
import Link from "next/link";

export default function SingleProduct12({ product }) {
  const { cartProducts, setCartProducts } = useContextElement();
  const [quantity, setQuantity] = useState(1);
  const [warn, setWarn] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);

  // --- Backend талбаруудыг тааруулах ---
  const images = product?.ProductImages?.map((i) => i.imageUrl) ?? [];
  const defaultVariant =
    product?.variants?.find((v) => v.isDefault) || product?.variants?.[0] || null;

  const price =
    (selectedVariant ? Number(selectedVariant.price) : 
     defaultVariant ? Number(defaultVariant.price) : 
     Number(product?.price || 0)) || 0;

  // ✅ Нийт үлдэгдэл (бүх variant + product level)
  const totalStock = useMemo(() => {
    const vSum = (product?.variants || []).reduce(
      (s, v) => s + (v?.inventory?.quantity ? Number(v.inventory.quantity) : 0),
      0
    );
    const pSum = (product?.inventories || []).reduce(
      (s, inv) => s + (inv?.quantity ? Number(inv.quantity) : 0),
      0
    );
    return vSum + pSum;
  }, [product]);

  // ✅ Одоогоор сонгогдсон variant-ын үлдэгдэл, байхгүй бол default variant-ыг ашиглая
  const selectedStock = useMemo(() => {
    if (selectedVariant?.inventory?.quantity != null) {
      return Number(selectedVariant.inventory.quantity);
    }
    if (defaultVariant?.inventory?.quantity != null) {
      return Number(defaultVariant.inventory.quantity);
    }
    return totalStock;
  }, [selectedVariant, defaultVariant, totalStock]);

  const outOfStock = selectedStock <= 0;

  // cart helpers
  const isIncludeCard = () => {
    const currentVariantId = selectedVariant?.id || defaultVariant?.id;
    return cartProducts.find((elm) => 
      elm.id === product.id && elm.variantId === currentVariantId
    );
  };

  const clampQty = (q) => {
    // 1-ээс багагүй, selectedStock-оос ихгүй
    const n = Math.max(1, parseInt(q, 10) || 1);
    if (selectedStock > 0 && n > selectedStock) {
      setWarn(`Үлдэгдэл ${selectedStock} ширхэг байна. ${selectedStock}-с илүүг сагсанд хийх боломжгүй.`);
      return selectedStock;
    }
    setWarn("");
    return n;
  };

  const setQuantityCartItem = (id, q) => {
    const qty = clampQty(q);
    const existed = isIncludeCard();
    if (existed) {
      const currentVariantId = selectedVariant?.id || defaultVariant?.id;
      const items = cartProducts.map((it) => 
        (it.id === id && it.variantId === currentVariantId) ? { ...it, quantity: qty } : it
      );
      setCartProducts(items);
    } else {
      setQuantity(qty);
    }
  };

  const addToCart = () => {
    if (outOfStock) return;
    if (isIncludeCard()) return;

    // safety: сонгосон тоо үлдэгдлээс их бол дарж болохгүй
    const safeQty = clampQty(quantity);

    const item = {
      id: product.id,
      name: product.name,
      price: price,
      quantity: safeQty,
      image: (selectedVariant?.images?.[0]?.imageUrl || defaultVariant?.images?.[0]?.imageUrl || images[0]) || "/images/placeholder-330x400.png",
      sku: selectedVariant?.sku || defaultVariant?.sku || product?.sku || "",
      variantId: selectedVariant?.id || defaultVariant?.id || null,
      attributes: (selectedVariant?.attributes || defaultVariant?.attributes || []).map((a) => ({
        name: a?.option?.attribute?.name ?? "",
        value: a?.option?.value ?? "",
      })),
      stock: selectedStock ?? 0,
    };
    setCartProducts((prev) => [...prev, item]);
  };

  // Вариантуудаас атрибутуудын нэрсийг цуглуулах
  const attributeNameSet = useMemo(() => {
    const s = new Set();
    (product?.variants || []).forEach(v => {
      (v.attributes || []).forEach(va => {
        const n = va?.option?.attribute?.name;
        if (n) s.add(n.trim());
      });
    });
    return s;
  }, [product]);

  // case-insensitive шалгалт (Mongolian/English аль алиныг нь барих regex)
  const hasSize = useMemo(() => {
    return Array.from(attributeNameSet).some(n => /^(size|хэмж(ээ)?)$/i.test(n));
  }, [attributeNameSet]);

  const hasColor = useMemo(() => {
    return Array.from(attributeNameSet).some(n => /^(color|өнгө)$/i.test(n));
  }, [attributeNameSet]);


  return (
    <section className="product-single container">
      <div className="row">
        <div className="col-lg-7">
          <ProductSlider1 images={images} />
        </div>

        <div className="col-lg-5">
          <div className="d-flex justify-content-between mb-4 pb-md-2">
            <div className="breadcrumb mb-0 d-none d-md-block flex-grow-1">
              <BreadCumb />
            </div>

            {/* <div className="product-single__prev-next d-flex align-items-center justify-content-between justify-content-md-end flex-grow-1">
              <a className="text-uppercase fw-medium">
                <svg className="mb-1px" width="10" height="10" viewBox="0 0 25 25">
                  <use href="#icon_prev_md" />
                </svg>
                <span className="menu-link menu-link_us-s">Prev</span>
              </a>
              <a className="text-uppercase fw-medium">
                <span className="menu-link menu-link_us-s">Next</span>
                <svg className="mb-1px" width="10" height="10" viewBox="0 0 25 25">
                  <use href="#icon_next_md" />
                </svg>
              </a>
            </div> */}
          </div>

          <h1 className="product-single__name">{product?.name}</h1>

          <div className="product-single__rating">
            <div className="reviews-group d-flex">
              <Star stars={5} />
            </div>
            <span className="reviews-note text-lowercase text-secondary ms-1">8k+ reviews</span>
          </div>

          <div className="product-single__price">
            <span className="current-price">${price.toLocaleString()}</span>
          </div>

          {/* ✅ Үлдэгдэл */}
          <div className="mb-2">
            {outOfStock ? (
              <span className="text-dark bg-danger">
                Уучлаарай, уг барааны үлдэгдэл дууссан байна.
              </span>
            ) : (
              <span className="text-secondary">
                Боломжит үлдэгдэл: <strong>{selectedStock}</strong>
              </span>
            )}
          </div>
          {warn && !outOfStock && (
            <div className="mb-2 text-dark bg-warning" role="alert">
              {warn}
            </div>
          )}

          <div className="product-single__short-desc">
            <p>{product?.description || "No description."}</p>
          </div>

          {/* Product Specifications */}
          {product?.specs && product.specs.length > 0 && (
            <div className="product-specifications mb-4">
              <h6 className="fw-semibold mb-3 text-dark">Барааны тодорхойлолт</h6>
              <div className="specs-container" style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                {product.specs.map((spec, index) => (
                  <div key={index} className="spec-item d-flex justify-content-between align-items-center py-1" style={{
                    borderBottom: index < product.specs.length - 1 ? '1px solid #e9ecef' : 'none'
                  }}>
                    <span className="spec-label text-dark" style={{ color: '#2d5a27' }}>
                      {spec.type?.toUpperCase() || 'N/A'}
                    </span>
                    <span className="spec-value text-dark" style={{ color: '#2d5a27' }}>
                      {spec.value || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Variants */}
          {product?.variants && product.variants.length > 0 && (
            <div className="product-variants mb-4">
              <h6 className="fw-semibold mb-3 text-dark">Барааны хувилбарууд</h6>
              
              {/* Variant Type Selection (e.g., Color, Scent) */}
              {(() => {
                const variantTypes = new Set();
                product.variants.forEach(variant => {
                  variant.attributes?.forEach(attr => {
                    if (attr?.option?.attribute?.name) {
                      variantTypes.add(attr.option.attribute.name);
                    }
                  });
                });
                
                return Array.from(variantTypes).map(type => {
                  const options = product.variants
                    .filter(variant => 
                      variant.attributes?.some(attr => 
                        attr?.option?.attribute?.name === type
                      )
                    )
                    .map(variant => {
                      const attr = variant.attributes?.find(a => 
                        a?.option?.attribute?.name === type
                      );
                      return {
                        variantId: variant.id,
                        value: attr?.option?.value || 'N/A',
                        image: variant.images?.[0]?.imageUrl,
                        price: variant.price,
                        isDefault: variant.isDefault,
                        inStock: variant.inventory?.quantity > 0,
                        variant: variant // Keep full variant object for reference
                      };
                    });

                  return (
                    <div key={type} className="variant-section mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <label className="fw-medium text-dark me-2">{type}:</label>
                        <span className="text-muted">
                          {selectedVariant && selectedVariant.attributes?.some(attr => 
                            attr?.option?.attribute?.name === type
                          ) ? 
                            selectedVariant.attributes.find(attr => 
                              attr?.option?.attribute?.name === type
                            )?.option?.value :
                            options.find(opt => opt.isDefault)?.value || options[0]?.value
                          }
                        </span>
                      </div>
                      
                      <div className="variant-options d-flex flex-wrap gap-2">
                        {options.map((option, index) => {
                          const isSelected = selectedVariant?.id === option.variantId || 
                            (!selectedVariant && option.isDefault);
                          
                          return (
                            <div
                              key={option.variantId}
                              className={`variant-option position-relative ${isSelected ? 'selected' : ''} ${!option.inStock ? 'out-of-stock' : ''}`}
                              style={{
                                cursor: option.inStock ? 'pointer' : 'not-allowed',
                                opacity: option.inStock ? 1 : 0.5
                              }}
                              onClick={() => {
                                if (option.inStock) {
                                  setSelectedVariant(option.variant);
                                  // Reset quantity when variant changes
                                  setQuantity(1);
                                  setWarn("");
                                }
                              }}
                            >
                              {option.image && (
                                <img
                                  src={option.image}
                                  alt={option.value}
                                  className="variant-image"
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: isSelected ? '3px solid #000' : '2px solid #e9ecef'
                                  }}
                                />
                              )}
                              
                              {/* Labels */}
                              {option.isDefault && (
                                <span className="position-absolute top-0 start-0 badge bg-success text-white" style={{ fontSize: '0.7rem' }}>
                                  NEW
                                </span>
                              )}
                              
                              {!option.inStock && (
                                <span className="position-absolute top-0 end-0 badge bg-danger text-white" style={{ fontSize: '0.7rem' }}>
                                  OUT
                                </span>
                              )}
                              
                              <div className="variant-info text-center mt-1">
                                <div className="variant-value small fw-medium">{option.value}</div>
                                <div className="variant-price small text-muted">₮{Number(option.price).toLocaleString()}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* Ingredients Section */}
          {product?.ingredients && (
            <div className="ingredients-section mb-3">
              <div className="d-flex justify-content-between align-items-center py-2" style={{
                borderBottom: '1px solid #e9ecef'
              }}>
                <span className="fw-medium text-dark">Найрлага</span>
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => setShowIngredients(!showIngredients)}
                  style={{ fontSize: '1.2rem', lineHeight: '1' }}
                >
                  {showIngredients ? '−' : '+'}
                </button>
              </div>
              {showIngredients && (
                <div className="ingredients-content py-2">
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {product.ingredients}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* How to Use Section */}
          {product?.howToUse && (
            <div className="how-to-use-section mb-3">
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="fw-medium text-dark">Ашиглах заавар</span>
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => setShowHowToUse(!showHowToUse)}
                  style={{ fontSize: '1.2rem', lineHeight: '1' }}
                >
                  {showHowToUse ? '−' : '+'}
                </button>
              </div>
              {showHowToUse && (
                <div className="how-to-use-content py-2">
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {product.howToUse}
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {/* ✅ Size/Color аль нэг нь байвал л swatches үзүүлнэ */}
            {(hasSize || hasColor) && (
              <div className="product-single__swatches">
                {hasSize && (
                  <div className="product-swatch text-swatches">
                    <label>Sizes</label>
                    <div className="swatch-list">
                      <Size />
                    </div>
                    <a
                      href="#"
                      className="sizeguide-link"
                      data-bs-toggle="modal"
                      data-bs-target="#sizeGuide"
                    >
                      Size Guide
                    </a>
                  </div>
                )}

                {hasColor && (
                  <div className="product-swatch color-swatches">
                    <label>Color</label>
                    <div className="swatch-list">
                      <Colors />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ✅ Үлдэгдэлгүй үед тоо болон товчнуудыг нуух */}
            {!outOfStock && (
              <div className="product-single__addtocart">
                <div className="qty-control position-relative">
                  <input
                    type="number"
                    name="quantity"
                    value={isIncludeCard()?.quantity ?? quantity}
                    min="1"
                    max={selectedStock || undefined}
                    onChange={(e) => setQuantityCartItem(product.id, e.target.value)}
                    className="qty-control__number text-center"
                  />
                  <div
                    onClick={() =>
                      setQuantityCartItem(
                        product.id,
                        (isIncludeCard()?.quantity || quantity) - 1
                      )
                    }
                    className="qty-control__reduce"
                  >
                    -
                  </div>
                  <div
                    onClick={() =>
                      setQuantityCartItem(
                        product.id,
                        (isIncludeCard()?.quantity || quantity) + 1
                      )
                    }
                    className="qty-control__increase"
                  >
                    +
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-addtocart js-open-aside"
                  onClick={addToCart}
                  disabled={outOfStock}
                >
                  {isIncludeCard() ? "Сагсанд хийсэн" : "Сагсанд хийх"}
                </button>

                <Link
                  href="/shop_cart"
                  onClick={(e) => {
                    if (outOfStock) {
                      e.preventDefault();
                      return;
                    }
                    if (!isIncludeCard()) addToCart();
                  }}
                  className="btn btn-primary btn-addtocart js-open-aside bg-white text-dark"
                  aria-disabled={outOfStock}
                >
                  Худалдаж авах
                </Link>
              </div>
            )}
          </form>

          <div className="product-single__addtolinks">
            <a href="#" className="menu-link menu-link_us-s add-to-wishlist">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <use href="#icon_heart" />
              </svg>
              <span>Add to Wishlist</span>
            </a>
            <ShareComponent title={product?.name || "Product"} />
          </div>

          <div className="product-single__meta-info">
            <div className="meta-item">
              <label>SKU:</label>
              <span>{product?.sku || "N/A"}</span>
            </div>
            <div className="meta-item">
              <label>Categories:</label>
              <span>{product?.category?.name || "—"}</span>
            </div>
            <div className="meta-item">
              <label>Tags:</label>
              <span>{(product?.tags || []).map((t) => t.tag).join(", ") || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="product-single__details-tab">
        <ul className="nav nav-tabs" id="myTab1" role="tablist">
          {/* <li className="nav-item" role="presentation">
            <a
              className="nav-link nav-link_underscore"
              id="tab-additional-info-tab"
              data-bs-toggle="tab"
              href="#tab-additional-info"
              role="tab"
              aria-controls="tab-additional-info"
              aria-selected="false"
            >
              Нэмэлт мэдээлэл
            </a>
          </li> */}
          <li className="nav-item" role="presentation">
            <a
              className="nav-link nav-link_underscore"
              id="tab-reviews-tab"
              data-bs-toggle="tab"
              href="#tab-reviews"
              role="tab"
              aria-controls="tab-reviews"
              aria-selected="false"
            >
              Сэтгэгдэл
            </a>
          </li>
        </ul>

        <div className="tab-content">
          {/* <div className="tab-pane fade show active" id="tab-additional-info" role="tabpanel">
            <AdditionalInfo product={product} />
          </div> */}
          <div className="tab-pane fade show active"  id="tab-reviews" role="tabpanel">
             <Reviews productId={product?.id} productName={product?.name} />
          </div>
        </div>
      </div>
    </section>
  );
}
