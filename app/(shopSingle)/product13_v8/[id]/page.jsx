
import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct8 from "@/components/singleProduct/SingleProduct8";
import React from "react";
import { allProducts } from "@/data/products";

export const metadata = {
  title: "Shop Single 8 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default async function ProductDetailsPage13(props) {
  const params = await props.params;
  const productId = params.id;
  const product =
    allProducts.filter((elm) => elm.id == productId)[0] || allProducts[0];
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-md-1 pb-md-3"></div>
        <SingleProduct8 product={product} />
        <RelatedSlider />
      </main>
    </>
  );
}
