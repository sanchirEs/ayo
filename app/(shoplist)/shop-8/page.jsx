import Categories from "@/components/shoplist/Categories";
import Shop8 from "@/components/shoplist/Shop8";
import React from "react";

export const metadata = {
  title: "Shop 8 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function ShopPage8() {
  return (
    <>
      <Categories />
      <div className="mb-4 pb-lg-3"></div>
      <Shop8 />
    </>
  );
}
