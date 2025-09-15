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
        <div className="mb-2 pb-2"></div>
        <section className="my-account container">
          <h2 className="page-title fs-3 fs-md-4 d-none d-lg-block" style={{ color: '#495D35' }}>Хаягийн мэдээлэл</h2>
          {/* <h2 className="page-title d-none d-lg-block">Хаягийн мэдээлэл</h2> */}
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
