# 🛍️ Shop Category Filtering System Guide

## Overview

The enhanced shop/[id] page now supports comprehensive filtering based on category attributes, specifications, and other product properties. The system automatically loads all available filter options from your backend and provides a dynamic, responsive filtering experience.

## Features

### ✅ Dynamic Attribute Filtering
- **Colors** (өнгө) - All available colors from product variants
- **Sizes** (хэмжээ) - All available sizes from product variants  
- **Custom Attributes** - Any attribute defined in your backend (үнэртэн, материал, etc.)

### ✅ Specification Filtering
- **Product Specs** - All specifications like "Хэмжээ:", "SPF", "Volume", etc.
- **Dynamic Values** - Automatically loads all available values for each spec

### ✅ Advanced Filtering
- **Brands** - Multi-select with search functionality
- **Price Ranges** - Predefined ranges or custom slider
- **Tags** - Simple and hierarchical tags
- **Stock Status** - In stock only toggle
- **Discounts** - On sale products toggle
- **Search** - Text search across products

### ✅ URL Synchronization
- All filters are saved in URL parameters
- Shareable links with applied filters
- Browser back/forward support
- SEO-friendly URLs

## How It Works

### 1. Category-Based Filtering
When you visit `/shop/123`, the system:
1. Loads the category information
2. Fetches all available filter options for that category
3. Includes child categories automatically (hierarchical filtering)
4. Shows only relevant filters based on available products

### 2. Dynamic Filter Options
The system automatically:
- Discovers all attributes from product variants
- Loads all specifications from product specs
- Shows product counts for each filter option
- Updates filter options when filters are applied

### 3. Real-time Filtering
- **Instant filters**: Brands, attributes, specs, tags, toggles
- **Debounced filters**: Search (300ms), price slider (500ms)
- **URL updates**: Automatically syncs with browser URL

## URL Structure

### Basic Category Page
```
/shop/123
```

### With Filters Applied
```
/shop/123?brands=1,2&priceMin=10000&priceMax=50000&attributes=color:red,color:blue&specs=Хэмжээ:3 г&tags=organic&inStock=true
```

### URL Parameters
- `brands` - Comma-separated brand IDs: `1,2,3`
- `priceMin` - Minimum price: `10000`
- `priceMax` - Maximum price: `50000`
- `attributes` - Attribute filters: `color:red,size:large`
- `specs` - Specification filters: `Хэмжээ:3 г,SPF:30`
- `tags` - Tag filters: `organic,vegan`
- `inStock` - Stock filter: `true` or `false`
- `hasDiscount` - Discount filter: `true` or `false`
- `search` - Search query: `smartphone`
- `page` - Page number: `2`
- `limit` - Products per page: `20`
- `sort` - Sort order: `price-asc`, `price-desc`, `newest`, `rating`

## Backend API Integration

### Filter Options API
```javascript
GET /api/v1/filters?categoryId=123&context=category&include=all

// Response includes:
{
  "filters": {
    "brands": [
      { "id": 1, "name": "Apple", "count": 25 },
      { "id": 2, "name": "Samsung", "count": 18 }
    ],
    "attributes": {
      "color": {
        "name": "Color",
        "options": [
          { "id": 1, "value": "Red", "count": 15 },
          { "id": 2, "value": "Blue", "count": 12 }
        ]
      }
    },
    "specs": {
      "Хэмжээ:": {
        "type": "Хэмжээ:",
        "values": [
          { "value": "3 г", "count": 8 },
          { "value": "5 г", "count": 5 }
        ]
      }
    }
  }
}
```

### Enhanced Products API
```javascript
GET /api/v1/products/enhanced?categoryId=123&brands=1,2&attributes=color:red,size:large&page=1&limit=20

// Response includes filtered products with pagination
```

## Component Structure

### Main Components
1. **ShopCategoryPage** (`/app/shop/[categoryId]/page.jsx`)
   - Server-side page component
   - Handles URL parameter parsing
   - Passes initial filters to layout

2. **ShopLayoutWrapper** (`/components/shoplist/ShopLayoutWrapper.jsx`)
   - Manages filter state between components
   - Coordinates filter changes
   - Handles initial filter setup

3. **FilterAll** (`/components/shoplist/filter/FilterAll.jsx`)
   - Dynamic filter sidebar
   - Loads filter options from backend
   - Handles filter interactions
   - URL synchronization

4. **Shop4** (`/components/shoplist/Shop4.jsx`)
   - Product grid display
   - Applies filters to product loading
   - Handles pagination and sorting

### Filter Context
- **FilterProvider** - Provides global filter state
- **useFilterContext** - Hook to access filter state
- Centralized filter management across components

