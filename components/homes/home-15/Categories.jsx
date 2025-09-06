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

  // List of all available category images from the folder
  const categoryImages = [
    '/assets/images/categories/АМПУЛЬ.png',
    '/assets/images/categories/БИЕИЙН ТОС.png',
    '/assets/images/categories/БИЕИЙН ШИНГЭН САВАН.png',
    '/assets/images/categories/ГАРЫН ТОС.png',
    '/assets/images/categories/МАСК.png',
    '/assets/images/categories/НАРНЫ ТОС.png',
    '/assets/images/categories/НҮҮРНИЙ ТОС.png',
    '/assets/images/categories/ТОНЕР.png',
    '/assets/images/categories/УРУУЛЫН БАЛМ.png',
    '/assets/images/categories/ҮНЭРТЭН.png',
    '/assets/images/categories/ШАМПУНЬ.png',
    '/assets/images/categories/ШҮДНИЙ ОО.png'
  ];

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
      delay: 4000,
      disableOnInteraction: false,
    },
    slidesPerView: 8,
    slidesPerGroup: 1,
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
        slidesPerGroup: 1,
        spaceBetween: 16,
      },
      480: {
        slidesPerView: 3,
        slidesPerGroup: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 4,
        slidesPerGroup: 1,
        spaceBetween: 24,
      },
      992: {
        slidesPerView: 5,
        slidesPerGroup: 1,
        spaceBetween: 28,
      },
      1200: {
        slidesPerView: 7,
        slidesPerGroup: 1,
        spaceBetween: 32,
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
    <section className="category-carousel container" style={{ padding: '0px 80px' }}>

{/* <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
        Онцлох ангиллууд
      </h2>
      <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center">
        Бүх захиалгыг нэг дороос
      </p> */}
      <div className="section-header d-flex align-items-center justify-content-center" style={{
        position: 'relative',
        width: '100%',
        marginBottom: '30px'
      }}>
        <div className="title-line" style={{
          flex: 1,
          height: '2px',
          backgroundColor: '#DCDCDC',
          maxWidth: '150px'
        }}></div>
        <h2 className="section-title text-uppercase fs-25 fw-medium mb-0" style={{
          color: '#333',
          letterSpacing: '1px',
          margin: '0 30px',
          whiteSpace: 'nowrap'
        }}>
          АНГИЛЛААР ДЭЛГҮҮР ХЭСЭХ
        </h2>
        
        <div className="title-line" style={{
          flex: 1,
          height: '2px',
          backgroundColor: '#DCDCDC',
          maxWidth: '150px'
        }}></div>
        
      </div>

      <div id="category_1" className="position-relative" style={{ padding: '0 20px' }}>
        <Swiper
          className="swiper-container js-swiper-slider"
          {...swiperOptions}
        >
          {categories.map((category, i) => {
            // Get category image by index (cycling through available images)
            const categoryImage = categoryImages[i % categoryImages.length];

            return (
              <SwiperSlide key={category.id || i} className="swiper-slide product-card">
                 <div className="text-center">
                
                  <Link
                    href={`/shop/${category.id}`}
                    className="category-link d-block"
                  >
                    <div className="category-image-wrapper mb-3 ">
                      {/* <div className="category-image-container"> */}
                        <Image
                          loading="lazy"
                          src={categoryImage}
                          width={300}
                          height={300}
                          alt={category.name}
                          className="category-image"
                          style={{ 
                            objectFit: 'cover',
                            transition: 'all 0.3s ease',
                            // borderRadius: '12px',
                            // boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            // width: '100%',
                            // height: 'auto'
                          }}
                        />
                      {/* </div> */}
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            );
          })}

          {/* <!-- /.swiper-wrapper --> */}
        </Swiper>
        {/* <!-- /.swiper-container js-swiper-slider --> */}

        <div className="cursor-pointer products-carousel__prev position-absolute top-50 d-flex align-items-center justify-content-center" >
          <svg width="25" height="25" viewBox="0 0 25 25" style={{ fill: '#495D35', stroke: '#495D35', strokeWidth: '2px', transform: 'scale(1.15)' }}>
            <use href="#icon_prev_md" />
          </svg>
        </div>
        <div className="cursor-pointer products-carousel__next position-absolute top-50 d-flex align-items-center justify-content-center" >
          <svg width="25" height="25" viewBox="0 0 25 25" style={{ fill: '#495D35', stroke: '#495D35', strokeWidth: '2px', transform: 'scale(1.15)' }}>
            <use href="#icon_next_md" />
          </svg>
        </div>
      
       
     
        {/* <!-- /.category-carousel__next --> */}
      </div>
      {/* <!-- /.position-relative --> */}
    </section>
  );
}
