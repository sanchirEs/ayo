"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

export default function CategoriesGrid() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.categories.main()
      .then((res) => setItems(res?.data ?? res ?? []))
      .catch((e) => setErr(e.message || "Failed to load categories"));
  }, []);

  return (
    <section className="container">
      <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">Онцлох ангиллууд</h2>
      {err && <p className="text-danger text-center">{err}</p>}
      <div className="row row-cols-2 row-cols-md-4 g-3 g-md-4">
        {items.slice(0,8).map((c) => (
          <div key={c.id} className="col">
            <Link href={`/category/${c.id}`} className="d-block text-center rounded-3 p-2 bg-white shadow-sm h-100">
              <Image src={c.image_url || "/images/placeholder-330x400.png"} width={330} height={200} alt={c.name} className="w-100 rounded-3" />
              <div className="mt-2 small fw-semibold text-dark">{c.name}</div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
