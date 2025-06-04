"use client";
import {
  additionalShopPageitems,
  blogmenuItems,
  homePages,
  othersMenuItems,
  shopDetails,
  shopList,
} from "@/data/menu";
import Link from "next/link";
import React, { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const isMenuActive = (menu) => {
    return menu.split("/")[1] == pathname.split("/")[1];
  };
  const isActiveParentMenu = (menus) => {
    return menus.some(
      (menu) => menu.href.split("/")[1] == pathname.split("/")[1]
    );
  };
  useEffect(() => {
    function setBoxMenuPosition(menu) {
      const scrollBarWidth = 17; // You might need to calculate or define this value
      const limitR = window.innerWidth - menu.offsetWidth - scrollBarWidth;
      const limitL = 0;
      const menuPaddingLeft = parseInt(
        window.getComputedStyle(menu, null).getPropertyValue("padding-left")
      );
      const parentPaddingLeft = parseInt(
        window
          .getComputedStyle(menu.previousElementSibling, null)
          .getPropertyValue("padding-left")
      );
      const centerPos =
        menu.previousElementSibling.offsetLeft -
        menuPaddingLeft +
        parentPaddingLeft;

      let menuPos = centerPos;
      if (centerPos < limitL) {
        menuPos = limitL;
      } else if (centerPos > limitR) {
        menuPos = limitR;
      }

      menu.style.left = `${menuPos}px`;
    }
    document.querySelectorAll(".box-menu").forEach((el) => {
      setBoxMenuPosition(el);
    });
  }, []);
  return (
    <>
      <li className="navigation__item">
        <a
          href="#"
          className={`navigation__link ${
            isActiveParentMenu(homePages) ? "menu-active" : ""
          }`}
        >
          Home
        </a>
        <div className="box-menu" style={{ width: "800px" }}>
          <div className="col pe-4">
            <ul className="sub-menu__list list-unstyled">
              {homePages.slice(0, 6).map((elm, i) => (
                <li key={i} className="sub-menu__item">
                  <Link
                    href={elm.href}
                    className={`menu-link menu-link_us-s ${
                      isMenuActive(elm.href) ? "menu-active" : ""
                    }`}
                  >
                    {elm.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col pe-4">
            <ul className="sub-menu__list list-unstyled">
              {homePages.slice(6, 12).map((elm, i) => (
                <li key={i} className="sub-menu__item">
                  <Link
                    href={elm.href}
                    className={`menu-link menu-link_us-s ${
                      isMenuActive(elm.href) ? "menu-active" : ""
                    }`}
                  >
                    {elm.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col pe-4">
            <ul className="sub-menu__list list-unstyled">
              {homePages.slice(12, 18).map((elm, i) => (
                <li key={i} className="sub-menu__item">
                  <Link
                    href={elm.href}
                    className={`menu-link menu-link_us-s ${
                      isMenuActive(elm.href) ? "menu-active" : ""
                    }`}
                  >
                    {elm.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col">
            <ul className="sub-menu__list list-unstyled">
              {homePages.slice(18, 24).map((elm, i) => (
                <li key={i} className="sub-menu__item">
                  <Link
                    href={elm.href}
                    className={`menu-link menu-link_us-s ${
                      isMenuActive(elm.href) ? "menu-active" : ""
                    }`}
                  >
                    {elm.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* <!-- /.box-menu --> */}
      </li>
      <li className="navigation__item">
        <a
          href="#"
          className={`navigation__link
           ${isActiveParentMenu(shopList) ? "menu-active" : ""}
           ${isActiveParentMenu(shopDetails) ? "menu-active" : ""}
           ${isActiveParentMenu(additionalShopPageitems) ? "menu-active" : ""}
          `}
        >
          Shop
        </a>
        <div className="mega-menu">
          <div className="container d-flex">
            <div className="col pe-4">
              <a href="#" className="sub-menu__title">
                Shop List
              </a>
              <ul className="sub-menu__list list-unstyled">
                {shopList.map((elm, i) => (
                  <li key={i} className="sub-menu__item">
                    <Link
                      href={elm.href}
                      className={`menu-link menu-link_us-s ${
                        isMenuActive(elm.href) ? "menu-active" : ""
                      }`}
                    >
                      {elm.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col pe-4">
              <a href="#" className="sub-menu__title">
                Shop Detail
              </a>
              <ul className="sub-menu__list list-unstyled">
                {shopDetails.map((elm, i) => (
                  <li key={i} className="sub-menu__item">
                    <Link
                      href={elm.href}
                      className={`menu-link menu-link_us-s ${
                        isMenuActive(elm.href) ? "menu-active" : ""
                      }`}
                    >
                      {elm.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col pe-4">
              <a href="#" className="sub-menu__title">
                Other Pages
              </a>
              <ul className="sub-menu__list list-unstyled">
                {additionalShopPageitems.map((elm, i) => (
                  <li key={i} className="sub-menu__item">
                    <Link
                      href={elm.href}
                      className={`menu-link menu-link_us-s ${
                        isMenuActive(elm.href) ? "menu-active" : ""
                      }`}
                    >
                      {elm.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mega-menu__media col">
              <div className="position-relative">
                <Image
                  loading="lazy"
                  className="mega-menu__img"
                  src="/assets/images/mega-menu-item.jpg"
                  width={902}
                  height={990}
                  style={{ height: "fit-content" }}
                  alt="New Horizons"
                />
                <div className="mega-menu__media-content content_abs content_left content_bottom">
                  <h3>NEW</h3>
                  <h3 className="mb-0">HORIZONS</h3>
                  <Link
                    href="/shop-1"
                    className="btn-link default-underline fw-medium"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* <!-- /.container d-flex --> */}
        </div>
      </li>
      <li className="navigation__item">
        <a
          href="#"
          className={`navigation__link ${
            isActiveParentMenu(blogmenuItems) ? "menu-active" : ""
          }`}
        >
          Blog
        </a>
        <ul className="default-menu list-unstyled">
          {blogmenuItems.map((elm, i) => (
            <li key={i} className="sub-menu__item">
              <Link
                href={elm.href}
                className={`menu-link menu-link_us-s ${
                  isMenuActive(elm.href) ? "menu-active" : ""
                }`}
              >
                {elm.title}
              </Link>
            </li>
          ))}
        </ul>
        {/* <!-- /.box-menu --> */}
      </li>
      <li className="navigation__item">
        <a
          href="#"
          className={`navigation__link ${
            isActiveParentMenu(othersMenuItems) ? "menu-active" : ""
          }`}
        >
          Pages
        </a>
        <ul className="default-menu list-unstyled">
          {othersMenuItems.map((elm, i) => (
            <li key={i} className="sub-menu__item">
              <Link
                href={elm.href}
                className={`menu-link menu-link_us-s ${
                  isMenuActive(elm.href) ? "menu-active" : ""
                }`}
              >
                {elm.title}
              </Link>
            </li>
          ))}
        </ul>
        {/* <!-- /.box-menu --> */}
      </li>
      <li className="navigation__item">
        <Link
          href="/about"
          className={`navigation__link ${
            pathname == "/about" ? "menu-active" : ""
          }`}
        >
          About
        </Link>
      </li>
      <li className="navigation__item">
        <Link
          href="/contact"
          className={`navigation__link ${
            pathname == "/contact" ? "menu-active" : ""
          }`}
        >
          Contact
        </Link>
      </li>
    </>
  );
}