## Usage Examples

### 1. Basic Category Page
```jsx
// Visit /shop/123
// Automatically loads all products in category 123
// Shows all available filters for that category
```

### 2. Filtered Category Page
```jsx
// Visit /shop/123?brands=1,2&attributes=color:red
// Shows only products from brands 1,2 with red color
// Filter sidebar shows selected filters
```

### 3. Search with Filters
```jsx
// Visit /shop/123?search=smartphone&priceMin=100000&inStock=true
// Shows smartphones in category 123
// Price range 100,000+ and in stock only
```

## Filter Types

### 1. Attribute Filters
- **Source**: Product variant attributes
- **Format**: `attributes=color:red,color:blue,size:large`
- **UI**: Button-based multi-select
- **Examples**: Colors, sizes, materials, scents

### 2. Specification Filters  
- **Source**: Product specifications
- **Format**: `specs=Хэмжээ:3 г,SPF:30`
- **UI**: Button-based multi-select
- **Examples**: Weight, SPF, volume, dimensions

### 3. Brand Filters
- **Source**: Product brands
- **Format**: `brands=1,2,3`
- **UI**: Searchable multi-select list
- **Features**: Search functionality, product counts

### 4. Price Filters
- **Source**: Product prices
- **Format**: `priceMin=10000&priceMax=50000`
- **UI**: Predefined ranges or custom slider
- **Features**: Category-specific price ranges

### 5. Tag Filters
- **Source**: Product tags
- **Format**: `tags=organic,vegan`
- **UI**: Button-based multi-select
- **Types**: Simple tags and hierarchical tags

### 6. Boolean Filters
- **Stock**: `inStock=true` - Show only in-stock products
- **Discount**: `hasDiscount=true` - Show only discounted products
- **UI**: Toggle switches

## Mobile Responsiveness

### Desktop Experience
- Full sidebar with all filters
- Accordion-style filter sections
- Grid view options (2, 3, 4 columns)

### Mobile Experience
- Collapsible filter modal
- Touch-friendly filter buttons
- Optimized for small screens
- Filter count badges

## Performance Features

### 1. Smart Loading
- **Filter Options**: Cached for 5 minutes
- **Products**: Debounced loading (300-500ms)
- **Pagination**: Lazy loading support

### 2. URL Optimization
- Only active filters in URL
- Clean URLs without empty parameters
- Browser history support

### 3. State Management
- Centralized filter state
- Optimistic UI updates
- Error handling and fallbacks

## Customization

### Adding New Filter Types
1. Update backend filter configuration
2. Add filter type to FilterAll component
3. Update URL parsing functions
4. Add UI components for new filter type

### Styling
- Bootstrap-based responsive design
- Custom CSS classes for filter components
- Themeable color schemes
- Mobile-first approach

## Troubleshooting

### Common Issues

1. **Filters not showing**
   - Check if products exist in category
   - Verify backend API responses
   - Check browser console for errors

2. **URL not updating**
   - Ensure client-side JavaScript is enabled
   - Check for JavaScript errors
   - Verify URL parameter format

3. **Slow performance**
   - Check network requests in DevTools
   - Verify backend response times
   - Consider reducing products per page

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Best Practices

### 1. Filter Design
- Group related filters together
- Use clear, descriptive labels
- Show product counts for each option
- Provide clear all filters option

### 2. Performance
- Limit products per page (20-50)
- Use debouncing for search inputs
- Cache filter options
- Optimize database queries

### 3. User Experience
- Show loading states
- Provide clear feedback
- Handle empty states gracefully
- Make filters easily accessible

### 4. SEO
- Use semantic URL parameters
- Provide canonical URLs
- Include filter information in meta tags
- Support browser navigation

## Future Enhancements

### Planned Features
- **Filter Presets** - Save and share filter combinations
- **Advanced Search** - Full-text search with filters
- **Filter Analytics** - Track popular filter combinations
- **A/B Testing** - Test different filter layouts
- **Personalization** - Remember user preferences

### Integration Opportunities
- **Recommendation Engine** - Suggest related filters
- **Inventory Management** - Real-time stock updates
- **Price Alerts** - Notify on price changes
- **Wishlist Integration** - Filter by wishlist items

---

## Quick Start

1. **Visit a category page**: `/shop/123`
2. **Apply filters**: Use the sidebar to select filters
3. **Share results**: Copy the URL to share filtered results
4. **Navigate**: Use browser back/forward buttons
5. **Clear filters**: Click "Clear All" button

The system automatically handles all the complexity while providing a smooth, responsive filtering experience for your users.
