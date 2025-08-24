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
  const { cartProducts, setCartProducts, toggleWishlist, isAddedtoWishlist } = useContextElement();
  const [quantity, setQuantity] = useState(1);
  const [warn, setWarn] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  // --- Backend талбаруудыг тааруулах ---
  const images = product?.ProductImages?.map((i) => i.imageUrl) ?? [];
  
  // Selected variant-ыг initialize хийх
  React.useEffect(() => {
    const defaultVariant = product?.variants?.find((v) => v.isDefault) || product?.variants?.[0] || null;
    setSelectedVariant(defaultVariant);
  }, [product]);

  const currentVariant = selectedVariant || product?.variants?.[0] || null;
  const price = (currentVariant ? Number(currentVariant.price) : Number(product?.price || 0)) || 0;

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

  // ✅ Одоогоор сонгогдсон variant-ын үлдэгдэл, байхгүй бол бүх үлдэгдлийг ашиглая
  const selectedStock = useMemo(() => {
    if (currentVariant?.inventory?.quantity != null) {
      return Number(currentVariant.inventory.quantity);
    }
    return totalStock;
  }, [currentVariant, totalStock]);

  const outOfStock = selectedStock <= 0;

  // cart helpers
  const isIncludeCard = () => cartProducts.find((elm) => elm.id == product.id);

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
      const items = cartProducts.map((it) => (it.id === id ? { ...it, quantity: qty } : it));
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
      image: images[0] || "/images/placeholder-330x400.png",
      sku: currentVariant?.sku || product?.sku || "",
      variantId: currentVariant?.id || null,
      attributes: (currentVariant?.attributes || []).map((a) => ({
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

            <div className="product-single__prev-next d-flex align-items-center justify-content-between justify-content-md-end flex-grow-1">
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
            </div>
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

          <form onSubmit={(e) => e.preventDefault()}>
            {/* ✅ Size/Color аль нэг нь байвал л swatches үзүүлнэ */}
            {(hasSize || hasColor) && (
              <div className="product-single__swatches">
                {hasSize && (
                  <div className="product-swatch text-swatches">
                    <label>Хэмжээ</label>
                    <div className="swatch-list">
                      <Size 
                        product={product}
                        selectedVariant={selectedVariant}
                        onVariantChange={setSelectedVariant}
                      />
                    </div>
                    <a
                      href="#"
                      className="sizeguide-link"
                      data-bs-toggle="modal"
                      data-bs-target="#sizeGuide"
                    >
                      Хэмжээний хүснэгт
                    </a>
                  </div>
                )}

                {hasColor && (
                  <div className="product-swatch color-swatches">
                    <label>Өнгө</label>
                    <div className="swatch-list">
                      <Colors 
                        product={product}
                        selectedVariant={selectedVariant}
                        onVariantChange={setSelectedVariant}
                      />
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
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={`menu-link menu-link_us-s add-to-wishlist ${isAddedtoWishlist(product.id) ? 'active' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <use href="#icon_heart" />
              </svg>
              <span>{isAddedtoWishlist(product.id) ? 'Хүслийн жагсаалтаас хасах' : 'Хүслийн жагсаалтад нэмэх'}</span>
            </button>
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

      {/* Reviews Section - Compact */}
      <div className="product-single__reviews-section mt-5 mb-5">
        <div className="row">
          <div className="col-12">
            <div className="reviews-compact-container">
              <Reviews productId={product?.id} productName={product?.name} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
