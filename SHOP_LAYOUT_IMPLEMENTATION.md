# Shop Layout Implementation with Next.js 13+ App Router

## Overview
This implementation restructures the shop-4/[id] route to use Next.js Parallel Routes and Layouts with loading.tsx and Suspense for better performance.

## New Structure

### Directory Structure
```
app/
├── shop/
│   ├── layout.tsx          # Main shop layout with sidebar + header
│   ├── page.tsx            # Main shop page (all products)
│   ├── loading.tsx         # Loading state for shop route
│   └── [categoryId]/
│       ├── page.tsx        # Category-specific products
│       └── loading.tsx     # Loading state for category route
```

### Key Components

#### 1. `app/shop/layout.tsx`
- Main layout wrapper for all shop routes
- Contains the category sidebar and header
- Uses Suspense for loading states
- Imports `ShopLayoutWrapper` component

#### 2. `app/shop/page.tsx`
- Main shop page showing all products
- Renders `Shop4` component without sidebar/header
- Uses Suspense for product loading

#### 3. `app/shop/[categoryId]/page.tsx`
- Dynamic route for category-specific products
- Accepts URL parameters: page, limit, sort
- Renders `Shop4` component with category filtering

#### 4. `components/shoplist/ShopLayoutWrapper.jsx`
- Client component that manages filter state
- Renders sidebar (FilterAll) and header (BreadCumb)
- Handles filter changes and passes to children

#### 5. Loading States
- `loading.tsx` files provide loading states for each route
- Uses Suspense boundaries for smooth transitions
- Only the main content area changes, sidebar/header remain static

## Benefits

### Performance
- **Static Sidebar/Header**: Category sidebar and breadcrumb navigation remain fixed
- **Dynamic Content**: Only product list updates when navigating between categories
- **Suspense Boundaries**: Smooth loading states without full page refresh

### User Experience
- **Persistent Navigation**: Users don't lose their place in the category tree
- **Faster Navigation**: No need to reload sidebar and header
- **Smooth Transitions**: Loading states provide visual feedback

### Code Organization
- **Separation of Concerns**: Layout logic separated from product logic
- **Reusable Components**: Shop4 component can be used in different contexts
- **Maintainable Structure**: Clear separation between layout and content

## URL Structure

### Main Shop
- `/shop` - All products with sidebar and filters

### Category Pages
- `/shop/123` - Products from category ID 123
- `/shop/123?page=2&limit=24&sort=price-asc` - With pagination and sorting

## CSS Classes

### Layout Classes
- `.shop-layout` - Main container
- `.shop-header` - Header section with breadcrumbs
- `.shop-content` - Flex container for sidebar and main content
- `.shop-sidebar` - Fixed sidebar with filters
- `.shop-main` - Main content area for products

### Loading Classes
- `.shop-loading` - Loading state for main shop
- `.category-loading` - Loading state for category pages

## Responsive Design
- **Desktop**: Sidebar fixed on left, main content on right
- **Tablet**: Sidebar above main content
- **Mobile**: Stacked layout with full-width components

## Migration Notes

### From shop-4 to shop
- Update navigation links from `/shop-4` to `/shop`
- Breadcrumb component automatically updated
- Existing Shop4 component functionality preserved

### Filter Integration
- FilterAll component receives `onFiltersChange` prop
- Filter state managed in ShopLayoutWrapper
- Filters persist across category navigation

## Future Enhancements
- Add search functionality to sidebar
- Implement filter persistence in URL
- Add category tree expansion state
- Implement infinite scroll for products
