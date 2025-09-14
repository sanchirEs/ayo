"use client";
import { useShopRoute } from "@/hooks/useShopRoute";
import MobileHeader from "./MobileHeader";
import UnifiedMobileHeader from "./UnifiedMobileHeader";

export default function HeaderWrapper() {
  const { isShopRoute, isProductRoute, isCartRoute, isCheckoutRoute, isStoreLocationsRoute, isDashboardRoute, categoryId, productId, dashboardTitle } = useShopRoute();
  
  // Check specific routes first (more specific before general)
  if (isCartRoute) {
    return <UnifiedMobileHeader title="Сагс" titleType="static" />;
  }
  
  if (isCheckoutRoute) {
    return <UnifiedMobileHeader title="Миний захиалга" titleType="static" />;
  }
  
  if (isProductRoute) {
    return <UnifiedMobileHeader titleType="product" productId={productId} />;
  }
  
  if (isStoreLocationsRoute) {
    return <UnifiedMobileHeader title="Салбарууд" titleType="static" />;
  }
  
  if (isDashboardRoute) {
    return <UnifiedMobileHeader title={dashboardTitle} titleType="static" />;
  }
  
  if (isShopRoute) {
    return <UnifiedMobileHeader titleType="category" categoryId={categoryId} />;
  }
  
  return <MobileHeader />;
}
