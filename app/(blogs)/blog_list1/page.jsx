import Blog1 from "@/components/blogs/Blog1";

import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";
import React from "react";

export const metadata = {
  title: "Blog 1 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function BlogPage1() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Blog1 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
