
import RelatedSlider from "@/components/singleProduct/RelatedSlider";

import SingleProduct6 from "@/components/singleProduct/SingleProduct6";
import React from "react";
import { allProducts } from "@/data/products";
// e0e0e0;
export const metadata = {
  title: "Shop Single 6 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default async function ProductDetailsPage11(props) {
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
        <SingleProduct6 product={product} />
        <RelatedSlider />
      </main>
    </>
  );
}
