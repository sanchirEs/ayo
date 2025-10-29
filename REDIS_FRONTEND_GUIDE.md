# 🚀 Redis Caching Frontend Integration Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Available Redis Endpoints](#available-redis-endpoints)
3. [How to Use in Components](#how-to-use-in-components)
4. [Performance Expectations](#performance-expectations)
5. [Checking if Redis is Working](#checking-if-redis-is-working)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🎯 Quick Start

### What is Redis Caching?

Redis is an in-memory cache that stores frequently accessed data. Instead of querying the database every time (2-5 seconds), data is served from Redis cache (50-200ms) - **10-40x faster!**

### The Problem We're Solving

**Before Redis:**
```javascript
// Each component fetches separately from database
api.homepage.bundled({ sections: 'featured' })  // 3-6 seconds
api.homepage.bundled({ sections: 'new' })       // 3-6 seconds  
api.homepage.bundled({ sections: 'flash' })     // 3-6 seconds
// Total: 9-18 seconds 😱
```

**After Redis:**
```javascript
// All components fetch from Redis cache
api.homepage.cached({ sections: 'featured' })   // 50-150ms ✅
api.homepage.cached({ sections: 'new' })        // 50-150ms ✅
api.homepage.cached({ sections: 'flash' })      // 50-150ms ✅
// Total: 150-450ms 🚀
```

---

## 📡 Available Redis Endpoints

### 1. Homepage Bundle (Primary)

**Use for:** Homepage data (categories, products, flash sales)

```javascript
// ✅ RECOMMENDED: Single call for all homepage data
const data = await api.homepage.cached({
  sections: 'categories,new,flash,featured,discounted',
  limit: 20,
  categoryLimit: 8,
  include: 'card'  // 'minimal' | 'card' | 'full'
});

// Response:
{
  success: true,
  data: {
    categories: [...],    // 8 categories
    newArrivals: [...],   // 20 products
    flashSale: [...],     // 20 products
    featured: [...],      // 20 products
    discounted: [...]     // 20 products
  },
  performance: {
    responseTime: "87ms",
    cached: true
  }
}
```

### 2. Flash Sale Products (Real-Time)

**Use for:** Flash sales with live inventory

```javascript
// ✅ Real-time inventory tracking (30s cache)
const data = await api.flashSale.products({
  limit: 20,
  include: 'card'
});

// Response includes current stock levels
{
  success: true,
  data: {
    products: [...],
    // Each product has real-time inventory
  }
}
```

### 3. Product Search (Dynamic)

**Use for:** Product search and filtering

```javascript
// ✅ Cached search results (5-15min cache)
const results = await api.products.enhanced({
  search: 'phone',
  categoryId: 5,
  limit: 20,
  sortBy: 'newest'
});
```

### 4. Categories (Static)

**Use for:** Category lists and navigation

```javascript
// ✅ Long-term cache (6-24h)
const categories = await api.categories.getAll();
```

### 5. Brands (Static)

**Use for:** Brand lists and filters

```javascript
// ✅ Long-term cache (6-24h)
const brands = await api.brands.getAll();
```

---

## 💻 How to Use in Components

### Pattern 1: Basic Usage (Client-Side)

```javascript
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // ✅ Use cached endpoint
    api.homepage.cached({ 
      sections: 'featured', 
      limit: 20, 
      include: 'card' 
    })
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data?.featured || []);
        
        // Check cache performance in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Cache hit:', res.performance?.cached);
          console.log('Response time:', res.performance?.responseTime);
        }
      })
      .catch((err) => console.error('Failed to load:', err))
      .finally(() => setLoading(false));

    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Pattern 2: Server-Side Rendering (Fastest!)

```javascript
// ✅ BEST PERFORMANCE: Fetch on server, render with data
// app/home/page.jsx

import { api } from '@/lib/api';

export default async function HomePage() {
  // Fetch all data in parallel on server
  const [homepage, flashSale] = await Promise.all([
    api.homepage.cached({ 
      sections: 'categories,new,featured',
      limit: 20 
    }),
    api.flashSale.products({ limit: 20 })
  ]);

  return (
    <div>
      <Categories data={homepage.data.categories} />
      <Featured data={homepage.data.featured} />
      <FlashSale data={flashSale.data.products} />
    </div>
  );
}
```

### Pattern 3: With Cache Monitoring

```javascript
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const startTime = Date.now();
    
    api.products.enhanced({ categoryId: 5, limit: 20 })
      .then((res) => {
        setProducts(res.data?.products || []);
        
        // Monitor performance
        const totalTime = Date.now() - startTime;
        console.log({
          fetchTime: totalTime,
          cached: res.performance?.cached,
          serverTime: res.performance?.responseTime
        });
      });
  }, []);

  return <ProductGrid products={products} />;
}
```

---

## ⚡ Performance Expectations

### Response Times by Cache Tier

| Endpoint | Cache Tier | TTL | Expected Response | Status |
|----------|------------|-----|-------------------|--------|
| `/categories` | Tier 1 (Static) | 6-24h | **20-50ms** | ✅ |
| `/brands/all` | Tier 1 (Static) | 6-24h | **20-50ms** | ✅ |
| `/homepage/cached` | Tier 2 (Semi-Dynamic) | 30min-2h | **50-150ms** | ✅ |
| `/products/enhanced` | Tier 3 (Dynamic) | 5-15min | **80-200ms** | ✅ |
| `/flash-sale/products` | Tier 4 (Real-Time) | ≤30s | **100-300ms** | ✅ |

### What "Good" Looks Like

**✅ Redis Working Properly:**
```
First request:  150ms (MISS - fetches from DB, caches)
Second request: 45ms  (HIT - served from Redis)
Third request:  42ms  (HIT - served from Redis)
```

**❌ Redis NOT Working:**
```
First request:  3,500ms (No caching)
Second request: 3,200ms (Still hitting DB)
Third request:  3,800ms (No improvement)
```

---

## 🔍 Checking if Redis is Working

### Method 1: Browser DevTools (Easiest)

1. Open DevTools → Network tab
2. Reload the page
3. Click any API request
4. Check **Response Headers**:

```
✅ GOOD - Redis is working:
X-Cache: HIT
X-Response-Time: 87ms
X-Data-Source: cache

