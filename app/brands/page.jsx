"use client";

import Link from "next/link";
import Image from "next/image";
import { brandImages2 } from "@/data/brands";
import UnifiedMobileHeader from "@/components/headers/UnifiedMobileHeader";

export default function BrandsPage() {
  return (
    <>
      <UnifiedMobileHeader 
        title="БРЭНДҮҮД" 
        titleType="static"
        className="d-lg-none"
      />
      <div className="container py-5 mb-5 mb-lg-0">
      {/* <h1 className="h3 mb-4">Our Brands</h1> */}

      <div className="row g-3">
        {brandImages2.map((brand, i) => (
          <div key={i} className="col-12 col-sm-4 col-md-3">
            <Link
              href={`#`}
              className="card h-100 border-0 shadow-sm d-flex flex-row align-items-center p-3 text-decoration-none text-dark"
            >
              {/* Logo (left side, centered) */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="me-3"
              >
                <Image
                  loading="lazy"
                  src={brand.src}
                  alt="brand"
                  width={brand.width}
                  height={brand.height}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>

              {/* Brand Name (right side) */}
              <h6 className="fw-medium mb-0">{brand.name ?? ""}</h6>
            </Link>
          </div>
        ))}
      </div>
      </div>
    </>
  );
}
