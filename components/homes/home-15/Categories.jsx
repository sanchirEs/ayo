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

  // List of all available category images from the folder
  const categoryImages = [
    '/assets/images/categories/АМПУЛЬ.png',
    '/assets/images/categories/БИЕИЙН-ТОС.png',
    '/assets/images/categories/БИЕИЙН-ШИНГЭН-САВАН.png',
    '/assets/images/categories/ГАРЫН-ТОС.png',
    '/assets/images/categories/МАСК.png',
    '/assets/images/categories/НАРНЫ-ТОС.png',
    '/assets/images/categories/НҮҮРНИЙ-ТОС.png',
    '/assets/images/categories/ТОНЕР.png',
    '/assets/images/categories/УРУУЛЫН-БАЛМ.png',
    '/assets/images/categories/ҮНЭРТЭН.png',
    '/assets/images/categories/ШАМПУНЬ.png',
    '/assets/images/categories/ШҮДНИЙ-ОО.png'
  ];

  // Function to get category name from image path
  const getCategoryNameFromImage = (imagePath) => {
    const fileName = imagePath.split('/').pop(); // Get filename
    const nameWithoutExtension = fileName.replace('.png', ''); // Remove .png
    return nameWithoutExtension;
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
    
    // Try multiple API endpoints to get all categories
    const loadCategories = async () => {
      try {
        // Try categories.getAll() with all=true parameter
        // console.log("Trying categories.getAll() with all=true...");
        const allCategoriesRes = await api.fetch('/categories?all=true', { auth: false });
        // console.log("categories.getAll() response: ", allCategoriesRes);
        
        if (allCategoriesRes.data && allCategoriesRes.data.length > 0) {
          setCategories(allCategoriesRes.data);
          // console.log("Loaded categories from getAll(): ", allCategoriesRes.data.length, "items");
          return;
        }
      } catch (e) {
        // console.log("categories.getAll() failed: ", e.message);
      }

      try {
        // Try categories.getTree() for hierarchical data
        // console.log("Trying categories.getTree()...");
        const treeRes = await api.categories.getTree();
        // console.log("categories.getTree() response: ", treeRes);
        
        if (treeRes.data && treeRes.data.length > 0) {
          // Flatten the tree to get all categories
          const flattenCategories = (categories) => {
            let result = [];
            categories.forEach(cat => {
              result.push(cat);
              if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children));
              }
            });
            return result;
          };
          
          const flattened = flattenCategories(treeRes.data);
          setCategories(flattened);
          // console.log("Loaded categories from getTree(): ", flattened.length, "items");
          return;
        }
      } catch (e) {
        // console.log("categories.getTree() failed: ", e.message);
      }

      try {
        // Try homepage API as fallback
        // console.log("Trying homepage API...");
        const homepageRes = await api.homepage.bundled({ 
          sections: 'categories', 
          categoryLimit: 1000 
        });
        // console.log("Homepage API response: ", homepageRes);
        
        if (homepageRes.data?.categories && homepageRes.data.categories.length > 0) {
          setCategories(homepageRes.data.categories);
          // console.log("Loaded categories from homepage: ", homepageRes.data.categories.length, "items");
          return;
        }
      } catch (e) {
        // console.log("Homepage API failed: ", e.message);
      }

      // If all APIs fail, set error
      setErr("Failed to load categories from all endpoints");
    };

    loadCategories().finally(() => {
      if (mounted) setLoading(false);
    });
      
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
            {categoryImages.map((imagePath, i) => {
              // Get category name from image filename
              const imageCategoryName = getCategoryNameFromImage(imagePath);
              // Find matching category from backend
              const matchingCategory = findMatchingCategory(imageCategoryName, categories);
              
              // If no matching category found, use default category with id 1
              const displayCategory = matchingCategory || { id: 1, name: imageCategoryName };

              return (
                <Link 
                  key={`mobile-category-${i}-${imageCategoryName}`} 
                  href={`/shop/${displayCategory.id}`} 
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <Image
                    src={imagePath}
                    width={150}
                    height={150}
                    alt={displayCategory.name}
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
                    {displayCategory.name}
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
          {categoryImages.map((imagePath, i) => {
            // Get category name from image filename
            const imageCategoryName = getCategoryNameFromImage(imagePath);
            // Find matching category from backend
            const matchingCategory = findMatchingCategory(imageCategoryName, categories);
            
            // Debug logging
            if (!matchingCategory) {
              // console.log(`No matching category found for image: ${imageCategoryName}`);
              // console.log('Available categories:', categories.map(c => c.name));
            }
            
            // If no matching category found, use default category with id 1
            const displayCategory = matchingCategory || { id: 1, name: imageCategoryName };

            return (
              <SwiperSlide 
                key={`category-${i}-${imageCategoryName}`} 
                className="swiper-slide product-card"
             
              >
                 <div className="text-center">
                
                  <Link
                    href={`/shop/${displayCategory.id}`}
                    className="category-link d-block "
                   
                  >
                    <div className="category-image-wrapper mb-3 ">
                   
                    
                      <Image
                        loading="lazy"
                        src={imagePath}
                        width={300}
                        height={300}
                        alt={displayCategory.name}
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
                      {matchingCategory.name}
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
