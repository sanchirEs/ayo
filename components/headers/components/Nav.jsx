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
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

export default function Nav() {
  const pathname = usePathname();

  const isMenuActive = (menu) => {
    return menu.split("/")[1] === pathname.split("/")[1];
  };

  // === Categories data from backend (tree or flat) ===
  const [catTree, setCatTree] = useState([]);
  const [catErr, setCatErr] = useState("");

  // If API returns FLAT data, convert to tree
  function buildTree(flat) {
    const byId = new Map();
    flat.forEach((c) => byId.set(c.id, { ...c, children: [] }));

    const roots = [];
    byId.forEach((node) => {
      if (node.parentId == null) {
        roots.push(node);
      } else {
        const parent = byId.get(node.parentId);
        if (parent) parent.children.push(node);
      }
    });
    return roots;
  }

  function ensureTree(data) {
    if (!Array.isArray(data)) return [];
    const looksLikeTree =
      data.length === 0 || typeof data[0]?.children !== "undefined";
    return looksLikeTree ? data : buildTree(data);
  }

  // Load category tree from backend via lib/api.js
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res =
          (await api.categories?.getTree?.()) ??
          (await api.fetch("/categories/tree/all"));
        const payload = res?.data ?? res; // support {data:[...]} or [...]
        const tree = ensureTree(payload);
        if (alive) setCatTree(tree);
      } catch (e) {
        if (alive) setCatErr(e?.message || "Ангилал ачилт алдаа");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Recursive nested list for unlimited depth
  function CategoryList({ nodes }) {
    if (!nodes || nodes.length === 0) return null;
    return (
      <ul className="sub-menu__list list-unstyled">
        {nodes.map((n) => {
          const href = `/category/${n.id}`;
          return (
            <li key={n.id} className="sub-menu__item">
              <Link
                href={href}
                className={`menu-link menu-link_us-s ${
                  isMenuActive(href) ? "menu-active" : ""
                }`}
              >
                {n.name}
              </Link>

              {n.children && n.children.length > 0 && (
                <CategoryList nodes={n.children} />
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      {catErr ? (
        <li className="navigation__link">{catErr}</li>
      ) : (
        catTree.map((root) => (
          <li key={root.id} className="navigation__item">
            <Link href={`/shop-4/${root.id}`} className="navigation__link">
              {root.name}
            </Link>

            {/* Mega menu (show via CSS hover) */}
            {
              root.children.length>0?(
                <div className="mega-menu">
              <div className="container d-flex">
                {/* One column per direct child of ROOT */}
                {root.children?.map((child) => (
                  <div key={child.id} className="col pe-4">
                    <Link
                      href={`/shop-4/${child.id}`}
                      className="sub-menu__title"
                    >
                      {child.name}
                    </Link>

                    {/* Render child's descendants recursively */}
                    <CategoryList nodes={child.children} />
                  </div>
                ))}

                {/* Optional image column
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
                </div> */}
              </div>
            </div>
              ):(
                <div></div>
              )

            }
            
          </li>
        ))
      )}
    </>
  );
}
