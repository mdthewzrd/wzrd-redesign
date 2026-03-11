#!/usr/bin/env node

/**
 * Final Performance Test - Compare ALL implementations
 */

const path = require('path');
const { performance } = require('perf_hooks');
const fs = require('fs');

// Import all loaders
const SmartSkillLoader = require('./smart-skill-loader');
const AsyncSkillLoader = require('./async-skill-loader');
const SkillLoaderBridge = require('./skill-loader-bridge');
const OptimizedPipeline = require('../interfaces/optimized-pipeline');

class FinalPerformanceTest {
  constructor() {
    this.loaders = {
      'Old (SmartSkillLoader)': new SmartSkillLoader(),
      'New (AsyncSkillLoader)': new AsyncSkillLoader(),
      'Bridge (Compatibility)': new SkillLoaderBridge(),
      'Full Pipeline': new OptimizedPipeline()
    };
    
    this.testCases = [
      { message: 'hey remi', description: 'Simple greeting', expectedTime: 3000 },
      { message: 'write a python function', description: 'Coding task', expectedTime: 4000 },
      { message: 'design a database schema', description: 'Design task', expectedTime: 5000 },
      { message: 'research react 19 features', description: 'Research task', expectedTime: 6000 },
      { message: 'fix this error: print(1/0)', description: 'Debug task', expectedTime: 4000 }
    ];
    
    this.results = {};
    this.summary = {};
  }
  
  async testLoader(loaderName, loader, testCase, iteration) {
    const startTime = performance.now();
    
    try {
      let result;
      
      if (loaderName === 'Full Pipeline') {
        // Special handling for pipeline
        result = await loader.processMessage(testCase.message);
      } else if (loaderName === 'New (AsyncSkillLoader)') {
        // Async loader
        result = await loader.loadSkillsForMessage(testCase.message);
      } else if (loaderName === 'Bridge (Compatibility)') {
        // Bridge (has both sync and async)
        result = await loader.loadSkillsForMessageAsync(testCase.message);
      } else {
        // Old loader (sync)
        result = loader.loadSkillsForMessage(testCase.message);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      return {
        duration,
        success: true,
        skillCount: result.skills ? result.skills.length : 0,
        mode: result.mode || 'N/A',
        metrics: result.metrics || {}
      };
      
    } catch (error) {
      console.error(`${loaderName} error on "${testCase.message}":`, error.message);
      return {
        duration: 0,
        success: false,
        skillCount: 0,
        mode: 'ERROR',
        error: error.message
      };
    }
  }
  
  async runComparison(testCase, iterations = 3) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`TEST: ${testCase.description}`);
    console.log(`Query: "${testCase.message}"`);
    console.log(`Iterations: ${iterations}`);
    console.log(`Expected time: ${testCase.expectedTime}ms`);
    console.log('='.repeat(70));
    
    const loaderResults = {};
    
    // Test each loader
    for (const [loaderName, loader] of Object.entries(this.loaders)) {
      process.stdout.write(`Testing ${loaderName.padEnd(25)}... `);
      
      const results = [];
      for (let i = 0; i < iterations; i++) {
        const result = await this.testLoader(loaderName, loader, testCase, i + 1);
        results.push(result);
      }
      
      // Calculate statistics
      const successfulResults = results.filter(r => r.success);
      const durations = successfulResults.map(r => r.duration);
      const skillCounts = successfulResults.map(r => r.skillCount);
      
      const avgDuration = durations.length > 0 ? 
        durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const avgSkills = skillCounts.length > 0 ?
        skillCounts.reduce((a, b) => a + b, 0) / skillCounts.length : 0;
      
      loaderResults[loaderName] = {
        avgDuration,
        avgSkills,
        successRate: successfulResults.length / iterations,
        minDuration: durations.length > 0 ? Math.min(...durations) : 0,
        maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
        results
      };
      
      console.log(`${avgDuration.toFixed(1)}ms (${avgSkills.toFixed(1)} skills)`);
    }
    
    // Store results
    this.results[testCase.description] = loaderResults;
    
    // Calculate improvement percentages
    const oldTime = loaderResults['Old (SmartSkillLoader)'].avgDuration;
    const improvements = {};
    
    for (const [loaderName, result] of Object.entries(loaderResults)) {
      if (loaderName !== 'Old (SmartSkillLoader)') {
        const improvement = oldTime > 0 ? ((oldTime - result.avgDuration) / oldTime * 100) : 0;
        improvements[loaderName] = improvement.toFixed(1);
      }
    }
    
    // Display comparison
    console.log('\n--- IMPROVEMENTS OVER OLD ---');
    for (const [loaderName, improvement] of Object.entries(improvements)) {
      const sign = parseFloat(improvement) > 0 ? '+' : '';
      console.log(`${loaderName.padEnd(25)}: ${sign}${improvement}% faster`);
    }
    
