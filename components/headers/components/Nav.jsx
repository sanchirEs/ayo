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
  const [isAllCatsOpen, setIsAllCatsOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState(null);

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
  function CategoryList({ nodes, linkClassName = "" }) {
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
                } ${linkClassName}`}
              >
                {n.name}
              </Link>

              {n.children && n.children.length > 0 && (
                <CategoryList nodes={n.children} linkClassName={linkClassName} />
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  // When categories arrive, select the first root as active by default
  useEffect(() => {
    if (Array.isArray(catTree) && catTree.length > 0 && !activeRootId) {
      setActiveRootId(catTree[0].id);
    }
  }, [catTree, activeRootId]);

  return (
    <>
      {catErr ? (
        <li className="navigation__link">{catErr}</li>
      ) : (
        <>
          {/* БҮХ АНГИЛАЛ - Mega menu */}
          <li
            className="navigation__item"
            onMouseEnter={() => setIsAllCatsOpen(true)}
            onMouseLeave={() => setIsAllCatsOpen(false)}
          >
            <Link href="#" className="navigation__link">
              БҮХ АНГИЛАЛ
            </Link>

            {isAllCatsOpen && (
              <div className="mega-menu mega-menu--allcats">
                <div className="container d-flex">
                  {/* Left: root categories list */}
                  <div className="col-2 pe-4 allcats__left">
                    <ul className="list-unstyled m-0">
                      {catTree.map((root) => (
                        <li
                          key={root.id}
                          onMouseEnter={() => setActiveRootId(root.id)}
                          className={`sub-menu__item ${
                            activeRootId === root.id ? "menu-active is-active" : ""
                          }`}
                        >
                          <Link
                            href={`/shop-4/${root.id}`}
                            className="menu-link  sub-menu__title"
                          >
                            {root.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: active root details */}
                  <div className="col allcats__right">
                    {(() => {
                      const active = catTree.find((r) => r.id === activeRootId);
                      if (!active) return null;
                      return (
                        <div>
                          <div className="sub-menu__title mb-3 allcats__right-title">{active.name} </div>
                          <div className="d-flex flex-wrap">
                            {(() => {
                              const children = Array.isArray(active.children) ? active.children : [];
                              const withKids = children.filter((c) => Array.isArray(c.children) && c.children.length > 0);
                              const withoutKids = children.filter((c) => !Array.isArray(c.children) || c.children.length === 0);
                              return (
                                <>
                                  {/* One column list for items without children */}
                                  {withoutKids.length > 0 && (
                                    <div className="col pe-4 mb-4">
                                      <ul className="sub-menu__list list-unstyled">
                                        {withoutKids.map((leaf) => (
                                          <li key={leaf.id} className="sub-menu__item">
                                            <Link href={`/shop-4/${leaf.id}`} className="menu-link menu-link_us-s sub-menu__title allcats__leaf-bold">
                                              {leaf.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Each item with children goes to its own column with its children below */}
                                  {withKids.map((child) => (
                                    <div key={child.id} className="col pe-4 mb-4">
                                      <Link href={`/shop-4/${child.id}`} className="sub-menu__title allcats__leaf-bold">
                                        {child.name}
                                      </Link>
                                      <CategoryList nodes={child.children} linkClassName="allcats__nested-link" />
                                    </div>
                                  ))}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* First 6 root categories as regular nav items */}
          {catTree.slice(0, 6).map((root) => (
            <li key={root.id} className="navigation__item">
              <Link href={`/shop-4/${root.id}`} className="navigation__link">
                {root.name}
              </Link>

            </li>
          ))}
        </>
      )}
    </>
  );
}
