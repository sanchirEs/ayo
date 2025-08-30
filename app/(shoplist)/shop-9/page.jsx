import Banner1 from "@/components/shoplist/Banner1";
import Shop1 from "@/components/shoplist/Shop1";
import Shop9 from "@/components/shoplist/Shop9";
import React from "react";

export const metadata = {
  title: "Shop 9 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function ShopPage9() {
  return (
    <>
      <Banner1 />
      <div className="mb-4 pb-lg-3"></div>
      <Shop9 />
    </>
  );
}
