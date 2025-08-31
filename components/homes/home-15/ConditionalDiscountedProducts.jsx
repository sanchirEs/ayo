"use client";

import { useEffect, useState } from "react";
import DiscountedProducts from "./DiscountedProducts";
import api from "@/lib/api";

export default function ConditionalDiscountedProducts() {
  const [hasProducts, setHasProducts] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check if there are discounted products
    api.homepage
      .bundled({ sections: 'discounted', limit: 1, include: 'card' })
      .then((res) => {
        if (!mounted) return;
        const discountedProducts = res.data?.discounted || [];
        setHasProducts(discountedProducts.length > 0);
      })
      .catch(() => {
        if (!mounted) return;
        setHasProducts(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Don't render anything while loading or if no products
  if (loading || !hasProducts) {
    return null;
  }

  return <DiscountedProducts />;
}
