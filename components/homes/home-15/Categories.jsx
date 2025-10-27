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
  const [isMobile, setIsMobile] = useState(false);

  // List of all available category images with their types (category or tag)
  // Tags match exactly what's in the database/filter sidebar
  const categoryImages = [
    {
      image: '/assets/images/categories/АМПУЛЬ.png',
      name: 'Ампуль', // Exact name from your filter
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
      name: 'Маск', // Exact name from your filter
      type: 'tag'
    },
    {
      image: '/assets/images/categories/НАРНЫ-ТОС.png',
      name: 'Нарны тос', // Exact name from your filter
      type: 'tag'
    },
    {
      image: '/assets/images/categories/НҮҮРНИЙ-ТОС.png',
      name: 'Нүүрний тос', // Exact name from your filter
      type: 'tag'
    },
    {
      image: '/assets/images/categories/ТОНЕР.png',
      name: 'Тонер', // Exact name from your filter
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

  // Function to generate the correct URL based on type
  const generateUrl = (item) => {
    if (item.type === 'tag') {
      // For tags, use /shop?tags= with proper URL encoding
      const encodedTag = encodeURIComponent(item.name);
      return `/shop?tags=${encodedTag}`;
    } else {
      // For categories, find matching category from backend
      const matchingCategory = findMatchingCategory(item.name, categories);
      if (matchingCategory) {
        return `/shop/${matchingCategory.id}`;
      }
      // Fallback to shop page without filters
      return '/shop';
    }
  };

  // Function to find matching category from backend based on image name
  const findMatchingCategory = (imageName, backendCategories) => {
    return backendCategories.find(category => 
      category.name === imageName || 
      category.name.toLowerCase() === imageName.toLowerCase()
    );
  };

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 991);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Optimized category loading - only fetch if we have category-type items
    const loadCategories = async () => {
      // Check if we have any category-type items
      const hasCategories = categoryImages.some(item => item.type === 'category');
      
      if (!hasCategories) {
        // No need to fetch categories if all items are tags
        if (mounted) setLoading(false);
        return;
      }

      try {
        // Single API call to get all categories
        const allCategoriesRes = await api.fetch('/categories?all=true', { auth: false });
        
        if (mounted && allCategoriesRes.data && allCategoriesRes.data.length > 0) {
          setCategories(allCategoriesRes.data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to load categories:", e.message);
      }

      // If API fails, still set loading to false
      if (mounted) {
        setLoading(false);
        setErr("Failed to load categories");
      }
    };

    loadCategories();
      
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
        slidesPerView: 6,
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
    <section 
      className="category-carousel container" 
      style={{ 
        padding: isMobile ? '0' : '0px 80px'
      }}
    >

{/* <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
        Онцлох ангиллууд
      </h2>
      <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center">
        Бүх захиалгыг нэг дороос
      </p> */}
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
            {categoryImages.map((item, i) => {
              return (
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
                      // boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  {/* <div style={{
                    marginTop: '4px',
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#333',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>
                    {item.name}
                  </div> */}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Swiper Layout */}
        <div className="d-none d-lg-block" style={{ padding: '0 20px' }}>
          <Swiper
            className="swiper-container js-swiper-slider"
          
            {...swiperOptions}
          >
          {categoryImages.map((item, i) => {
            return (
              <SwiperSlide 
                key={`category-${i}-${item.name}`} 
                className="swiper-slide product-card"
             
              >
                 <div className="text-center">
                
                  <Link
                    href={generateUrl(item)}
                    className="category-link d-block "
                   
                  >
                    <div className="category-image-wrapper mb-3 ">
                   
                    
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
                      
                 
                    {/* <div 
                      className="category-name text-center"
                      style={{
                        marginTop: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#333',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        width: '100%'
                      }}
                    >
                      {item.name}
                    </div> */}
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
        </div>
      
       
     
        {/* <!-- /.category-carousel__next --> */}
      </div>
      {/* <!-- /.position-relative --> */}
    </section>
  );
}
