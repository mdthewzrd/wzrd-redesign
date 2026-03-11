#!/usr/bin/env node

/**
 * Performance Test Script - Compare old vs new skill loaders
 */

const path = require('path');
const { performance } = require('perf_hooks');

// Import both loaders
const SmartSkillLoader = require('./smart-skill-loader');
const AsyncSkillLoader = require('./async-skill-loader');

class PerformanceTest {
  constructor() {
    this.oldLoader = new SmartSkillLoader();
    this.newLoader = new AsyncSkillLoader();
    
    this.testCases = [
      { message: 'hey remi', mode: null, description: 'Simple greeting' },
      { message: 'write a python function', mode: 'CODER', description: 'Coding task' },
      { message: 'design a database schema', mode: 'THINKER', description: 'Design task' },
      { message: 'research react 19 features', mode: 'RESEARCH', description: 'Research task' },
      { message: 'fix this error: print(1/0)', mode: 'DEBUG', description: 'Debug task' }
    ];
    
    this.results = {
      oldLoader: [],
      newLoader: []
    };
  }
  
  async runTest(loaderType, testCase, iteration) {
    const loader = loaderType === 'old' ? this.oldLoader : this.newLoader;
    const startTime = performance.now();
    
    let result;
    try {
      if (loaderType === 'old') {
        // Old loader synchronous API
        result = loader.loadSkillsForMessage(testCase.message, testCase.mode);
      } else {
        // New loader async API
        result = await loader.loadSkillsForMessage(testCase.message, testCase.mode);
      }
    } catch (error) {
      console.error(`${loaderType} loader error:`, error.message);
      return { error: error.message };
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      duration,
      skillCount: result.skills ? result.skills.length : 0,
      success: !result.error,
      iteration
    };
  }
  
  async runSingleTest(testCase, iterations = 5) {
    console.log(`\n=== TEST: ${testCase.description} ===`);
    console.log(`Message: "${testCase.message}"`);
    console.log(`Mode: ${testCase.mode || 'auto-detected'}`);
    console.log(`Iterations: ${iterations}`);
    
    const oldResults = [];
    const newResults = [];
    
    // Warm-up run (discard first result)
    console.log('Warming up...');
    await this.runTest('old', testCase, 0);
    await this.runTest('new', testCase, 0);
    
    // Run tests
    for (let i = 0; i < iterations; i++) {
      process.stdout.write(`\rRunning iteration ${i + 1}/${iterations}...`);
      
      const [oldResult, newResult] = await Promise.all([
        this.runTest('old', testCase, i + 1),
        this.runTest('new', testCase, i + 1)
      ]);
      
      oldResults.push(oldResult);
      newResults.push(newResult);
    }
    
    console.log('\n'); // New line after progress
    
    // Calculate statistics
    const oldStats = this.calculateStats(oldResults);
    const newStats = this.calculateStats(newResults);
    
    // Store results
    this.results.oldLoader.push({
      testCase: testCase.description,
      stats: oldStats
    });
    
    this.results.newLoader.push({
      testCase: testCase.description,
      stats: newStats
    });
    
    // Display comparison
    console.log('OLD LOADER:');
    console.log(`  Avg time: ${oldStats.avg.toFixed(1)}ms`);
    console.log(`  Min time: ${oldStats.min.toFixed(1)}ms`);
    console.log(`  Max time: ${oldStats.max.toFixed(1)}ms`);
    console.log(`  Skills loaded: ${oldStats.avgSkills.toFixed(1)}`);
    
    console.log('\nNEW LOADER:');
    console.log(`  Avg time: ${newStats.avg.toFixed(1)}ms`);
    console.log(`  Min time: ${newStats.min.toFixed(1)}ms`);
    console.log(`  Max time: ${newStats.max.toFixed(1)}ms`);
    console.log(`  Skills loaded: ${newStats.avgSkills.toFixed(1)}`);
    
    const improvement = ((oldStats.avg - newStats.avg) / oldStats.avg * 100).toFixed(1);
    console.log(`\nIMPROVEMENT: ${improvement}% faster`);
    
    return { oldStats, newStats, improvement };
  }
  
  calculateStats(results) {
    const validResults = results.filter(r => r.success);
    if (validResults.length === 0) {
      return { avg: 0, min: 0, max: 0, stdDev: 0, avgSkills: 0 };
    }
    
    const durations = validResults.map(r => r.duration);
    const skillCounts = validResults.map(r => r.skillCount);
    
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const avgSkills = skillCounts.reduce((a, b) => a + b, 0) / skillCounts.length;
    
    // Calculate standard deviation
    const variance = durations.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    
    return { avg, min, max, stdDev, avgSkills };
  }
  
  async runAllTests(iterations = 3) {
    console.log('=== PERFORMANCE COMPARISON: OLD vs NEW SKILL LOADERS ===');
    console.log(`Running ${this.testCases.length} test cases with ${iterations} iterations each`);
    console.log('='.repeat(60));
    
    const startTime = performance.now();
    
    for (const testCase of this.testCases) {
      await this.runSingleTest(testCase, iterations);
      console.log('='.repeat(60));
    }
    
    const totalTime = performance.now() - startTime;
    
    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total test time: ${(totalTime / 1000).toFixed(1)}s`);
    
    const oldAvg = this.results.oldLoader.reduce((sum, r) => sum + r.stats.avg, 0) / this.results.oldLoader.length;
    const newAvg = this.results.newLoader.reduce((sum, r) => sum + r.stats.avg, 0) / this.results.newLoader.length;
    
    console.log(`Old loader average: ${oldAvg.toFixed(1)}ms`);
    console.log(`New loader average: ${newAvg.toFixed(1)}ms`);
    
    const totalImprovement = ((oldAvg - newAvg) / oldAvg * 100).toFixed(1);
    console.log(`Overall improvement: ${totalImprovement}% faster`);
    
    // Get cache stats from new loader
    const newMetrics = this.newLoader.getMetrics();
    console.log('\n=== NEW LOADER METRICS ===');
    console.log(`Cache hit rate: ${(newMetrics.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`Cache size: ${newMetrics.cacheSize} skills`);
    console.log(`Total file reads: ${newMetrics.fileReads}`);
    
    return {
      oldAvg,
      newAvg,
      improvement: totalImprovement,
      totalTime,
      newMetrics
    };
  }
  
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testCases: this.testCases.length,
      results: this.results,
      summary: {
        oldAvg: this.results.oldLoader.reduce((sum, r) => sum + r.stats.avg, 0) / this.results.oldLoader.length,
        newAvg: this.results.newLoader.reduce((sum, r) => sum + r.stats.avg, 0) / this.results.newLoader.length
      }
    };
    
    const improvement = ((report.summary.oldAvg - report.summary.newAvg) / report.summary.oldAvg * 100).toFixed(1);
    report.summary.improvement = `${improvement}%`;
    
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const iterations = args[0] ? parseInt(args[0]) : 3;
  
  const test = new PerformanceTest();
  
  test.runAllTests(iterations)
    .then(results => {
      const report = test.generateReport();
      
      // Save report to file
      const fs = require('fs');
      const reportPath = path.join(__dirname, '..', 'performance-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`\nReport saved to: ${reportPath}`);
      
      // Exit with success if improvement > 0
      const improvement = parseFloat(results.improvement);
      if (improvement > 0) {
        console.log(`\n✅ SUCCESS: Performance improved by ${results.improvement}%`);
        process.exit(0);
      } else {
        console.log(`\n⚠️ WARNING: No performance improvement detected`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceTest;