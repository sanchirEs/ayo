import Banner7 from "@/components/shoplist/Banner7";
import BreadCumb from "@/components/shoplist/BreadCumb";
import Collections from "@/components/shoplist/Collections";
import React from "react";

export const metadata = {
  title: "Shop 12 || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function ShopPage12() {
  return (
    <>
      <Banner7 />
      <div className="mb-4 pb-lg-3"></div>
      <div className="container">
        <div className="breadcrumb mb-4 pb-md-2">
          <BreadCumb />
        </div>
      </div>
      <Collections />
    </>
  );
}
