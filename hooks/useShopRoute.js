"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useShopRoute() {
  const pathname = usePathname();
  
  return useMemo(() => {
    // Check if current path is a shop route
    const isShopRoute = pathname.startsWith('/shop/');
    
    // Extract category ID if it exists
    let categoryId = null;
    if (isShopRoute) {
      const match = pathname.match(/^\/shop\/(\d+)/);
      if (match) {
        categoryId = parseInt(match[1]);
      }
    }
    
    return {
      isShopRoute,
      categoryId,
      pathname
    };
  }, [pathname]);
}
