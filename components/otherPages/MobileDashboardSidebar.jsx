// MobileDashboardSidebar.jsx - Mobile-specific version
"use client";
import { dashboardMenuItems } from "@/data/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MobileDashboardSidebar({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleMenuClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="p-4">
      <ul className="account-nav list-unstyled">
        {dashboardMenuItems.map((elm, i) => (
          <li key={i} className="mb-3">
            {elm.title === "Гарах" ? (
              <Link
                href={elm.href}
                onClick={(e) => {
                  logout();
                  handleMenuClick();
                }}
                className="menu-link menu-link_us-s text-danger d-block py-2 px-3 rounded"
                style={{ textDecoration: 'none' }}
              >
                {elm.title}
              </Link>
            ) : (
              <Link
                href={elm.href}
                onClick={handleMenuClick}
                className={`menu-link menu-link_us-s d-block py-2 px-3 rounded ${
                  pathname === elm.href || (elm.href === "/account_orders" && pathname.startsWith("/account_orders/")) ? "menu-link_active bg-light" : ""
                }`}
                style={{ textDecoration: 'none' }}
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
