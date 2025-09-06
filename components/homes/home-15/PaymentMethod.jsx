"use client";

import Image from "next/image";

export default function PaymentMethod() {
  return (
    <section className="payment-method-section-compact">
      <div className="container">
        <div className="payment-methods-wrapper">
          <div className="payment-method-card">
            <Image
              src="/assets/images/payment/storepay_web.webp"
              alt="Storepay Payment Method"
              width={350}
              height={70}
              className="payment-method-logo"
              style={{ width: '100%', height: 'auto' }}
              priority
            />
          </div>
          <div className="payment-method-card">
            <Image
              src="/assets/images/payment/pocket_web.webp"
              alt="Pocket Payment Method"
              width={350}
              height={70}
              className="payment-method-logo"
              style={{ width: '100%', height: 'auto' }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
