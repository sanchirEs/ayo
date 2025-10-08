# Testing Guide: Category Tags Routing Implementation

## What Was Implemented

### 1. Backend Changes ✅
- **ProductTagNew Support**: Added hierarchical tags support to filter system
- **Enhanced Filter Validation**: Updated to handle `tags`, `hierarchicalTags`, and `tagGroups` parameters
- **Backward Compatibility**: Simple tags still work alongside hierarchical tags

### 2. Frontend Changes ✅
- **Categories Component**: Updated routing from `/shop/${categoryId}` to `/shop?tags=${categoryName}`
- **Shop Page**: Added URL parameter parsing to handle `tags` filter
- **URL Encoding**: Properly encodes Mongolian characters in URLs

## Testing Steps

### Test 1: Category Button Click
1. **Navigate to homepage**
2. **Find the "АНГИЛЛААР ДЭЛГҮҮР ХЭСЭХ" section**
3. **Click on "НАРНЫ ТОС" category button**
4. **Expected Result**: Should navigate to `/shop?tags=НАРНЫ-ТОС`

### Test 2: URL Parameter Handling
1. **Manually navigate to**: `/shop?tags=МАСК`
2. **Expected Result**: Shop page should load and filter products by "МАСК" tag
3. **Check Filter UI**: The tag filter should show "МАСК" as selected

### Test 3: Multiple Tags
1. **Navigate to**: `/shop?tags=МАСК,ТОНЕР`
2. **Expected Result**: Products should be filtered by both "МАСК" and "ТОНЕР" tags

### Test 4: Hierarchical Tags (if available)
1. **Navigate to**: `/shop?hierarchicalTags=anti_aging,moisturizing`
2. **Expected Result**: Products should be filtered by hierarchical tag values

## URL Examples

### Simple Tag Filtering
```
/shop?tags=НАРНЫ-ТОС
/shop?tags=МАСК
/shop?tags=ТОНЕР,АМПУЛЬ
```

### With Additional Filters
```
/shop?tags=НАРНЫ-ТОС&priceMin=10000&priceMax=50000
/shop?tags=МАСК&inStock=true&hasDiscount=true
```

### Hierarchical Tags
```
/shop?hierarchicalTags=anti_aging,moisturizing
/shop?tagGroups={"1":["anti_aging","moisturizing"]}
```

## Expected API Calls

### When clicking "НАРНЫ ТОС" category:
1. **Filter Options API**: `GET /api/v1/filters?context=category&include=all&appliedFilters={"tags":["НАРНЫ-ТОС"]}`
2. **Products API**: `GET /api/v1/products/enhanced?tags=НАРНЫ-ТОС&page=1&limit=20&sortBy=newest`

## Category Image Mappings

The following categories are available as images:
- АМПУЛЬ → `/shop?tags=АМПУЛЬ`
- БИЕИЙН-ТОС → `/shop?tags=БИЕИЙН-ТОС`
- БИЕИЙН-ШИНГЭН-САВАН → `/shop?tags=БИЕИЙН-ШИНГЭН-САВАН`
- ГАРЫН-ТОС → `/shop?tags=ГАРЫН-ТОС`
- МАСК → `/shop?tags=МАСК`
- НАРНЫ-ТОС → `/shop?tags=НАРНЫ-ТОС`
- НҮҮРНИЙ-ТОС → `/shop?tags=НҮҮРНИЙ-ТОС`
- ТОНЕР → `/shop?tags=ТОНЕР`
- УРУУЛЫН-БАЛМ → `/shop?tags=УРУУЛЫН-БАЛМ`
- ҮНЭРТЭН → `/shop?tags=ҮНЭРТЭН`
- ШАМПУНЬ → `/shop?tags=ШАМПУНЬ`
- ШҮДНИЙ-ОО → `/shop?tags=ШҮДНИЙ-ОО`

## Troubleshooting

### If categories don't filter correctly:
1. **Check Backend**: Ensure products have the correct tags in database
2. **Check API Response**: Verify filter API returns expected results
3. **Check URL Encoding**: Mongolian characters should be properly encoded

### If URL parameters aren't working:
1. **Check searchParams**: Ensure Next.js is properly parsing URL parameters
2. **Check Filter Context**: Verify filters are being applied to the context
3. **Check Network Tab**: Verify correct API calls are being made

## Database Requirements

### For Simple Tags (ProductTag):
```sql
-- Products should have tags matching category names
INSERT INTO ProductTag (productId, tag) VALUES (1, 'НАРНЫ-ТОС');
INSERT INTO ProductTag (productId, tag) VALUES (2, 'МАСК');
```

### For Hierarchical Tags (ProductTagNew):
```sql
-- Create tag groups and options
INSERT INTO TagGroup (name, description) VALUES ('Product Type', 'Type of beauty product');
INSERT INTO TagOption (groupId, name, value) VALUES (1, 'Sun Oil', 'НАРНЫ-ТОС');
INSERT INTO ProductTagNew (productId, tagOptionId) VALUES (1, 1);
```

## Success Criteria

✅ **Category buttons route to `/shop?tags=` URLs**  
✅ **Shop page correctly parses and applies tag filters**  
✅ **Filter system supports both simple and hierarchical tags**  
✅ **URL parameters are properly encoded/decoded**  
✅ **Backward compatibility maintained**  

The implementation is complete and ready for testing!
