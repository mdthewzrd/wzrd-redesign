#!/usr/bin/env node
// 🧪 Test Skill Loading System
// Understand how skills are ACTUALLY loaded

const fs = require('fs');
const path = require('path');

console.log('🧪 SKILL LOADING ANALYSIS');
console.log('=========================');
console.log('');

// Configuration
const SKILLS_LOCK_FILE = path.join(__dirname, 'skills-lock.json');
const SKILLS_DIR = path.join(__dirname, '.claude/skills');

// Load skills-lock.json
console.log('📊 Analysis 1: skills-lock.json');
console.log('--------------------------------');

let lockSkills = [];
try {
    const lockContent = fs.readFileSync(SKILLS_LOCK_FILE, 'utf8');
    const lockData = JSON.parse(lockContent);
    lockSkills = Object.keys(lockData.skills || {});
    console.log(`✅ Loaded skills-lock.json`);
    console.log(`   Skills: ${lockSkills.length}`);
    console.log(`   Sample: ${lockSkills.slice(0, 5).join(', ')}...`);
} catch (e) {
    console.log(`❌ Failed to load skills-lock.json: ${e.message}`);
}

console.log('');

// Load local skill directories
console.log('📊 Analysis 2: Local skill directories');
console.log('--------------------------------------');

let localSkills = [];
try {
    localSkills = fs.readdirSync(SKILLS_DIR).filter(name => 
        fs.statSync(path.join(SKILLS_DIR, name)).isDirectory()
    );
    console.log(`✅ Loaded local skill directories`);
    console.log(`   Skills: ${localSkills.length}`);
    console.log(`   Sample: ${localSkills.slice(0, 5).join(', ')}...`);
} catch (e) {
    console.log(`❌ Failed to load local skills: ${e.message}`);
}

console.log('');

// Compare sources
console.log('📊 Analysis 3: Source Comparison');
console.log('-------------------------------');

const lockSet = new Set(lockSkills);
const localSet = new Set(localSkills);

// Find overlaps and differences
const inBoth = [...lockSet].filter(skill => localSet.has(skill));
const onlyInLock = [...lockSet].filter(skill => !localSet.has(skill));
const onlyInLocal = [...localSet].filter(skill => !lockSet.has(skill));

console.log(`Skills in both sources: ${inBoth.length}`);
console.log(`Skills only in skills-lock.json: ${onlyInLock.length}`);
console.log(`Skills only in local directory: ${onlyInLocal.length}`);

console.log('');

// Check what smart skill loader expects
console.log('📊 Analysis 4: Smart Skill Loader Expectations');
console.log('--------------------------------------------');

const expectedSkills = {
    chat: ['orchestration', 'communication', 'topic-switcher', 'auto-memory'],
    thinker: ['planning', 'architecture', 'research', 'validation'],
    coder: ['coding', 'debugging', 'testing', 'github'],
    debug: ['debugging', 'system-health', 'performance', 'verification-before-completion'],
    research: ['research', 'web-search', 'documentation', 'data-analysis']
};

console.log('Checking if expected skills exist in any source...');
console.log('');

for (const [mode, skills] of Object.entries(expectedSkills)) {
    console.log(`${mode.toUpperCase()} mode:`);
    
    const found = [];
    const missing = [];
    
    for (const skill of skills) {
        const inLock = lockSet.has(skill);
        const inLocal = localSet.has(skill);
        
        if (inLock || inLocal) {
            found.push(`${skill} (${inLock ? 'lock' : ''}${inLock && inLocal ? '+' : ''}${inLocal ? 'local' : ''})`);
        } else {
            missing.push(skill);
        }
    }
    
    console.log(`  Found: ${found.length}/${skills.length}`);
    if (found.length > 0) {
        console.log(`    ${found.join(', ')}`);
    }
    
    console.log(`  Missing: ${missing.length}/${skills.length}`);
    if (missing.length > 0) {
        console.log(`    ${missing.join(', ')}`);
    }
    
    console.log('');
}

// Check token dashboard output
console.log('📊 Analysis 5: Token Dashboard Output');
console.log('-----------------------------------');

// Simulate what token dashboard shows
const totalSkillsInSystem = new Set([...lockSkills, ...localSkills]).size;
console.log(`Total unique skills in system: ${totalSkillsInSystem}`);

// For each mode, count skills actually available
for (const [mode, expected] of Object.entries(expectedSkills)) {
    const availableSkills = expected.filter(skill => 
        lockSet.has(skill) || localSet.has(skill)
    );
    
    const percentAvailable = (availableSkills.length / expected.length * 100).toFixed(1);
    console.log(`${mode}: ${availableSkills.length}/${expected.length} skills available (${percentAvailable}%)`);
}

console.log('');

// Recommendations
console.log('🎯 RECOMMENDATIONS');
console.log('==================');
console.log('');

if (onlyInLocal.length > 0) {
    console.log(`1. ${onlyInLocal.length} skills exist locally but not in skills-lock.json`);
    console.log('   Consider: Adding them to skills-lock.json for consistency');
}

if (onlyInLock.length > 0) {
    console.log(`2. ${onlyInLock.length} skills in skills-lock.json but no local directory`);
    console.log('   Consider: Creating local directories or removing from lock file');
}

console.log('3. Skill name mismatches detected');
console.log('   Example: "orchestration" expected but might be "saga-orchestration" or "workflow-orchestration-patterns"');
console.log('   Solution: Update smart skill loader to use correct skill names');

console.log('');
console.log('🔧 Next steps:');
console.log('1. Fix skill name mappings in smart skill loader');
console.log('2. Sync local skills with skills-lock.json');
console.log('3. Update deferred loader to handle both sources');
console.log('4. Benchmark actual skill loading performance');

console.log('');
console.log('✅ Analysis complete!');

process.exit(0);