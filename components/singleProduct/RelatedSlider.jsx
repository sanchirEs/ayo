"use client";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import api from "@/lib/api";

export default function RelatedSlider({ currentProduct }) {
  
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swiperOptions = {
    autoplay: false,
    slidesPerView: 4,
    slidesPerGroup: 4,
    effect: "none",
    loop: true,
    modules: [Pagination, Navigation],
    pagination: {
      el: "#related_products .products-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: ".ssn11",
      prevEl: ".ssp11",
    },
    breakpoints: {
      320: {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 14,
      },
      768: {
        slidesPerView: 4,
        slidesPerGroup: 3,
        spaceBetween: 24,
      },
      992: {
        slidesPerView: 5,
        slidesPerGroup: 4,
        spaceBetween: 30,
      },
    },
  };

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      // console.log("currentProduct", currentProduct);
      if (!currentProduct?.categoryId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // console.log("currentProduct.category.id", currentProduct.categoryId);
        // Try to get products by category, fallback to alternative endpoints if enhanced fails
        let response;
        try {
          response = await api.products.enhanced({
            categoryId: currentProduct.categoryId,
            limit: 8
          });
        } catch (error) {
          // console.warn('Enhanced endpoint failed, trying alternative approach:', error);
          try {
            // Try to get all products and filter by category on frontend
            const allProducts = await api.products.new({ limit: 20 });
            if (allProducts?.data?.products) {
              // Filter products by category and exclude current product
              const filteredProducts = allProducts.data.products
                .filter(p => p.categoryId === currentProduct.categoryId && p.id !== currentProduct.id)
                .slice(0, 8);
              response = { data: { products: filteredProducts } };
            } else {
              response = { data: { products: [] } };
            }
          } catch (fallbackError) {
            // console.warn('Fallback also failed:', fallbackError);
            response = { data: { products: [] } };
          }
        }
        // console.log("response related products", response);
        
        // Filter out current product and get products array
        const products = Array.isArray(response?.data?.products) ? response.data.products : 
                        Array.isArray(response?.products) ? response.products : 
                        Array.isArray(response) ? response : [];
        
        const filteredProducts = products.filter(p => p.id !== currentProduct.id);
        setRelatedProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError(err.message || 'Төстэй бүтээгдэхүүн ачааллахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProduct?.categoryId, currentProduct?.id]);

  // Don't render if no related products
  if (loading) {
    return (
      <section className="products-carousel container">
        <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4">
          Төстэй <strong>бүтээгдэхүүн</strong>
        </h2>
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Уншиж байна...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="products-carousel container">
        <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4">
          Төстэй <strong>бүтээгдэхүүн</strong>
        </h2>
        <div className="alert alert-warning text-center">
          {error}
        </div>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show section if no related products
  }

  return (
    <section className="products-carousel container" style={{ position: 'relative', zIndex: 1 }}>
      <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4">
        Төстэй <strong>бүтээгдэхүүн</strong>
      </h2>

      <div id="related_products" className="position-relative">
        <Swiper
          {...swiperOptions}
          className="swiper-container js-swiper-slider"
          data-settings=""
        >
          {relatedProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}

          {/* <!-- /.swiper-wrapper --> */}
        </Swiper>
        {/* <!-- /.swiper-container js-swiper-slider --> */}

        <div className="cursor-pointer products-carousel__prev ssp11 position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_prev_md" />
          </svg>
        </div>
        {/* <!-- /.products-carousel__prev --> */}
        <div className="cursor-pointer products-carousel__next ssn11 position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_next_md" />
          </svg>
        </div>
        {/* <!-- /.products-carousel__next --> */}

        <div className="products-pagination mt-4 mb-5 d-flex align-items-center justify-content-center"></div>
        {/* <!-- /.products-pagination --> */}
      </div>
      {/* <!-- /.position-relative --> */}
    </section>
  );
}
