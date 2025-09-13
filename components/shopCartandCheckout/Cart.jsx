"use client";

import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { openModalUserlogin } from "@/utlis/aside";

export default function Cart() {
  const { cartProducts, setCartProducts, totalPrice, updateCartItemQuantity, removeCartItem } = useContextElement();
  const { user } = useAuth();
  const router = useRouter();

const setQuantity = async (id, q) => {
  const max = cartProducts.find(it => it.id === id)?.stock;
  const maxQuantity = typeof max === "number" ? max : Infinity;
  let next = Math.max(1, parseInt(q, 10) || 1);
  if (next > maxQuantity) {
    next = maxQuantity;
    // анхааруулга хүсвэл:
    // if (typeof window !== "undefined") alert(`Үлдэгдэл ${maxQuantity} ширхэг байна.`);
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
    setCartProducts((prev) => prev.filter((it) => it.id !== id));
    
    // Sync with backend
    await removeCartItem(id);
  };

  // ✅ Subtotal (context-д байхгүй бол fallback)
  const computedSubtotal = useMemo(() => {
    if (typeof totalPrice === "number") return totalPrice;
    return cartProducts.reduce(
      (sum, it) => sum + (Number(it.price || 0) * (it.quantity || 1)),
      0
    );
  }, [cartProducts, totalPrice]);

  // Хүргэлтийн сонголтууд
  const [checkboxes, setCheckboxes] = useState({
    free_shipping: false,
    flat_rate: false,
    local_pickup: false,
  });
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckboxes((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // Нийт (жишээнд байсан VAT=19, flat=49, pickup=8)
  const shippingFee =
    (checkboxes.flat_rate ? 49 : 0) + (checkboxes.local_pickup ? 8 : 0);
  const vat = 19;
  const grandTotal = computedSubtotal + shippingFee + vat;

  // Захиалга өгөх товчийг дарахад нэвтрээгүй үед login modal харуулах
  const handleCheckout = () => {
    if (cartProducts.length > 0) {
      if (!user) {
        // Нэвтрээгүй бол login modal харуулах
        openModalUserlogin();
      } else {
        // Нэвтэрсэн бол checkout хуудас руу шилжих
        router.push('/shop_checkout');
      }
    }
  };

  return (
    <div className="shopping-cart" style={{ minHeight: "calc(100vh - 300px)" }}>
      <div className="cart-table__wrapper">
        {cartProducts.length ? (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Бүтээгдэхүүн</th>
                  <th></th>
                  <th>Үнэ</th>
                  <th>Тоо хэмжээ</th>
                  <th>Нийт үнэ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartProducts.map((elm, i) => {
                  const unitPrice = Number(elm.price || 0);
                  const lineTotal = unitPrice * (elm.quantity || 1);
                  return (
                    <tr key={`₮{elm.id}-${i}`}>
                      <td>
                        <div className="px-4 shopping-cart__product-item">
                          <Image
                            loading="lazy"
                            src={elm.image || "/images/placeholder-330x400.png"}
                            width="120"
                            height="120"
                            alt={elm.name || "Product"}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="shopping-cart__product-item__detail" style={{ 
                          padding: '0 15px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '300px'
                        }}>
                          <h4 style={{ 
                            fontSize: '16px',
                            lineHeight: '1.4',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: '#333',
                            wordBreak: 'break-word'
                          }}>
                            {elm.name}
                          </h4>

                          {/* ✅ Variant attributes байвал харуулна */}
                          {Array.isArray(elm.attributes) &&
                            elm.attributes.length > 0 && (
                              <ul className="shopping-cart__product-item__options" style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                fontSize: '14px',
                                color: '#666'
                              }}>
                                {elm.attributes.map((a, idx) => (
                                  <li key={idx} style={{ marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '500' }}>{a.name}:</span> {a.value}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      </td>
                      <td>
                        <span className="shopping-cart__product-price">
                       {unitPrice.toLocaleString()}₮
                        </span>
                      </td>
                      <td>
                        <div className="qty-control position-relative" style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <input
                            type="number"
                            name="quantity"
                            value={elm.quantity || 1}
                            min={1}
                            onChange={(e) => setQuantity(elm.id, e.target.value)}
                            className="qty-control__number text-center"
                      
                          />
                          <div
                            onClick={() => setQuantity(elm.id, (elm.quantity || 1) - 1)}
                            className="qty-control__reduce"
                          
                            onMouseEnter={(e) => {
                    
                              e.currentTarget.style.color = '#495D35';
                            }}
                            onMouseLeave={(e) => {
                           
                              e.currentTarget.style.color = '#333';
                            }}
                          >
                            -
                          </div>
                          <div
                            onClick={() => setQuantity(elm.id, (elm.quantity || 1) + 1)}
                            className="qty-control__increase"
                           
                            onMouseEnter={(e) => {
                             
                              e.currentTarget.style.color = '#495D35';
                            }}
                            onMouseLeave={(e) => {
                            
                              e.currentTarget.style.color = '#333';
                            }}
                          >
                            +
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="shopping-cart__subtotal">
                        {lineTotal.toLocaleString()}₮
                        </span>
                      </td>
                      <td>
                        <a 
                          onClick={() => removeItem(elm.id)} 
                          className="remove-cart"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc3545';
                            e.currentTarget.style.borderColor = '#dc3545';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.color = '#6c757d';
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 10 10"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M0.259435 8.85506L9.11449 0L10 0.885506L1.14494 9.74056L0.259435 8.85506Z" />
                            <path d="M0.885506 0.0889838L9.74057 8.94404L8.85506 9.82955L0 0.97449L0.885506 0.0889838Z" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* <div className="cart-table-footer">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="position-relative bg-body"
              >
                <input
                  className="form-control"
                  type="text"
                  name="coupon_code"
                  placeholder="Coupon Code"
                />
                <input
                  className="btn-link fw-medium position-absolute top-0 end-0 h-100 px-4"
                  type="submit"
                  defaultValue="APPLY COUPON"
                />
              </form>
              <button className="btn btn-light">UPDATE CART</button>
            </div> */}
          </>
        ) : (
          <>
            <div className="fs-20">Shop cart is empty</div>
            <button className="btn mt-3 btn-light">
              <Link href={"/"}>Explore Products</Link>
            </button>
          </>
        )}
      </div>

      {cartProducts.length ? (
        <div className="shopping-cart__totals-wrapper">
          <div className="sticky-content">
            <div className="shopping-cart__totals">
              <h3>Нийт (сагс)</h3>
              <table className="cart-totals">
                <tbody>
                  <tr>
                    <th>Бүтээгдэхүүний нийт үнэ</th>
                    <td>{computedSubtotal.toLocaleString()}₮</td>
                  </tr>
                 
                  <tr>
                    <th>Хүргэлтийн зардал</th>
                    <td>{vat.toLocaleString()}₮</td>
                  </tr>
                  <tr>
                    <th>НИЙТ</th>
                    <td>{grandTotal.toLocaleString()}₮</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mobile_fixed-btn_wrapper">
              <div className="button-wrapper container">
                <button 
                  className="btn btn-primary btn-checkout"
                  onClick={handleCheckout}
                  style={{backgroundColor: "#495D35", color: "white"}}
                >
                  Захиалга хийх
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
