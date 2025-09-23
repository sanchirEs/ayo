"use client";
import Link from "next/link";
import CartLength from "./components/CartLength";
import Nav from "./components/Nav";
import { openCart } from "@/utlis/openCart";
import Image from "next/image";
import User from "./components/User";
import { currencyOptions, languageOptions2 } from "@/data/footer";
import { socialLinks } from "@/data/socials";
import SearchPopup from "./components/SearchPopup";
import { useAuth } from "@/context/AuthContext";
import { useContextElement } from "@/context/Context";
import { openModalUserlogin } from "@/utlis/aside";

export default function Header14() {
  const { user, logout } = useAuth();
  const { wishList } = useContextElement();

  // Heart icon дээр дарахад нэвтрээгүй үед login modal харуулах
  const handleWishlistClick = (e) => {
    if (!user) {
      e.preventDefault();
      openModalUserlogin();
    }
    // Хэрэв user байвал ердийн байдлаар wishlist хуудас руу шилжинэ
  };

  // Cart icon дээр дарахад нэвтрээгүй үед login modal харуулах

  return (
    <header
      id="header"
      className="header sticky_disabled w-100"
      style={{
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        zIndex: 1000,
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid rgba(47, 79, 47, 0.1)",
      }}
    >
      <div className="header-top" style={{ backgroundColor: "#495D35" }}>
        <div
          className="container d-flex container align-items-center"
          style={{ color: "white" }}
        >
          <ul className="list-unstyled d-flex flex-1 gap-3 m-0">
            <li>
              <a
                href="/store-locations"
                className="menu-link menu-link_us-s d-flex align-items-center gap-2"
                style={{ color: "white" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="color-white"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="currentColor"
                  />
                </svg>
                Салбаруудын байршил харах
              </a>
            </li>
          </ul>
          <ul className="social-links list-unstyled d-flex flex-wrap mx-auto mb-0">
            {socialLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="footer__social-link d-flex align-items-center justify-content-center"
                  style={{
                    color: "white",

                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = "1";
                  }}
                >
                  <svg
                    className={link.className}
                    width={link.width}
                    height={link.height}
                    viewBox={link.viewBox}
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      display: "block",
                      flexShrink: "0",
                    }}
                  >
                    <use href={link.icon} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <div
            className="heeader-top__right flex-1 d-flex gap-1 justify-content-end"
            style={{ color: "white", fontSize: "0.8rem" }}
          >
            Хүргэлтийн ачааллаас хамааран онлайн захиалга 24-48 цагт хүргэгдэж
            байна.
          </div>
        </div>
      </div>
      <div
        className="header-desk_type_8"
        style={{ backgroundColor: "#F4F7F5" }}
      >
        <div className="header-middle py-2">
          <div className="container d-flex align-items-center my-2">
            <div className="flex-1 d-flex align-items-center gap-3">
              <div className="service-promotion__icon">
                <svg
                  width="40"
                  height="30"
                  viewBox="0 0 53 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "var(--color-secondary)" }}
                >
                  <use href="#icon_headphone"></use>
                </svg>
              </div>
              <div className="service-promotion__content-wrap">
                <h3
                  className="service-promotion__title h6 text-uppercase mb-0"
                  style={{ color: "var(--color-primary)" }}
                >
                  {/* Асуудал байна уу? */}
                </h3>
                <p
                  className="service-promotion__content fs-base mb-0"
                  style={{ color: "var(--color-text)" }}
                >
                  +976 80940575
                </p>
              </div>
            </div>
            <div
              className="logo-container"
              style={{ padding: "0", margin: "0" }}
            >
              <Link href="/">
                <Image
                  src="/assets/images/logoReal.png"
                  width={130}
                  height={50}
                  alt="Ayo"
                  className="logo__image"
                  style={{
                    objectFit: "contain",
                    maxWidth: "100%",
                    height: "auto",
                    padding: "0",
                    margin: "0",
                  }}
                />
              </Link>
            </div>
            {/* <!-- /.logo --> */}

            <div className="header-tools d-flex align-items-center flex-1 justify-content-end me-2">
              <SearchPopup />
              {/* <!-- /.header-tools__item hover-container --> */}

              {user ? (
                // НЭВТЭРСЭН ҮЕД: нэр + dropdown (logout)
                <div className="header-tools__item hover-container">
                  <Link
                    href="/account_edit"
                    className="menu-link menu-link_us-s d-flex align-items-center gap-2"
                    style={{
                      color: "var(--color-text)",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "var(--color-primary)";
                      e.target.style.backgroundColor = "rgba(47, 79, 47, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "var(--color-text)";
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    Сайн байна уу, {user.username || user.firstName || "User"}
                  </Link>
                </div>
              ) : (
                // НЭВТРЭЭГҮЙ ҮЕД: login/register руу
                <div className="header-tools__item hover-container">
                  <Link
                    href="/login_register"
                    className="menu-link d-flex align-items-center gap-2"
                    style={{
                      color: "var(--color-text)",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "var(--color-primary)";
                      e.target.style.backgroundColor = "rgba(47, 79, 47, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "var(--color-text)";
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    <User />
                  </Link>
                </div>
              )}

              <Link
                className="header-tools__item header-tools__cart js-open-aside"
                href="/account_wishlist"
                onClick={handleWishlistClick}
              >
                <svg
                  className="d-block"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_heart" />
                </svg>
                {wishList.length > 0 && (
                  <span
                    className="cart-amount d-block position-absolute js-cart-items-count"
                    style={{
                      backgroundColor: "#BFD099",
                      // backgroundColor: "var(--color-accent-yellow)",
                      // color: "white",
                      // borderRadius: "50%",
                      // width: "20px",
                      // height: "20px",
                      // fontSize: "12px",
                      // display: "flex",
                      // alignItems: "center",
                      // justifyContent: "center",
                      // top: "-5px",
                      // right: "-5px"
                    }}
                  >
                    {wishList.length}
                  </span>
                )}
              </Link>

              <a
                onClick={() => openCart()}
                className="header-tools__item header-tools__cart js-open-aside"
                // style={{
                //   color: "var(--color-text)",
                //   textDecoration: "none",
                //   transition: "color 0.3s ease",
                //   padding: "8px",
                //   borderRadius: "6px",
                //   position: "relative",
                //   cursor: "pointer"
                // }}
                // onMouseEnter={(e) => {
                //   e.target.style.color = "var(--color-primary)";
                //   // e.target.style.backgroundColor = "rgba(47, 79, 47, 0.05)";
                // }}
                // onMouseLeave={(e) => {
                //   e.target.style.color = "var(--color-text)";
                //   e.target.style.backgroundColor = "transparent";
                // }}
              >
                <svg
                  className="d-block"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_cart" />
                </svg>
                <span
                  className="cart-amount d-block position-absolute js-cart-items-count"
                  style={{
                    backgroundColor: "#BFD099",
                    // color: "white",
                    // borderRadius: "50%",
                    // width: "20px",
                    // height: "20px",
                    // fontSize: "12px",
                    // display: "flex",
                    // alignItems: "center",
                    // justifyContent: "center",
                    // top: "-5px",
                    // right: "-5px"
                  }}
                >
                  <CartLength />
                </span>
              </a>
            </div>
            {/* <!-- /.header__tools --> */}
          </div>
        </div>
        {/* <!-- /.header-middle --> */}

        <div
          className="header-bottom"
          style={{ borderTop: "1px solid rgba(47, 79, 47, 0.1)" }}
        >
          <div className="container">
            <nav className="navigation w-100 d-flex align-items-center justify-content-between py-2">
              <ul
                className="navigation__list list-unstyled d-flex my-1 flex-1 justify-content-start"
                style={{ marginLeft: "0", paddingLeft: "0" }}
              >
                <Nav />
              </ul>
              {/* Brands button on the right */}
              <div className="brands-button-container ms-3">
                <Link
                  href="/brands"
                  className="navigation__link"
                  style={{
                    color: "var(--color-text)",
                    textDecoration: "none",
                    transition: "color 0.3s ease",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "var(--color-primary)";
                    e.target.style.backgroundColor = "rgba(47, 79, 47, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "var(--color-text)";
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  БРЭНДҮҮД
                </Link>
              </div>
              {/* <!-- /.navigation__list --> */}
            </nav>
            {/* <!-- /.navigation --> */}
          </div>
        </div>
        {/* <!-- /.header-bottom --> */}
      </div>
      {/* <!-- /.header-desk header-desk_type_6 --> */}
    </header>
  );
}
