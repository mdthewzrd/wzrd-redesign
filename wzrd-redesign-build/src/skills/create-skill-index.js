#!/usr/bin/env node
// 🚀 Create Skill Index for Deferred Parsing
// Analyzes skills-lock.json and creates index for efficient loading

const fs = require('fs');
const path = require('path');

// Configuration
const SKILLS_FILE = path.join(__dirname, 'skills-lock.json');
const INDEX_FILE = path.join(__dirname, 'skills-index.json');
const LINE_MAP_FILE = path.join(__dirname, 'skills-line-map.json');

console.log('🚀 Creating skill index for deferred parsing...');
console.log(`Skills file: ${SKILLS_FILE}`);
console.log(`Index file: ${INDEX_FILE}`);
console.log('');

// Read skills file
const skillsContent = fs.readFileSync(SKILLS_FILE, 'utf8');
const lines = skillsContent.split('\n');
console.log(`📊 Skills file: ${lines.length} lines`);

// Parse JSON to get skill names
let skillsData;
try {
    skillsData = JSON.parse(skillsContent);
} catch (e) {
    console.error(`❌ Failed to parse skills-lock.json: ${e.message}`);
    process.exit(1);
}

const allSkills = skillsData.skills || {};
const skillNames = Object.keys(allSkills);
console.log(`📊 Total skills: ${skillNames.length}`);

// Create line number mapping for each skill
console.log('🔍 Analyzing skill locations...');
const skillLocations = {};
const lineMap = {};

let currentSkill = null;
let skillStartLine = 0;
let inSkillObject = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for skill names in the JSON
    if (line.startsWith('"') && line.includes('": {')) {
        const skillNameMatch = line.match(/^"([^"]+)": \{/);
        if (skillNameMatch) {
            const skillName = skillNameMatch[1];
            if (allSkills[skillName]) {
                currentSkill = skillName;
                skillStartLine = i + 1; // 1-indexed for readability
                inSkillObject = true;
                braceCount = 1;
                
                skillLocations[currentSkill] = {
                    start: skillStartLine,
                    end: null,
                    lines: 0
                };
                
                console.log(`  Found skill: ${currentSkill} at line ${skillStartLine}`);
            }
        }
    }
    
    // Track braces within skill objects
    if (inSkillObject && currentSkill) {
        if (line.includes('{')) braceCount++;
        if (line.includes('}')) braceCount--;
        
        // Skill object ends when braceCount returns to 0
        if (braceCount === 0) {
            skillLocations[currentSkill].end = i + 1; // 1-indexed
            skillLocations[currentSkill].lines = (i + 1) - skillStartLine + 1;
            inSkillObject = false;
            currentSkill = null;
        }
    }
}

// Create index structure
const skillIndex = {
    metadata: {
        created: new Date().toISOString(),
        totalSkills: skillNames.length,
        totalLines: lines.length,
        indexedSkills: Object.keys(skillLocations).length,
        version: '1.0'
    },
    skills: {}
};

// Populate index
for (const skillName of skillNames) {
    const location = skillLocations[skillName];
    if (location) {
        skillIndex.skills[skillName] = {
            file: 'skills-lock.json',
            startLine: location.start,
            endLine: location.end,
            lineCount: location.lines,
            // Extract key metadata without parsing full object
            sourceType: 'unknown',
            source: 'unknown'
        };
        
        // Try to extract metadata from the actual lines
        if (location.start && location.end) {
            const skillLines = lines.slice(location.start - 1, location.end);
            const skillText = skillLines.join('\n');
            
            // Extract sourceType
            const sourceTypeMatch = skillText.match(/"sourceType":\s*"([^"]+)"/);
            if (sourceTypeMatch) {
                skillIndex.skills[skillName].sourceType = sourceTypeMatch[1];
            }
            
            // Extract source
            const sourceMatch = skillText.match(/"source":\s*"([^"]+)"/);
            if (sourceMatch) {
                skillIndex.skills[skillName].source = sourceMatch[1];
            }
        }
    } else {
        console.warn(`⚠️  Skill "${skillName}" not found in line analysis`);
    }
}

// Create line map (for quick lookup)
const lineToSkillMap = {};
for (const [skillName, location] of Object.entries(skillLocations)) {
    for (let lineNum = location.start; lineNum <= location.end; lineNum++) {
        lineToSkillMap[lineNum] = skillName;
    }
}

// Save index files
fs.writeFileSync(INDEX_FILE, JSON.stringify(skillIndex, null, 2));
fs.writeFileSync(LINE_MAP_FILE, JSON.stringify(lineToSkillMap, null, 2));

console.log('');
console.log('✅ Skill index created successfully!');
console.log(`📁 Index saved to: ${INDEX_FILE}`);
console.log(`📁 Line map saved to: ${LINE_MAP_FILE}`);
console.log('');

// Statistics
const indexedSkills = Object.keys(skillIndex.skills).length;
console.log('📊 Statistics:');
console.log(`  Total skills in file: ${skillNames.length}`);
console.log(`  Successfully indexed: ${indexedSkills}`);
console.log(`  Index coverage: ${((indexedSkills / skillNames.length) * 100).toFixed(1)}%`);
console.log('');

// Show sample of indexed skills
console.log('📋 Sample indexed skills (first 10):');
const sampleSkills = Object.keys(skillIndex.skills).slice(0, 10);
for (const skillName of sampleSkills) {
    const skill = skillIndex.skills[skillName];
    console.log(`  ${skillName}: lines ${skill.startLine}-${skill.endLine} (${skill.lineCount} lines)`);
}

console.log('');
console.log('🎯 Next steps:');
console.log('1. Create deferred skill loader that uses this index');
console.log('2. Benchmark parsing performance before/after');
console.log('3. Update smart-skill-loader.js to use deferred loading');
console.log('');

console.log('💡 Benefits:');
console.log('  • Parse only needed skills (4 vs 148)');
console.log('  • Reduce JSON parsing overhead');
console.log('  • Lower token usage in context');
console.log('  • Faster startup time');

process.exit(0);