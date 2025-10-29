/**
 * Cache Performance Monitor
 * Tracks cache hits, misses, and response times for Redis-backed API calls
 * 
 * WHY: Helps identify cache effectiveness and optimize TTL values
 */

class CacheMonitor {
  constructor() {
    this.enabled = typeof window !== 'undefined';
    this.stats = {
      hits: 0,
      misses: 0,
      totalResponseTime: 0,
      requests: 0,
      endpoints: {}, // Per-endpoint statistics
    };
  }

  /**
   * Track an API response
   * @param {Response} response - Fetch API response object
   * @param {string} endpoint - API endpoint path
   * @param {number} startTime - Request start timestamp
   */
  trackResponse(response, endpoint, startTime) {
    if (!this.enabled) return;

    const responseTime = Date.now() - startTime;
    
    // Extract cache headers
    const cacheStatus = response.headers?.get?.('X-Cache') || 'UNKNOWN';
    const serverResponseTime = response.headers?.get?.('X-Response-Time');
    const dataSource = response.headers?.get?.('X-Data-Source');
    
    // Update global stats
    this.stats.requests++;
    
    if (cacheStatus === 'HIT') {
      this.stats.hits++;
    } else if (cacheStatus === 'MISS') {
      this.stats.misses++;
    }
    
    this.stats.totalResponseTime += responseTime;

    // Update per-endpoint stats
    if (!this.stats.endpoints[endpoint]) {
      this.stats.endpoints[endpoint] = {
        hits: 0,
        misses: 0,
        requests: 0,
        avgResponseTime: 0,
        totalResponseTime: 0,
      };
    }
    
    const endpointStats = this.stats.endpoints[endpoint];
    endpointStats.requests++;
    endpointStats.totalResponseTime += responseTime;
    endpointStats.avgResponseTime = endpointStats.totalResponseTime / endpointStats.requests;
    
    if (cacheStatus === 'HIT') {
      endpointStats.hits++;
    } else if (cacheStatus === 'MISS') {
      endpointStats.misses++;
    }

    // Log in development mode
    if (process.env.NODE_ENV === 'development' && cacheStatus !== 'UNKNOWN') {
      console.log(
        `📊 ${cacheStatus === 'HIT' ? '✅' : '⚠️'} ${endpoint}:`,
        `${responseTime}ms`,
        serverResponseTime ? `(server: ${serverResponseTime})` : '',
        dataSource ? `[${dataSource}]` : ''
      );
    }
  }

  /**
   * Get overall cache statistics
   */
  getStats() {
    const hitRate = this.stats.requests > 0 
      ? (this.stats.hits / this.stats.requests * 100).toFixed(2)
      : 0;
    
    const avgResponseTime = this.stats.requests > 0
      ? (this.stats.totalResponseTime / this.stats.requests).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      avgResponseTime: `${avgResponseTime}ms`,
    };
  }

  /**
   * Get statistics for a specific endpoint
   */
  getEndpointStats(endpoint) {
    const stats = this.stats.endpoints[endpoint];
    if (!stats) return null;

    const hitRate = stats.requests > 0
      ? (stats.hits / stats.requests * 100).toFixed(2)
      : 0;

    return {
      ...stats,
      hitRate: `${hitRate}%`,
      avgResponseTime: `${stats.avgResponseTime.toFixed(2)}ms`,
    };
  }

  /**
   * Log statistics to console (formatted table)
   */
  log() {
    if (!this.enabled) return;
    
    console.group('📊 Cache Performance Report');
    console.table({
      'Overall': this.getStats()
    });
    
    if (Object.keys(this.stats.endpoints).length > 0) {
      console.group('📍 Per-Endpoint Statistics');
      const endpointTable = {};
      Object.entries(this.stats.endpoints).forEach(([endpoint, stats]) => {
        const hitRate = stats.requests > 0
          ? (stats.hits / stats.requests * 100).toFixed(2)
          : 0;
        endpointTable[endpoint] = {
          requests: stats.requests,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: `${hitRate}%`,
          avgTime: `${stats.avgResponseTime.toFixed(2)}ms`,
        };
      });
      console.table(endpointTable);
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.stats = {
      hits: 0,
      misses: 0,
      totalResponseTime: 0,
      requests: 0,
      endpoints: {},
    };
  }
}

// Export singleton instance
export const cacheMonitor = new CacheMonitor();

// Make available globally for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__cacheMonitor = cacheMonitor;
  window.__logCacheStats = () => cacheMonitor.log();
}

export default cacheMonitor;

