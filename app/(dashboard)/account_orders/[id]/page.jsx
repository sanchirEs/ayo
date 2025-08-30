import Footer1 from "@/components/footers/Footer1";
import OrderDetail from "@/components/otherPages/OrderDetail";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import React, { Suspense } from "react";

export const metadata = {
  title: "Захиалгын дэлгэрэнгүй || Uomo eCommerce",
  description: "Захиалгын дэлгэрэнгүй мэдээлэл",
};

export default function OrderDetailPage({ params }) {
  return (
    <>
      <div className="mb-4 pb-4"></div>
      <section className="my-account container" style={{backgroundColor: "#FBFFFC"}}>
        <h2 className="page-title">Захиалгын дэлгэрэнгүй</h2>
        <div className="row">
          <DashboardSidebar />
          <Suspense fallback={<div>Loading order details...</div>}>
            <OrderDetail orderId={params.id} />
          </Suspense>
        </div>
      </section>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
