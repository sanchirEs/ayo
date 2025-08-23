"use client";

import React, { useEffect } from "react";
import tippy from "tippy.js";

export default function Size({ product, selectedVariant, onVariantChange }) {
  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  // Product-ийн variant-уудаас хэмжээ атрибутуудыг цуглуулах
  const sizeOptions = React.useMemo(() => {
    const sizeAttribute = product?.variants?.find(v => 
      v.attributes?.some(attr => 
        /^(size|хэмж(ээ)?)$/i.test(attr?.option?.attribute?.name)
      )
    )?.attributes?.find(attr => 
      /^(size|хэмж(ээ)?)$/i.test(attr?.option?.attribute?.name)
    );

    if (!sizeAttribute) return [];

    // Бүх variant-уудаас хэмжээ утгуудыг цуглуулах
    const sizeValues = new Map();
    product.variants.forEach(variant => {
      const sizeAttr = variant.attributes?.find(attr => 
        /^(size|хэмж(ээ)?)$/i.test(attr?.option?.attribute?.name)
      );
      if (sizeAttr?.option?.value) {
        const sizeValue = sizeAttr.option.value;
        const hasStock = variant.inventory?.quantity > 0;
        
        if (!sizeValues.has(sizeValue)) {
          sizeValues.set(sizeValue, {
            id: `size-${sizeValue}`,
            label: sizeValue,
            value: sizeValue,
            hasStock,
            isSelected: selectedVariant?.id === variant.id
          });
        }
      }
    });

    return Array.from(sizeValues.values());
  }, [product, selectedVariant]);

  const handleSizeChange = (sizeValue) => {
    // Тухайн хэмжээтэй variant-ыг олох
    const targetVariant = product.variants.find(variant => 
      variant.attributes?.some(attr => 
        /^(size|хэмж(ээ)?)$/i.test(attr?.option?.attribute?.name) && 
        attr.option.value === sizeValue
      )
    );
    
    if (targetVariant && onVariantChange) {
      onVariantChange(targetVariant);
    }
  };

  if (sizeOptions.length === 0) return null;

  return (
    <>
      {sizeOptions.map((size) => (
        <React.Fragment key={size.id}>
          <input
            type="radio"
            name="size"
            id={size.id}
            checked={size.isSelected}
            onChange={() => handleSizeChange(size.value)}
            disabled={!size.hasStock}
          />
          <label
            className={`swatch js-swatch ${!size.hasStock ? 'disabled' : ''} ${size.isSelected ? 'selected' : ''}`}
            htmlFor={size.id}
            aria-label={size.label}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-tippy-content={`${size.label}${!size.hasStock ? ' (Out of Stock)' : ''}`}
          >
            {size.label}
          </label>
        </React.Fragment>
      ))}
    </>
  );
}
