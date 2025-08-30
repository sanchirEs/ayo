import RelatedSlider from "@/components/singleProduct/RelatedSlider";

import SingleProduct3 from "@/components/singleProduct/SingleProduct3";
import React from "react";
import { allProducts } from "@/data/products";
// e0e0e0;
export const metadata = {
  title: "Shop Single 8 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default async function ProductDetailsPage8(props) {
  const params = await props.params;
  const productId = params.id;
  const product =
    allProducts.filter((elm) => elm.id == productId)[0] || allProducts[0];
  return (
    <>
    
      <main style={{ paddingTop: "70px" }}>
        <div className="mb-md-1 pb-md-3"></div>
        <SingleProduct3 product={product} />
        <RelatedSlider />
      </main>
 
    </>
  );
}
