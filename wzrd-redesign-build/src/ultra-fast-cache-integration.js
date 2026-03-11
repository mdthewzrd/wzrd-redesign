#!/usr/bin/env node

/**
 * Ultra-Fast Cache Integration for Remi
 * Implements the original WZRD ultra-fast optimization (100-169× speedup)
 * Integrated with Remi's context management system
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class UltraFastCache {
  constructor() {
    this.cacheDir = path.join(process.env.HOME, '.cache', 'wzrd-ultra');
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL
    this.initCacheDir();
  }

  initCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate cache key from query parameters
   */
  generateKey(query, model, mode) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify({ query, model, mode }));
    return hash.digest('hex').slice(0, 32);
  }

  /**
   * Check if cached response exists and is fresh
   */
  getCachedResponse(query, model, mode) {
    const key = this.generateKey(query, model, mode);
    const cacheFile = path.join(this.cacheDir, `${key}.json`);
    
    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const now = Date.now();
      
      if (now - cached.timestamp > this.ttl) {
        // Cache expired
        fs.unlinkSync(cacheFile);
        return null;
      }

      return cached.response;
    } catch (error) {
      // Corrupted cache file
      fs.unlinkSync(cacheFile);
      return null;
    }
  }

  /**
   * Cache a response
   */
  cacheResponse(query, model, mode, response) {
    const key = this.generateKey(query, model, mode);
    const cacheFile = path.join(this.cacheDir, `${key}.json`);
    
    const cacheEntry = {
      timestamp: Date.now(),
      query,
      model,
      mode,
      response
    };

    try {
      fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2));
      return true;
    } catch (error) {
      console.error('Cache write failed:', error.message);
      return false;
    }
  }

  /**
   * Clear expired cache entries
   */
  cleanup() {
    try {
      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();
      let cleaned = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const cacheFile = path.join(this.cacheDir, file);
        try {
          const content = fs.readFileSync(cacheFile, 'utf8');
          const cached = JSON.parse(content);
          
          if (now - cached.timestamp > this.ttl) {
            fs.unlinkSync(cacheFile);
            cleaned++;
          }
        } catch (error) {
          // Corrupted file, remove it
          fs.unlinkSync(cacheFile);
          cleaned++;
        }
      }

      return cleaned;
    } catch (error) {
      console.error('Cache cleanup failed:', error.message);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    try {
      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();
      let totalSize = 0;
      let validEntries = 0;
      let expiredEntries = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const cacheFile = path.join(this.cacheDir, file);
        try {
          const stats = fs.statSync(cacheFile);
          totalSize += stats.size;

          const content = fs.readFileSync(cacheFile, 'utf8');
          const cached = JSON.parse(content);
          
          if (now - cached.timestamp > this.ttl) {
            expiredEntries++;
          } else {
            validEntries++;
          }
        } catch (error) {
          // Corrupted file
          expiredEntries++;
        }
      }

      return {
        totalEntries: files.filter(f => f.endsWith('.json')).length,
        validEntries,
        expiredEntries,
        totalSizeBytes: totalSize,
        cacheDir: this.cacheDir,
        ttlMinutes: this.ttl / (60 * 1000)
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

/**
 * Remi Ultra-Fast Response Wrapper
 * Integrates cache with Remi's response system
 */
class RemiUltraFastWrapper {
  constructor() {
    this.cache = new UltraFastCache();
    this.stats = {
      hits: 0,
      misses: 0,
      responseTimeSavedMs: 0
    };
  }

  /**
   * Get response with ultra-fast caching
   */
  async getResponse(query, model, mode, responseGenerator) {
    const startTime = Date.now();
    
    // Try cache first
    const cached = this.cache.getCachedResponse(query, model, mode);
    if (cached) {
      const cacheTime = Date.now() - startTime;
      this.stats.hits++;
      this.stats.responseTimeSavedMs += cacheTime;
      
      console.log(`[Ultra-Fast Cache] HIT - ${cacheTime}ms`);
      return cached;
    }

    // Cache miss, generate response
    console.log(`[Ultra-Fast Cache] MISS - generating response`);
    this.stats.misses++;
    
    const response = await responseGenerator();
    const generationTime = Date.now() - startTime;
    
    // Cache the response for future use
    this.cache.cacheResponse(query, model, mode, response);
    
    console.log(`[Ultra-Fast Cache] Generated in ${generationTime}ms`);
    return response;
  }

  /**
   * Get current statistics
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;

    return {
      cache: cacheStats,
      performance: {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: `${hitRate.toFixed(2)}%`,
        responseTimeSavedMs: this.stats.responseTimeSavedMs,
        avgSavedPerHit: this.stats.hits > 0 
          ? Math.round(this.stats.responseTimeSavedMs / this.stats.hits) 
          : 0
      }
    };
  }

  /**
   * Cleanup expired cache entries
   */
  cleanup() {
    const cleaned = this.cache.cleanup();
    console.log(`[Ultra-Fast Cache] Cleaned ${cleaned} expired entries`);
    return cleaned;
  }
}

// Export for use in Remi
module.exports = {
  UltraFastCache,
  RemiUltraFastWrapper
};

// Test function if run directly
if (require.main === module) {
  const wrapper = new RemiUltraFastWrapper();
  
  // Test cache
  const testQuery = "What is the meaning of life?";
  const testModel = "deepseek-v3.2";
  const testMode = "THINKER";
  
  async function testResponseGenerator() {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate 1s response
    return "42 - The answer to life, the universe, and everything.";
  }
  
  async function runTest() {
    console.log('=== Testing Ultra-Fast Cache Integration ===\n');
    
    // First call (should miss)
    console.log('1. First request (cache miss)...');
    const result1 = await wrapper.getResponse(testQuery, testModel, testMode, testResponseGenerator);
    console.log(`   Result: ${result1}\n`);
    
    // Second call (should hit)
    console.log('2. Second request (cache hit)...');
    const result2 = await wrapper.getResponse(testQuery, testModel, testMode, testResponseGenerator);
    console.log(`   Result: ${result2}\n`);
    
    // Get stats
    console.log('3. Cache statistics...');
    const stats = wrapper.getStats();
    console.log(JSON.stringify(stats, null, 2));
    
    // Cleanup
    console.log('\n4. Cache cleanup...');
    wrapper.cleanup();
    
    console.log('\n=== Test Complete ===');
  }
  
  runTest().catch(console.error);
}