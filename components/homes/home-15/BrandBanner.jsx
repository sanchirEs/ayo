"use client";

import Image from 'next/image';
import Link from 'next/link';

/**
 * BrandBanner Component
 * Replaces BrandProduct/BrandProduct2 - same visual output, no wasted API calls
 * ✅ OPTIMIZATION: Removed data fetching that wasn't used
 * ❌ UI: Unchanged from original
 */
export default function BrandBanner({ image, alt = "Brand Banner", link, height = 600 }) {
  const bannerContent = (
    <div className="">
      <div className="overflow-hidden position-relative h-100">
        <div className="slideshow-bg ">
          <Image
            loading="lazy"
            src={image}
            width={1920}
            height={height}
            alt={alt}
            className="slideshow-bg__img object-fit-cover"
            quality={85}
          />
        </div>
        <div className="slideshow-text container position-absolute start-100 top-50 translate-middle">
          {/* Empty - matching original BrandProduct design */}
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <section className="converse-brand-section">
        <Link href={link}>
          {bannerContent}
        </Link>
      </section>
    );
  }

  return (
    <section className="converse-brand-section">
      {bannerContent}
    </section>
  );
}
