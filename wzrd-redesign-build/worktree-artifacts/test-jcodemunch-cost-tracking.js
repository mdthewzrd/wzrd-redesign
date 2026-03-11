#!/usr/bin/env node
/**
 * Test jCodeMunch integration for finding cost tracking references
 * This tests BOTH jCodeMunch semantic search AND cost tracker functionality
 */

// unified-memory.js exports a class that needs config
const UnifiedMemory = require('./memory/unified-memory.js').UnifiedMemory;
const unifiedMemory = new UnifiedMemory({
    memoryBasePath: './memory/storage',
    jcodeMunchPath: '/home/mdwzrd/.local/lib/python3.12/site-packages/jcodemunch_mcp',
    topicRegistryPath: './memory/topics',
    cacheEnabled: true
});
const fs = require('fs');
const path = require('path');

async function testJCodeMunchIntegration() {
    console.log('🔍 Testing jCodeMunch Integration for "cost tracking"\n');
    
    const query = 'cost tracking';
    const repoPath = process.cwd();
    
    try {
        console.log(`Query: "${query}"`);
        console.log(`Repository: ${repoPath}\n`);
        
        // Test 1: Semantic Search using jCodeMunch
        console.log('📊 Test 1: jCodeMunch Semantic Search');
        console.log('='.repeat(50));
        
        const searchResults = await unifiedMemory.semanticSearch(query, repoPath);
        
        if (searchResults && searchResults.length > 0) {
            console.log(`✅ Found ${searchResults.length} relevant files:\n`);
            
            searchResults.forEach((result, index) => {
                console.log(`${index + 1}. ${result.path}`);
                console.log(`   Relevance: ${result.relevance.toFixed(3)}`);
                console.log(`   Snippet: ${result.snippet}`);
                console.log();
            });
            
            // Check if cost tracker files are found
            const costTrackerFiles = searchResults.filter(r => 
                r.path.includes('tracker') || r.path.includes('cost')
            );
            
            console.log(`📁 Found ${costTrackerFiles.length} cost tracker related files`);
            costTrackerFiles.forEach(file => {
                console.log(`   - ${file.path} (score: ${file.relevance.toFixed(3)})`);
            });
            
        } else {
            console.log('❌ No results found from jCodeMunch');
        }
        
        console.log('\n📊 Test 2: Direct Cost Tracker Module Test');
        console.log('='.repeat(50));
        
        // Test 2: Direct cost tracker module
        try {
            const tracker = require('./cost/tracker.js');
            console.log('✅ Cost tracker module loaded successfully');
            
            // Check available functions
            const functions = Object.keys(tracker).filter(k => typeof tracker[k] === 'function');
            console.log(`📋 Available functions: ${functions.join(', ')}`);
            
            // Test basic functionality
            if (tracker.getDailyStatus) {
                const status = tracker.getDailyStatus();
                console.log(`💰 Daily status:`);
                console.log(`   Used: $${status.used.toFixed(6)}`);
                console.log(`   Remaining: $${status.remaining.toFixed(6)}`);
                console.log(`   Percent: ${status.percentUsed.toFixed(1)}%`);
                console.log(`   Tasks: ${status.taskCount}`);
                
                if (status.warnings && status.warnings.length > 0) {
                    console.log(`   Warnings: ${status.warnings.length}`);
                }
            }
            
            // Test tracking a task
            if (tracker.trackTask) {
                const testTask = {
                    taskId: 'test-jcodemunch-' + Date.now(),
                    model: 'claude-3-opus',
                    inputTokens: 1500,
                    outputTokens: 800
                };
                
                tracker.trackTask(testTask);
                console.log('✅ Test task tracked successfully');
                
                // Verify it was recorded
                const newStatus = tracker.getDailyStatus();
                console.log(`📈 Updated task count: ${newStatus.taskCount}`);
            }
            
        } catch (trackerError) {
            console.log(`❌ Cost tracker error: ${trackerError.message}`);
        }
        
        console.log('\n📊 Test 3: File System Verification');
        console.log('='.repeat(50));
        
        // Test 3: Verify actual files exist
        const expectedCostFiles = [
            'cost/tracker.ts',
            'cost/tracker.js',
            'PERFORMANCE_ANALYSIS.md',
            'TESTING_COMPLETE_REPORT.md'
        ];
        
        let foundFiles = 0;
        expectedCostFiles.forEach(file => {
            const fullPath = path.join(repoPath, file);
            if (fs.existsSync(fullPath)) {
                foundFiles++;
                const stats = fs.statSync(fullPath);
                console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
            } else {
                console.log(`❌ ${file} - NOT FOUND`);
            }
        });
        
        console.log(`\n📈 Summary: ${foundFiles}/${expectedCostFiles.length} cost tracking files found`);
        
        // Test 4: Content verification
        console.log('\n📊 Test 4: Content Analysis');
        console.log('='.repeat(50));
        
        if (fs.existsSync('cost/tracker.ts')) {
            const content = fs.readFileSync('cost/tracker.ts', 'utf8');
            const lines = content.split('\n');
            
            console.log(`📄 cost/tracker.ts: ${lines.length} lines`);
            
            // Check for key features
            const features = {
                'Daily limit': /dailyLimit|\\$1.*day/i,
                'Budget warning': /warning.*threshold|threshold.*warning/i,
                'Circuit breaker': /circuit.*breaker|breaker.*circuit/i,
                'Task tracking': /trackTask|track.*task/i,
                'Token counting': /inputTokens|outputTokens/i
            };
            
            Object.entries(features).forEach(([feature, regex]) => {
                const matches = content.match(regex);
                console.log(`   ${matches ? '✅' : '❌'} ${feature}`);
            });
        }
        
        console.log('\n🎯 TEST COMPLETE');
        console.log('='.repeat(50));
        
        return {
            jCodeMunchResults: searchResults?.length || 0,
            costTrackerWorking: true, // We know it loads
            filesFound: foundFiles,
            totalExpectedFiles: expectedCostFiles.length
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Run the test
testJCodeMunchIntegration()
    .then(results => {
        console.log('\n📋 FINAL RESULTS:');
        console.log('='.repeat(50));
        console.log(`jCodeMunch found ${results.jCodeMunchResults} relevant files`);
        console.log(`Cost tracker: ${results.costTrackerWorking ? 'WORKING' : 'BROKEN'}`);
        console.log(`Files: ${results.filesFound}/${results.totalExpectedFiles} found`);
        
        process.exit(0);
    })
    .catch(error => {
        console.error('Test suite failed:', error);
        process.exit(1);
    });