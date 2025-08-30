
import Checkout from "@/components/shopCartandCheckout/Checkout";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import React from "react";

export default function () {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="shop-checkout container" style={{backgroundColor: "#FBFFFC"}}>
          <h2 className="page-title" style={{ color: '#495D35' }}>Хүргэлт ба төлбөр</h2>
          <ChectoutSteps />
          <Checkout />
        </section>
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
