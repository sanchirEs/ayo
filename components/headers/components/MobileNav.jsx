"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { useContextElement } from "@/context/Context";

export default function MobileNav() {
  const pathname = usePathname();
  const { setCurrentCategory } = useContextElement();
  const [catTree, setCatTree] = useState([]);
  const [catErr, setCatErr] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const isMenuActive = (menu) => {
    return menu.split("/")[1] == pathname.split("/")[1];
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
        <div className="d-flex align-items-center" >
          <Link
            href={`/shop/${category.id}`}
            className="navigation__link flex-grow-1"
            style={{ 
              paddingLeft: `${paddingLeft}px`,
              color: '#333',
              textDecoration: 'none',
              fontSize: '0.9rem',
              padding: '8px 0',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => handleCategoryClick(category)}
          >
            <span>{category.name}</span>
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="btn btn-link p-0 border-0 bg-transparent ms-2"
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

  // Function to close mobile menu when link is clicked
  const closeMobileMenu = () => {
    if (document.body.classList.contains("mobile-menu-opened")) {
      document.body.classList.remove("mobile-menu-opened");
      document.body.style.paddingRight = "";
      const mobileDropdown = document.querySelector(".navigation");
      if (mobileDropdown) {
        mobileDropdown.style.paddingRight = "";
      }
    }
  };

  // Function to handle category click and save to context
  const handleCategoryClick = (category) => {
    setCurrentCategory({
      id: category.id,
      name: category.name
    });
    closeMobileMenu();
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

      {/* Specific categories in order - same as Nav.jsx */}
    

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
