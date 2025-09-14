
import Cart from "@/components/shopCartandCheckout/Cart";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import React from "react";

export default function () {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-2 pb-2 mb-md-4 pb-md-4"></div>
        <section className="shop-checkout container">
          <h2 className="page-title fs-3 fs-md-4" style={{ color: '#495D35' }}>Миний сагс</h2>
          <div className="d-none d-md-block">
            <ChectoutSteps />
          </div>
          <Cart />
        </section>
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
