"use client";

import { useMemo } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "@/components/common/ProductCard";

/**
 * PopularProducts Component
 * Displays featured/popular products in a carousel
 * 
 * ✅ OPTIMIZED: Now accepts products as props (no API calls, no loading state)
 * WHY: Parent fetches all data in single API call = faster, no duplicates
 */
export default function PopulerProducts({ products = [] }) {
  const swiperOptions = useMemo(
    () => ({
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      slidesPerView: 5,
      slidesPerGroup: 5,
      effect: "none",
      loop: products.length > 5,
      pagination: false,
      modules: [Navigation, Autoplay],
      navigation: {
        nextEl: "#product_1 .products-carousel__next",
        prevEl: "#product_1 .products-carousel__prev",
      },
      breakpoints: {
        320: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 14,
        },
        768: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 5,
          slidesPerGroup: 1,
          spaceBetween: 30,
          pagination: false,
        },
      },
    }),
    [products.length]
  );

  // Don't render if no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="products-carousel container">
      <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
        Онцлох бүтээгдэхүүнүүд
      </h2>
      <p className="fs-15 mb-2 pb-xl-2 text-secondary text-center">
        Хамгийн их захиалагдсан бараанууд
      </p>

      <div className="tab-content pt-2" id="collections-tab-content">
        <div
          className="tab-pane fade show active"
          id="collections-tab-1"
          role="tabpanel"
          aria-labelledby="collections-tab-1-trigger"
        >
          <div id="product_1" className="position-relative">
            <Swiper
              className="swiper-container js-swiper-slider"
              {...swiperOptions}
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} imageWidth={280} imageHeight={340} />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="cursor-pointer products-carousel__prev position-absolute top-50 d-flex align-items-center justify-content-center">
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_prev_md" />
              </svg>
            </div>
            
            <div className="cursor-pointer products-carousel__next position-absolute top-50 d-flex align-items-center justify-content-center">
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_next_md" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
