// PIV Detector - Automatically detects when to use PIV workflow
// Based on SOUL.md rules

/**
 * Detects if a task should use PIV orchestration
 * Returns { usePiv: boolean, reason: string, components: number }
 */
export function detectPivNeeded(taskDescription) {
    const analysis = {
        usePiv: false,
        reason: '',
        components: 0,
        confidence: 0,
        estimatedTimeSavings: 0
    };

    // Component counting (simple heuristic)
    analysis.components = countComponents(taskDescription);
    
    // Keyword detection
    const complexityKeywords = [
        'system', 'architecture', 'full', 'complete', 'entire',
        'dashboard', 'authentication', 'e-commerce', 'platform',
        'integration', 'api', 'database', 'frontend', 'backend'
    ];
    
    const hasComplexityKeywords = complexityKeywords.some(keyword => 
        taskDescription.toLowerCase().includes(keyword)
    );
    
    // Step estimation
    const stepCount = estimateSteps(taskDescription);
    
    // Research need estimation
    const researchNeeded = estimateResearchNeed(taskDescription);
    
    // Decision logic
    const reasons = [];
    
    if (analysis.components >= 3) {
        reasons.push(`Task has ${analysis.components} components (threshold: 3)`);
        analysis.confidence += 30;
    }
    
    if (hasComplexityKeywords) {
        reasons.push('Contains complexity keywords');
        analysis.confidence += 25;
    }
    
    if (stepCount >= 5) {
        reasons.push(`Estimated ${stepCount} steps (threshold: 5)`);
        analysis.confidence += 20;
    }
    
    if (researchNeeded >= 2) {
        reasons.push(`High research need (score: ${researchNeeded}/3)`);
        analysis.confidence += 25;
    }
    
    // Check for simple task indicators (override)
    const simpleIndicators = [
        'fix typo', 'update ', 'change ', 'small ', 'quick ',
        'minor ', 'simple ', 'one ', 'single '
    ];
    
    const isSimpleTask = simpleIndicators.some(indicator =>
        taskDescription.toLowerCase().startsWith(indicator)
    );
    
    if (isSimpleTask && analysis.confidence < 70) {
        analysis.usePiv = false;
        analysis.reason = 'Simple task - use mode shifting';
        return analysis;
    }
    
    // Final decision - lower threshold for PIV
    analysis.usePiv = analysis.confidence >= 50;
    analysis.reason = analysis.usePiv 
        ? `PIV recommended: ${reasons.join(', ')}` 
        : `Mode shifting recommended (confidence: ${analysis.confidence}%)`;
    
    // Estimated time savings
    if (analysis.usePiv) {
        analysis.estimatedTimeSavings = Math.round(analysis.components * 15); // 15min per component saved
    }
    
    return analysis;
}

/**
 * Count components mentioned in task
 */
function countComponents(taskDescription) {
    const componentPatterns = [
        { pattern: /\b(form|input|field|button)\b/gi, weight: 1 },
        { pattern: /\b(api|endpoint|route|controller)\b/gi, weight: 1 },
        { pattern: /\b(database|db|schema|table|model)\b/gi, weight: 1 },
        { pattern: /\b(ui|frontend|interface|dashboard|component)\b/gi, weight: 1 },
        { pattern: /\b(backend|server|service|microservice)\b/gi, weight: 1 },
        { pattern: /\b(auth|authentication|login|register|password)\b/gi, weight: 2 }, // Auth is complex
        { pattern: /\b(test|testing|validation|qa|quality)\b/gi, weight: 0.5 },
        { pattern: /\b(documentation|docs|readme|guide)\b/gi, weight: 0.5 },
        { pattern: /\b(integration|connection|hook|webhook)\b/gi, weight: 1.5 },
        { pattern: /\b(configuration|config|setting|environment)\b/gi, weight: 0.5 },
        { pattern: /\b(payment|checkout|cart|order)\b/gi, weight: 2 }, // E-commerce is complex
        { pattern: /\b(catalog|product|inventory)\b/gi, weight: 1 },
        { pattern: /\b(search|filter|sort)\b/gi, weight: 1 }
    ];
    
    let componentScore = 0;
    
    componentPatterns.forEach(({ pattern, weight }) => {
        const matches = taskDescription.match(pattern);
        if (matches) {
            componentScore += weight;
        }
    });
    
    // Count explicit features/items
    const featureWords = taskDescription.match(/\b(feature|component|part|item|element)\b/gi);
    if (featureWords) {
        componentScore += featureWords.length * 0.5;
    }
    
    // Count commas and "and" as separators
    const separators = (taskDescription.match(/,/g) || []).length + 
                      (taskDescription.match(/\band\b/gi) || []).length;
    componentScore += separators * 0.3;
    
    // Round up to nearest integer
    return Math.ceil(componentScore);
}

