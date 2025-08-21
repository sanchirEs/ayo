"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

export default function NewArrivals() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.new({ limit: 20 })
      .then((res) => setList(res?.data ?? res ?? []))
      .catch((e) => setErr(e.message || "Failed to load new products"))
      .finally(() => setLoading(false));
  }, []);

  const opts = useMemo(() => ({
    modules: [Navigation, Autoplay],
    autoplay: { delay: 5000 },
    navigation: true,
    slidesPerView: 2,
    spaceBetween: 14,
    breakpoints: { 768:{slidesPerView:3,spaceBetween:24}, 992:{slidesPerView:5,spaceBetween:30} }
  }), []);

  return (
    <section className="products-carousel container">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="section-title text-uppercase fs-25 fw-medium m-0">New Arrivals</h2>
        <Link href="/new" className="btn btn-link">View All</Link>
      </div>

      {loading ? <p>Loading…</p> : err ? <p className="text-danger">{err}</p> :
        <Swiper {...opts}>
          {list.map((p) => (
            <SwiperSlide key={p.id}>
              <div className="product-card text-center">
                <Link href={`/product1_simple/${p.id}`}>
                  <Image src={p.image_url || p.images?.[0]?.url || "/images/placeholder-330x400.png"}
                         width={330} height={400} alt={p.name} className="pc__img" />
                </Link>
                <div className="pc__info">
                  <p className="pc__category text-secondary">{p.category?.name ?? "—"}</p>
                  <h6 className="pc__title"><Link href={`/product1_simple/${p.id}`}>{p.name}</Link></h6>
                  <div className="product-card__price"><span className="price fw-medium">${p.price}</span></div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      }
    </section>
  );
}
