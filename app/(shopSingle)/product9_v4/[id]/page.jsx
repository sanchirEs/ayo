
import RelatedSlider from "@/components/singleProduct/RelatedSlider";

import SingleProduct4 from "@/components/singleProduct/SingleProduct4";
import React from "react";
import { allProducts } from "@/data/products";
// e0e0e0;
export const metadata = {
  title: "Shop Single 9 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default async function ProductDetailsPage9(props) {
  const params = await props.params;
  const productId = params.id;
  const product =
    allProducts.filter((elm) => elm.id == productId)[0] || allProducts[0];
  return (
    <>
      <main>
        {/* <div className="mb-md-1 pb-md-3"></div> */}
        <SingleProduct4 product={product} />
        <RelatedSlider />
      </main>
    </>
  );
}
