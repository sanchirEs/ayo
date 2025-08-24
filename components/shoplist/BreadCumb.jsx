"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function BreadCumb() {
  const params = useParams();
  const categoryId = params?.categoryId ? parseInt(params.categoryId) : null;
  const [categoryInfo, setCategoryInfo] = useState({ name: "", parent: null });
  const [loading, setLoading] = useState(false);

  // Find category and its parent from the tree
  const findCategoryPath = async (targetId) => {
    try {
      const res = await api.categories.getTree();
      const categories = res?.data ?? res;
      
      const findCategory = (cats, target, parent = null) => {
        for (const category of cats) {
          if (category.id === target) {
            return { category, parent };
          }
          if (category.children) {
            const result = findCategory(category.children, target, category);
            if (result) return result;
          }
        }
        return null;
      };

      const result = findCategory(categories, targetId);
      return result;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      return null;
    }
  };

  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      findCategoryPath(categoryId)
        .then(result => {
          if (result) {
            setCategoryInfo({
              name: result.category.name,
              parent: result.parent
            });
          } else {
            // Fallback: try to get category directly
            api.categories.getById(categoryId)
              .then(response => {
                if (response.success && response.data) {
                  setCategoryInfo({
                    name: response.data.name,
                    parent: null
                  });
                }
              })
              .catch(error => {
                console.error('Error fetching category:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error finding category path:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCategoryInfo({ name: "", parent: null });
    }
  }, [categoryId]);

  return (
    <>
      <Link href="/" className="menu-link menu-link_us-s text-uppercase fw-medium">
        Нүүр
      </Link>
      <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
        /
      </span>
      <Link href="/shop-4" className="menu-link menu-link_us-s text-uppercase fw-medium">
        Дэлгүүр
      </Link>
      {categoryId && (
        <>
          <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
            /
          </span>
          {loading ? (
            <span className="menu-link menu-link_us-s text-uppercase fw-medium">
              Ачаалж байна...
            </span>
          ) : (
            <>
              {categoryInfo.parent && (
                <>
                  <Link 
                    href={`/shop-4/${categoryInfo.parent.id}`}
                    className="menu-link menu-link_us-s text-uppercase fw-medium"
                  >
                    {categoryInfo.parent.name}
                  </Link>
                  <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
                    /
                  </span>
                </>
              )}
              <span className="menu-link menu-link_us-s text-uppercase fw-medium">
                {categoryInfo.name || "Ангилал"}
              </span>
            </>
          )}
        </>
      )}
    </>
  );
}
