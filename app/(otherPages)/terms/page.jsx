
import Terms from "@/components/otherPages/Terms";
import React from "react";

export const metadata = {
  title: "Үйлчилгээний нөхцөл || Ayo eCommerce",
  description: "Ayo eCommerce үйлчилгээний нөхцөл, хууль ёсны мэдээлэл",
};
export default function TermsPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <Terms />
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
