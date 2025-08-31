"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/common/ProductCard";
import api from "@/lib/api";

export default function NewBalanceBrand() {
  const [data, setData] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get featured products for New Balance brand
    api.homepage
      .bundled({ sections: 'featured', limit: 20, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        // Extract featured products from homepage response
        const featuredProducts = res.data?.featured || [];
        setData({ products: featuredProducts, pagination: null });
        console.log("new balance products: ", featuredProducts)
      })
      .catch((e) => setErr(e.message || "Failed to load new balance products"))
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
        nextEl: ".new-balance-carousel__next",
        prevEl: ".new-balance-carousel__prev",
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
        <section className="new-balance-brand-section">
          <div className="new-balance-bg-pattern"></div>
          <div className="new-balance-bg-overlay"></div>
          <div className="container">
            <div className="new-balance-brand-logo">
              <h2 className="new-balance-logo-text">NEW BALANCE</h2>
            </div>
            <p className="text-center">Loading products…</p>
          </div>
        </section>
    );
  }

  if (err) {
    return (
        <section className="new-balance-brand-section">
          <div className="new-balance-bg-pattern"></div>
          <div className="new-balance-bg-overlay"></div>
          <div className="container">
            <div className="new-balance-brand-logo">
              <h2 className="new-balance-logo-text">NEW BALANCE</h2>
            </div>
            <p className="text-danger text-center">{err}</p>
          </div>
        </section>
    );
  }

      return (
      <section className="new-balance-brand-section">
        {/* Desktop: Hero-style banner with background image */}
        <div className="d-none d-lg-block">
          <div className="overflow-hidden position-relative h-100">
            <div className="slideshow-bg ">
              <Image
                loading="lazy"
                src="/assets/images/brands/brand6.png"
                width="1920"
                height="600"
                alt="New Balance Background"
                className="slideshow-bg__img object-fit-cover"
              />
            </div>
            <div className="slideshow-text container position-absolute start-100 top-50 translate-middle">
              {/* <div className="new-balance-brand-logo">
                <h2 className="new-balance-logo-text">NEW BALANCE</h2>
              </div> */}
            
          
          
                       {/* View All Button */}
             {/* <div className="new-balance-view-all">
               <Link href="/shop-4" className="btn">
                 Бүгдийг үзэх
               </Link>
             </div> */}
           </div>
         </div>
       </div>
           
       {/* Mobile: Show only banner with clickable area */}
       <div className="d-lg-none">
         <Link href="/shop" className="new-balance-mobile-banner">
           <div className="new-balance-mobile-bg">
             <img
               src="/assets/images/brands/brand6.png"
               alt="New Balance"
               className="new-balance-mobile-img"
               style={{ width: '100%', height: 'auto' }}
             />
           </div>
         </Link>
                </div>
       </section>
  );
}
