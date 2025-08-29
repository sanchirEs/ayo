"use client";

import Image from "next/image";

export default function Banner() {
  return (
    <section className="payment-method-section">
      <div className="">
        <div className="">
          <div className="payment-method-image-container">
            <Image
              src="/assets/images/banner/banner1.png"
              alt="Payment Methods and Conditions"
              width={2000}
              height={800}
              className="payment-method-image"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
