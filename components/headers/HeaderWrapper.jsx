"use client";
import { useShopRoute } from "@/hooks/useShopRoute";
import MobileHeader from "./MobileHeader";
import CategoryHeader from "../shoplist/CategoryHeader";
import ProductHeader from "../shoplist/ProductHeader";

export default function HeaderWrapper() {
  const { isShopRoute, isProductRoute, categoryId, productId } = useShopRoute();
  
  if (isShopRoute) {
    return <CategoryHeader categoryId={categoryId} />;
  }
  
  if (isProductRoute) {
    return <ProductHeader productId={productId} />;
  }
  
  return <MobileHeader />;
}
