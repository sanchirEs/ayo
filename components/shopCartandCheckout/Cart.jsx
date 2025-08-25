"use client";

import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";

export default function Cart() {
  const { cartProducts, setCartProducts, totalPrice } = useContextElement();

const setQuantity = (id, q) => {
  setCartProducts(prev =>
    prev.map(it => {
      console.log("niit hed bna: ", it.stock)
      if (it.id !== id) return it;
      const max = typeof it.stock === "number" ? it.stock : Infinity;
      let next = Math.max(1, parseInt(q, 10) || 1);
      if (next > max) {
        next = max;
        // анхааруулга хүсвэл:
        // if (typeof window !== "undefined") alert(`Үлдэгдэл ${max} ширхэг байна.`);
      }
      return { ...it, quantity: next };
    })
  );
};

  const removeItem = (id) => {
    setCartProducts((prev) => prev.filter((it) => it.id !== id));
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

  return (
    <div className="shopping-cart" style={{ minHeight: "calc(100vh - 300px)" }}>
      <div className="cart-table__wrapper">
        {cartProducts.length ? (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th></th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartProducts.map((elm, i) => {
                  const unitPrice = Number(elm.price || 0);
                  const lineTotal = unitPrice * (elm.quantity || 1);
                  return (
                    <tr key={`${elm.id}-${i}`}>
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
                        <div className="shopping-cart__product-item__detail">
                          <h4>{elm.name}</h4>

                          {/* ✅ Variant attributes байвал харуулна */}
                          {Array.isArray(elm.attributes) &&
                            elm.attributes.length > 0 && (
                              <ul className="shopping-cart__product-item__options">
                                {elm.attributes.map((a, idx) => (
                                  <li key={idx}>
                                    {a.name}: {a.value}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      </td>
                      <td>
                        <span className="shopping-cart__product-price">
                          ${unitPrice.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="qty-control position-relative">
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
                          >
                            -
                          </div>
                          <div
                            onClick={() => setQuantity(elm.id, (elm.quantity || 1) + 1)}
                            className="qty-control__increase"
                          >
                            +
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="shopping-cart__subtotal">
                          ${lineTotal.toLocaleString()}
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
              <Link href={"/shop-1"}>Explore Products</Link>
            </button>
          </>
        )}
      </div>

      {cartProducts.length ? (
        <div className="shopping-cart__totals-wrapper">
          <div className="sticky-content">
            <div className="shopping-cart__totals">
              <h3>Cart Totals</h3>
              <table className="cart-totals">
                <tbody>
                  <tr>
                    <th>Subtotal</th>
                    <td>${computedSubtotal.toLocaleString()}</td>
                  </tr>
                  {/* <tr>
                    <th>Shipping</th>
                    <td>
                      <div className="form-check">
                        <input
                          className="form-check-input form-check-input_fill"
                          type="checkbox"
                          id="free_shipping"
                          checked={checkboxes.free_shipping}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor="free_shipping">
                          Free shipping
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input form-check-input_fill"
                          type="checkbox"
                          id="flat_rate"
                          checked={checkboxes.flat_rate}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor="flat_rate">
                          Flat rate: $49
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input form-check-input_fill"
                          type="checkbox"
                          id="local_pickup"
                          checked={checkboxes.local_pickup}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor="local_pickup">
                          Local pickup: $8
                        </label>
                      </div>
                      <div>Shipping to AL.</div>
                      <div>
                        <a href="#" className="menu-link menu-link_us-s">
                          CHANGE ADDRESS
                        </a>
                      </div>
                    </td>
                  </tr> */}
                  <tr>
                    <th>VAT</th>
                    <td>${vat.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Total</th>
                    <td>${grandTotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mobile_fixed-btn_wrapper">
              <div className="button-wrapper container">
                <button className="btn btn-primary btn-checkout">
                  Захиалга өгөх хаягаа оруулах
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
