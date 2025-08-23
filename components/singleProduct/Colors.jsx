"use client";

import React, { useEffect } from "react";
import tippy from "tippy.js";

export default function Colors({ product, selectedVariant, onVariantChange }) {
  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  // Өнгөний код авах helper function
  const getColorCode = (colorName) => {
    const colorMap = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#00ff00',
      'yellow': '#ffff00',
      'pink': '#ffc0cb',
      'purple': '#800080',
      'orange': '#ffa500',
      'brown': '#a52a2a',
      'gray': '#808080',
      'grey': '#808080',
      'хар': '#000000',
      'цагаан': '#ffffff',
      'улаан': '#ff0000',
      'цэнхэр': '#0000ff',
      'ногоон': '#00ff00',
      'шар': '#ffff00',
      'ягаан': '#ffc0cb',
      'нил ягаан': '#800080',
      'улбар шар': '#ffa500',
      'хүрэн': '#a52a2a',
      'саарал': '#808080',
    };
    return colorMap[colorName.toLowerCase()] || '#cccccc';
  };

  // Product-ийн variant-уудаас өнгө атрибутуудыг цуглуулах
  const colorOptions = React.useMemo(() => {
    const colorAttribute = product?.variants?.find(v => 
      v.attributes?.some(attr => 
        /^(color|өнгө)$/i.test(attr?.option?.attribute?.name)
      )
    )?.attributes?.find(attr => 
      /^(color|өнгө)$/i.test(attr?.option?.attribute?.name)
    );

    if (!colorAttribute) return [];

    // Бүх variant-уудаас өнгө утгуудыг цуглуулах
    const colorValues = new Map();
    product.variants.forEach(variant => {
      const colorAttr = variant.attributes?.find(attr => 
        /^(color|өнгө)$/i.test(attr?.option?.attribute?.name)
      );
      if (colorAttr?.option?.value) {
        const colorValue = colorAttr.option.value;
        const colorCode = colorAttr.option.colorCode || getColorCode(colorValue);
        const hasStock = variant.inventory?.quantity > 0;
        
        if (!colorValues.has(colorValue)) {
          colorValues.set(colorValue, {
            id: `color-${colorValue}`,
            label: colorValue,
            color: colorCode,
            value: colorValue,
            hasStock,
            isSelected: selectedVariant?.id === variant.id
          });
        }
      }
    });

    return Array.from(colorValues.values());
  }, [product, selectedVariant]);

  const handleColorChange = (colorValue) => {
    // Тухайн өнгөтэй variant-ыг олох
    const targetVariant = product.variants.find(variant => 
      variant.attributes?.some(attr => 
        /^(color|өнгө)$/i.test(attr?.option?.attribute?.name) && 
        attr.option.value === colorValue
      )
    );
    
    if (targetVariant && onVariantChange) {
      onVariantChange(targetVariant);
    }
  };

  if (colorOptions.length === 0) return null;

  return (
    <>
      {colorOptions.map((color) => (
        <React.Fragment key={color.id}>
          <input
            type="radio"
            name="color"
            id={color.id}
            checked={color.isSelected}
            onChange={() => handleColorChange(color.value)}
            disabled={!color.hasStock}
          />
          <label
            className={`swatch swatch-color js-swatch ${!color.hasStock ? 'disabled' : ''} ${color.isSelected ? 'selected' : ''}`}
            htmlFor={color.id}
            aria-label={color.label}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-tippy-content={`${color.label}${!color.hasStock ? ' (Out of Stock)' : ''}`}
            style={{ 
              backgroundColor: color.color,
              border: color.isSelected ? '2px solid #000' : '1px solid #ddd'
            }}
          ></label>
        </React.Fragment>
      ))}
    </>
  );
}
