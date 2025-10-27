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
                className="menu-link menu-link_us-s  d-block py-2 px-3 rounded"
                style={{ textDecoration: 'none' }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  className="me-2" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                {elm.title}
              </Link>
            ) : (
              <Link
                href={elm.href}
                onClick={handleMenuClick}
                className={`menu-link  d-block py-2 px-3  rounded ${
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
