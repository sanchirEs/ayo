"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import { useContextElement } from "@/context/Context";
import { openModalShopFilter } from "@/utlis/aside";
import { sortingOptions } from "@/data/products/productCategories";
import FilterAll from "./filter/FilterAll";
import BreadCumb from "./BreadCumb";
import Star from "../common/Star";
import ColorSelection from "../common/ColorSelection";
import api from "@/lib/api";
import Pagination2 from "../common/Pagination2";

// Grid-ийн боломжит баганын тоо
const itemPerRow = [2, 3, 4];

// Frontend sort → backend params map
function mapSortToParams(value) {
  switch (value) {
    case "price-asc":
      return { sortField: "price", sortOrder: "asc" };
    case "price-desc":
      return { sortField: "price", sortOrder: "desc" };
    case "rating-desc":
      return { sortField: "rating", sortOrder: "desc" };
    case "newest":
    default:
      return { sortField: "createdAt", sortOrder: "desc" };
  }
}

/**
 * props:
 * - categoryId? : number (байхгүй бол бүх бүтээгдэхүүн)
 * - initialPage?: number
 * - initialLimit?: number
 * - initialSort?: "newest" | "price-asc" | "price-desc" | "rating-desc"
 */
export default function Shop4({
  categoryId = null,
  initialPage = 1,
  initialLimit = 12,
  initialSort = "newest",
}) {
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  const [selectedColView, setSelectedColView] = useState(4);

  // ---- products state ----
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: initialPage,
    limit: initialLimit,
  });
  const [sort, setSort] = useState(initialSort);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---- load products from backend ----
  async function loadProducts({ page = initialPage, limit = initialLimit, sortValue = sort } = {}) {
    setLoading(true);
    setErr("");
    try {
      const { sortField, sortOrder } = mapSortToParams(sortValue);
      const params = { page, limit, sortField, sortOrder };

      const res = categoryId
        ? await api.products.getByCategory(categoryId, params)
        : await api.products.getAll(params);

      const payload = res?.data ?? res; // {success, data, pagination} эсвэл шууд массив
      const list =
        Array.isArray(payload?.data) ? payload.data :
        Array.isArray(payload?.products) ? payload.products :
        Array.isArray(payload) ? payload : [];

      const pg = payload?.pagination || res?.pagination || {
        total: list.length,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
        currentPage: page,
        limit,
      };

      setProducts(list);
      setPagination(pg);
    } catch (e) {
      setErr(e?.message || "Бүтээгдэхүүн ачаалахад алдаа гарлаа.");
      setProducts([]);
      setPagination((p) => ({ ...p, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }

  

  // эхний ачаалт + dependency өөрчлөгдөхөд дахин ачаал
  useEffect(() => {
    loadProducts({ page: 1, limit: initialLimit, sortValue: initialSort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // sort өөрчлөгдөхөд 1-р хуудаснаас эхлүүлэн дахин ачаал
  useEffect(() => {
    loadProducts({ page: 1, limit: pagination.limit, sortValue: sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // ---- pagination handler ----
  const canPrev = pagination.currentPage > 1;
  const canNext = pagination.currentPage < pagination.totalPages;

 const goPage = (p) => {
  if (p < 1 || p > pagination.totalPages) return;
  loadProducts({ page: p, limit: pagination.limit, sortValue: sort });
};

  // ---- helpers to read fields safely ----
  function getTitle(p) {
    return p.title || p.name || `Product #${p.id}`;
  }
  function getPrice(p) {
    return typeof p.price === "number" ? p.price : p.salePrice ?? p.finalPrice ?? 0;
  }
  function getOldPrice(p) {
    return p.priceOld ?? p.compareAtPrice ?? null;
  }
  function getImage(p) {
    return (
      p.images?.[0]?.url ||
      p.image ||
      p.thumbnail ||
      "/assets/images/products/p1.jpg"
    );
  }

  return (
    <section className="shop-main container d-flex pt-4 pt-xl-5">
      {/* SIDEBAR */}
      <div className="shop-sidebar side-sticky bg-body">
        <div onClick={openModalShopFilter} className="aside-header d-flex d-lg-none align-items-center">
          <h3 className="text-uppercase fs-6 mb-0">Filter By</h3>
          <button className="btn-close-lg js-close-aside btn-close-aside ms-auto" />
        </div>
        <div className="pt-4 pt-lg-0" />
        <FilterAll />
      </div>

      {/* LIST */}
      <div className="shop-list flex-grow-1">
        <div className="d-flex justify-content-between mb-4 pb-md-2">
          <div className="breadcrumb mb-0 d-none d-md-block flex-grow-1">
            <BreadCumb />
          </div>

          <div className="shop-acs d-flex align-items-center justify-content-between justify-content-md-end flex-grow-1">
            {/* Sort */}
            <select
              className="shop-acs__select form-select w-auto border-0 py-0 order-1 order-md-0"
              aria-label="Sort Items"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortingOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="shop-asc__seprator mx-3 bg-light d-none d-md-block order-md-0" />

            {/* Grid size */}
            <div className="col-size align-items-center order-1 d-none d-lg-flex">
              <span className="text-uppercase fw-medium me-2">View</span>
              {itemPerRow.map((elm, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColView(elm)}
                  className={`btn-link fw-medium me-2 js-cols-size ${selectedColView == elm ? "btn-link_active" : ""}`}
                >
                  {elm}
                </button>
              ))}
            </div>

            {/* Mobile filter open */}
            <div className="shop-filter d-flex align-items-center order-0 order-md-3 d-lg-none">
              <button
                className="btn-link btn-link_f d-flex align-items-center ps-0 js-open-aside"
                onClick={openModalShopFilter}
              >
                <svg className="d-inline-block align-middle me-2" width="14" height="10" viewBox="0 0 14 10">
                  <use href="#icon_filter" />
                </svg>
                <span className="text-uppercase fw-medium d-inline-block align-middle">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div
          className={`products-grid row row-cols-2 row-cols-md-3 row-cols-lg-${selectedColView}`}
          id="products-grid"
        >
          {loading ? (
            <div className="text-secondary p-3">Loading…</div>
          ) : err ? (
            <div className="alert alert-danger">{err}</div>
          ) : products.length === 0 ? (
            <div className="text-secondary p-3">No products.</div>
          ) : (
            products.map((p) => {
              const id = p.id;
              const title = getTitle(p);
              const price = getPrice(p);
              const priceOld = getOldPrice(p);
              const img1 = getImage(p);
              const img2 = p.images?.[1]?.url || img1; // хоёрыг нь слайдлуулна

              return (
                <div key={id} className="product-card-wrapper">
                  <div className="product-card mb-3 mb-md-4 mb-xxl-5">
                    <div className="pc__img-wrapper">
                      <Swiper
                        className="swiper-container background-img js-swiper-slider"
                        slidesPerView={1}
                        modules={[Navigation]}
                        navigation={{
                          prevEl: `.prev-${id}`,
                          nextEl: `.next-${id}`,
                        }}
                      >
                        {[img1, img2].map((src, i) => (
                          <SwiperSlide key={i}>
                            <Link href={`/product1_simple/${id}`}>
                              <Image
                                loading="lazy"
                                src={src}
                                width={330}
                                height={400}
                                alt={title}
                                className="pc__img"
                              />
                            </Link>
                          </SwiperSlide>
                        ))}
                        <span className={`cursor-pointer pc__img-prev prev-${id}`}>
                          <svg width="7" height="11" viewBox="0 0 7 11"><use href="#icon_prev_sm" /></svg>
                        </span>
                        <span className={`cursor-pointer pc__img-next next-${id}`}>
                          <svg width="7" height="11" viewBox="0 0 7 11"><use href="#icon_next_sm" /></svg>
                        </span>
                      </Swiper>

                      <button
                        className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                        onClick={() => addProductToCart(id)}
                        title={isAddedToCartProducts(id) ? "Already Added" : "Add to Cart"}
                      >
                        {isAddedToCartProducts(id) ? "Already Added" : "Add To Cart"}
                      </button>
                    </div>

                    <div className="pc__info position-relative">
                      <p className="pc__category">{p.category?.name || p.categoryName || ""}</p>
                      <h6 className="pc__title">
                        <Link href={`/product1_simple/${id}`}>{title}</Link>
                      </h6>

                      <div className="product-card__price d-flex">
                        {priceOld ? (
                          <>
                            <span className="money price price-old">${priceOld}</span>
                            <span className="money price price-sale">${price}</span>
                          </>
                        ) : (
                          <span className="money price">${price}</span>
                        )}
                      </div>

                      {p.colors?.length ? (
                        <div className="d-flex align-items-center mt-1"><ColorSelection /></div>
                      ) : null}

                      {typeof p.rating === "number" ? (
                        <div className="product-card__review d-flex align-items-center">
                          <div className="reviews-group d-flex"><Star stars={p.rating} /></div>
                          {typeof p.reviewsCount === "number" && (
                            <span className="reviews-note text-lowercase text-secondary ms-1">
                              {p.reviewsCount}
                            </span>
                          )}
                        </div>
                      ) : null}

                      <button
                        className={`pc__btn-wl position-absolute top-0 end-0 bg-transparent border-0 js-add-wishlist ${
                          isAddedtoWishlist(id) ? "active" : ""
                        }`}
                        onClick={() => toggleWishlist(id)}
                        title="Add To Wishlist"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20"><use href="#icon_heart" /></svg>
                      </button>
                    </div>

                    {/* Optional labels */}
                    {p.discont ? (
                      <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                        <div className="pc-labels__right ms-auto">
                          <span className="pc-label pc-label_sale d-block text-white">-{p.discont}%</span>
                        </div>
                      </div>
                    ) : null}
                    {p.isNew ? (
                      <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                        <div className="pc-labels__left">
                          <span className="pc-label pc-label_new d-block bg-white">NEW</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Simple pagination */}
        
        <Pagination2
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onChange={goPage}
          syncQuery={true}       // хүсвэл URL-д ?page=2 гэж хадгална
        />
        {/* <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button className="btn btn-outline-secondary btn-sm" disabled={!canPrev} onClick={() => goPage(pagination.currentPage - 1)}>
            Prev
          </button>
          <span className="text-secondary">
            Page {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button className="btn btn-outline-secondary btn-sm" disabled={!canNext} onClick={() => goPage(pagination.currentPage + 1)}>
            Next
          </button>
        </div> */}
      </div>
    </section>
  );
}
