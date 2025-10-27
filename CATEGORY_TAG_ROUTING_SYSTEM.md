# Updated Category/Tag Routing System

## Overview

The Categories component now differentiates between **categories** and **tags**, routing to different URLs based on the item type.

## New Structure

Each item now has:
- `image`: Path to the image file
- `name`: Display name
- `type`: Either `'category'` or `'tag'`

## Routing Logic

### For Tags (type: 'tag')
Routes to: `/shop?tags={tagName}`

**Examples:**
- АМПУЛЬ → `/shop?tags=АМПУЛЬ`
- МАСК → `/shop?tags=МАСК`
- НАРНЫ-ТОС → `/shop?tags=НАРНЫ-ТОС`
- НҮҮРНИЙ-ТОС → `/shop?tags=НҮҮРНИЙ-ТОС`
- ТОНЕР → `/shop?tags=ТОНЕР`

### For Categories (type: 'category')
Routes to: `/shop/{categoryId}`

**Examples:**
- БИЕИЙН-ТОС → `/shop/5` (finds matching category ID)
- ШАМПУНЬ → `/shop/8` (finds matching category ID)
- ҮНЭРТЭН → `/shop/12` (finds matching category ID)

## Current Configuration

Based on your filter image, I've configured the following as **tags**:
- ✅ **АМПУЛЬ** (tag) - Shows count: 3
- ✅ **МАСК** (tag) - Shows count: not visible
- ✅ **НАРНЫ-ТОС** (tag) - Shows count: 4
- ✅ **НҮҮРНИЙ-ТОС** (tag) - Shows count: 2
- ✅ **ТОНЕР** (tag) - Shows count: 1

And the following as **categories**:
- 📁 **БИЕИЙН-ТОС** (category)
- 📁 **БИЕИЙН-ШИНГЭН-САВАН** (category)
- 📁 **ГАРЫН-ТОС** (category)
- 📁 **УРУУЛЫН-БАЛМ** (category)
- 📁 **ҮНЭРТЭН** (category)
- 📁 **ШАМПУНЬ** (category)
- 📁 **ШҮДНИЙ-ОО** (category)

## How to Modify

To change an item from category to tag or vice versa, simply update the `type` field:

```javascript
{
  image: '/assets/images/categories/EXAMPLE.png',
  name: 'EXAMPLE',
  type: 'tag' // Change to 'category' if needed
}
```

## Testing

### Test Tag Routing:
1. Click **НАРНЫ-ТОС** → Should go to `/shop?tags=НАРНЫ-ТОС`
2. Click **ТОНЕР** → Should go to `/shop?tags=ТОНЕР`
3. Click **АМПУЛЬ** → Should go to `/shop?tags=АМПУЛЬ`

### Test Category Routing:
1. Click **ШАМПУНЬ** → Should go to `/shop/{categoryId}`
2. Click **ҮНЭРТЭН** → Should go to `/shop/{categoryId}`

## Notes

- **Tags** will filter products by tag name using the new hierarchical tag system we implemented
- **Categories** will show all products in that category using the existing category system
- The system automatically finds matching category IDs for category-type items
- All Mongolian characters are properly URL-encoded

This gives you the flexibility to mix both categories and tags in your homepage navigation!
