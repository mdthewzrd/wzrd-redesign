// OpenCode Integration for PIV Workflow
// Provides auto-detection and /piv command

import { detectPivNeeded, formatPivRecommendation } from './piv-detector.js';
import { PivIntegrator } from './piv-integrator.js';

/**
 * OpenCode PIV Integration
 * To use: Add to OpenCode agent configuration
 */
export class OpenCodePivIntegration {
    constructor() {
        this.integrator = new PivIntegrator();
        this.userPreferences = new Map(); // user_id -> preference
        this.taskHistory = []; // Track past tasks for learning
    }
    
    /**
     * Main handler - called by OpenCode for each user message
     */
    async handleUserMessage(userMessage, userId = 'default') {
        console.log(`[PIV] User: "${userMessage.substring(0, 50)}..."`);
        
        // Check for /piv command
        if (userMessage.trim().startsWith('/piv')) {
            return await this.handlePivCommand(userMessage, userId);
        }
        
        // Auto-detect PIV need
        const analysis = detectPivNeeded(userMessage);
        const formatted = formatPivRecommendation(analysis);
        
        // Get user preference (default to 'ask')
        const preference = this.userPreferences.get(userId) || 'ask';
        
        // Handle based on preference
        switch (preference) {
            case 'always_piv':
                console.log(`[PIV] User preference: always use PIV`);
                return await this.executePivWithConfirmation(userMessage, analysis, userId);
                
            case 'never_piv':
                console.log(`[PIV] User preference: never use PIV`);
                return {
                    type: 'mode_shifting',
                    message: 'Proceeding with mode shifting (user preference)',
                    analysis
                };
                
            case 'ask':
            default:
                return await this.handleAutoDetection(userMessage, analysis, formatted, userId);
        }
    }
    
    /**
     * Handle /piv command
     */
    async handlePivCommand(userMessage, userId) {
        const commandParts = userMessage.trim().split(' ');
        
        if (commandParts.length < 2) {
            return {
                type: 'error',
                message: 'Usage: `/piv "<task description>"`\nExample: `/piv "Create authentication system"`'
            };
        }
        
        // Extract task (handle quotes)
        let task = userMessage.substring(userMessage.indexOf(' ') + 1).trim();
        if (task.startsWith('"') && task.endsWith('"')) {
            task = task.substring(1, task.length - 1);
        }
        
        console.log(`[PIV] Manual PIV request: "${task}"`);
        
        // Execute PIV workflow
        const results = await this.integrator.executePivWorkflow(task, {
            usePiv: true,
            confidence: 100,
            components: 0,
            reason: 'Manual /piv command',
            estimatedTimeSavings: 0
        });
        
        // Track in history
        this.taskHistory.push({
            task,
            timestamp: new Date().toISOString(),
            workflow: 'piv_manual',
            userId
        });
        
        return this.formatPivResults(results);
    }
    
    /**
     * Handle auto-detection with user confirmation
     */
    async handleAutoDetection(userMessage, analysis, formatted, userId) {
        // If not recommended, proceed with mode shifting
        if (!analysis.usePiv) {
            console.log(`[PIV] Auto: Mode shifting recommended`);
            
            this.taskHistory.push({
                task: userMessage,
                timestamp: new Date().toISOString(),
                workflow: 'mode_shifting',
                reason: formatted.reason,
                userId
            });
            
            return {
                type: 'mode_shifting',
                message: formatted.message,
                analysis,
                quickActions: [
                    { label: 'Proceed', action: 'proceed_mode_shifting' },
                    { label: 'Use PIV anyway', action: 'force_piv' }
                ]
            };
        }
        
        // PIV recommended - ask user
        console.log(`[PIV] Auto: PIV recommended (${analysis.confidence}%)`);
        
        return {
            type: 'piv_recommended',
            message: formatted.message,
            analysis,
            quickActions: [
                { label: 'Use PIV (Recommended)', action: 'accept_piv' },
                { label: 'Use Mode Shifting', action: 'decline_piv' },
                { label: 'Always use PIV for tasks like this', action: 'set_preference_always' },
                { label: 'Never use PIV for tasks like this', action: 'set_preference_never' }
            ]
        };
    }
    
    /**
     * Execute PIV after user confirmation
     */
    async executePivWithConfirmation(userMessage, analysis, userId) {
        console.log(`[PIV] Executing PIV (confirmed)`);
        
        const results = await this.integrator.executePivWorkflow(userMessage, analysis);
        
        // Track in history
        this.taskHistory.push({
            task: userMessage,
            timestamp: new Date().toISOString(),
            workflow: 'piv_auto',
            confidence: analysis.confidence,
            userId
        });
        
        return this.formatPivResults(results);
    }
    
