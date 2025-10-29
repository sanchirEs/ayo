"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";

/**
 * Categories Component
 * Displays category images with links to shop pages
 * 
 * ✅ OPTIMIZED: Now accepts categories as props (no API calls)
 * WHY: Parent fetches all data in single API call = faster, no duplicates
 * 
 * NOTE: Category images are still hardcoded as they're local static assets
 * TODO: Backend should eventually return imageUrl for each category
 */
export default function Categories({ categories = [] }) {
  const [isMobile, setIsMobile] = useState(false);

  // Local category images mapping
  // These are static local images that match category/tag names from backend
  const categoryImages = [
    {
      image: '/assets/images/categories/АМПУЛЬ.png',
      name: 'Ампуль',
      type: 'tag'
    },
    {
      image: '/assets/images/categories/БИЕИЙН-ТОС.png',
      name: 'БИЕИЙН ТОС',
      type: 'category'
    },
    {
      image: '/assets/images/categories/БИЕИЙН-ШИНГЭН-САВАН.png',
      name: 'БИЕИЙН ШИНГЭН САВАН',
      type: 'category'
    },
    {
      image: '/assets/images/categories/ГАРЫН-ТОС.png',
      name: 'ГАРЫН ТОС',
      type: 'category'
    },
    {
      image: '/assets/images/categories/МАСК.png',
      name: 'Маск',
      type: 'tag'
    },
    {
      image: '/assets/images/categories/НАРНЫ-ТОС.png',
      name: 'Нарны тос',
      type: 'tag'
    },
    {
      image: '/assets/images/categories/НҮҮРНИЙ-ТОС.png',
      name: 'Нүүрний тос',
      type: 'tag'
    },
    {
      image: '/assets/images/categories/ТОНЕР.png',
      name: 'Тонер',
      type: 'tag'
    },
    {
      image: '/assets/images/categories/УРУУЛЫН-БАЛМ.png',
      name: 'УРУУЛЫН БАЛМ',
      type: 'category'
    },
    {
      image: '/assets/images/categories/ҮНЭРТЭН.png',
      name: 'ҮНЭРТЭН',
      type: 'category'
    },
    {
      image: '/assets/images/categories/ШАМПУНЬ.png',
      name: 'ШАМПУНЬ',
      type: 'category'
    },
    {
      image: '/assets/images/categories/ШҮДНИЙ-ОО.png',
      name: 'ШҮДНИЙ ОО',
      type: 'category'
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 991);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate URL based on type
  const generateUrl = (item) => {
    if (item.type === 'tag') {
      const encodedTag = encodeURIComponent(item.name);
      return `/shop?tags=${encodedTag}`;
    } else {
      // Find matching category from backend data
      const matchingCategory = categories.find(cat => 
        cat.name === item.name || 
        cat.name.toLowerCase() === item.name.toLowerCase()
      );
      
      if (matchingCategory) {
        return `/shop/${matchingCategory.id}`;
      }
      
      return '/shop';
    }
  };

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
        slidesPerView: 6,
        slidesPerGroup: 1,
        spaceBetween: 32,
      },
    },
  };

  return (
    <section 
      className="category-carousel container" 
      style={{ 
        padding: isMobile ? '0' : '0px 80px'
      }}
    >
      <div className="section-header d-flex align-items-center justify-content-center" style={{
        position: 'relative',
        width: '100%',
        marginBottom: '40px'
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

      <div id="category_1" className="position-relative" style={{ padding: '0' }}>
        {/* Mobile Grid Layout */}
        <div className="d-block d-lg-none">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              padding: '0'
            }}
          >
            {categoryImages.map((item, i) => (
              <Link 
                key={`mobile-category-${i}-${item.name}`} 
                href={generateUrl(item)} 
                style={{
                  display: 'block',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <Image
                  src={item.image}
                  width={150}
                  height={150}
                  alt={item.name}
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Swiper Layout */}
        <div className="d-none d-lg-block" style={{ padding: '0 20px' }}>
          <Swiper
            className="swiper-container js-swiper-slider"
            {...swiperOptions}
          >
            {categoryImages.map((item, i) => (
              <SwiperSlide 
                key={`category-${i}-${item.name}`} 
                className="swiper-slide product-card"
              >
                <div className="text-center">
                  <Link
                    href={generateUrl(item)}
                    className="category-link d-block"
                  >
                    <div className="category-image-wrapper mb-3">
                      <Image
                        loading="lazy"
                        src={item.image}
                        width={300}
                        height={300}
                        alt={item.name}
                        className="category-image"
                        style={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                          borderRadius: '12px'
                        }}
                      />
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="cursor-pointer products-carousel__prev position-absolute top-50 d-flex align-items-center justify-content-center">
            <svg width="25" height="25" viewBox="0 0 25 25" style={{ fill: '#495D35', stroke: '#495D35', strokeWidth: '2px', transform: 'scale(1.15)' }}>
              <use href="#icon_prev_md" />
            </svg>
          </div>
          <div className="cursor-pointer products-carousel__next position-absolute top-50 d-flex align-items-center justify-content-center">
            <svg width="25" height="25" viewBox="0 0 25 25" style={{ fill: '#495D35', stroke: '#495D35', strokeWidth: '2px', transform: 'scale(1.15)' }}>
              <use href="#icon_next_md" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