❌ BAD - Redis not working:
X-Cache: MISS (or missing)
X-Response-Time: 3500ms
X-Data-Source: database
```

### Method 2: Browser Console

```javascript
// Run this in browser console:
__apiCacheStats()

// ✅ GOOD output:
// Hit Rate: 85.5%
// Avg Response: 92ms

// ❌ BAD output:
// Hit Rate: 0%
// Avg Response: 3500ms
```

### Method 3: Manual Test

```javascript
// In browser console:
console.time('First Request');
await api.homepage.cached({ sections: 'featured' });
console.timeEnd('First Request');  // Should be ~150ms

console.time('Second Request');
await api.homepage.cached({ sections: 'featured' });
console.timeEnd('Second Request'); // Should be ~50ms (faster!)
```

---

## 🐛 Troubleshooting

### Problem 1: Still Getting Slow Response Times (3-6 seconds)

**Symptoms:**
- Network tab shows 3000-6000ms response times
- `X-Cache: MISS` or header is missing
- No performance improvement on repeat requests

**Possible Causes:**

#### A. Redis Not Connected on Backend

**Check backend logs for:**
```
❌ Error: Redis connection failed
❌ ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
```bash
# 1. Check if Redis is running
redis-cli ping
# Should return: PONG

# 2. If not running, start Redis
# Docker:
docker run -d --name redis-ayo -p 6379:6379 redis:7-alpine

# Or Windows:
redis-server

# 3. Restart backend
cd ayo-back
npm run dev
```

#### B. Redis Not Installed

**Check:**
```bash
redis-cli --version
```

**If not installed:**
```bash
# Docker (Recommended):
docker run -d \
  --name redis-ayo \
  -p 6379:6379 \
  redis:7-alpine

# Or install locally:
# Windows: Download from https://github.com/tporadowski/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server
```

#### C. Backend Environment Variables Missing

