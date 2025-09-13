"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import ProductCardNew from "@/components/common/ProductCardNew";
import api from "@/lib/api";

export default function Featured() {

  const [data, setData] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get new arrivals
    api.homepage
      .bundled({ sections: 'new', limit: 20, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        // Extract newArrivals from homepage response
        const newArrivals = res.data?.newArrivals || [];
        setData({ products: newArrivals, pagination: null });
        console.log("new arrivals: ", newArrivals)
      })
      .catch((e) => setErr(e.message || "Failed to load new products"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const products = data.products;

  const swiperOptions = useMemo(
    () => ({
      autoplay: { delay: 5000 },
      modules: [Autoplay, Navigation],
      slidesPerView: 5,
      slidesPerGroup: 5,
      effect: "none",
      loop: products.length > 5, // loop only if enough items
      pagination: false,
      navigation: {
        nextEl: ".products-carousel__next",
        prevEl: ".products-carousel__prev",
      },
      breakpoints: {
        320: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
        768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 24 },
        992: { slidesPerView: 5, slidesPerGroup: 1, spaceBetween: 30, pagination: false },
      },
    }),
    [products.length]
  );

  if (loading) {
    return (
      <section className="products-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Шинээр нэмэгдсэн бүтээгдэхүүнүүд
        </h2>
        <p className="text-center">Loading products…</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="products-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Шинээр нэмэгдсэн бүтээгдэхүүнүүд
        </h2>
        <p className="text-danger text-center">{err}</p>
      </section>
    );
  }

  return (
    <section className="products-carousel container">
      <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
      Шинээр нэмэгдсэн бүтээгдэхүүнүүд
      </h2>
      <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center">
        Хамгийн сүүлийн үеийн шинэ бүтээгдэхүүнүүд
      </p>

      <div className="position-relative">
        <Swiper className="swiper-container js-swiper-slider" {...swiperOptions}>
                        {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCardNew product={product} showNewBadge={true} />
                </SwiperSlide>
              ))}
        </Swiper>

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
