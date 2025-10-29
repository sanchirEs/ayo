# 🐛 Known Issues

**Status:** Non-critical issues documented for future work  
**Impact:** Low (app functions correctly, console warnings only)

---

## 1. React Rendering Warning in Filter System

**Severity:** ⚠️ LOW (Console warning, doesn't break functionality)  
**Component:** `FilterAll.jsx` + `FilterContext.jsx`  
**Discovered:** October 28, 2025

### Error Message:
```
Cannot update a component (FilterProvider) while rendering a different component (FilterAll).
```

### Root Cause:
`FilterAll` component calls `onFiltersChange` inside a `setState` updater function, which triggers `setAppliedFilters` in `FilterContext` **during render** (synchronously).

### Location:
```jsx
// components/shoplist/filter/FilterAll.jsx:220
setFilters(prev => {
  const updated = { ...prev, minPrice, maxPrice };
  
  if (onFiltersChange) {
    onFiltersChange(withMeta); // ❌ setState during render
  }
  
  return updated;
});
```

### Proper Fix (Future Work):
```jsx
// Option 1: Use useEffect to notify parent after state updates
useEffect(() => {
  if (onFiltersChange) {
    onFiltersChange(filters);
  }
}, [filters, onFiltersChange]);

// Option 2: Debounce the filter changes
// Option 3: Restructure to avoid nested setState calls
```

### Workaround (Current):
- Error is non-breaking (console warning only)
- Filters still work correctly
- Can be safely ignored until proper refactoring time

### Estimated Fix Time:
1-2 hours (requires understanding full filter architecture)

### Priority:
**LOW** - Does not affect functionality, only console cleanliness

---

## Notes for Future Developer:

When fixing this:
1. Review entire filter flow (FilterContext → FilterAll → ShopLayoutWrapper)
2. Consider moving to a more React-friendly pattern (useReducer + dispatch)
3. Test all filter interactions (price, categories, brands, etc.)
4. Verify no regressions in filter behavior

---

**Last Updated:** October 28, 2025

