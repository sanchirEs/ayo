"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Color mapping for common color names to hex values
const colorMap = {
  'red': '#dc3545',
  'blue': '#007bff',
  'green': '#28a745',
  'yellow': '#ffc107',
  'orange': '#fd7e14',
  'purple': '#6f42c1',
  'pink': '#e83e8c',
  'black': '#000000',
  'white': '#ffffff',
  'gray': '#6c757d',
  'grey': '#6c757d',
  'brown': '#8b4513',
  'navy': '#000080',
  'maroon': '#800000',
  'teal': '#20c997',
  'cyan': '#17a2b8',
  'lime': '#28a745',
  'indigo': '#6610f2',
  'violet': '#6f42c1',
  'magenta': '#e83e8c',
  'coral': '#ff7f50',
  'gold': '#ffd700',
  'silver': '#c0c0c0',
  'beige': '#f5f5dc',
  'tan': '#d2b48c',
  'olive': '#808000',
  'turquoise': '#40e0d0',
  'salmon': '#fa8072',
  'khaki': '#f0e68c',
  'default': '#bababa'
};

export default function ColorSelection({ 
  variants = [], 
  selectedVariantId = null, 
  onVariantChange = () => {} 
}) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const hasInitialized = useRef(false);

  // Extract unique color attributes from variants
  // console.log("variants", variants);
  const colorVariants = variants
    .filter(variant => variant.attributes && variant.attributes.length > 0)
    .map(variant => {
      // Debug: log attribute structure
      // console.log("Variant attributes:", variant.attributes.map(attr => ({
      //   attributeName: attr.option?.attribute?.name,
      //   attributeValue: attr.option?.value
      // })));
      
      const colorAttr = variant.attributes.find(attr => 
        attr.option?.attribute?.name?.toLowerCase().includes('color') || 
        attr.option?.attribute?.name?.toLowerCase().includes('өнгө')
      );
      // console.log("colorAttr", colorAttr);
      if(colorAttr) {
        return {
          variantId: variant.id,
          colorName: colorAttr?.option?.value || 'default',
          colorValue: colorMap[colorAttr?.option?.value?.toLowerCase()] || colorMap.default,
          isDefault: variant.isDefault,
          stock: variant.inventory?.quantity || 0
        };
      }
      return null;
     
      })
      .filter(variant => variant !== null) // Remove null values
      .filter((variant, index, self) => 
        // Remove duplicates based on color name
        index === self.findIndex(v => v.colorName === variant.colorName)
      );

  // Set initial selection based on selectedVariantId prop
  useEffect(() => {
    if (colorVariants.length > 0) {
      // console.log("colorVariants", colorVariants);
      const selectedIndex = colorVariants.findIndex(v => v.variantId === selectedVariantId);
      if (selectedIndex !== -1) {
        setSelectedColorIndex(selectedIndex);
      } else if (!hasInitialized.current) {
        // Fallback to default variant if no selectedVariantId provided
        const defaultVariant = colorVariants.find(v => v.isDefault) || colorVariants[0];
        const defaultIndex = colorVariants.findIndex(v => v.variantId === defaultVariant.variantId);
        setSelectedColorIndex(defaultIndex);
        hasInitialized.current = true;
      }
    }
  }, [colorVariants, selectedVariantId]);

  const handleColorSelect = (index) => {
    setSelectedColorIndex(index);
    const selectedVariant = colorVariants[index];
    if (selectedVariant) {
      onVariantChange(selectedVariant.variantId);
    }
  };

  // If no color variants, don't render anything
  if (colorVariants.length === 0) {
    return null;
  }

  return (
    <>
      {colorVariants.map((variant, index) => (
        <a
          key={variant.variantId}
          onClick={() => handleColorSelect(index)}
          className={`swatch-color pc__swatch-color ${
            index === selectedColorIndex ? "swatch_active" : ""
          } ${variant.stock === 0 ? "out-of-stock" : ""}`}
          style={{ 
            color: variant.colorValue,
            opacity: variant.stock === 0 ? 0.5 : 1,
            cursor: variant.stock === 0 ? "not-allowed" : "pointer"
          }}
          title={`${variant.colorName}${variant.stock === 0 ? ' (Үлдэгдэл байхгүй)' : ''}`}
        />
      ))}
    </>
  );
}
