
import Checkout from "@/components/shopCartandCheckout/Checkout";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import React from "react";

export default function () {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-2 pb-2 mb-md-4 pb-md-4 d-none d-md-block"></div>
        <section className="shop-checkout container" style={{backgroundColor: "#FBFFFC"}}>
          <h2 className="page-title fs-4 fs-md-3 d-none d-md-block" style={{ color: '#495D35' }}>Хүргэлт ба төлбөр</h2>
          <div className="d-none d-md-block">
            <ChectoutSteps />
          </div>
          <Checkout />
        </section>
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