**Check `ayo-back/.env`:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379
```

#### D. Cache Middleware Not Applied

**Backend should use:**
```javascript
// ayo-back/src/routes/homepageRoutes.js
router.get("/cached", homepageCache(), getHomepageData);
```

---

### Problem 2: Getting 404 Errors on /cached

**Symptoms:**
- Network tab shows `404 Not Found` for `/homepage/cached`
- Frontend working but slow

**Solution:**

**Check backend has this route:**
```javascript
// ayo-back/src/routes/homepageRoutes.js
router.get("/cached", getHomepageData); // ✅ This line must exist
```

**If missing, add it:**
```javascript
router.get("/cached", getHomepageData);
router.get("/bundled", getHomepageData); // Fallback
```

**Then restart backend:**
```bash
cd ayo-back
# Ctrl+C to stop, then:
npm run dev
```

---

### Problem 3: Cache Hit Rate is 0%

**Symptoms:**
- `__apiCacheStats()` shows 0% hit rate
- All requests show `X-Cache: MISS`

**Causes & Solutions:**

#### A. Cache TTL Too Short
```javascript
// Backend cache config - check these values:
TIER_1_TTL=86400  // 24 hours (categories/brands)
TIER_2_TTL=1800   // 30 minutes (homepage)
TIER_3_TTL=900    // 15 minutes (products)
TIER_4_TTL=30     // 30 seconds (flash sales)
```

#### B. Cache Keys Not Matching
```javascript
// Frontend - ensure parameters are consistent:
// ✅ GOOD - Same params = cache hit
api.homepage.cached({ sections: 'featured', limit: 20 });
api.homepage.cached({ sections: 'featured', limit: 20 }); // HIT!

// ❌ BAD - Different params = cache miss
api.homepage.cached({ sections: 'featured', limit: 20 });
api.homepage.cached({ sections: 'featured', limit: 10 }); // MISS!
```

---

### Problem 4: Products Show Old Data

**Symptoms:**
- Updated product not showing
- Prices not reflecting changes
- Images outdated

**Solution:**

**Option 1: Wait for Cache to Expire**
- Tier 1 (Categories): 6-24 hours
- Tier 2 (Homepage): 30 minutes
- Tier 3 (Products): 5-15 minutes
- Tier 4 (Flash Sales): 30 seconds

**Option 2: Manual Cache Invalidation (Admin)**
```javascript
// Call admin endpoint to clear cache
await fetch('http://localhost:8000/api/v1/homepage/cache/invalidate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    patterns: ['homepage:*', 'product:*']
  })
});
```

**Option 3: Bypass Cache for Testing**
```javascript
// Add noCache parameter
api.homepage.cached({ 
  sections: 'featured',
  noCache: true  // ✅ Bypasses cache
});
```

---

## ✅ Best Practices

### 1. Use Cached Endpoints for Everything

```javascript
// ❌ DON'T USE (slow, no cache):
api.homepage.bundled({ sections: 'featured' })

// ✅ USE (fast, Redis-cached):
api.homepage.cached({ sections: 'featured' })
```

### 2. Fetch Data Server-Side When Possible

```javascript
// ✅ BEST: Server-side (Next.js)
// Data already loaded when user sees page
export default async function Page() {
  const data = await api.homepage.cached({ ... });
  return <Component data={data} />;
}

// ⚠️ OK: Client-side
// User sees loading spinner first
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.homepage.cached({ ... }).then(setData);
  }, []);
}
```

### 3. Batch Requests in Parallel

```javascript
// ❌ BAD - Sequential (slow):
const featured = await api.homepage.cached({ sections: 'featured' });
const flashSale = await api.flashSale.products();
const categories = await api.categories.getAll();
// Total: 150ms + 120ms + 50ms = 320ms

// ✅ GOOD - Parallel (fast):
const [featured, flashSale, categories] = await Promise.all([
  api.homepage.cached({ sections: 'featured' }),
  api.flashSale.products(),
  api.categories.getAll()
]);
// Total: max(150ms, 120ms, 50ms) = 150ms
```

### 4. Use Minimal Data When Possible

```javascript
// ❌ SLOWER - Full data (2.5 kB):
api.homepage.cached({ 
  sections: 'featured',
  include: 'full'  // All product details
});

