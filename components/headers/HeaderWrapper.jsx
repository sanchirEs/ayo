"use client";
import { useShopRoute } from "@/hooks/useShopRoute";
import MobileHeader from "./MobileHeader";
import CategoryHeader from "../shoplist/CategoryHeader";
import ProductHeader from "../shoplist/ProductHeader";
import CartHeader from "../shoplist/CartHeader";

export default function HeaderWrapper() {
  const { isShopRoute, isProductRoute, isCartRoute, categoryId, productId } = useShopRoute();
  
  if (isShopRoute) {
    return <CategoryHeader categoryId={categoryId} />;
  }
  
  if (isProductRoute) {
    return <ProductHeader productId={productId} />;
  }
  
  if (isCartRoute) {
    return <CartHeader />;
  }
  
  return <MobileHeader />;
}
