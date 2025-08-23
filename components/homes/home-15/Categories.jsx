"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import api from "@/lib/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get categories
    api.homepage
      .bundled({ sections: 'categories', categoryLimit: 8 })
      .then((res) => {
        if (!mounted) return;
        // Extract categories from homepage response
        const categoryData = res.data?.categories || [];
        console.log("ontsloh angillaluud: ", res.data)
        setCategories(categoryData);
        console.log("categories: ", categoryData)
      })
      .catch((e) => setErr(e.message || "Failed to load categories"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const swiperOptions = {
    autoplay: {
      delay: 5000,
    },
    slidesPerView: 4,
    slidesPerGroup: 4,
    effect: "none",
    loop: true,
    pagination: false,
    modules: [Navigation, Autoplay],
    navigation: {
      nextEl: "#category_1 .category-carousel__next",
      prevEl: "#category_1 .category-carousel__prev",
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
        spaceBetween: 20,
        pagination: false,
      },
    },
  };

  if (loading) {
    return (
      <section className="category-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Онцлох ангиллууд
        </h2>
        <p className="text-center">Loading categories…</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="category-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Онцлох ангиллууд
        </h2>
        <p className="text-danger text-center">{err}</p>
      </section>
    );
  }

  return (
    <section className="category-carousel container">

      <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
        Онцлох ангиллууд
      </h2>
      <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center">
        The World's Premium Brands In One Destination.
      </p>

      <div id="category_1" className="position-relative">
        <Swiper
          className="swiper-container js-swiper-slider"
          {...swiperOptions}
        >
          {categories.map((category, i) => {
            // Map category names to image names
            const getCategoryImage = (categoryName) => {
              const name = categoryName?.toLowerCase() || '';
              if (name.includes('арьс') || name.includes('skincare')) return '/assets/images/categories/skincare.png';
              if (name.includes('бие') || name.includes('bodycare')) return '/assets/images/categories/bodycare.png';
              if (name.includes('нүүр') || name.includes('makeup')) return '/assets/images/categories/makeup.png';
              if (name.includes('үс') || name.includes('haircare')) return '/assets/images/categories/haircare.png';
              if (name.includes('хувцас') || name.includes('clothing')) return '/assets/images/categories/clothes.png';
              if (name.includes('хүүхэд') || name.includes('kids')) return '/assets/images/categories/kids.png';
              if (name.includes('эмэгтэй') || name.includes('women')) return '/assets/images/categories/women.png';
              return '/assets/images/categories/default.png';
            };

            const categoryImage = getCategoryImage(category.name);

            return (
              <SwiperSlide key={category.id || i} className="swiper-slide product-card">
                <div className="text-center">
                  <Link
                    href={`/shop-1?category=${category.id}`}
                    className="category-link d-block"
                  >
                    <div className="category-image-wrapper mb-3">
                      <Image
                        loading="lazy"
                        src={categoryImage}
                        width={200}
                        height={200}
                        alt={category.name}
                        className="category-image rounded"
                        style={{ 
                          objectFit: 'cover',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                    <h6 className="fw-medium text-uppercase mb-1">
                      {category.name}
                    </h6>
                  </Link>
                  {category.description && (
                    <p className="text-muted small">{category.description}</p>
                  )}
                </div>
              </SwiperSlide>
            );
          })}

          {/* <!-- /.swiper-wrapper --> */}
        </Swiper>
        {/* <!-- /.swiper-container js-swiper-slider --> */}

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
     
        {/* <!-- /.category-carousel__next --> */}
      </div>
      {/* <!-- /.position-relative --> */}
    </section>
  );
}
