"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/common/ProductCard";
import api from "@/lib/api";

export default function PumaBrand() {
  const [data, setData] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get featured products for Puma brand
    api.homepage
      .cached({ sections: 'featured', limit: 20, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        // Extract featured products from homepage response
        const featuredProducts = res.data?.featured || [];
        setData({ products: featuredProducts, pagination: null });
        // console.log("puma products: ", featuredProducts)
      })
      .catch((e) => setErr(e.message || "Failed to load puma products"))
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
        nextEl: ".puma-carousel__next",
        prevEl: ".puma-carousel__prev",
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
        <section className="puma-brand-section">
          <div className="puma-bg-pattern"></div>
          <div className="puma-bg-overlay"></div>
          <div className="container">
            <div className="puma-brand-logo">
              <h2 className="puma-logo-text">PUMA</h2>
            </div>
            <p className="text-center">Loading products…</p>
          </div>
        </section>
    );
  }

  if (err) {
    return (
        <section className="puma-brand-section">
          <div className="puma-bg-pattern"></div>
          <div className="puma-bg-overlay"></div>
          <div className="container">
            <div className="puma-brand-logo">
              <h2 className="puma-logo-text">PUMA</h2>
            </div>
            <p className="text-danger text-center">{err}</p>
          </div>
        </section>
    );
  }

      return (
      <section className="puma-brand-section">
        {/* Desktop: Hero-style banner with background image */}
        <div className="d-none d-lg-block">
          <div className="overflow-hidden position-relative h-100">
            <div className="slideshow-bg ">
              <Image
                loading="lazy"
                src="/assets/images/brands/brand3.png"
                width="1920"
                height="600"
                alt="Puma Background"
                className="slideshow-bg__img object-fit-cover"
              />
            </div>
            <div className="slideshow-text container position-absolute start-100 top-50 translate-middle">
              {/* <div className="puma-brand-logo">
                <h2 className="puma-logo-text">PUMA</h2>
              </div> */}
            
          
          
                       {/* View All Button */}
             {/* <div className="puma-view-all">
               <Link href="/shop-4" className="btn">
                 Бүгдийг үзэх
               </Link>
             </div> */}
           </div>
         </div>
       </div>
           
       {/* Mobile: Show only banner with clickable area */}
       <div className="d-lg-none">
         <Link href="/shop" className="puma-mobile-banner">
           <div className="puma-mobile-bg">
             <img
               src="/assets/images/brands/brand3.png"
               alt="Puma"
               className="puma-mobile-img"
               style={{ width: '100%', height: 'auto' }}
             />
           </div>
         </Link>
                </div>
       </section>
  );
}
