"use client";

import Image from "next/image";

export default function PaymentMethod() {
  return (
    <section className="payment-method-section">
      <div className="">
        <div className="">
          <div className="payment-method-image-container">
            <Image
              src="/assets/images/payment/paymentCond.png"
              alt="Payment Methods and Conditions"
              width={2000}
              height={80}
              className="payment-method-image"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
