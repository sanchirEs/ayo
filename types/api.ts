/**
 * API Response Type Definitions
 */

import { Product, Category } from './product';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  performance?: {
    responseTime: string;
    cached: boolean;
    source?: 'cache' | 'database';
  };
}

export interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationData;
}

export interface HomepageData {
  featured?: Product[];
  flashSale?: Product[];
  newArrivals?: Product[];
  discounted?: Product[];
  categories?: Category[];
}

export interface HomepageApiResponse {
  success: boolean;
  data: HomepageData;
  performance?: {
    responseTime: string;
    cached: boolean;
  };
}

