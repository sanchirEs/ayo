"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useShopRoute() {
  const pathname = usePathname();
  return useMemo(() => {
    const isShopRoute = pathname.startsWith('/shop/');
    const isProductRoute = pathname.startsWith('/product1_simple/');
    let categoryId = null;
    let productId = null;
    
    if (isShopRoute) {
      const match = pathname.match(/^\/shop\/(\d+)/);
      if (match) {
        categoryId = parseInt(match[1]);
      }
    }
    
    if (isProductRoute) {
      const match = pathname.match(/^\/product1_simple\/(\d+)/);
      if (match) {
        productId = parseInt(match[1]);
      }
    }
    
    return {
      isShopRoute,
      isProductRoute,
      categoryId,
      productId,
      pathname
    };
  }, [pathname]);
}
