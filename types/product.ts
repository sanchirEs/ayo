/**
 * Product Type Definitions
 * Used throughout the application for type safety
 */

export interface ProductImage {
  id?: number;
  imageUrl: string;
  url?: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  isDefault?: boolean;
  inventory?: {
    quantity: number;
  };
  attributes?: Array<{
    option?: {
      attribute?: {
        name: string;
      };
      value: string;
    };
  }>;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  sku?: string;
  rating?: number;
  
  // Images
  ProductImages?: ProductImage[];
  images?: ProductImage[];
  
  // Category
  category?: ProductCategory;
  
  // Variants
  variants?: ProductVariant[];
  
  // Inventory
  inventories?: Array<{
    quantity: number;
  }>;
  
  // Badges
  isNew?: boolean;
  isFlashSale?: boolean;
  isDiscounted?: boolean;
  discountPercentage?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  url?: string;
  description?: string;
  parentId?: number;
}

