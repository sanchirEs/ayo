// DashboardSidebar.jsx
"use client";
import { dashboardMenuItems } from "@/data/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="col-lg-3 d-none d-lg-block">
      <ul className="account-nav">
        {dashboardMenuItems.map((elm, i) => (
          <li key={i}>
            {elm.title === "Гарах" ? (
              <Link
                href={elm.href}
                onClick={logout}
                className="menu-link menu-link_us-s text-red-500"
              >
                {elm.title}
              </Link>
            ) : (
              <Link
                href={elm.href}
                className={`menu-link menu-link_us-s ${
                  pathname === elm.href || (elm.href === "/account_orders" && pathname.startsWith("/account_orders/")) ? "menu-link_active" : ""
                } `}
              >
                {elm.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
