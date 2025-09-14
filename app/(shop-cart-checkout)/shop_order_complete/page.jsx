

import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import OrderCompleted from "@/components/shopCartandCheckout/OrderCompleted";
import React, { Suspense } from "react";

export default function () {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-2 pb-2 mb-md-4 pb-md-4"></div>
        <section className="shop-checkout container">
          <h2 className="page-title fs-4 fs-md-3">ORDER RECEIVED</h2>
          <ChectoutSteps />
          <Suspense fallback={<div>Loading order details...</div>}>
            <OrderCompleted />
          </Suspense>
        </section>
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
