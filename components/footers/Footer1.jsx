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

export default function Footer1() {
  return (
    <footer className="footer footer_type_1" style={{
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      borderTop: '1px solid rgba(47, 79, 47, 0.1)'
    }}>
      <div className="footer-middle container">
        <div className="row row-cols-lg-5 row-cols-2">
          <div className="footer-column footer-store-info col-12 mb-4 mb-lg-0">
            <div className="logo">
              <Link href="/">
                <Image
                  src="/assets/images/logo.png"
                  width={112}
                  height={28}
                  alt="Uomo"
                  className="logo__image d-block"
                />
              </Link>
            </div>
            {/* <!-- /.logo --> */}
            <p className="footer-address" style={{ color: 'var(--color-text-light)' }}>
              1418 River Drive, Suite 35 Cottonhall, CA 9622 United States
            </p>

            <p className="m-0">
              <strong className="fw-medium" style={{ color: 'var(--color-primary)' }}>sale@uomo.com</strong>
            </p>
            <p>
              <strong className="fw-medium" style={{ color: 'var(--color-primary)' }}>+1 246-345-0695</strong>
            </p>

            <ul className="social-links list-unstyled d-flex flex-wrap mb-0">
              {socialLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="footer__social-link d-block"
                    style={{
                      color: 'var(--color-secondary)',
                      transition: 'color 0.3s ease',
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(106, 142, 90, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--color-primary)';
                      e.target.style.backgroundColor = 'rgba(47, 79, 47, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--color-secondary)';
                      e.target.style.backgroundColor = 'rgba(106, 142, 90, 0.1)';
                    }}
                  >
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
            <h5 className="sub-menu__title text-uppercase" style={{ 
              color: 'var(--color-primary)', 
              fontWeight: '600',
              marginBottom: '1.5rem',
              fontSize: '1.1rem'
            }}>Company</h5>
            <ul className="sub-menu__list list-unstyled">
              {footerLinks1.map((elm, i) => (
                <li key={i} className="sub-menu__item" style={{ marginBottom: '0.75rem' }}>
                  <Link 
                    href={elm.href} 
                    className="menu-link menu-link_us-s"
                    style={{
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--color-text)';
                    }}
                  >
                    {elm.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}
          <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h5 className="sub-menu__title text-uppercase" style={{ 
              color: 'var(--color-primary)', 
              fontWeight: '600',
              marginBottom: '1.5rem',
              fontSize: '1.1rem'
            }}>Shop</h5>
            <ul className="sub-menu__list list-unstyled">
              {footerLinks2.map((elm, i) => (
                <li key={i} className="sub-menu__item" style={{ marginBottom: '0.75rem' }}>
                  <Link 
                    href={elm.href} 
                    className="menu-link menu-link_us-s"
                    style={{
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--color-text)';
                    }}
                  >
                    {elm.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}
          <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h5 className="sub-menu__title text-uppercase" style={{ 
              color: 'var(--color-primary)', 
              fontWeight: '600',
              marginBottom: '1.5rem',
              fontSize: '1.1rem'
            }}>Help</h5>
            <ul className="sub-menu__list list-unstyled">
              {footerLinks3.map((elm, i) => (
                <li key={i} className="sub-menu__item" style={{ marginBottom: '0.75rem' }}>
                  <Link 
                    href={elm.href} 
                    className="menu-link menu-link_us-s"
                    style={{
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--color-text)';
                    }}
                  >
                    {elm.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}
          <div className="footer-column footer-newsletter col-12 mb-4 mb-lg-0">
            <h5 className="sub-menu__title text-uppercase" style={{ 
              color: 'var(--color-primary)', 
              fontWeight: '600',
              marginBottom: '1.5rem',
              fontSize: '1.1rem'
            }}>Subscribe</h5>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
              Be the first to get the latest news about trends, promotions, and
              much more!
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="footer-newsletter__form position-relative bg-body"
              style={{ marginBottom: '2rem' }}
            >
              <input
                className="form-control border-white"
                type="email"
                name="email"
                placeholder="Your email address"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(47, 79, 47, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.95rem'
                }}
              />
              <input
                className="btn-link fw-medium bg-white position-absolute top-0 end-0 h-100"
                type="submit"
                defaultValue="JOIN"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 20px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-primary)';
                }}
              />
            </form>

            <div className="mt-4 pt-3">
              <strong className="fw-medium" style={{ color: 'var(--color-primary)' }}>Secure payments</strong>
              <p className="mt-2">
                <Image
                  loading="lazy"
                  width={324}
                  height={38}
                  src="/assets/images/payment-options.png"
                  alt="Acceptable payment gateways"
                  className="mw-100"
                />
              </p>
            </div>
          </div>
          {/* <!-- /.footer-column --> */}
        </div>
        {/* <!-- /.row-cols-5 --> */}
      </div>
      {/* <!-- /.footer-middle container --> */}

      <div className="footer-bottom container" style={{
        borderTop: '1px solid rgba(47, 79, 47, 0.1)',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem'
      }}>
        <div className="d-block d-md-flex align-items-center">
          <span className="footer-copyright me-auto" style={{ color: 'var(--color-text-light)' }}>
            ©{new Date().getFullYear()} Uomo
          </span>
          <div className="footer-settings d-block d-md-flex align-items-center">
            <div className="d-flex align-items-center">
              <label
                htmlFor="footerSettingsLanguage"
                className="me-2 text-secondary"
                style={{ color: 'var(--color-text-light)' }}
              >
                Language
              </label>
              <select
                id="footerSettingsLanguage"
                className="form-select form-select-sm bg-transparent"
                aria-label="Default select example"
                name="store-language"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(47, 79, 47, 0.2)',
                  borderRadius: '4px',
                  color: 'var(--color-text)',
                  padding: '4px 8px'
                }}
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
              </select>
            </div>

            <div className="d-flex align-items-center">
              <label
                htmlFor="footerSettingsCurrency"
                className="ms-md-3 me-2 text-secondary"
                style={{ color: 'var(--color-text-light)' }}
              >
                Currency
              </label>
              <select
                id="footerSettingsCurrency"
                className="form-select form-select-sm bg-transparent"
                aria-label="Default select example"
                name="store-language"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(47, 79, 47, 0.2)',
                  borderRadius: '4px',
                  color: 'var(--color-text)',
                  padding: '4px 8px'
                }}
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
            </div>
          </div>
          {/* <!-- /.footer-settings --> */}
        </div>
        {/* <!-- /.d-flex --> */}
      </div>
      {/* <!-- /.footer-bottom container --> */}
    </footer>
  );
}