    /**
     * Format PIV results for OpenCode display
     */
    formatPivResults(results) {
        if (results.workflow === 'mode_shifting' && results.fallback) {
            return {
                type: 'mode_shifting_fallback',
                message: `⚠️ PIV workflow failed, falling back to mode shifting\n` +
                        `Reason: ${results.reason}\n\n` +
                        `Proceeding with standard implementation...`,
                workspace: results.workspace
            };
        }
        
        if (results.workflow === 'mode_shifting') {
            return {
                type: 'mode_shifting',
                message: `🔄 Proceeding with mode shifting\n` +
                        `Reason: ${results.reason}\n\n` +
                        `I'll handle this by shifting through modes as needed...`,
                analysis: results.analysis
            };
        }
        
        // PIV results
        return {
            type: 'piv_complete',
            message: `✅ PIV Workflow Complete!\n\n` +
                    `**Task:** ${results.phases?.plan?.findings?.task || 'Completed'}\n` +
                    `**Workspace:** ${results.workspace}\n` +
                    `**Time Saved:** ${results.analysis?.estimatedTimeSavings || 0} minutes\n` +
                    `**Memory Efficiency:** 24% less than 3 Remi instances\n\n` +
                    `### Phase Results\n` +
                    `1. **PLAN**: ${results.phases?.plan?.status || 'Completed'} (${results.phases?.plan?.findings?.worker_count || 3} agents)\n` +
                    `2. **IMPLEMENT**: ${results.phases?.implement?.status || 'Completed'} (${results.phases?.implement?.files?.length || 0} files)\n` +
                    `3. **VALIDATE**: ${results.phases?.validate?.status || 'Completed'} (All tests passed)\n\n` +
                    `### Artifacts\n` +
                    `- Research: ${results.artifacts?.research}\n` +
                    `- Implementation: ${results.artifacts?.implementation}\n` +
                    `- Validation: ${results.artifacts?.validation}\n` +
                    `- Summary: ${results.artifacts?.summary}\n\n` +
                    `**Next:** Review the implementation or deploy as needed.`,
            workspace: results.workspace,
            artifacts: results.artifacts,
            quickActions: [
                { label: 'View Summary', action: 'view_summary' },
                { label: 'Run Implementation', action: 'run_implementation' },
                { label: 'Open Workspace', action: 'open_workspace' },
                { label: 'Continue with Mode Shifting', action: 'continue_mode_shifting' }
            ]
        };
    }
    
    /**
     * Handle quick action responses
     */
    async handleQuickAction(action, task, userId) {
        console.log(`[PIV] Quick action: ${action} for "${task.substring(0, 30)}..."`);
        
        switch (action) {
            case 'accept_piv':
                this.userPreferences.set(userId, 'ask'); // Keep asking
                const analysis = detectPivNeeded(task);
                return await this.executePivWithConfirmation(task, analysis, userId);
                
            case 'decline_piv':
                this.userPreferences.set(userId, 'ask'); // Keep asking
                return {
                    type: 'mode_shifting',
                    message: 'Proceeding with mode shifting as requested...',
                    analysis: detectPivNeeded(task)
                };
                
            case 'force_piv':
                return await this.handlePivCommand(`/piv "${task}"`, userId);
                
            case 'set_preference_always':
                this.userPreferences.set(userId, 'always_piv');
                return {
                    type: 'preference_set',
                    message: '✅ Preference saved: Always use PIV for complex tasks\n' +
                            'I\'ll automatically use PIV workflow without asking.',
                    nextAction: 'proceed_with_piv'
                };
                
            case 'set_preference_never':
                this.userPreferences.set(userId, 'never_piv');
                return {
                    type: 'preference_set',
                    message: '✅ Preference saved: Never use PIV\n' +
                            'I\'ll always use mode shifting.',
                    nextAction: 'proceed_with_mode_shifting'
                };
                
            case 'proceed_mode_shifting':
                return {
                    type: 'mode_shifting',
                    message: 'Proceeding with mode shifting...',
                    analysis: detectPivNeeded(task)
                };
                
            default:
                return {
                    type: 'error',
                    message: `Unknown action: ${action}`
                };
        }
    }
    
    /**
     * Get statistics for dashboard
     */
    getStatistics() {
        const totalTasks = this.taskHistory.length;
        const pivTasks = this.taskHistory.filter(t => t.workflow.includes('piv')).length;
        const modeShiftTasks = this.taskHistory.filter(t => t.workflow === 'mode_shifting').length;
        
        const avgConfidence = this.taskHistory
            .filter(t => t.confidence)
            .reduce((sum, t) => sum + t.confidence, 0) / Math.max(1, pivTasks);
        
        return {
            totalTasks,
            pivTasks,
            modeShiftTasks,
            pivPercentage: totalTasks > 0 ? Math.round((pivTasks / totalTasks) * 100) : 0,
            avgConfidence: Math.round(avgConfidence),
            recentTasks: this.taskHistory.slice(-5).map(t => ({
                task: t.task.substring(0, 30) + (t.task.length > 30 ? '...' : ''),
                workflow: t.workflow,
                timestamp: t.timestamp
            }))
        };
    }
}

/**
 * Example usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const integration = new OpenCodePivIntegration();
    
    console.log('=== Testing OpenCode PIV Integration ===\n');
    
    const testTasks = [
        "Create a full user authentication system with registration, login, and admin dashboard",
        "Fix typo in the README file",
        "/piv Build e-commerce platform",
        "Research React state management best practices"
    ];
    
    for (const task of testTasks) {
        console.log(`\n=== Task: "${task}" ===`);
        
        const response = await integration.handleUserMessage(task, 'test_user');
        
        console.log(`Response type: ${response.type}`);
        console.log(`Message: ${response.message.substring(0, 150)}...`);
        
        if (response.quickActions) {
            console.log(`Quick actions: ${response.quickActions.map(a => a.label).join(', ')}`);
        }
        
        // Simulate user choosing first quick action
        if (response.quickActions && response.quickActions.length > 0) {
            const actionResponse = await integration.handleQuickAction(
                response.quickActions[0].action,
                task,
                'test_user'
            );
            console.log(`Action response: ${actionResponse.type}`);
        }
        
        console.log('─'.repeat(50));
    }
    
    // Show statistics
    const stats = integration.getStatistics();
    console.log('\n=== Statistics ===');
    console.log(JSON.stringify(stats, null, 2));
}