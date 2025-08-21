"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

export default function DealsGrid() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.products.discounted({ limit: 20 })
      .then((res) => setList(res?.data ?? res ?? []))
      .catch((e) => setErr(e.message || "Failed to load deals"));
  }, []);

  return (
    <section className="container">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="section-title text-uppercase fs-25 fw-medium m-0">Great Deals</h2>
        <Link href="/deals" className="btn btn-link">View All Deals</Link>
      </div>

      {err && <p className="text-danger">{err}</p>}
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
        {list.map((p) => {
          const img = p.image_url || p.images?.[0]?.url || "/images/placeholder-330x400.png";
          const price = p.sale_price ?? p.price;
          const old = p.sale_price ? p.price : null;
          const discount = p.discount_percentage ?? (old ? Math.round((1 - price/old)*100) : null);
          return (
            <div key={p.id} className="col">
              <div className="product-card h-100">
                <Link href={`/product1_simple/${p.id}`}>
                  <Image src={img} width={330} height={400} alt={p.name} className="w-100 rounded-3" />
                </Link>
                <div className="pc__info mt-2">
                  <h6 className="pc__title"><Link href={`/product1_simple/${p.id}`}>{p.name}</Link></h6>
                  <div className="d-flex gap-2 align-items-baseline">
                    {old && <span className="price price-old">${old}</span>}
                    <span className="price price-sale fw-semibold">${price}</span>
                    {discount ? <span className="badge bg-danger-subtle text-danger ms-auto">-{discount}%</span> : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
