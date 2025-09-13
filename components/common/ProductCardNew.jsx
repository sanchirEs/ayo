"use client";

import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";

export default function ProductCardNew({ product, imageWidth = 330, imageHeight = 400 }) {
  const { toggleWishlist, isAddedtoWishlist, cartProducts, setCartProducts } = useContextElement();
  const { setQuickViewItem } = useContextElement();

  // Extract image and price from product data
  const imageUrl = product.ProductImages?.[0]?.imageUrl || product.images?.[0]?.url || '/assets/images/placeholder-330x400.png';
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
  const price = defaultVariant ? Number(defaultVariant.price) : Number(product.price || 0);
  const categoryName = product.category?.name || 'Бүтээгдэхүүн';

  // Check if product is already in cart
  const isInCart = cartProducts.find((elm) => elm.id == product.id);

  // Check if product is already in wishlist
  const isInWishlist = isAddedtoWishlist(product.id);

  // Add to cart function
  const addToCart = () => {
    if (isInCart) return;

    const item = {
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      image: imageUrl,
      sku: defaultVariant?.sku || product?.sku || "",
      variantId: defaultVariant?.id || null,
      attributes: (defaultVariant?.attributes || []).map((a) => ({
        name: a?.option?.attribute?.name ?? "",
        value: a?.option?.value ?? "",
      })),
      stock: defaultVariant?.inventory?.quantity || product?.inventories?.[0]?.quantity || 0,
    };

    setCartProducts((prev) => [...prev, item]);

    // Open cart drawer
    const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");
    const cartDrawer = document.getElementById("cartDrawer");
    if (cartDrawerOverlay && cartDrawer) {
      cartDrawerOverlay.classList.add("page-overlay_visible");
      cartDrawer.classList.add("aside_visible");
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    await toggleWishlist(product.id);
  };

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

        {/* NEW tag - top right */}
        <span className="badge-new position-absolute top-0 end-0 mt-3 me-3 bg-danger text-white px-2 py-1 rounded">
            Шинэ
        </span>
        {/* Wishlist (favorite) button - top right */}
        {/* <div className="anim_appear-right position-absolute top-0 end-0 mt-3 me-3">
            <button
            className={`btn btn-square btn-hover-primary d-block border-1 text-uppercase mb-2 js-add-wishlist ${
                isInWishlist ? "active" : ""
            }`}
            onClick={handleWishlistToggle}
            title={isInWishlist ? "Хүслийн жагсаалтаас хасах" : "Хүслийн жагсаалтад нэмэх"}
            >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <use href="#icon_heart"></use>
            </svg>
            </button>
        </div> */}

        {/* Add to cart button stays at bottom */}
        {/* <button
            className="pc__atc btn btn-primary btn-lg anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside left-0 w-100 bottom-0 btn-50 text-white d-flex align-items-center justify-content-center gap-2"
            onClick={addToCart}
            title={isInCart ? "Сагсанд нэмэгдсэн" : "Сагсанд нэмэх"}
        >
            <svg className="d-block me-1" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <use href={isInCart ? "#icon_cart_added" : "#icon_cart"}></use>
            </svg>
            <span>
                {isInCart ? "Сагсанд нэмэгдсэн" : "Сагсанд нэмэх"}
            </span>
        </button> */}
      </div>

      <div className="pc__info position-relative text-rigth">
        <h4 className="pc__title text-uppercase fw-medium mb-1" title={product.name}>
          <Link href={`/product1_simple/${product.id}`}>{product.name}</Link>
        </h4>        
        <p className="pc__category text-secondary">{categoryName}</p>
        <div className="product-card__price d-flex align-items-right justify-content-right mb-1">
          <span className="money price fw-medium">₮{price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
