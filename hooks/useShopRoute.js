"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useShopRoute() {
  const pathname = usePathname();
  return useMemo(() => {
    const isShopRoute = pathname.startsWith('/shop');
    const isProductRoute = pathname.startsWith('/product1_simple/');
    const isCartRoute = pathname.startsWith('/shop_cart');
    const isCheckoutRoute = pathname.startsWith('/shop_checkout');
    const isStoreLocationsRoute = pathname.startsWith('/store-locations');
    const isDashboardRoute = pathname.startsWith('/account_');
    let categoryId = null;
    let productId = null;
    let dashboardTitle = null;
    
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
    
    if (isDashboardRoute) {
      // Map dashboard routes to titles
      const titleMap = {
        '/account_edit': 'Профайл дэлгэрэнгүй',
        '/account_orders': 'Миний захиалгууд',
        '/account_edit_address': 'Хаягийн мэдээлэл',
        '/account_wishlist': 'Хүслийн жагсаалт'
      };
      
      // Check for dynamic order detail route
      if (pathname.startsWith('/account_orders/') && pathname !== '/account_orders') {
        dashboardTitle = 'Миний захиалга';
      } else {
        dashboardTitle = titleMap[pathname] || 'Миний профайл';
      }
    }
    
    return {
      isShopRoute,
      isProductRoute,
      isCartRoute,
      isCheckoutRoute,
      isStoreLocationsRoute,
      isDashboardRoute,
      categoryId,
      productId,
      dashboardTitle,
      pathname
    };
  }, [pathname]);
}
