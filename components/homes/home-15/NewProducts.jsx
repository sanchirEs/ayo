"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import Star from "@/components/common/Star";
import { useContextElement } from "@/context/Context";
import api from "@/lib/api";

export default function Featured() {
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  const [data, setData] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    // Use homepageService to get new arrivals
    api.homepage
      .bundled({ sections: 'new', limit: 20, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        // Extract newArrivals from homepage response
        const newArrivals = res.data?.newArrivals || [];
        setData({ products: newArrivals, pagination: null });
        console.log("new arrivals: ", newArrivals)
      })
      .catch((e) => setErr(e.message || "Failed to load new products"))
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
        nextEl: ".products-carousel__next",
        prevEl: ".products-carousel__prev",
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
      <section className="products-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Шинээр нэмэгдсэн бүтээгдэхүүнүүд
        </h2>
        <p className="text-center">Loading products…</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="products-carousel container">
        <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
          Шинээр нэмэгдсэн бүтээгдэхүүнүүд
        </h2>
        <p className="text-danger text-center">{err}</p>
      </section>
    );
  }

  return (
    <section className="products-carousel container">
      <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
        Шинээр нэмэгдсэн бүтээгдэхүүнүүд
      </h2>
      <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center">
        The World's Premium Brands In One Destination.
      </p>

      <div className="position-relative">
        <Swiper className="swiper-container js-swiper-slider" {...swiperOptions}>
          {products.map((p) => {
            // Handle different image formats from API
            const img = p.ProductImages?.[0]?.imageUrl || p.images?.[0]?.url || "/images/placeholder-330x400.png";
            const price = p.variants?.[0]?.price || p.price || 0;
            const finalPrice = typeof price === "number" ? price : Number(price);

            return (
              <SwiperSlide key={p.id} className="">
                <div className="pc__img-wrapper">
                  <Link href={`/product1_simple/${p.id}`}>
                    <Image
                      loading="lazy"
                      src={img}
                      width={330}
                      height={400}
                      alt={p.name || "Product"}
                      className="pc__img"
                    />
                  </Link>

                  <button
                    className="pc__atc btn btn-primary btn-lg anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside left-0 w-100 bottom-0 btn-50 text-white d-flex align-items-center justify-content-center gap-2"
                    onClick={() => addProductToCart(p.id)}
                    title={isAddedToCartProducts(p.id) ? "Already Added" : "Add to Cart"}
                  >
                    <svg className="d-block me-1" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <use href={isAddedToCartProducts(p.id) ? "#icon_cart_added" : "#icon_cart"}></use>
                    </svg>
                    <span>{isAddedToCartProducts(p.id) ? "Already Added" : "Add To Cart"}</span>
                  </button>

                  <div className="anim_appear-right position-absolute top-0 mt-3 me-3">
                    <button
                      className={`btn btn-square btn-hover-primary d-block border-1 text-uppercase mb-2 js-add-wishlist ${
                        isAddedtoWishlist(p.id) ? "active" : ""
                      }`}
                      onClick={() => toggleWishlist(p.id)}
                      title="Add To Wishlist"
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <use href="#icon_heart"></use>
                      </svg>
                    </button>

                    <button
                      className="btn btn-square btn-hover-primary d-block border-1 text-uppercase js-quick-view"
                      data-bs-toggle="modal"
                      data-bs-target="#quickView"
                      onClick={() => setQuickViewItem(p)}
                      title="Quick view"
                    >
                      <svg className="d-inline-block" width="14" height="14" viewBox="0 0 18 18">
                        <use href="#icon_view"></use>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="pc__info position-relative text-center">
                  <p className="pc__category text-secondary">{p.category?.name ?? "—"}</p>
                  <h6 className="pc__title text-uppercase fw-medium mb-2">
                    <Link href={`/product1_simple/${p.id}`}>{p.name}</Link>
                  </h6>
                  <div className="product-card__price d-flex align-items-center justify-content-center mb-2">
                    <span className="money price fw-medium">${finalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="product-card__review d-flex align-items-center justify-content-center">
                    <div className="reviews-group d-flex">
                      <Star stars={p.rating ?? 4} />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

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
      </div>
    </section>
  );
}
