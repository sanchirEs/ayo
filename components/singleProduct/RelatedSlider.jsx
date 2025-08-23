"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function RelatedSlider({ currentProduct }) {
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  
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
      console.log("currentProduct", currentProduct);
      if (!currentProduct?.categoryId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("currentProduct.category.id", currentProduct.categoryId);
        const response = await api.products.getAll({
          categoryId: currentProduct.categoryId,
          limit: 8,
          excludeId: currentProduct.id // Exclude current product
        });
        console.log("response related products", response);
        
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
    <section className="products-carousel container">
      <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4">
        Төстэй <strong>бүтээгдэхүүн</strong>
      </h2>

      <div id="related_products" className="position-relative">
        <Swiper
          {...swiperOptions}
          className="swiper-container js-swiper-slider"
          data-settings=""
        >
          {relatedProducts.map((product, i) => {
            // Extract image and price from product data
            const imageUrl = product.ProductImages?.[0]?.imageUrl || product.images?.[0]?.url || '/assets/images/placeholder-330x400.png';
            const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
            const price = defaultVariant ? Number(defaultVariant.price) : Number(product.price || 0);
            const categoryName = product.category?.name || 'Бүтээгдэхүүн';
            
            return (
              <SwiperSlide key={product.id} className="swiper-slide product-card">
                                 <div className="pc__img-wrapper">
                   <Link href={`/product1_simple/${product.id}`}>
                     <Image
                       loading="lazy"
                       src={imageUrl}
                       width={330}
                       height={400}
                       alt={product.name}
                       className="pc__img"
                     />
                   </Link>
                   <button
                     className="pc__atc btn btn-primary btn-lg anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside left-0 w-100 bottom-0 btn-50 text-white d-flex align-items-center justify-content-center gap-2"
                     onClick={() => addProductToCart(product.id)}
                     title={
                       isAddedToCartProducts(product.id)
                         ? "Сагсанд нэмэгдсэн"
                         : "Сагсанд нэмэх"
                     }
                   >
                     <svg className="d-block me-1" width="20" height="20" viewBox="0 0 20 20" fill="none">
                       <use href={isAddedToCartProducts(product.id) ? "#icon_cart_added" : "#icon_cart"}></use>
                     </svg>
                     <span>{isAddedToCartProducts(product.id)
                       ? "Сагсанд нэмэгдсэн"
                       : "Сагсанд нэмэх"}</span>
                   </button>

                   <div className="anim_appear-right position-absolute top-0 mt-3 me-3">
                     <button
                       className={`btn btn-square btn-hover-primary d-block border-1 text-uppercase mb-2 js-add-wishlist ${
                         isAddedtoWishlist(product.id) ? "active" : ""
                       }`}
                       onClick={() => toggleWishlist(product.id)}
                       title="Хүслийн жагсаалтад нэмэх"
                     >
                       <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                         <use href="#icon_heart"></use>
                       </svg>
                     </button>

                    
                   </div>
                 </div>

                <div className="pc__info position-relative text-center">
                  <p className="pc__category text-secondary">{categoryName}</p>
                  <h6 className="pc__title text-uppercase fw-medium mb-2">
                    <Link href={`/product1_simple/${product.id}`}>{product.name}</Link>
                  </h6>
                  <div className="product-card__price d-flex align-items-center justify-content-center mb-2">
                    <span className="money price fw-medium">₮{price.toLocaleString()}</span>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}

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
