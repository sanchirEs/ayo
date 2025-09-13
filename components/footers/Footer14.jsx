"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  currencyOptions,
  footerLinks1,
  footerLinks2,
  footerLinks3,
  languageOptions,
  socialLinks,
} from "@/data/footer";

export default function Footer14() {
  return (
    <footer className="footer footer_type_1 dark" style={{backgroundColor: "#495D35"}}>
    
      {/* <!-- /.footer-top container --> */}

      <div className="footer-middle container">
        <div className="row row-cols-lg-5 row-cols-2">
          <div className="footer-column footer-store-info col-12 mb-4 mb-lg-0">
            <div className="logo">
              <Link href="/">
                <Image
                  src="/assets/images/logoAyo.png"
                  width={120}
                  height={60}
                  alt="Ayo"
                  className="logo__image d-block"
                />
              </Link>
            </div>
            {/* <!-- /.logo --> */}
            <p className="footer-address">
               2-р хороо, ЧД, 58-р байр 1 давхар Улаанбаатар хот, Монгол улс
            </p>

            <p className="m-0">
                              <strong className="fw-medium">sanchirenkhamgalan@gmail.com</strong>
            </p>
            <p>
              <strong className="fw-medium">+976 7200 9191</strong>
            </p>

            <ul className="social-links list-unstyled d-flex flex-wrap mb-0">
              {socialLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer__social-link d-block">
                    <svg
                      className={link.className}
                      width={link.width}
                      height={link.height}
                      viewBox={link.viewBox}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {typeof link.icon === "string" ? (
                        <use href={link.icon} />
                      ) : (
                        link.icon
                      )}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}

          <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">ТАНИЛЦУУЛГА</h6>
            <ul className="sub-menu__list list-unstyled">
              <li className="sub-menu__item">
                <Link href="#" className="menu-link menu-link_us-s">
                  Бидний тухай
                </Link>
              </li>
              <li className="sub-menu__item">
                <Link href="/careers" className="menu-link menu-link_us-s">
                  Ажлын анкет
                </Link>
              </li>
              <li className="sub-menu__item">
                <Link href="#" className="menu-link menu-link_us-s">
                  Хүргэлт
                </Link>
              </li>
              <li className="sub-menu__item">
                <Link href="#" className="menu-link menu-link_us-s">
                  Бэлгийн карт
                </Link>
              </li>
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}

      
          {/* <!-- /.footer-column --> */}

          <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">Тусламж</h6>
            <ul className="sub-menu__list list-unstyled">
              <li className="sub-menu__item">
                <Link href="#" className="menu-link menu-link_us-s">
                  Нууцлал
                </Link>
              </li>
              <li className="sub-menu__item">
                <Link href="#" className="menu-link menu-link_us-s">
                  Түгээмэл асуулт, хариулт
                </Link>
              </li>
              <li className="sub-menu__item">
                <Link href="#" className="menu-link menu-link_us-s">
                  Үйлчилгээний нөхцөл
                </Link>
              </li>
              <li className="sub-menu__item">
                <Link href="/return-policy" className="menu-link menu-link_us-s">
                  Бараа буцаалтын журам
                </Link>
              </li>
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}

          <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">САЛБАРЫН БАЙРШИЛ</h6>
            <ul className="sub-menu__list list-unstyled">
              <li className="sub-menu__item">
                <Link href="/store-locations" className="menu-link menu-link_us-s">
                  Салбарын байршил харах
                </Link>
              </li>
            </ul>
          </div>

          {/* <div className="footer-column footer-newsletter col-12 mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">Бүртгүүлэх</h6>
            <p>
              Хямдрал, урамшуулал болон бусад шинэ мэдээллийг хамгийн түрүүнд аваарай!
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="footer-newsletter__form position-relative bg-body"
            >
              <input
                className="form-control border-white"
                type="email"
                name="email"
                placeholder="Таны имэйл хаяг"
              />
              <input
                className="btn-link fw-medium bg-white position-absolute top-0 end-0 h-100"
                type="submit"
                defaultValue="НЭГДЭХ"
              />
            </form>
          </div> */}
          {/* <!-- /.footer-column --> */}
        </div>
        {/* <!-- /.row-cols-5 --> */}
      </div>
      {/* <!-- /.footer-middle container --> */}

      <div className="footer-bottom container">
        <div className="d-block d-md-flex align-items-center">
          <span className="footer-copyright me-auto">
                     Ayo Cosmetics
          </span>
          <div className="footer-settings d-block d-md-flex align-items-center">
            <div className="d-flex align-items-center">
              <label
                htmlFor="footerSettingsLanguage"
                className="me-2 text-white"
              >
                  © {new Date().getFullYear()}.  AIM TRENDSET LLC.  Бүх эрх хуулиар хамгаалагдсан
              </label>
              {/* <select
                id="footerSettingsLanguage"
                className="form-select form-select-sm bg-transparent border-0"
                aria-label="Default select example"
                name="store-language"
              >
                {languageOptions.map((option, index) => (
                  <option
                    key={index}
                    className="footer-select__option"
                    value={option.value}
                  >
                    {option.text}
                  </option>
                ))}
              </select> */}
            </div>

            {/* <div className="d-flex align-items-center">
              <label
                htmlFor="footerSettingsCurrency"
                className="ms-md-3 me-2 text-white"
              >
                Валют
              </label>
              <select
                id="footerSettingsCurrency"
                className="form-select form-select-sm bg-transparent border-0"
                aria-label="Default select example"
                name="store-language"
              >
                {currencyOptions.map((option, index) => (
                  <option
                    key={index}
                    className="footer-select__option"
                    value={option.value}
                  >
                    {option.text}
                  </option>
                ))}
              </select>
            </div> */}
          </div>
          {/* <!-- /.footer-settings --> */}
        </div>
        {/* <!-- /.d-flex --> */}
      </div>
      {/* <!-- /.footer-bottom container --> */}
    </footer>
  );
}
