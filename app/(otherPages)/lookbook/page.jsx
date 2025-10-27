import Lookbook from "@/components/otherPages/Lookbook";
import React from "react";

export const metadata = {
  title: "Lookbook || Ayo eCommerce",
  description: "Ayo eCommerce",
};

export default function LookbookPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <Lookbook />
      </main>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}

