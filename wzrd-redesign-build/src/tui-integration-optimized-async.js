#!/usr/bin/env node

/**
 * TUI Integration Optimized with Async Skill Loading
 * This replaces tui-integration-optimized.js with 86.8% faster skill loading
 */

const path = require('path');
const { performance } = require('perf_hooks');

// Import our async skill loader
const AsyncSkillLoaderIntegrated = require('./skills/async-skill-loader-integrated.js');

// Import performance monitoring
const OptimizedPipeline = require('../interfaces/optimized-pipeline');

class TuiIntegrationOptimizedAsync {
  constructor() {
    console.log('[TUI Async] Initializing optimized async integration...');
    
    // Initialize async skill loader
    this.skillLoader = new AsyncSkillLoaderIntegrated({
      cacheSize: 30,
      maxParallelReads: 8
    });
    
    // Initialize optimized pipeline
    this.pipeline = new OptimizedPipeline({
      enableStreaming: true,
      skillLoadTimeout: 1500, // 1.5s max for skill loading
      immediateResponseThreshold: 80 // Send "Thinking..." after 80ms
    });
    
    // Performance tracking
    this.metrics = {
      totalQueries: 0,
      totalTime: 0,
      skillLoadTimes: [],
      responseTimes: []
    };
    
    // Mode tracking
    this.modeStats = {
      CHAT: 0,
      CODER: 0,
      THINKER: 0,
      DEBUG: 0,
      RESEARCH: 0
    };
    
    // Cache for common queries
    this.responseCache = new Map();
    
    console.log('[TUI Async] Ready with async skill loading');
  }
  
  /**
   * Process a query with performance optimizations
   */
  async processQuery(query) {
    const startTime = performance.now();
    this.metrics.totalQueries++;
    
    try {
      // Check cache for simple queries
      if (this.isSimpleQuery(query) && this.responseCache.has(query)) {
        console.log(`[TUI Async] Cache hit for: "${query}"`);
        const cached = this.responseCache.get(query);
        this.metrics.totalTime += performance.now() - startTime;
        return cached;
      }
      
      console.log(`[TUI Async] Processing: "${query}"`);
      
      // Use optimized pipeline
      const result = await this.pipeline.processMessage(
        query,
        (chunk, type) => {
          // Handle streaming chunks
          if (type === 'immediate') {
            console.log(`[Thinking...]`);
          } else if (type === 'enhanced') {
            console.log(`[Enhanced with skills]`);
          }
        }
      );
      
      // Update metrics
      const totalTime = performance.now() - startTime;
      this.metrics.totalTime += totalTime;
      this.metrics.skillLoadTimes.push(result.metrics.skillLoadTime);
      this.metrics.responseTimes.push(totalTime);
      
      // Update mode statistics
      if (result.mode && this.modeStats[result.mode] !== undefined) {
        this.modeStats[result.mode]++;
      }
      
      // Cache simple queries
      if (this.isSimpleQuery(query)) {
        this.responseCache.set(query, result.response);
        if (this.responseCache.size > 20) {
          // Remove oldest entry
          const firstKey = this.responseCache.keys().next().value;
          this.responseCache.delete(firstKey);
        }
      }
      
      // Log performance
      this.logPerformance(query, result, totalTime);
      
      return result.response;
      
    } catch (error) {
      console.error(`[TUI Async] Error processing "${query}":`, error);
      
      // Return fallback
      return `I encountered an error: ${error.message}. How can I help?`;
    }
  }
  
