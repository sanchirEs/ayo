import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header14";
import Cart from "@/components/shopCartandCheckout/Cart";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import React from "react";

export default function () {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="shop-checkout container">
          <h2 className="page-title">Миний сагс</h2>
          <ChectoutSteps />
          <Cart />
        </section>
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
