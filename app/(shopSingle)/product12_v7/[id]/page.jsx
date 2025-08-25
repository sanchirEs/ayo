import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";

import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct7 from "@/components/singleProduct/SingleProduct7";
import React from "react";
import { allProducts } from "@/data/products";
// e0e0e0;
export const metadata = {
  title: "Shop Single 7 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default async function ProductDetailsPage12(props) {
  const params = await props.params;
  const productId = params.id;
  const product =
    allProducts.filter((elm) => elm.id == productId)[0] || allProducts[0];
  return (
    <>
      <div className="header_dark">
      </div>
      <main className="page-wrapper">
        {/* <div className="mb-md-1 pb-md-3"></div> */}
        <SingleProduct7 product={product} />
        <RelatedSlider />
      </main>
    </>
  );
}
