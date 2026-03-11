#!/usr/bin/env node
/**
 * WZRD.dev Integration Script
 * Activates jCodeMunch semantic search + cost tracking
 */

const { UnifiedMemory } = require('./memory/unified-memory.js');
const fs = require('fs');
const path = require('path');

// Check if cost tracker exists
let CostTracker;
try {
    const trackerModule = require('./cost/tracker.js');
    CostTracker = trackerModule.CostTracker || trackerModule.default;
    console.log('✅ Cost tracker module available');
} catch (error) {
    console.log('⚠️ Cost tracker not available:', error.message);
    CostTracker = null;
}

class WZRDIntegration {
    constructor(config = {}) {
        this.config = {
            enableSemanticSearch: true,
            enableCostTracking: true,
            dailyBudget: 1.0, // $1/day
            ...config
        };
        
        // Initialize memory system
        this.memory = new UnifiedMemory({
            jcodeMunchPath: '/home/mdwzrd/.local/lib/python3.12/site-packages/jcodemunch_mcp',
            cacheEnabled: true,
            memoryBasePath: './memory/storage',
            topicRegistryPath: './memory/topics'
        });
        
        // Initialize cost tracker
        this.costTracker = null;
        if (this.config.enableCostTracking && CostTracker) {
            this.costTracker = new CostTracker({
                dataPath: './cost/data.json',
                dailySummaryPath: './cost/daily-summary.json',
                limits: {
                    dailyLimit: this.config.dailyBudget,
                    dailyLimitTokens: 30000, // ~$1 at typical rates
                    resetTime: '00:00' // Midnight reset
                },
                models: [
                    {
                        model: 'claude-3-opus',
                        inputCostPer1k: 0.015, // $0.015 per 1k input tokens
                        outputCostPer1k: 0.075  // $0.075 per 1k output tokens
                    },
                    {
                        model: 'gpt-4',
                        inputCostPer1k: 0.03,
                        outputCostPer1k: 0.06
                    },
                    {
                        model: 'gpt-3.5-turbo',
                        inputCostPer1k: 0.001,
                        outputCostPer1k: 0.002
                    }
                ]
            });
            console.log('💰 Cost tracker initialized');
        }
        
        this.performanceMetrics = {
            queries: 0,
            tokensSaved: 0,
            semanticSearchHits: 0,
            totalCost: 0
        };
    }
    
    async search(query, options = {}) {
        const startTime = Date.now();
        this.performanceMetrics.queries++;
        
        // Track cost if enabled
        if (this.costTracker) {
            const estimatedTokens = Math.ceil(query.length / 4) + 1000; // Input + output estimate
            this.costTracker.trackUsage(
                estimatedTokens,
                'claude-3-opus',
                'search',
                estimatedTokens // actual same as estimated for now
            );
        }
        
        // Perform semantic search
        let results = [];
        if (this.config.enableSemanticSearch) {
            try {
                results = await this.memory.semanticSearch(query);
                this.performanceMetrics.semanticSearchHits++;
                
                // Calculate token savings (estimated)
                // Semantic search reduces results by 80%+
                this.performanceMetrics.tokensSaved += Math.ceil(results.length * 20);
            } catch (error) {
                console.log('[WZRD] Semantic search failed:', error.message);
            }
        }
        
        const duration = Date.now() - startTime;
        
        // Update performance metrics
        if (this.costTracker) {
            const status = this.costTracker.getRemainingBudget();
            this.performanceMetrics.totalCost = this.config.dailyBudget - status.remaining;
        }
        
        console.log(`[WZRD] Search complete in ${duration}ms`);
        console.log(`[WZRD] Found ${results.length} results`);
        
        return {
            results,
            metadata: {
                duration,
                semanticSearchUsed: this.config.enableSemanticSearch,
                tokensSaved: this.performanceMetrics.tokensSaved,
                cost: this.performanceMetrics.totalCost
            }
        };
    }
    
    getPerformanceReport() {
let costStatus = null;
        if (this.costTracker) {
            const budget = this.costTracker.getRemainingBudget();
            costStatus = {
                limit: this.config.dailyBudget,
                used: this.config.dailyBudget - budget.remaining,
                remaining: budget.remaining,
                tokensRemaining: budget.tokensRemaining
            };
        }
        
        return {
            ...this.performanceMetrics,
            costStatus
        };
    }
    
    async testIntegration() {
        console.log('🧪 Testing WZRD.dev Integration...');
        console.log('='.repeat(60));
        
        const testQueries = [
            'cost tracking',
            'jCodeMunch integration',
            'memory system',
            'performance optimization'
        ];
        
        for (const query of testQueries) {
            console.log(`\\n🔍 Testing: "${query}"`);
            const result = await this.search(query);
            
            if (result.results.length > 0) {
                console.log(`   Found ${result.results.length} results`);
                console.log(`   Best match: ${result.results[0].path} (score: ${result.results[0].relevance.toFixed(3)})`);
            } else {
                console.log('   No results found');
            }
        }
        
        console.log('\\n📊 Performance Report:');
        console.log('='.repeat(60));
        const report = this.getPerformanceReport();
        console.log(`Queries processed: ${report.queries}`);
        console.log(`Semantic search success rate: ${report.semanticSearchRate}`);
        console.log(`Tokens saved: ${report.tokensSaved} (avg: ${report.avgTokensSaved}/query)`);
        console.log(`Total cost: $${report.totalCost.toFixed(6)}`);
        
        if (this.costTracker) {
            const budget = this.costTracker.getRemainingBudget();
            console.log(`\\n💰 Cost Status:`);
            console.log(`   Limit: $${this.config.dailyBudget}`);
            const used = budget && budget.remaining !== undefined ? (this.config.dailyBudget - budget.remaining) : 0;
            const remaining = budget && budget.remaining !== undefined ? budget.remaining : this.config.dailyBudget;
            const tokensRemaining = budget && budget.tokensRemaining !== undefined ? budget.tokensRemaining : 30000;
            
            console.log(`   Used: $${used.toFixed(6)}`);
            console.log(`   Remaining: $${remaining.toFixed(6)}`);
            console.log(`   Tokens remaining: ${tokensRemaining}`);
            
            const warnings = this.costTracker.checkLimits();
            if (warnings && warnings.length > 0) {
                console.log(`   Warnings: ${warnings.length}`);
            }
        }
        
        console.log('\\n✅ Integration Test Complete');
        return report;
    }
}

// Command line interface
if (require.main === module) {
    const integration = new WZRDIntegration();
    
    async function main() {
        if (process.argv.length > 2) {
            // Search query provided
            const query = process.argv.slice(2).join(' ');
            const result = await integration.search(query);
            console.log(JSON.stringify(result, null, 2));
        } else {
            // Run integration test
            await integration.testIntegration();
        }
    }
    
    main().catch(error => {
        console.error('❌ Integration failed:', error);
        process.exit(1);
    });
}

module.exports = { WZRDIntegration };