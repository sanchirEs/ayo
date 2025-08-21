"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export default function FlashSaleProducts() {
  const [active, setActive] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const a = await api.flashSale.active();
        if ((a?.data ?? a)?.active) {
          setActive(true);
          const res = await api.flashSale.products({ limit: 20 });
          setList(res?.data ?? res ?? []);
        }
      } catch {}
    })();
  }, []);

  if (!active || list.length === 0) return null;

  return (
    <section className="products-carousel container">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="section-title text-uppercase fs-25 fw-medium m-0">Flash Sale - Limited Time!</h2>
        <Link href="/deals" className="btn btn-link">View All</Link>
      </div>

      <Swiper modules={[Navigation]} slidesPerView={2} spaceBetween={14} navigation
              breakpoints={{768:{slidesPerView:3, spaceBetween:24}, 992:{slidesPerView:5, spaceBetween:30}}}>
        {list.map((p) => {
          const img = p.image_url || p.images?.[0]?.url || "/images/placeholder-330x400.png";
          const price = p.sale_price ?? p.price;
          const old = p.sale_price ? p.price : null;
          const discount = p.discount_percentage ?? (old ? Math.round((1 - price/old)*100) : null);

          return (
            <SwiperSlide key={p.id}>
              <div className="product-card">
                <div className="pc__img-wrapper position-relative">
                  <Link href={`/product1_simple/${p.id}`}>
                    <Image src={img} alt={p.name} width={330} height={400} className="pc__img" />
                  </Link>
                  {discount ? (
                    <span className="pc-label pc-label_sale position-absolute top-0 end-0 m-2 text-white">-{discount}%</span>
                  ) : null}
                  <button className="btn btn-dark btn-sm position-absolute bottom-0 start-0 end-0 m-2">Add to Cart</button>
                </div>
                <div className="pc__info text-center">
                  <h6 className="pc__title"><Link href={`/product1_simple/${p.id}`}>{p.name}</Link></h6>
                  <div className="product-card__price d-flex justify-content-center gap-2">
                    {old && <span className="price price-old">${old}</span>}
                    <span className="price price-sale fw-semibold">${price}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
