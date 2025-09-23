"use client";

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
  const [isAllCatsHovered, setIsAllCatsHovered] = useState(false);

  // Function to get arrow icon for БҮХ АНГИЛАЛ
  const getArrowIcon = (isHovered = false) => {
    return (
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        className="ms-1 transition-transform duration-200"
        style={{ 
          transform: isHovered ? 'rotate(180deg)' : 'rotate(0deg)',
          color: 'var(--color-text)'
        }}
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
    );
  };


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

  // Function to close mega menu
  const closeMegaMenu = () => {
    setIsAllCatsOpen(false);
    setIsAllCatsHovered(false);
  };

  // Recursive nested list for unlimited depth
  function CategoryList({ nodes, linkClassName = "" }) {
    if (!nodes || nodes.length === 0) return null;
    return (
      <ul className="sub-menu__list list-unstyled" >
        {nodes.map((n) => {
          const href = `/category/${n.id}`;
          return (
            <li key={n.id} className="sub-menu__item">
              <Link
                href={href}
                className={`menu-link menu-link_us-s ${
                  isMenuActive(href) ? "menu-active" : ""
                } ${linkClassName}`}
                onClick={closeMegaMenu}
                style={{
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem',
                  padding: '4px 0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--color-text)';
                }}
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
        <li className="navigation__link" style={{ color: 'var(--color-text-light)' }}>{catErr}</li>
      ) : (
        <>
          {/* БҮХ АНГИЛАЛ - Mega menu */}
          <li
            className="navigation__item"
            onMouseEnter={() => {
              setIsAllCatsOpen(true);
              setIsAllCatsHovered(true);
            }}
            onMouseLeave={() => {
              setIsAllCatsOpen(false);
              setIsAllCatsHovered(false);
            }}
          >
            <Link 
              href="#" 
              className="navigation__link d-flex align-items-center"
              style={{
                color: 'var(--color-text)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                padding: '6px 16px 6px 0',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '0.85rem',
                marginRight: '24px'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--color-primary)';
                e.target.style.backgroundColor = 'rgba(47, 79, 47, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--color-text)';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              БҮХ АНГИЛАЛ
              {getArrowIcon(isAllCatsHovered)}
            </Link>
           
            {isAllCatsOpen && (
              <div 
                className="mega-menu mega-menu--allcats"
                style={{
                  backgroundColor: "#F4F7F5",
                  border: '1px solid rgba(47, 79, 47, 0.1)',
                  // borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  // padding: '20px',
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  zIndex: 1000,
                  minWidth: '800px',
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitScrollbar: { display: 'none' }
                }}
              >
                <div className="container d-flex">
                  {/* Left: root categories list */}
                  <div className="col-2.5 pe-4 allcats__left" style={{ 
                    maxHeight: '60vh', 
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitScrollbar: { display: 'none' }
                  }}>
                    <ul className="list-unstyled m-0">
                      {catTree.map((root) => (
                        <li
                          key={root.id}
                          onMouseEnter={() => setActiveRootId(root.id)}
                          className={`sub-menu__item ${
                            activeRootId === root.id ? "menu-active is-active" : ""
                          }`}
                          style={{
                            // padding: '8px 0',
                            borderBottom: '1px solid rgba(47, 79, 47, 0.05)'
                          }}
                        >
                          <Link
                            href={`/shop/${root.id}`}
                            className="menu-link sub-menu__title"
                            onClick={closeMegaMenu}
                            style={{
                              color: activeRootId === root.id ? 'var(--color-primary)' : 'var(--color-text)',
                              textDecoration: 'none',
                              transition: 'color 0.3s ease',
                              fontWeight: activeRootId === root.id ? '600' : '400',
                              fontSize: '0.95rem'
                            }}
                          >
                            {root.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: active root details */}
                  <div className="col allcats__right" style={{ 
                    maxHeight: '60vh', 
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitScrollbar: { display: 'none' }
                  }}>
                    {(() => {
                      const active = catTree.find((r) => r.id === activeRootId);
                      if (!active) return null;
                      return (
                        <div>
                          <div 
                            className="sub-menu__title mb-3 allcats__right-title"
                            style={{
                              color: 'var(--color-primary)',
                              fontWeight: '600',
                              fontSize: '1.1rem',
                              borderBottom: '2px solid var(--color-primary)',
                              // paddingBottom: '8px'
                            }}
                          >
                            {active.name}
                          </div>
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
                                          <li key={leaf.id} className="sub-menu__item" style={{ padding: '4px 0' }}>
                                            <Link 
                                              href={`/shop/${leaf.id}`} 
                                              className="menu-link menu-link_us-s sub-menu__title allcats__leaf-bold"
                                              onClick={closeMegaMenu}
                                              style={{
                                                color: 'var(--color-text)',
                                                textDecoration: 'none',
                                                transition: 'color 0.3s ease',
                                                fontWeight: '500',
                                                fontSize: '0.9rem'
                                              }}
                                              onMouseEnter={(e) => {
                                                e.target.style.color = 'var(--color-primary)';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.target.style.color = 'var(--color-text)';
                                              }}
                                            >
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
                                                                              <Link 
                                          href={`/shop/${child.id}`} 
                                          className="sub-menu__title allcats__leaf-bold"
                                          onClick={closeMegaMenu}
                                          style={{
                                            color: 'var(--color-primary)',
                                            textDecoration: 'none',
                                            transition: 'color 0.3s ease',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                            display: 'block',
                                            // marginBottom: '8px'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.color = 'var(--color-secondary)';
                                          }}
                                        onMouseLeave={(e) => {
                                          e.target.style.color = 'var(--color-primary)';
                                        }}
                                      >
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

          {/* Specific categories in order */}
          {(() => {
            const specificCategories = [
              'Хямдралын багц',
              'Арьс арчилгаа',
              'Нүүр будалт',
              'Үнэртэн',
              'Маск',
              'Үс, хуйх эмчилгээ'
              // 'Эмэгтэйчүүдийн бүтээгдэхүүн'
            ];
            
            return specificCategories.map((categoryName, index) => {
              const category = catTree.find(cat => cat.name === categoryName);
              if (!category) return null;
              
              return (
                <li key={category.id} className="navigation__item">
                  <Link 
                    href={`/shop/${category.id}`} 
                    className="navigation__link"
                    onClick={closeMegaMenu}
                    style={{
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      padding: '6px 8px 6px 8px',   
                      borderRadius: '6px',
                      fontWeight: '500',
                      fontSize: '0.85rem',
                      marginRight: '24px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--color-primary)';
                      e.target.style.backgroundColor = 'rgba(47, 79, 47, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--color-text)';
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    {category.name}
                  </Link>
                </li>
              );
            });
          })()}
        </>
      )}
    </>
  );
}
