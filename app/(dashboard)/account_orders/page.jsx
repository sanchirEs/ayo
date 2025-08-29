import Footer1 from "@/components/footers/Footer1";
import AccountOrders from "@/components/otherPages/AccountOrders";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import React, { Suspense } from "react";

export const metadata = {
  title: "Миний захиалгууд || Uomo eCommerce",
  description: "Хэрэглэгчийн захиалгын жагсаалт",
};
export default function AccountOrderPage() {
  return (
    <>
      <div className="mb-4 pb-4"></div>
      <section className="my-account container">
        <h2 className="page-title">Миний захиалгууд</h2>
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
