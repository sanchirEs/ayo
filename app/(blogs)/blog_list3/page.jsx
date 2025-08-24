import Blog3 from "@/components/blogs/Blog3";

import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";
import React from "react";

export const metadata = {
  title: "Blog 3 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function BlogPage3() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Blog3 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
