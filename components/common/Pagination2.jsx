"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Props
 * - totalPages: нийт хуудас
 * - currentPage?: гаднаас өгвөл controlled горим болно
 * - onChange?: (page:number) => void   // гаднаас солих функц
 * - syncQuery?: boolean                 // URL ?page=...-тай sync хийх эсэх (optional)
 * - queryKey?: string                   // default: "page"
 */
export default function Pagination2({
  totalPages = 1,
  currentPage: controlledPage,
  onChange,
  syncQuery = false,
  queryKey = "page",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // uncontrolled fallback
  const [page, setPage] = useState(controlledPage ?? 1);
  useEffect(() => {
    if (typeof controlledPage === "number") setPage(controlledPage);
  }, [controlledPage]);

  const currentPage = page;

  const go = (p) => {
    if (p < 1 || p > totalPages || p === currentPage) return;

    // parent-д мэдэгдэнэ
    if (onChange) onChange(p);
    // uncontrolled бол дотроо state сольдог
    if (!onChange) setPage(p);

    // URL-тэй sync (reload хийлгүй)
    if (syncQuery) {
      const sp = new URLSearchParams(searchParams?.toString() || "");
      if (p === 1) sp.delete(queryKey);
      else sp.set(queryKey, String(p));
      router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false });
    }
  };

  return (
    <nav className="shop-pages d-flex justify-content-between mt-3" aria-label="Page navigation">
      <a
        href="#"
        className={`btn-link d-inline-flex align-items-center ${currentPage === 1 ? "disabled" : ""}`}
        onClick={(e) => { e.preventDefault(); go(currentPage - 1); }}
        aria-disabled={currentPage === 1}
      >
        <svg className="me-1" width="7" height="11" viewBox="0 0 7 11"><use href="#icon_prev_sm" /></svg>
        <span className="fw-medium">PREV</span>
      </a>

      <ul className="pagination mb-0">
        {Array.from({ length: totalPages }, (_, index) => {
          const p = index + 1;
          return (
            <li key={p} className="page-item">
              <a
                className={`btn-link px-1 mx-2 ${currentPage === p ? "btn-link_active" : ""}`}
                href="#"
                onClick={(e) => { e.preventDefault(); go(p); }}
                aria-current={currentPage === p ? "page" : undefined}
              >
                {p}
              </a>
            </li>
          );
        })}
      </ul>

      <a
        href="#"
        className={`btn-link d-inline-flex align-items-center ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={(e) => { e.preventDefault(); go(currentPage + 1); }}
        aria-disabled={currentPage === totalPages}
      >
        <span className="fw-medium me-1">NEXT</span>
        <svg width="7" height="11" viewBox="0 0 7 11"><use href="#icon_next_sm" /></svg>
      </a>
    </nav>
  );
}
