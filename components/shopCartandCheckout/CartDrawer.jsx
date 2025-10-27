"use client";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import React, { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { openModalUserlogin } from "@/utlis/aside";

export default function CartDrawer() {
  const { cartProducts, setCartProducts, totalPrice, updateCartItemQuantity, removeCartItem } = useContextElement();
  const { user } = useAuth();
  const pathname = usePathname();

  const closeCart = () => {
    document.getElementById("cartDrawerOverlay")?.classList.remove("page-overlay_visible");
    document.getElementById("cartDrawer")?.classList.remove("aside_visible");
  };


// Тоог шинэчлэхдээ min=1, max= тухайн барааны stock барина
const setQuantity = async (id, q) => {
  const max = cartProducts.find(it => it.id === id)?.stock;
  const maxQuantity = typeof max === "number" ? max : Infinity;
  let next = Math.max(1, parseInt(q, 10) || 1);
  if (next > maxQuantity) {
    next = maxQuantity;
    // анхааруулга хүсвэл:
    if (typeof window !== "undefined") alert(`Үлдэгдэл ${maxQuantity} ширхэг байна.`);
  }
  
  // Update local state immediately for better UX
  setCartProducts(prev =>
    prev.map(it => {
      if (it.id !== id) return it;
      return { ...it, quantity: next };
    })
  );
  
  // Sync with backend
  await updateCartItemQuantity(id, next);
};


  const removeItem = async (id) => {
    // Update local state immediately for better UX
    setCartProducts(prev => prev.filter(it => it.id !== id));
    
    // Sync with backend
    await removeCartItem(id);
  };

  // Checkout button дээр дарахад нэвтрээгүй үед login modal харуулах
  const handleCheckoutClick = (e) => {
    if (!user) {
      e.preventDefault();
      closeCart(); // Cart modal хаах
      openModalUserlogin(); // Login modal нээх
    }
    // Хэрэв user байвал ердийн байдлаар checkout хуудас руу шилжинэ
  };

  useEffect(() => {
    closeCart();
  }, [pathname]);

  return (
    <>
      <div className="aside aside_right overflow-hidden cart-drawer" id="cartDrawer">
        <div className="aside-header d-flex align-items-center">
          <h3 className="text-uppercase fs-6 mb-0">
            Сагс (
            <span className="cart-amount js-cart-items-count">{cartProducts.length}</span>
            )
          </h3>
          <button onClick={closeCart} className="btn-close-lg js-close-aside btn-close-aside ms-auto" />
        </div>

        {cartProducts.length ? (
          <div className="aside-content cart-drawer-items-list">
            {cartProducts.map((elm, i) => {
              const unitPrice = Number(elm.price || 0);
              const lineTotal = unitPrice * (elm.quantity || 1);
              return (
                <React.Fragment key={`${elm.id}-${i}`}>
                  <div className="cart-drawer-item d-flex position-relative">
                    <div className="position-relative">
                      <Image
                        loading="lazy"
                        className="cart-drawer-item__img"
                        width={330}
                        height={400}
                        style={{ height: "fit-content" }}
                        src={elm.image || "/images/placeholder-330x400.png"}
                        alt={elm.name || "Бүтээгдэхүүн"}
                      />
                    </div>

                    <div className="cart-drawer-item__info flex-grow-1">
                      <h6 className="cart-drawer-item__title fw-normal">{elm.name}</h6>

                      {/* ✅ Variant attributes байвал харуулна */}
                      {Array.isArray(elm.attributes) && elm.attributes.length > 0 ? (
                        <div className="text-secondary">
                          {elm.attributes.map((a, idx) => (
                            <p key={idx} className="cart-drawer-item__option text-secondary">
                              {a.name}: {a.value}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div className="qty-control position-relative">
                          <input
                            type="number"
                            name="quantity"
                            onChange={(e) => setQuantity(elm.id, e.target.value)}
                            value={elm.quantity || 1}
                            min="1"
                            max={typeof elm.stock === "number" ? elm.stock : undefined}
                            className="qty-control__number border-0 text-center"
                          />

                        <div
                          onClick={() => setQuantity(elm.id, (elm.quantity || 1) - 1)}
                          className="qty-control__reduce text-start"
                        >
                          -
                        </div>
                        <div
                          onClick={() => {
                            const max = typeof elm.stock === "number" ? elm.stock : Infinity;
                            if ((elm.quantity || 1) < max) {
                              setQuantity(elm.id, (elm.quantity || 1) + 1);
                            }
                            // else { alert(`Үлдэгдэл ${max} ширхэг байна.`); }
                          }}
                          className="qty-control__increase text-end"
                        >
                          +
                        </div>

                        </div>

                        <span className="cart-drawer-item__price money price">
                          {lineTotal.toLocaleString()}₮
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(elm.id)}
                      className="btn-close-xs position-absolute top-0 end-0 js-cart-item-remove"
                    />
                  </div>

                  <hr className="cart-drawer-divider" />
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="fs-18 mt-5 px-5">Таны сагс хоосон байна.</div>
        )}

        <div className="cart-drawer-actions position-absolute start-0 bottom-0 w-100">
          <hr className="cart-drawer-divider" />
          <div className="d-flex justify-content-between">
            <h6 className="fs-base fw-medium">Нийт:</h6>
            {/* Хэрэв context-д totalPrice аль хэдийн байгаа бол түүнийг ашигла */}
            <span className="cart-subtotal fw-medium">
             {Number(totalPrice || cartProducts.reduce((s, it) => s + (Number(it.price || 0) * (it.quantity || 1)), 0)).toLocaleString()}₮
            </span>
          </div>

          {cartProducts.length ? (
            <>
              <Link href="/shop_cart" className="btn btn-light mt-3 d-block">
                Сагсыг харах
              </Link>
              <Link 
                href="/shop_checkout" 
                className="btn btn-success mt-3 d-block" 
                style={{backgroundColor: "#495D35", color: "white"}}
                onClick={handleCheckoutClick}
              >
                Худалдаж авах
              </Link>
            </>
          ) : (
            <button 
              onClick={closeCart} 
              className="btn btn-light mt-3 d-block w-100"
            >
              Буцах
            </button>
          )}
        </div>
      </div>

      <div id="cartDrawerOverlay" onClick={closeCart} className="page-overlay" />
    </>
  );
}