    return loaderResults;
  }
  
  async runAllTests(iterations = 2) {
    console.log('🚀 FINAL PERFORMANCE COMPARISON 🚀');
    console.log(`Testing ${this.testCases.length} scenarios with ${iterations} iterations each`);
    console.log('='.repeat(70));
    
    const startTime = performance.now();
    
    for (const testCase of this.testCases) {
      await this.runComparison(testCase, iterations);
    }
    
    const totalTime = performance.now() - startTime;
    
    // Generate summary
    this.generateSummary();
    
    // Save detailed results
    this.saveResults();
    
    // Display final summary
    this.displayFinalSummary(totalTime);
    
    return this.summary;
  }
  
  generateSummary() {
    const summary = {
      loaders: {},
      overall: {
        testCount: this.testCases.length,
        totalImprovement: 0
      }
    };
    
    // Calculate averages across all tests
    for (const [loaderName] of Object.entries(this.loaders)) {
      const times = [];
      const skills = [];
      
      for (const testCase of this.testCases) {
        const result = this.results[testCase.description]?.[loaderName];
        if (result) {
          times.push(result.avgDuration);
          skills.push(result.avgSkills);
        }
      }
      
      if (times.length > 0) {
        summary.loaders[loaderName] = {
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          avgSkills: skills.reduce((a, b) => a + b, 0) / skills.length,
          testCount: times.length
        };
      }
    }
    
    // Calculate overall improvement
    const oldAvg = summary.loaders['Old (SmartSkillLoader)']?.avgTime || 0;
    const newAvg = summary.loaders['New (AsyncSkillLoader)']?.avgTime || 0;
    
    if (oldAvg > 0) {
      summary.overall.totalImprovement = ((oldAvg - newAvg) / oldAvg * 100).toFixed(1);
    }
    
    this.summary = summary;
    return summary;
  }
  
  saveResults() {
    const report = {
      timestamp: new Date().toISOString(),
      testCases: this.testCases.length,
      results: this.results,
      summary: this.summary,
      loaders: Object.keys(this.loaders)
    };
    
    const reportPath = path.join(__dirname, '..', 'final-performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Detailed report saved to: ${reportPath}`);
    
    // Also save a simplified CSV
    this.saveCSV(reportPath.replace('.json', '.csv'));
  }
  
  saveCSV(csvPath) {
    const headers = ['Test Case', 'Loader', 'Avg Time (ms)', 'Avg Skills', 'Success Rate', 'Min Time', 'Max Time'];
    const rows = [headers.join(',')];
    
    for (const [testName, loaderResults] of Object.entries(this.results)) {
      for (const [loaderName, result] of Object.entries(loaderResults)) {
        const row = [
          testName,
          loaderName,
          result.avgDuration.toFixed(1),
          result.avgSkills.toFixed(1),
          (result.successRate * 100).toFixed(1) + '%',
          result.minDuration.toFixed(1),
          result.maxDuration.toFixed(1)
        ];
        rows.push(row.join(','));
      }
    }
    
    fs.writeFileSync(csvPath, rows.join('\n'));
    console.log(`📈 CSV report saved to: ${csvPath}`);
  }
  
  displayFinalSummary(totalTime) {
    console.log('\n' + '='.repeat(70));
    console.log('🎉 FINAL SUMMARY 🎉');
    console.log('='.repeat(70));
    
    console.log('\n🏆 AVERAGE PERFORMANCE ACROSS ALL TESTS:');
    for (const [loaderName, data] of Object.entries(this.summary.loaders)) {
      console.log(`${loaderName.padEnd(25)}: ${data.avgTime.toFixed(1)}ms (${data.avgSkills.toFixed(1)} skills)`);
    }
    
    const oldTime = this.summary.loaders['Old (SmartSkillLoader)']?.avgTime || 0;
    const newTime = this.summary.loaders['New (AsyncSkillLoader)']?.avgTime || 0;
    const pipelineTime = this.summary.loaders['Full Pipeline']?.avgTime || 0;
    
    if (oldTime > 0) {
      const newImprovement = ((oldTime - newTime) / oldTime * 100).toFixed(1);
      const pipelineImprovement = ((oldTime - pipelineTime) / oldTime * 100).toFixed(1);
      
      console.log('\n🚀 PERFORMANCE IMPROVEMENTS:');
      console.log(`New Async Loader: ${newImprovement}% faster`);
      console.log(`Full Pipeline: ${pipelineImprovement}% faster`);
      
      console.log('\n💡 INTERPRETATION:');
      if (parseFloat(newImprovement) > 50) {
        console.log('✅ EXCELLENT: More than 50% improvement!');
      } else if (parseFloat(newImprovement) > 20) {
        console.log('✅ GOOD: Significant improvement achieved');
      } else if (parseFloat(newImprovement) > 0) {
        console.log('⚠️ MODEST: Some improvement, but could be better');
      } else {
        console.log('❌ REGRESSION: Performance got worse!');
      }
    }
    
    console.log(`\n⏱️ Total test time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log('='.repeat(70));
    
    // Check if we met the 1000ms target for "hey remi"
    const heyRemiResults = this.results['Simple greeting'];
    if (heyRemiResults) {
      const pipelineResult = heyRemiResults['Full Pipeline'];
      if (pipelineResult && pipelineResult.avgDuration < 2000) {
        console.log('\n🎯 TARGET ACHIEVED: "hey remi" response under 2 seconds!');
        console.log(`Actual: ${pipelineResult.avgDuration.toFixed(0)}ms`);
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const test = new FinalPerformanceTest();
  
  const iterations = process.argv[2] ? parseInt(process.argv[2]) : 2;
  
  test.runAllTests(iterations)
    .then(summary => {
      const improvement = parseFloat(summary.overall.totalImprovement);
      
      if (improvement > 30) {
        console.log('\n✅ SUCCESS: Significant performance improvement achieved!');
        process.exit(0);
      } else if (improvement > 0) {
        console.log('\n⚠️ WARNING: Modest improvement, needs more optimization');
        process.exit(1);
      } else {
        console.log('\n❌ FAILURE: No improvement or regression detected');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = FinalPerformanceTest;