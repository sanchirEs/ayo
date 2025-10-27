import { useContextElement } from "@/context/Context";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import MobileDashboardSidebar from "@/components/otherPages/MobileDashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { openModalUserlogin } from "@/utlis/aside";
import { usePathname } from "next/navigation";

export default function MobileFooter1() {
  const [showFooter, setShowFooter] = useState(false);
  const [showDashboardSidebar, setShowDashboardSidebar] = useState(false);
  const { wishList } = useContextElement();
  const { user } = useAuth();
  const pathname = usePathname();
  
  useEffect(() => {
    setShowFooter(true);
  }, []);

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (user) {
      // Нэвтэрсэн үед dashboard sidebar нээх
      setShowDashboardSidebar(true);
    } else {
      // Нэвтрээгүй үед login modal нээх
      openModalUserlogin();
    }
  };

  const handleWishlistClick = (e) => {
    if (!user) {
      e.preventDefault();
      openModalUserlogin();
    }
    // Хэрэв user байвал ердийн байдлаар wishlist хуудас руу шилжинэ
  };

  const closeDashboardSidebar = () => {
    setShowDashboardSidebar(false);
  };

  const openDashboardSidebar = () => {
    setShowDashboardSidebar(true);
  };

  // Check if current page is active
  const isHomeActive = pathname === '/';
  const isProfileActive = (pathname.startsWith('/account') && pathname !== '/account_wishlist') || pathname.startsWith('/dashboard');
  const isWishlistActive = pathname === '/account_wishlist';

  return (
    <>
    <footer
      className={`footer-mobile container w-100 px-5 d-md-none bg-body ${
        showFooter ? "position-fixed footer-mobile_initialized" : ""
      }`}
    >
      <div className="row text-center">
        <div className="col-4">
          <Link
            href="/"
            className="footer-mobile__link d-flex flex-column align-items-center"
            style={{
              color: isHomeActive ? '#495D35' : 'inherit',
              textDecoration: 'none',
              fontWeight: isHomeActive ? '600' : 'normal'
            }}
          >
            <svg
              className="d-block"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: isHomeActive ? '#495D35' : 'inherit' }}
            >
              <use href="#icon_home" />
            </svg>
            <span style={{ 
              color: isHomeActive ? '#495D35' : 'inherit',
              fontWeight: isHomeActive ? '600' : 'normal'
            }}>Нүүр</span>
          </Link>
        </div>
        {/* <!-- /.col-3 --> */}

        <div className="col-4">
          <button
            onClick={handleProfileClick}
            className="footer-mobile__link d-flex flex-column align-items-center border-0 bg-transparent"
            style={{ 
              width: '100%',
              color: isProfileActive ? '#495D35' : 'inherit',
              fontWeight: isProfileActive ? '600' : 'normal'
            }}
          >
             <svg
              
              className="d-block"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: isProfileActive ? '#495D35' : 'inherit' }}
            >
              <use href="#icon_user" />
            </svg>
            <span style={{ 
              color: isProfileActive ? '#495D35' : 'inherit',
              fontWeight: isProfileActive ? '600' : 'normal'
            }}>Профайл</span>
          </button>
        </div>
        {/* <!-- /.col-3 --> */}

        <div className="col-4">
          <Link
            href="/account_wishlist"
            className="footer-mobile__link d-flex flex-column align-items-center"
            onClick={handleWishlistClick}
            style={{
              color: isWishlistActive ? '#495D35' : 'inherit',
              textDecoration: 'none',
              fontWeight: isWishlistActive ? '600' : 'normal'
            }}
          >
            <div className="position-relative">
              <svg
                className="d-block"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: isWishlistActive ? '#495D35' : 'inherit' }}
              >
                <use href="#icon_heart" />
              </svg>
              <span className="wishlist-amount d-block position-absolute js-wishlist-count">
                {wishList.length}
              </span>
            </div>
            <span style={{ 
              color: isWishlistActive ? '#495D35' : 'inherit',
              fontWeight: isWishlistActive ? '600' : 'normal'
            }}>Хадгалсан</span>
          </Link>
        </div>
        {/* <!-- /.col-3 --> */}
      </div>
      {/* <!-- /.row --> */}
    </footer>

    {/* Dashboard Sidebar - CartDrawer Style */}
    <div className={`aside aside_left overflow-hidden ${showDashboardSidebar ? 'aside_visible' : ''}`} id="dashboardSidebar">
      <div className="aside-header d-flex align-items-center">
        <h3 className="text-uppercase fs-6 mb-0">
          Миний профайл
        </h3>
        <button onClick={closeDashboardSidebar} className="btn-close-lg js-close-aside btn-close-aside ms-auto" />
      </div>

      <div className="aside-content">
        <MobileDashboardSidebar onClose={closeDashboardSidebar} />
      </div>
    </div>

    {/* Overlay */}
    {showDashboardSidebar && (
      <div id="dashboardSidebarOverlay" onClick={closeDashboardSidebar} className="page-overlay" />
    )}
  </>
  );
}
