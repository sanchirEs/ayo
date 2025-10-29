# ⚡ Redis Quick Reference Card

## 🎯 One-Line Summary
**Use `api.homepage.cached()` instead of `api.homepage.bundled()` = 10-40x faster (50-200ms vs 3-6 seconds)**

---

## 📡 Essential Endpoints

```javascript
// Homepage (30min cache)
api.homepage.cached({ sections: 'featured', limit: 20, include: 'card' })

// Flash Sales (30s cache - real-time)
api.flashSale.products({ limit: 20 })

// Products (5-15min cache)
api.products.enhanced({ search: 'phone', limit: 20 })

// Categories (6-24h cache)
api.categories.getAll()

// Brands (6-24h cache)
api.brands.getAll()
```

---

## ✅ Good vs Bad

```javascript
// ❌ BAD (3-6 seconds)
api.homepage.bundled({ sections: 'featured' })

// ✅ GOOD (50-200ms)
api.homepage.cached({ sections: 'featured' })
```

---

## 🔍 Check if Working

```javascript
// In browser console:
__apiCacheStats()

// Expected:
// Hit Rate: >80%
// Avg Response: <200ms
```

**In Network Tab:**
- Check Response Headers
- Should see: `X-Cache: HIT`
- Should see: `X-Response-Time: 87ms`

---

## 🐛 Quick Fixes

### 1. Still Slow? (6+ seconds)
```bash
# Check if Redis is running:
redis-cli ping  # Should return: PONG

# If not, start Redis:
docker run -d --name redis-ayo -p 6379:6379 redis:7-alpine

# Restart backend:
cd ayo-back && npm run dev
```

### 2. Getting 404?
```javascript
// Backend needs this route in homepageRoutes.js:
router.get("/cached", getHomepageData);

// Then restart backend
```

### 3. Cache Always MISS?
```bash
# Check backend .env has:
REDIS_URL=redis://localhost:6379

# Restart backend after adding
```

---

## ⚡ Performance Targets

| What | Expected Time | If Slower |
|------|---------------|-----------|
| First load | 200-500ms | Redis not working |
| Cached load | 50-150ms | Redis not connected |
| Categories | 20-50ms | Check Redis |
| Search | 80-200ms | Verify cache middleware |

---

## 🎨 Component Pattern

```javascript
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api.homepage.cached({ 
      sections: 'featured', 
      limit: 20,
      include: 'card'
    })
      .then((res) => {
        if (!mounted) return;
        setData(res.data?.featured || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Render data */}</div>;
}
```

---

## 🎯 Include Levels

```javascript
// Fastest (0.9 kB)
include: 'minimal'

// Recommended (1.3 kB)  ⭐
include: 'card'

// Slowest (2.5 kB)
include: 'full'
```

---

## 🔥 Pro Tips

```javascript
// ✅ Fetch in parallel (fast)
const [a, b, c] = await Promise.all([
  api.homepage.cached({ sections: 'featured' }),
  api.flashSale.products(),
  api.categories.getAll()
]);

// ❌ Sequential (slow)
const a = await api.homepage.cached({ sections: 'featured' });
const b = await api.flashSale.products();
const c = await api.categories.getAll();
```

---

## 📊 Health Check Commands

```bash
# 1. Is Redis running?
redis-cli ping

# 2. Test cached endpoint
curl "http://localhost:8000/api/v1/homepage/cached?sections=featured&limit=5"

# 3. Check response time (should be <200ms)
time curl "http://localhost:8000/api/v1/homepage/cached?sections=featured"

# 4. Check cache headers
curl -i "http://localhost:8000/api/v1/homepage/cached?sections=featured" | grep "X-Cache"
```

---

## 🚨 Emergency: Bypass Cache

```javascript
// For testing/debugging only:
api.homepage.cached({ 
  sections: 'featured',
  noCache: true  // ⚠️ Bypasses Redis
});
```

---

## 📞 Help

**Frontend Guide:** `ayo/REDIS_FRONTEND_GUIDE.md`  
**Backend Debug:** `ayo-back/REDIS_TROUBLESHOOTING.md`  
**Full Docs:** `ayo-back/REDIS_CACHE_IMPLEMENTATION.md`

---

## 🎯 Success Checklist

- [ ] All components use `.cached()` not `.bundled()`
- [ ] Redis is running (`redis-cli ping` returns `PONG`)
- [ ] Backend shows "✅ Redis connected" in logs
- [ ] Response times < 200ms in Network tab
- [ ] Headers show `X-Cache: HIT` on repeat requests
- [ ] `__apiCacheStats()` shows >80% hit rate
- [ ] Homepage loads in < 1 second

---

**Print this and keep it next to your monitor! 📌**

