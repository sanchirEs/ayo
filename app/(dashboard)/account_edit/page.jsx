import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import EditAccount from "@/components/otherPages/EditAccount";
import React from "react";

export const metadata = {
  title: "Dashboard Account Edit || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function AccountEditPage() {
  return (
    <>
      <main className="page-wrapper">
      <div className="mb-2 mb-md-4 pb-2 pb-md-4"></div>
        <section className="my-account container">
          <h2 className="page-title fs-3 fs-md-4 d-none d-lg-block" style={{ color: '#495D35' }}>Профайл дэлгэрэнгүй</h2>
          {/* <h2 className="page-title d-none d-lg-block">Профайл дэлгэрэнгүй</h2> */}

          <div className="row">
            <DashboardSidebar />
            <EditAccount />
          </div>
        </section>
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