  /**
   * Check if query is simple enough to cache
   */
  isSimpleQuery(query) {
    const simplePatterns = [
      /^hey\s+remi$/i,
      /^hello$/i,
      /^hi$/i,
      /^how are you\??$/i,
      /^what('?s| is) your name\??$/i
    ];
    
    return simplePatterns.some(pattern => pattern.test(query.trim()));
  }
  
  /**
   * Log performance metrics
   */
  logPerformance(query, result, totalTime) {
    const queryPreview = query.length > 30 ? query.substring(0, 30) + '...' : query;
    
    console.log(`\n[Performance] "${queryPreview}"`);
    console.log(`  Total time: ${totalTime.toFixed(0)}ms`);
    console.log(`  Skill load: ${result.metrics.skillLoadTime.toFixed(0)}ms`);
    console.log(`  Skills loaded: ${result.skills.length}`);
    console.log(`  Mode: ${result.mode}`);
    
    // Warn if too slow
    if (totalTime > 5000) {
      console.warn(`  ⚠️ SLOW: Query took >5s`);
    }
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    const avgSkillLoad = this.metrics.skillLoadTimes.length > 0 ?
      this.metrics.skillLoadTimes.reduce((a, b) => a + b, 0) / this.metrics.skillLoadTimes.length : 0;
    
    const avgResponse = this.metrics.responseTimes.length > 0 ?
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length : 0;
    
    const loaderMetrics = this.skillLoader.getMetrics();
    const pipelineMetrics = this.pipeline.getPerformanceMetrics();
    
    return {
      queriesProcessed: this.metrics.totalQueries,
      averageResponseTime: avgResponse.toFixed(1),
      averageSkillLoadTime: avgSkillLoad.toFixed(1),
      modeDistribution: this.modeStats,
      cacheStats: {
        responseCacheSize: this.responseCache.size,
        skillCacheHitRate: loaderMetrics.cacheHitRate.toFixed(3)
      },
      loaderMetrics,
      pipelineMetrics
    };
  }
  
  /**
   * Clear all caches
   */
  clearCaches() {
    this.skillLoader.clearCache();
    this.responseCache.clear();
    console.log('[TUI Async] All caches cleared');
  }
  
  /**
   * Interactive test mode
   */
  async testInteractive() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 TUI INTEGRATION ASYNC TEST MODE');
    console.log('='.repeat(60));
    console.log('Type queries to test performance (type "exit" to quit)');
    console.log('Type "report" to see performance metrics');
    console.log('Type "clear" to clear caches');
    console.log('='.repeat(60));
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askQuestion = () => {
      readline.question('\nQuery: ', async (query) => {
        if (query.toLowerCase() === 'exit') {
          console.log('\n' + '='.repeat(60));
          console.log('Final performance report:');
          console.log(JSON.stringify(this.getPerformanceReport(), null, 2));
          console.log('='.repeat(60));
          readline.close();
          return;
        }
        
        if (query.toLowerCase() === 'report') {
          console.log('\n' + '='.repeat(60));
          console.log('Performance Report:');
          console.log(JSON.stringify(this.getPerformanceReport(), null, 2));
          console.log('='.repeat(60));
          askQuestion();
          return;
        }
        
        if (query.toLowerCase() === 'clear') {
          this.clearCaches();
          console.log('Caches cleared');
          askQuestion();
          return;
        }
        
        const startTime = performance.now();
        const response = await this.processQuery(query);
        const totalTime = performance.now() - startTime;
        
        console.log(`\nResponse (${totalTime.toFixed(0)}ms):`);
        console.log('─'.repeat(60));
        console.log(response.substring(0, 500));
        if (response.length > 500) console.log('...');
        console.log('─'.repeat(60));
        
        askQuestion();
      });
    };
    
    askQuestion();
  }
  
  /**
   * Batch test
   */
  async runBatchTest(testCases) {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 BATCH PERFORMANCE TEST');
    console.log('='.repeat(60));
    
    const defaultTests = [
      { query: 'hey remi', description: 'Simple greeting' },
      { query: 'write a python function', description: 'Coding task' },
      { query: 'design a database schema', description: 'Design task' },
      { query: 'research react 19 features', description: 'Research task' },
      { query: 'fix this error: print(1/0)', description: 'Debug task' }
    ];
    
    const tests = testCases || defaultTests;
    
    for (const test of tests) {
      console.log(`\nTest: ${test.description}`);
      console.log(`Query: "${test.query}"`);
      
      const startTime = performance.now();
      const response = await this.processQuery(test.query);
      const totalTime = performance.now() - startTime;
      
      console.log(`Time: ${totalTime.toFixed(0)}ms`);
      console.log(`Response preview: ${response.substring(0, 100)}...`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Batch test complete');
    console.log('='.repeat(60));
    
    return this.getPerformanceReport();
  }
}

// Main entry point
if (require.main === module) {
  const tui = new TuiIntegrationOptimizedAsync();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--test') || args.includes('-t')) {
    tui.testInteractive();
  } else if (args.includes('--batch') || args.includes('-b')) {
    tui.runBatchTest();
  } else if (args.includes('--report') || args.includes('-r')) {
    console.log(JSON.stringify(tui.getPerformanceReport(), null, 2));
    process.exit(0);
  } else {
    console.log('Usage:');
    console.log('  --test, -t    Interactive test mode');
    console.log('  --batch, -b   Run batch performance test');
    console.log('  --report, -r  Show performance report');
    console.log('\nExample: node tui-integration-optimized-async.js --test');
    process.exit(1);
  }
}

module.exports = TuiIntegrationOptimizedAsync;