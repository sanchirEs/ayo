import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * API Route Proxy for Shop Bundle
 * Proxies client-side requests to backend shop bundle endpoint
 * Enables filter updates without full page reload
 */
export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // Get search params from request
    const { searchParams } = new URL(request.url);
    
    // Build backend API URL
    const backendUrl = `${env.backendUrl}/api/v1/shop/bundle?${searchParams.toString()}`;
    
    console.log('🔄 Proxying shop bundle request:', backendUrl);
    
    // Forward to backend
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 minute in Next.js (Redis handles main caching on backend)
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      console.error(`❌ Backend API error: ${response.status}`);
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log performance
    const proxyTime = Date.now() - startTime;
    const backendTime = response.headers.get('X-Response-Time');
    const dataSource = response.headers.get('X-Data-Source');
    
    console.log(`✅ Shop bundle proxied: ${proxyTime}ms (backend: ${backendTime}, source: ${dataSource})`);
    
    // Forward performance headers
    const nextResponse = NextResponse.json(data);
    nextResponse.headers.set('X-Response-Time', `${proxyTime}ms`);
    nextResponse.headers.set('X-Backend-Time', backendTime || 'unknown');
    nextResponse.headers.set('X-Data-Source', dataSource || 'unknown');
    
    // Add cache control for browser
    nextResponse.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    
    return nextResponse;
    
  } catch (error) {
    console.error('❌ Shop API proxy error:', error);
    
    // Return fallback data
    return NextResponse.json({
      success: true,
      data: {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        filters: { brands: [], attributes: [], priceRange: { min: 0, max: 100000 } },
        category: null,
        appliedFilters: {},
        sortOptions: [
          { key: 'newest', label: 'Шинэ нь эхэндээ', active: true }
        ],
        meta: { fallback: true, error: error.message }
      },
      error: error.message
    }, { status: 200 }); // Return 200 to prevent UI breaks
  }
}


