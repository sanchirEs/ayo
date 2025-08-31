"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import ProductCard from "@/components/common/ProductCard";
import FlashSaleCountdown from "./FlashSaleCountdown";
import api from "@/lib/api";

export default function FlashSaleProducts() {
  const [data, setData] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get flash sale products
    api.homepage
      .bundled({ sections: 'flash', limit: 20, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        // Extract flashSale from homepage response
        const flashSaleProducts = res.data?.flashSale || [];
        setData({ products: flashSaleProducts, pagination: null });
        console.log("flash sale products: ", flashSaleProducts)
      })
      .catch((e) => setErr(e.message || "Failed to load flash sale products"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const products = data.products;

  // Always call useMemo hook before any conditional returns
  const swiperOptions = useMemo(
    () => ({
      autoplay: { delay: 3000 }, // Faster autoplay for flash sale
      modules: [Autoplay, Navigation],
      slidesPerView: 5,
      slidesPerGroup: 5,
      effect: "none",
      loop: products.length > 5, // loop only if enough items
      pagination: false,
      navigation: {
        nextEl: ".flash-sale-carousel__next",
        prevEl: ".flash-sale-carousel__prev",
      },
      breakpoints: {
        320: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
        768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 24 },
        992: { slidesPerView: 5, slidesPerGroup: 1, spaceBetween: 30, pagination: false },
      },
    }),
    [products.length]
  );

  // If no products, show the countdown
  if (!loading && !err && products.length === 0) {
    return <FlashSaleCountdown />;
  }

  if (loading) {
    return (
      <section className="products-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Flash Sale
        </h2>
        <p className="text-center">Loading products…</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="products-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Flash Sale
        </h2>
        <p className="text-danger text-center">{err}</p>
      </section>
    );
  }

  return (
    <section className="products-carousel container">
      <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
       Flash Sale
      </h2>
      <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center">
        Хязгаарлагдмал хугацааны хямдрал - Амжиж захиалаарай!
      </p>

      <div className="position-relative">
        <Swiper className="swiper-container js-swiper-slider" {...swiperOptions}>
          {products.map((product) => (
            <SwiperSlide key={product.id} className="swiper-slide">
              <div className="position-relative">
                {/* Flash Sale Badge */}
                <div className="position-absolute top-0 start-0 m-3 z-3">
                  <span className="badge bg-danger text-white px-3 py-2">
                    FLASH SALE
                  </span>
                </div>
                
                {/* Use ProductCard component */}
                <ProductCard 
                  product={product} 
                  imageWidth={330} 
                  imageHeight={400} 
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation arrows */}
        <div className="cursor-pointer products-carousel__prev position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg width="25" height="25" viewBox="0 0 25 25">
            <use href="#icon_prev_md" />
          </svg>
        </div>
        <div className="cursor-pointer products-carousel__next position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg width="25" height="25" viewBox="0 0 25 25">
            <use href="#icon_next_md" />
          </svg>
        </div>
      </div>
    </section>
  );
}
