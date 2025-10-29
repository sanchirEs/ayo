"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/common/ProductCard";
import api from "@/lib/api";

export default function AsicsBrand() {
  const [data, setData] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get featured products for Asics brand
    api.homepage
      .cached({ sections: 'featured', limit: 20, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        // Extract featured products from homepage response
        const featuredProducts = res.data?.featured || [];
        setData({ products: featuredProducts, pagination: null });
        // console.log("asics products: ", featuredProducts)
      })
      .catch((e) => setErr(e.message || "Failed to load asics products"))
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
        nextEl: ".asics-carousel__next",
        prevEl: ".asics-carousel__prev",
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
        <section className="asics-brand-section">
          <div className="asics-bg-pattern"></div>
          <div className="asics-bg-overlay"></div>
          <div className="container">
            <div className="asics-brand-logo">
              <h2 className="asics-logo-text">ASICS</h2>
            </div>
            <p className="text-center">Loading products…</p>
          </div>
        </section>
    );
  }

  if (err) {
    return (
        <section className="asics-brand-section">
          <div className="asics-bg-pattern"></div>
          <div className="asics-bg-overlay"></div>
          <div className="container">
            <div className="asics-brand-logo">
              <h2 className="asics-logo-text">ASICS</h2>
            </div>
            <p className="text-danger text-center">{err}</p>
          </div>
        </section>
    );
  }

      return (
      <section className="asics-brand-section">
        {/* Desktop: Hero-style banner with background image */}
        <div className="d-none d-lg-block">
          <div className="overflow-hidden position-relative h-100">
            <div className="slideshow-bg ">
              <Image
                loading="lazy"
                src="/assets/images/brands/brand7.png"
                width="1920"
                height="600"
                alt="Asics Background"
                className="slideshow-bg__img object-fit-cover"
              />
            </div>
            <div className="slideshow-text container position-absolute start-100 top-50 translate-middle">
              {/* <div className="asics-brand-logo">
                <h2 className="asics-logo-text">ASICS</h2>
              </div> */}
            
          
          
                       {/* View All Button */}
             {/* <div className="asics-view-all">
               <Link href="/shop-4" className="btn">
                 Бүгдийг үзэх
               </Link>
             </div> */}
           </div>
         </div>
       </div>
           
       {/* Mobile: Show only banner with clickable area */}
       <div className="d-lg-none">
         <Link href="/shop" className="asics-mobile-banner">
           <div className="asics-mobile-bg">
             <img
               src="/assets/images/brands/brand7.png"
               alt="Asics"
               className="asics-mobile-img"
               style={{ width: '100%', height: 'auto' }}
             />
           </div>
         </Link>
                </div>
       </section>
  );
}
