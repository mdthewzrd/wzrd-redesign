#!/usr/bin/env node
// 🚀 Simple Skill Index Creator
// Uses JSON parsing instead of line analysis for reliability

const fs = require('fs');
const path = require('path');

// Configuration
const SKILLS_FILE = path.join(__dirname, 'skills-lock.json');
const INDEX_FILE = path.join(__dirname, 'skills-index.json');

console.log('🚀 Creating skill index (simple version)...');
console.log(`Skills file: ${SKILLS_FILE}`);
console.log('');

// Read and parse skills file
const skillsContent = fs.readFileSync(SKILLS_FILE, 'utf8');
const skillsData = JSON.parse(skillsContent);
const allSkills = skillsData.skills || {};

const skillNames = Object.keys(allSkills);
console.log(`📊 Total skills: ${skillNames.length}`);

// Create index
const skillIndex = {
    metadata: {
        created: new Date().toISOString(),
        totalSkills: skillNames.length,
        version: '1.1'
    },
    skills: {}
};

// For each skill, store minimal metadata
for (const skillName of skillNames) {
    const skill = allSkills[skillName];
    
    skillIndex.skills[skillName] = {
        source: skill.source || 'unknown',
        sourceType: skill.sourceType || 'unknown',
        computedHash: skill.computedHash || 'unknown',
        
        // Mode assignments (we'll populate based on usage patterns)
        commonModes: [],
        
        // Estimated size (in characters)
        estimatedSize: JSON.stringify(skill).length,
        
        // Key triggers (for dynamic loading)
        triggers: [],
        
        // Dependencies (other skills often used with this one)
        dependencies: []
    };
}

// Add mode assignments based on skill names
for (const skillName of skillNames) {
    const skill = skillIndex.skills[skillName];
    
    // Guess mode based on skill name patterns
    if (skillName.includes('orchestrat') || skillName.includes('context') || skillName.includes('communicat') || skillName.includes('topic')) {
        skill.commonModes.push('chat');
    }
    if (skillName.includes('architect') || skillName.includes('planning') || skillName.includes('research') || skillName.includes('validat')) {
        skill.commonModes.push('thinker');
    }
    if (skillName.includes('coding') || skillName.includes('refactor') || skillName.includes('testing') || skillName.includes('git')) {
        skill.commonModes.push('coder');
    }
    if (skillName.includes('debug') || skillName.includes('test') || skillName.includes('performance') || skillName.includes('system-health')) {
        skill.commonModes.push('debug');
    }
    if (skillName.includes('research') || skillName.includes('web-search') || skillName.includes('data-analysis') || skillName.includes('documentation')) {
        skill.commonModes.push('research');
    }
    
    // Add triggers based on skill name
    const triggers = [];
    const nameLower = skillName.toLowerCase();
    
    if (nameLower.includes('web') || nameLower.includes('search')) {
        triggers.push('search', 'web', 'internet', 'lookup');
    }
    if (nameLower.includes('git')) {
        triggers.push('git', 'version', 'commit', 'push', 'pull');
    }
    if (nameLower.includes('test')) {
        triggers.push('test', 'testing', 'validate', 'verify');
    }
    if (nameLower.includes('debug')) {
        triggers.push('debug', 'error', 'fix', 'bug');
    }
    
    skill.triggers = [...new Set(triggers)]; // Remove duplicates
}

// Save index
fs.writeFileSync(INDEX_FILE, JSON.stringify(skillIndex, null, 2));

console.log('');
console.log('✅ Skill index created successfully!');
console.log(`📁 Index saved to: ${INDEX_FILE}`);
console.log('');

// Statistics
console.log('📊 Statistics:');
console.log(`  Total skills indexed: ${skillNames.length}`);

// Count skills by mode
const modeCounts = {
    chat: 0,
    thinker: 0,
    coder: 0,
    debug: 0,
    research: 0
};

for (const skillName of skillNames) {
    const skill = skillIndex.skills[skillName];
    skill.commonModes.forEach(mode => {
        modeCounts[mode]++;
    });
}

console.log('');
console.log('📋 Skills by mode (estimated):');
for (const [mode, count] of Object.entries(modeCounts)) {
    console.log(`  ${mode}: ${count} skills`);
}

// Show sample
console.log('');
console.log('📋 Sample skills (first 5):');
const sampleSkills = skillNames.slice(0, 5);
for (const skillName of sampleSkills) {
    const skill = skillIndex.skills[skillName];
    console.log(`  ${skillName}:`);
    console.log(`    Modes: ${skill.commonModes.join(', ')}`);
    console.log(`    Triggers: ${skill.triggers.slice(0, 3).join(', ')}...`);
    console.log(`    Size: ${skill.estimatedSize} chars`);
}

console.log('');
console.log('🎯 Next: Create deferred skill loader');
console.log('  This index allows us to:');
console.log('  1. Load only skills needed for current mode');
console.log('  2. Dynamically load skills based on triggers');
console.log('  3. Skip parsing 144 unused skills');

process.exit(0);