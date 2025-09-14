"use client";
import { useContextElement } from "@/context/Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CartLength from "./components/CartLength";
import { openCart } from "@/utlis/openCart";

export default function UnifiedMobileHeader({ 
  title, 
  titleType = "static", // "static", "category", "product"
  categoryId, 
  productId,
  className = ""
}) {
  const { cartProducts, currentCategory, currentProduct } = useContextElement();
  const router = useRouter();
  const [displayTitle, setDisplayTitle] = useState(title || "");
  const [loading, setLoading] = useState(false);

  // Handle dynamic title based on type
  useEffect(() => {
    if (titleType === "static") {
      setDisplayTitle(title || "");
      setLoading(false);
      return;
    }

    if (titleType === "category") {
      if (!categoryId) {
        setDisplayTitle("Онцлох бүтээгдэхүүн");
        setLoading(false);
        return;
      }

      // First try to get from context
      if (currentCategory && currentCategory.id === categoryId) {
        setDisplayTitle(currentCategory.name);
        setLoading(false);
        return;
      }

      // Fallback to default name if context doesn't have the category
      setDisplayTitle("Бүтээгдэхүүн");
      setLoading(false);
    }

    if (titleType === "product") {
      if (!productId) {
        setDisplayTitle("Бүтээгдэхүүн");
        setLoading(false);
        return;
      }
      
      if (currentProduct && currentProduct.id === productId) {
        setDisplayTitle(currentProduct.name);
        setLoading(false);
        return;
      }
      
      setDisplayTitle("Бүтээгдэхүүн");
      setLoading(false);
    }
  }, [titleType, categoryId, productId, currentCategory, currentProduct, title]);

  const handleBack = () => {
    router.back();
  };

  const cartItemCount = cartProducts.length;

  return (
    <div className={`unified-mobile-header d-lg-none ${className}`} style={{
      position: 'sticky',
      top: '0',
      zIndex: 1000,
      backgroundColor: "#F4F7F5",
      borderBottom: '1px solid #e9ecef',
      padding: '12px 16px',
      boxShadow: '0 2px 2px rgba(220, 229, 224, 0.1)'
    }}>
      {/* Main header bar */}
      <div className="d-flex align-items-center justify-content-between mb-2 mt-2">
        {/* Left side - Back button and title */}
        <div className="d-flex align-items-center">
          <button
            onClick={handleBack}
            className="btn btn-link p-0 me-3"
            style={{ 
              color: '#6c757d', 
              textDecoration: 'none',
              border: 'none',
              background: 'none',
              padding: '4px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <div>
            <h5 className="mb-0 fw-bold" style={{ 
              color: '#212529', 
              fontSize: '16px',
              lineHeight: '1.2',
              ...(titleType === "product" && {
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              })
            }}>
              {loading ? "..." : displayTitle}
            </h5>
          </div>
        </div>

        {/* Right side - Cart icon */}
        <div className="position-relative">
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
      </div>
    </div>
  );
}
