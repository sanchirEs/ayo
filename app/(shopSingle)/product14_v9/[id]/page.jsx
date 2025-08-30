
import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct9 from "@/components/singleProduct/SingleProduct9";
import React from "react";
import { allProducts } from "@/data/products";

export const metadata = {
  title: "Shop Single 9 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default async function ProductDetailsPage14(props) {
  const params = await props.params;
  const productId = params.id;
  const product =
    allProducts.filter((elm) => elm.id == productId)[0] || allProducts[0];
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-md-1 pb-md-3"></div>
        <SingleProduct9 product={product} />
        <RelatedSlider />
      </main>
    </>
  );
}
