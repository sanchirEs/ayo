import AccountWishlist from "@/components/otherPages/AccountWishlist";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import React from "react";

export const metadata = {
  title: "Dashboard Account Wishlist || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function AccountWishlistPage() {
  return (
    <>
      <div className="mb-4 pb-4"></div>
      <section className="my-account container" style={{backgroundColor: "#FBFFFC"}}>
      <h2 className="page-title fs-3 fs-md-4 d-none d-lg-block" style={{ color: '#495D35' }}>Хүслийн жагсаалт</h2>
        {/* <h2 className="page-title py-3 d-none d-lg-block">Хүслийн жагсаалт</h2> */}
        <div className="row">
          <DashboardSidebar />
          <AccountWishlist />
        </div>
      </section>
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
