"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

export default function MobileNav() {
  const pathname = usePathname();
  const [catTree, setCatTree] = useState([]);
  const [catErr, setCatErr] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const isMenuActive = (menu) => {
    return menu.split("/")[1] == pathname.split("/")[1];
  };

  // Function to get appropriate icon for category
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('арьс') || name.includes('нүүр')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      );
    } else if (name.includes('бие') || name.includes('биеийн')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    } else if (name.includes('будалт') || name.includes('будаг')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    } else if (name.includes('өсвөр') || name.includes('нас')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      );
    } else if (name.includes('уруул') || name.includes('уруулын')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    } else if (name.includes('хувцас') || name.includes('хувцасны')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
          <path d="M21.6 18.2L13 11.75v-.91c1.65-.49 2.8-2.17 2.43-4.05-.26-1.31-1.3-2.4-2.61-2.7C10.54 3.57 8.5 5.3 8.5 7.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .84-.69 1.52-1.53 1.5-.54-.01-.97.45-.97.99v1.76L2.4 18.2c-.77.58-.36 1.8.6 1.8h18c.96 0 1.37-1.22.6-1.8zM6 18l6-4.5 6 4.5H6z"/>
        </svg>
      );
    } else {
      // Default icon for other categories
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }
  };

  // Function to get arrow icon
  const getArrowIcon = (isExpanded = false) => {
    return (
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        className="ms-auto transition-transform duration-200"
        style={{ 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
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

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Recursive component for rendering nested categories
  const CategoryItem = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const paddingLeft = level * 20; // 20px indent per level

    return (
      <li className="navigation__item">
        <div 
          className="navigation__link d-flex align-items-center"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {/* {getCategoryIcon(category.name)} */}
          <span className="flex-grow-1">{category.name}</span>
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="btn btn-link p-0 border-0 bg-transparent"
              style={{ minWidth: 'auto' }}
            >
              {getArrowIcon(isExpanded)}
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <ul className="list-unstyled ms-3">
            {category.children.map((child) => (
              <CategoryItem 
                key={child.id} 
                category={child} 
                level={level + 1} 
              />
            ))}
          </ul>
        )}
      </li>
    );
  };

  useEffect(() => {
    const selectors = {
      mobileMenuActivator: ".mobile-nav-activator",
      mobileMenu: ".navigation",
      mobileMenuActiveClass: "mobile-menu-opened",
    };

    const mobileMenuActivator = document.querySelector(
      selectors.mobileMenuActivator
    );
    const mobileDropdown = document.querySelector(selectors.mobileMenu);

    const toggleMobileMenu = (event) => {
      if (event) {
        event.preventDefault();
      }

      if (document.body.classList.contains(selectors.mobileMenuActiveClass)) {
        document.body.classList.remove(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "";
        mobileDropdown.style.paddingRight = "";
      } else {
        document.body.classList.add(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "scrollWidth";
        mobileDropdown.style.paddingRight = "scrollWidth";
      }
    };

    if (mobileDropdown) {
      mobileMenuActivator &&
        mobileMenuActivator.addEventListener("click", toggleMobileMenu);

      return () => {
        mobileMenuActivator &&
          mobileMenuActivator.removeEventListener("click", toggleMobileMenu);
      };
    }
  }, []);

  useEffect(() => {
    const selectors = {
      mobileMenuActivator: ".mobile-nav-activator",
      mobileMenu: ".navigation",
      mobileMenuActiveClass: "mobile-menu-opened",
    };

    const mobileDropdown = document.querySelector(selectors.mobileMenu);

    const removeMenu = (event) => {
      if (event) {
        event.preventDefault();
      }

      if (document.body.classList.contains(selectors.mobileMenuActiveClass)) {
        document.body.classList.remove(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "";
        mobileDropdown.style.paddingRight = "";
      }
    };
    removeMenu();
  }, [pathname]);

  if (catErr) {
    return (
      <li className="navigation__item">
        <div className="navigation__link text-danger">
          {catErr}
        </div>
      </li>
    );
  }

  return (
    <>
      {/* All Categories Section */}
      <li className="navigation__item">
        {/* <div className="navigation__link d-flex align-items-center border-bottom">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-2">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          <span className="flex-grow-1">БҮХ АНГИЛАЛ</span>
        </div> */}
      </li>

      {/* Dynamic Categories */}
      {catTree.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}

      {/* Static Menu Items */}
      {/* <li className="navigation__item">
        <Link
          href="/about"
          className={`navigation__link ${
            pathname == "/about" ? "menu-active" : ""
          }`}
        >
          About
        </Link>
      </li>
      <li className="navigation__item">
        <Link
          href="/contact"
          className={`navigation__link ${
            pathname == "/contact" ? "menu-active" : ""
          }`}
        >
          Contact
        </Link>
      </li> */}
    </>
  );
}
