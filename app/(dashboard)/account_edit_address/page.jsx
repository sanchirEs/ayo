import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import EditAddress from "@/components/otherPages/EditAddress";
import React from "react";

export const metadata = {
  title: "Хаягийн мэдээлэл || Ayo eCommerce",
  description: "Хэрэглэгчийн хаягийн мэдээллийг удирдах",
};
export default function AccountEditAddressPage() {
  return (
    <>
      <main className="page-wrapper" style={{backgroundColor: "#FBFFFC"}}>
        <div className="mb-4 pb-4"></div>
        <section className="my-account container">
          <h2 className="page-title d-none d-lg-block">Хаягийн мэдээлэл</h2>
          <div className="row">
            <DashboardSidebar />
            <EditAddress />
          </div>
        </section>
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
