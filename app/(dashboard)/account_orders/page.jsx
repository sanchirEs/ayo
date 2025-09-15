import AccountOrders from "@/components/otherPages/AccountOrders";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import React, { Suspense } from "react";

export const metadata = {
  title: "Миний захиалгууд || Ayo eCommerce",
  description: "Хэрэглэгчийн захиалгын жагсаалт",
};
export default function AccountOrderPage() {
  return (
    <>
      <div className="mb-4 pb-4"></div>
      <section className="my-account container" style={{backgroundColor: "#FBFFFC"}}>
        {/* <h2 className="page-title py-3 d-none d-lg-block">Миний захиалгууд</h2> */}
        <h2 className="page-title fs-3 fs-md-4 d-none d-lg-block" style={{ color: '#495D35' }}>Захиалгын хэсэг</h2>
        <div className="row">
          <DashboardSidebar />
          <Suspense fallback={<div>Loading orders...</div>}>
            <AccountOrders />
          </Suspense>
        </div>
      </section>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