// ✅ FASTER - Minimal data (0.9 kB):
api.homepage.cached({ 
  sections: 'featured',
  include: 'minimal'  // Only essential fields
});

// ⚡ BEST - Card data (1.3 kB):
api.homepage.cached({ 
  sections: 'featured',
  include: 'card'  // Optimized for product cards
});
```

### 5. Monitor Cache Performance in Development

```javascript
// Add this to your components:
if (process.env.NODE_ENV === 'development') {
  console.log('Cache Performance:', {
    cached: response.performance?.cached,
    responseTime: response.performance?.responseTime,
    dataSize: JSON.stringify(response.data).length
  });
}

// Check overall stats:
api.cache.logStats();
```

### 6. Handle Loading States Properly

```javascript
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.homepage.cached({ sections: 'featured' })
      .then(res => setProducts(res.data?.featured || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <ProductGrid products={products} />;
}
```

---

## 🎯 Quick Reference

### API Methods Summary

```javascript
// Homepage data (Tier 2: 30min cache)
api.homepage.cached({ sections, limit, categoryLimit, include })

// Flash sales (Tier 4: 30s cache)
api.flashSale.products({ limit, include })
api.flashSale.active()
api.flashSale.timer()

// Products (Tier 3: 5-15min cache)
api.products.enhanced({ search, categoryId, limit, sortBy })
api.products.getById(productId)
api.products.related(productId)

// Categories (Tier 1: 6-24h cache)
api.categories.getAll()
api.categories.getById(categoryId)
api.categories.getTree()

// Brands (Tier 1: 6-24h cache)
api.brands.getAll()
api.brands.getById(brandId)

// Cache utilities
api.cache.getStats()          // Get statistics
api.cache.logStats()          // Pretty print stats
api.cache.reset()             // Reset statistics
```

### Include Levels

| Level | Size | Use Case | Response Time |
|-------|------|----------|---------------|
| `minimal` | ~0.9 kB | List views, quick loads | Fastest ⚡ |
| `card` | ~1.3 kB | Product cards (recommended) | Fast ✅ |
| `full` | ~2.5 kB | Detail pages | Slower ⚠️ |

### Expected Performance by Page

| Page | API Calls | Expected Load Time | Cache Hit Rate |
|------|-----------|-------------------|----------------|
| Homepage | 3-5 parallel | **200-500ms** | >85% |
| Shop | 2-3 parallel | **150-400ms** | >80% |
| Product Detail | 2-3 parallel | **180-450ms** | >75% |
| Search | 1-2 parallel | **100-300ms** | >70% |

---

## 📞 Support

### If Redis Still Not Working

**Check these in order:**

1. **Is Redis running?**
   ```bash
   redis-cli ping  # Should return: PONG
   ```

2. **Is backend connected to Redis?**
   ```bash
   # Check backend logs for:
   ✅ "Redis connected successfully"
   ❌ "Redis connection failed"
   ```

3. **Are routes registered?**
   ```bash
   # Test directly:
   curl http://localhost:8000/api/v1/homepage/cached?sections=featured
   # Should return data in <200ms
   ```

4. **Is cache middleware applied?**
   - Check `ayo-back/src/routes/homepageRoutes.js`
   - Ensure routes use cached controller

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Redis not running | Start Redis |
| `404 Not Found` | Route not registered | Add route to backend |
| `3000ms+ response` | Redis not connected | Check backend logs |
| `X-Cache: MISS` always | Cache not working | Verify middleware |

---

## 🎓 Learning Resources

- **Redis Basics:** https://redis.io/docs/
- **Next.js Data Fetching:** https://nextjs.org/docs/app/building-your-application/data-fetching
- **Cache Strategies:** https://web.dev/cache-api-quick-guide/

---

**Last Updated:** 2025-10-28  
**Version:** 1.0  
**Maintained by:** Project Ayo Team

