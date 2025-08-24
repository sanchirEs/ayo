"use client";

import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product, imageWidth = 330, imageHeight = 400 }) {
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  // Extract image and price from product data
  const imageUrl = product.ProductImages?.[0]?.imageUrl || product.images?.[0]?.url || '/assets/images/placeholder-330x400.png';
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
  const price = defaultVariant ? Number(defaultVariant.price) : Number(product.price || 0);
  const categoryName = product.category?.name || 'Бүтээгдэхүүн';

  return (
    <div className="product-card">
      <div className="pc__img-wrapper">
        <Link href={`/product1_simple/${product.id}`}>
          <Image
            loading="lazy"
            src={imageUrl}
            width={imageWidth}
            height={imageHeight}
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
          <span>
            {isAddedToCartProducts(product.id)
              ? "Сагсанд нэмэгдсэн"
              : "Сагсанд нэмэх"}
          </span>
        </button>

        <div className="anim_appear-right position-absolute top-0 mt-3 me-3">
          <button
            className={`btn btn-square btn-hover-primary d-block border-1 text-uppercase mb-2 js-add-wishlist ${
              isAddedtoWishlist(product.id) ? "active" : ""
            }`}
            onClick={async () => await toggleWishlist(product.id)}
            title={isAddedtoWishlist(product.id) ? "Хүслийн жагсаалтаас хасах" : "Хүслийн жагсаалтад нэмэх"}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <use href="#icon_heart"></use>
            </svg>
          </button>

          {/* <button
            className="btn btn-square btn-hover-primary d-block border-1 text-uppercase js-quick-view"
            data-bs-toggle="modal"
            data-bs-target="#quickView"
            onClick={() => setQuickViewItem(product)}
            title="Хурдан харах"
          >
            <svg className="d-inline-block" width="14" height="14" viewBox="0 0 18 18">
              <use href="#icon_view"></use>
            </svg>
          </button> */}
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
    </div>
  );
}
