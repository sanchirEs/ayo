import Footer1 from "@/components/footers/Footer1";
import Header14 from "@/components/headers/Header14";
import OrderTrack from "@/components/shopCartandCheckout/OrderTrack";
import React from "react";

export default function () {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <OrderTrack />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
