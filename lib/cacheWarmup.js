/**
 * Cache Warmup Utility
 * Pre-fetches critical data to populate Redis cache on app initialization
 * 
 * WHY: Ensures first users get fast responses by pre-warming the cache
 */

import { api } from './api';

/**
 * Warm up cache with homepage data
 */
export async function warmupCache(options = {}) {
  const {
    silent = false,
    sections = ['categories', 'new', 'flash', 'featured'],
  } = options;

  if (!silent) {
    console.log('🔥 Warming up cache...');
  }

  const results = {
    success: [],
    failed: [],
    totalTime: 0,
  };

  const startTime = Date.now();

  try {
    // Warm homepage data (most critical)
    try {
      await api.homepage.cached({ 
        sections: sections.join(','),
        limit: 20,
        categoryLimit: 8,
        include: 'card'
      });
      results.success.push('homepage');
    } catch (error) {
      results.failed.push({ endpoint: 'homepage', error: error.message });
    }

    // Warm categories (Tier 1 - Static)
    try {
      await api.categories.getAll();
      results.success.push('categories');
    } catch (error) {
      results.failed.push({ endpoint: 'categories', error: error.message });
    }

    // Warm brands (Tier 1 - Static)
    try {
      await api.brands.getAll();
      results.success.push('brands');
    } catch (error) {
      results.failed.push({ endpoint: 'brands', error: error.message });
    }

    // Warm flash sale if active
    try {
      await api.flashSale.active();
      results.success.push('flashSale');
    } catch (error) {
      // Flash sale might not be active - not critical
      if (!silent) {
        console.log('ℹ️ No active flash sale to warm');
      }
    }

    results.totalTime = Date.now() - startTime;

    if (!silent) {
      console.log(
        `✅ Cache warmup complete in ${results.totalTime}ms`,
        `\n   Success: ${results.success.length}`,
        results.failed.length > 0 ? `\n   Failed: ${results.failed.length}` : ''
      );
    }

    return results;

  } catch (error) {
    console.error('❌ Cache warmup failed:', error);
    return {
      ...results,
      totalTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Warm specific endpoint
 */
export async function warmupEndpoint(endpoint, params = {}) {
  try {
    const startTime = Date.now();
    
    // Map endpoint to API method
    if (endpoint === 'homepage') {
      await api.homepage.cached(params);
    } else if (endpoint === 'categories') {
      await api.categories.getAll();
    } else if (endpoint === 'brands') {
      await api.brands.getAll();
    } else if (endpoint === 'flashSale') {
      await api.flashSale.active();
    }
    
    const time = Date.now() - startTime;
    console.log(`✅ Warmed ${endpoint} in ${time}ms`);
    return { success: true, time };
    
  } catch (error) {
    console.error(`❌ Failed to warm ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check if cache warmup is needed (based on storage flag)
 */
export function shouldWarmupCache() {
  if (typeof window === 'undefined') return false;
  
  try {
    const lastWarmup = localStorage.getItem('cacheLastWarmup');
    if (!lastWarmup) return true;
    
    const lastWarmupTime = parseInt(lastWarmup);
    const now = Date.now();
    
    // Warmup every 30 minutes
    return now - lastWarmupTime > 30 * 60 * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Mark cache as warmed
 */
export function markCacheWarmed() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cacheLastWarmup', Date.now().toString());
  } catch (error) {
    // localStorage might be disabled - not critical
  }
}

export default {
  warmupCache,
  warmupEndpoint,
  shouldWarmupCache,
  markCacheWarmed,
};