/**
 * Estimate number of steps needed
 */
function estimateSteps(taskDescription) {
    const stepIndicators = [
        /\bfirst\b|\bsecond\b|\bthird\b|\bfourth\b|\bfifth\b/gi,
        /\bstep\s+\d+\b/gi,
        /\bphase\s+\d+\b/gi,
        /\bthen\b|\bnext\b|\bafter\b/gi,
        /\b1\)|\b2\)|\b3\)|\b4\)|\b5\)/gi
    ];
    
    let stepCount = 1; // Minimum 1 step
    
    stepIndicators.forEach(pattern => {
        const matches = taskDescription.match(pattern);
        if (matches) {
            stepCount = Math.max(stepCount, matches.length);
        }
    });
    
    // Count explicit step numbers
    const stepNumberMatch = taskDescription.match(/\b(\d+)\s+steps?\b/i);
    if (stepNumberMatch) {
        stepCount = Math.max(stepCount, parseInt(stepNumberMatch[1], 10));
    }
    
    return stepCount;
}

/**
 * Estimate research need (0-3 scale)
 */
function estimateResearchNeed(taskDescription) {
    let score = 0;
    
    // Research-heavy keywords
    const researchKeywords = [
        'research', 'analyze', 'investigate', 'compare',
        'evaluate', 'review', 'study', 'find', 'search',
        'look up', 'check', 'verify', 'unknown'
    ];
    
    researchKeywords.forEach(keyword => {
        if (taskDescription.toLowerCase().includes(keyword)) {
            score += 1;
        }
    });
    
    // Domain complexity
    if (taskDescription.match(/\b(ai|ml|machine learning|artificial intelligence)\b/i)) score += 1;
    if (taskDescription.match(/\b(security|encryption|cryptography)\b/i)) score += 1;
    if (taskDescription.match(/\b(performance|optimization|scaling)\b/i)) score += 1;
    
    // Open-ended questions
    if (taskDescription.includes('?') && taskDescription.length > 50) score += 1;
    
    return Math.min(score, 3);
}

/**
 * Format PIV recommendation for user display
 */
export function formatPivRecommendation(analysis) {
    if (!analysis.usePiv) {
        return {
            message: `**Mode shifting recommended**\n` +
                    `Confidence: ${analysis.confidence}%\n` +
                    `Reason: ${analysis.reason}\n` +
                    `Components detected: ${analysis.components}`,
            buttons: [
                { label: 'Proceed with mode shifting', value: 'mode_shift' },
                { label: 'Force PIV anyway', value: 'force_piv' }
            ]
        };
    }
    
    return {
        message: `**PIV Orchestration Recommended** 🚀\n\n` +
                `**Why:** ${analysis.reason}\n` +
                `**Components:** ${analysis.components} detected\n` +
                `**Estimated time savings:** ${analysis.estimatedTimeSavings} minutes\n` +
                `**Confidence:** ${analysis.confidence}%\n\n` +
                `**PIV Workflow:**\n` +
                `1. **PLAN**: 3 parallel research agents\n` +
                `2. **IMPLEMENT**: Single focused build agent\n` +
                `3. **VALIDATE**: Systematic testing agent\n` +
                `**Memory efficiency:** 24% less than current setup`,
        buttons: [
            { label: 'Use PIV (recommended)', value: 'use_piv' },
            { label: 'Use mode shifting instead', value: 'mode_shift' }
        ]
    };
}

/**
 * Example usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const testTasks = [
        "Create a user authentication system with registration, login, and password reset",
        "Fix typo in README.md",
        "Build full e-commerce platform with product catalog, shopping cart, checkout, and payment processing",
        "Research best practices for React state management",
        "Optimize database queries for the user dashboard"
    ];
    
    console.log('=== PIV Detector Test ===\n');
    
    testTasks.forEach((task, i) => {
        console.log(`Task ${i + 1}: "${task}"`);
        const analysis = detectPivNeeded(task);
        const formatted = formatPivRecommendation(analysis);
        console.log(formatted.message);
        console.log('\n' + '─'.repeat(50) + '\n');
    });
}