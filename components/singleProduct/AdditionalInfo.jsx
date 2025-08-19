import React, { useMemo } from "react";

export default function AdditionalInfo({ product }) {
  // Variant-ууд
  const variants = product?.variants ?? [];

  // ✅ Атрибутуудыг бүлэглэх (ж: Color → [Red, Blue], Size → [M, L])
  const attributeGroups = useMemo(() => {
    const map = new Map(); // name -> Set(values)
    variants.forEach((v) => {
      (v.attributes || []).forEach((va) => {
        const name = va?.option?.attribute?.name?.trim();
        const val  = va?.option?.value?.trim();
        if (!name || !val) return;
        if (!map.has(name)) map.set(name, new Set());
        map.get(name).add(val);
      });
    });
    // энгийн object руу хөрвүүлнэ
    const obj = {};
    for (const [k, set] of map.entries()) obj[k] = Array.from(set);
    return obj;
  }, [variants]);

  // // ✅ Үнэний муж (variant.price-уудаас)
  // const priceRange = useMemo(() => {
  //   const ps = variants
  //     .map((v) => (typeof v.price === "string" ? Number(v.price) : v.price))
  //     .filter((n) => typeof n === "number" && !Number.isNaN(n));
  //   if (ps.length === 0) {
  //     const base = typeof product?.price === "string" ? Number(product.price) : product?.price;
  //     return base ? { min: Number(base), max: Number(base) } : null;
  //   }
  //   return { min: Math.min(...ps), max: Math.max(...ps) };
  // }, [variants, product?.price]);

  // ✅ Нийт үлдэгдэл
  const totalStock = useMemo(() => {
    // variant.inventory.quantity сум
    const vSum = variants.reduce(
      (s, v) => s + (v?.inventory?.quantity ? Number(v.inventory.quantity) : 0),
      0
    );
    // product.inventories (variant-гүй үлдэгдэл ашиглаж байсан бол) нэмж тооцно
    const pSum = (product?.inventories || []).reduce(
      (s, inv) => s + (inv?.quantity ? Number(inv.quantity) : 0),
      0
    );
    return vSum + pSum;
  }, [variants, product?.inventories]);

  // ✅ SKU жагсаалт (хэт урт бол эхний хэдийг л)
  // const skuList = useMemo(() => {
  //   const skus = variants.map((v) => v?.sku).filter(Boolean);
  //   if (skus.length === 0 && product?.sku) skus.push(product.sku);
  //   return skus;
  // }, [variants, product?.sku]);

  // ✅ Харагдуулах мөрүүдийг бүрдүүлнэ (дизайны class-уудыг яг хэвээр нь ашигласан)
  const rows = [];

  // Price row
  // rows.push({
  //   label: "Price",
  //   value: priceRange
  //     ? priceRange.min === priceRange.max
  //       ? `$${priceRange.min.toLocaleString()}`
  //       : `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}`
  //     : "—",
  // });

  // Stock row
  rows.push({
    label: "Stock",
    value: typeof totalStock === "number" ? totalStock.toString() : "—",
  });

  // SKU row
  // rows.push({
  //   label: "SKUs",
  //   value:
  //     skuList.length > 0
  //       ? (skuList.length > 6 ? [...skuList.slice(0, 6), "…"] : skuList).join(", ")
  //       : "—",
  // });

  // Category row (хэрэв байгаа бол)
  // rows.push({
  //   label: "Category",
  //   value: product?.category?.name || "—",
  // });

  // Tags row (танай structure: [{ id, productId, tag, tagPresetId }, ...])
  // rows.push({
  //   label: "Tags",
  //   value:
  //     (product?.tags || []).map((t) => t.tag).filter(Boolean).join(", ") || "—",
  // });

  // Бүх Attribute бүлгүүдийг мөр болгон нэмж харуулна (ж: Color, Size, Material…)
  Object.entries(attributeGroups).forEach(([attrName, values]) => {
    rows.push({
      label: attrName,
      value: (values || []).join(", "),
    });
  });

  return (
    <div className="product-single__addtional-info">
      {rows.map((r, idx) => (
        <div className="item" key={`${r.label}-${idx}`}>
          <label className="h6">{r.label}</label>
          <span>{r.value || "—"}</span>
        </div>
      ))}
    </div>
  );
}
