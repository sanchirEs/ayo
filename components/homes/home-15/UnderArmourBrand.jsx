"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/common/ProductCard";
import api from "@/lib/api";

export default function UnderArmourBrand() {
  const [data, setData] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get featured products for Under Armour brand
    api.homepage
      .cached({ sections: 'featured', limit: 20, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        // Extract featured products from homepage response
        const featuredProducts = res.data?.featured || [];
        setData({ products: featuredProducts, pagination: null });
        // console.log("under armour products: ", featuredProducts)
      })
      .catch((e) => setErr(e.message || "Failed to load under armour products"))
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
        nextEl: ".under-armour-carousel__next",
        prevEl: ".under-armour-carousel__prev",
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
        <section className="under-armour-brand-section">
          <div className="under-armour-bg-pattern"></div>
          <div className="under-armour-bg-overlay"></div>
          <div className="container">
            <div className="under-armour-brand-logo">
              <h2 className="under-armour-logo-text">UNDER ARMOUR</h2>
            </div>
            <p className="text-center">Loading products…</p>
          </div>
        </section>
    );
  }

  if (err) {
    return (
        <section className="under-armour-brand-section">
          <div className="under-armour-bg-pattern"></div>
          <div className="under-armour-bg-overlay"></div>
          <div className="container">
            <div className="under-armour-brand-logo">
              <h2 className="under-armour-logo-text">UNDER ARMOUR</h2>
            </div>
            <p className="text-danger text-center">{err}</p>
          </div>
        </section>
    );
  }

      return (
      <section className="under-armour-brand-section">
        {/* Desktop: Hero-style banner with background image */}
        <div className="d-none d-lg-block">
          <div className="overflow-hidden position-relative h-100">
            <div className="slideshow-bg ">
              <Image
                loading="lazy"
                src="/assets/images/brands/brand5.png"
                width="1920"
                height="600"
                alt="Under Armour Background"
                className="slideshow-bg__img object-fit-cover"
              />
            </div>
            <div className="slideshow-text container position-absolute start-100 top-50 translate-middle">
              {/* <div className="under-armour-brand-logo">
                <h2 className="under-armour-logo-text">UNDER ARMOUR</h2>
              </div> */}
            
          
          
                       {/* View All Button */}
             {/* <div className="under-armour-view-all">
               <Link href="/shop-4" className="btn">
                 Бүгдийг үзэх
               </Link>
             </div> */}
           </div>
         </div>
       </div>
           
       {/* Mobile: Show only banner with clickable area */}
       <div className="d-lg-none">
         <Link href="/shop" className="under-armour-mobile-banner">
           <div className="under-armour-mobile-bg">
             <img
               src="/assets/images/brands/brand5.png"
               alt="Under Armour"
               className="under-armour-mobile-img"
               style={{ width: '100%', height: 'auto' }}
             />
           </div>
         </Link>
                </div>
       </section>
  );
}
