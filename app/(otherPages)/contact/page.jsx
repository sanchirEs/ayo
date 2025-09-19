
import Contact from "@/components/otherPages/Contact/Contact";
import LocationMap from "@/components/otherPages/Contact/LocationMap";

import React from "react";

export const metadata = {
  title: "Contact || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function ContactPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-2 pb-2 mb-md-4 pb-md-4"></div>
        <section className="contact-us container">
          <div className="mw-930">
            <h2 className="page-title fs-4 fs-md-3">CONTACT US</h2>
          </div>
        </section>

        <section className="google-map mb-5">
          <h2 className="d-none">Contact US</h2>
          <div id="map" className="google-map__wrapper">
            <LocationMap />
          </div>
        </section>
        <Contact />
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
