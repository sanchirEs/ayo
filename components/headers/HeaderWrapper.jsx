"use client";

import { useShopRoute } from "@/hooks/useShopRoute";
import MobileHeader from "./MobileHeader";
import CategoryHeader from "../shoplist/CategoryHeader";

export default function HeaderWrapper() {
  const { isShopRoute, categoryId } = useShopRoute();
  
  // Show CategoryHeader on shop routes, MobileHeader on other routes
  if (isShopRoute) {
    return <CategoryHeader categoryId={categoryId} />;
  }
  
  return <MobileHeader />;
}
