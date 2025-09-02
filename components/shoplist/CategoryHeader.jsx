"use client";

import { useContextElement } from "@/context/Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CartLength from "../headers/components/CartLength";
import { openCart } from "@/utlis/openCart";
export default function CategoryHeader({ categoryId }) {
  const { cartProducts, currentCategory } = useContextElement();
  const router = useRouter();
  const [categoryName, setCategoryName] = useState("Онцлох бүтээгдэхүүн");
  const [loading, setLoading] = useState(false);

  // Set category name based on categoryId or use default
  useEffect(() => {
    if (!categoryId) {
      setCategoryName("Онцлох бүтээгдэхүүн");
      setLoading(false);
      return;
    }

    // First try to get from context
    if (currentCategory && currentCategory.id === categoryId) {
      setCategoryName(currentCategory.name);
      setLoading(false);
      return;
    }

    // Fallback to default name if context doesn't have the category
    setCategoryName("Бүтээгдэхүүн");
    setLoading(false);
  }, [categoryId, currentCategory]);

  const handleBack = () => {
    router.back();
  };

  const cartItemCount = cartProducts.length;

  return (
    <div className="category-header d-lg-none" style={{
      position: 'sticky',
      top: '0',
      zIndex: 1000,
      backgroundColor: "#F4F7F5",
      borderBottom: '1px solid #e9ecef',
      padding: '12px 16px'
    }}>
      {/* Main header bar */}
      <div className="d-flex align-items-center justify-content-between mb-2 mt-2">
        {/* Left side - Back button and category info */}
        <div className="d-flex align-items-center">
          <button
            onClick={handleBack}
            className="btn btn-link p-0 me-3"
            style={{ color: '#6c757d', textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <div>
            <h5 className="mb-0 fw-bold" style={{ color: '#212529', fontSize: '16px' }}>
              {loading ? "..." : categoryName}
            </h5>
            {/* <small className="text-muted" style={{ fontSize: '12px' }}>
              {cartItemCount} бараа
            </small> */}
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

      {/* Back navigation */}
      {/* <div className="d-flex align-items-center">
        <button
          onClick={handleBack}
          className="btn btn-link p-0 d-flex align-items-center"
          style={{ color: '#6c757d', textDecoration: 'none', fontSize: '14px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="me-1">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Буцах
        </button>
      </div> */}
    </div>
  );
}
