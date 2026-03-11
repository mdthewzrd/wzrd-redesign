#!/usr/bin/env node
// 🚀 Fixed Smart Skill Loader
// Uses CORRECT skill names after fixing the skill system

const fs = require('fs');
const path = require('path');

// Configuration
const SKILLS_FILE = path.join(__dirname, '../skills-lock.json');
const SKILLS_DIR = path.join(__dirname, '../.claude/skills');

// CORRECTED Mode to skill mapping (using actual skill names)
const modeSkills = {
    'chat': ['orchestration', 'team-communication-protocols', 'topic-switcher', 'auto-memory'],
    'thinker': ['planning', 'architecture', 'research', 'validation'],
    'coder': ['coding', 'debugging', 'testing', 'github'],
    'debug': ['debugging', 'system-health', 'performance', 'verification-before-completion'],
    'research': ['research', 'web-search', 'documentation', 'data-analysis']
};

// Core skills (always loaded)
const coreSkills = ['using-superpowers', 'context', 'workflow-patterns', 'documentation'];

class FixedSmartSkillLoader {
    constructor() {
        this.allSkills = {};
        this.allSkillsCount = 0;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Load from skills-lock.json
        try {
            const skillsContent = fs.readFileSync(SKILLS_FILE, 'utf8');
            const skillsData = JSON.parse(skillsContent);
            const lockSkills = skillsData.skills || {};
            
            // Load from local skill directories
            const localSkills = this.loadLocalSkills();
            
            // Merge both sources
            this.allSkills = { ...lockSkills, ...localSkills };
            this.allSkillsCount = Object.keys(this.allSkills).length;
            
            console.log(`📊 Loaded ${this.allSkillsCount} skills total`);
            console.log(`   From lock file: ${Object.keys(lockSkills).length}`);
            console.log(`   From local dirs: ${Object.keys(localSkills).length}`);
            
        } catch (e) {
            console.error(`❌ Failed to initialize: ${e.message}`);
            process.exit(1);
        }

        this.initialized = true;
    }

    loadLocalSkills() {
        const localSkills = {};
        
        try {
            const skillDirs = fs.readdirSync(SKILLS_DIR).filter(name => 
                fs.statSync(path.join(SKILLS_DIR, name)).isDirectory()
            );
            
            for (const skillName of skillDirs) {
                // Check for SKILL.md file
                const skillFile = path.join(SKILLS_DIR, skillName, 'SKILL.md');
                if (fs.existsSync(skillFile)) {
                    try {
                        const skillContent = fs.readFileSync(skillFile, 'utf8');
                        localSkills[skillName] = {
                            source: `file://${skillFile}`,
                            sourceType: 'local',
                            skillContent: skillContent.substring(0, 500) + '...' // Truncate
                        };
                    } catch (e) {
                        console.log(`⚠️  Could not read skill: ${skillName}`);
                    }
                }
            }
            
            console.log(`📁 Found ${skillDirs.length} local skill directories`);
            console.log(`📄 Loaded ${Object.keys(localSkills).length} local skills`);
            
        } catch (e) {
            console.log(`⚠️  Could not load local skills: ${e.message}`);
        }
        
        return localSkills;
    }

    // Load skills for a mode (with token optimization)
    loadSkillsForMode(mode, taskDescription = '') {
        const modeSkillNames = modeSkills[mode] || [];
        const allSkillNames = [...new Set([...coreSkills, ...modeSkillNames])];
        
        console.log(`🔧 Fixed Smart Skill Loader - ${mode.toUpperCase()} Mode`);
        console.log('===========================================');
        
        // Traditional method: Load ALL skills
        console.log(`📊 Traditional: Would load ${this.allSkillsCount} skills`);
        
        // Optimized: Load only needed skills
        const loadedSkills = {};
        const missingSkills = [];
        
        for (const skillName of allSkillNames) {
            if (this.allSkills[skillName]) {
                loadedSkills[skillName] = this.allSkills[skillName];
            } else {
                missingSkills.push(skillName);
            }
        }
        
        console.log(`🚀 Optimized: Loading ${allSkillNames.length} skills`);
        console.log(`✅ Loaded: ${Object.keys(loadedSkills).length} skills`);
        
        if (missingSkills.length > 0) {
            console.log(`❌ Missing: ${missingSkills.length} skills`);
            console.log(`   ${missingSkills.join(', ')}`);
        }
        
        // Calculate token savings
        const savingsPercent = ((this.allSkillsCount - allSkillNames.length) / this.allSkillsCount * 100).toFixed(1);
        console.log(`💰 Token savings: ${savingsPercent}%`);
        
        // Task detection
        const detectedTasks = this.detectTasks(taskDescription);
        if (detectedTasks.length > 0) {
            console.log(`🎯 Detected tasks: ${detectedTasks.join(', ')}`);
        }
        
        // Output format expected by wzrd-mode
        const output = {
            mode: mode,
            totalSkills: this.allSkillsCount,
            loadedSkills: Object.keys(loadedSkills).length,
            tokenSavingsPercent: parseFloat(savingsPercent),
            skills: loadedSkills,
            detectedTasks: detectedTasks,
            coreSkills: coreSkills,
            modeSkills: modeSkillNames,
            missingSkills: missingSkills,
            success: missingSkills.length === 0
        };
        
        console.log('');
        console.log(`📦 Output ready for wzrd-mode`);
        console.log(`✅ Success: ${output.success ? 'YES' : 'NO (missing skills)'}`);
        
        return output;
    }

    detectTasks(taskDescription) {
        const taskPatterns = {
            frontend: ['react', 'vue', 'angular', 'component', 'ui', 'frontend', 'javascript', 'typescript'],
            python: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
            testing: ['test', 'testing', 'pytest', 'jest', 'unit test', 'integration test'],
            api: ['api', 'rest', 'graphql', 'endpoint', 'route'],
            database: ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'redis'],
            devops: ['docker', 'kubernetes', 'ci/cd', 'deploy', 'infrastructure'],
            security: ['security', 'auth', 'authentication', 'authorization', 'encryption'],
            architecture: ['architecture', 'design', 'pattern', 'microservice', 'monolith'],
            llm: ['llm', 'ai', 'model', 'openai', 'anthropic', 'deepseek'],
            documentation: ['documentation', 'readme', 'docs', 'wiki', 'comment']
        };

        const detected = [];
        const lowerDesc = taskDescription.toLowerCase();

        for (const [task, patterns] of Object.entries(taskPatterns)) {
            if (patterns.some(pattern => lowerDesc.includes(pattern.toLowerCase()))) {
                detected.push(task);
            }
        }

        return detected;
    }

    // Benchmark all modes
    benchmark() {
        console.log('🏃 Running Fixed Loader Benchmark');
        console.log('===============================');
        console.log('');
        
        const modes = ['chat', 'thinker', 'coder', 'debug', 'research'];
        let totalTraditional = 0;
        let totalOptimized = 0;
        let totalMissing = 0;
        
        for (const mode of modes) {
            const modeSkillNames = modeSkills[mode] || [];
            const allSkillNames = [...new Set([...coreSkills, ...modeSkillNames])];
            
            totalTraditional += this.allSkillsCount;
            totalOptimized += allSkillNames.length;
            
            // Check which skills are missing
            const missing = allSkillNames.filter(skill => !this.allSkills[skill]);
            totalMissing += missing.length;
            
            const savings = this.allSkillsCount - allSkillNames.length;
            const savingsPercent = (savings / this.allSkillsCount * 100).toFixed(1);
            
            console.log(`${mode.toUpperCase()}:`);
            console.log(`  Needed: ${allSkillNames.length} skills`);
            console.log(`  Missing: ${missing.length} skills`);
            if (missing.length > 0) {
                console.log(`    ${missing.join(', ')}`);
            }
            console.log(`  Token savings: ${savingsPercent}%`);
            console.log('');
        }
        
        const totalSavings = totalTraditional - totalOptimized;
        const totalSavingsPercent = (totalSavings / totalTraditional * 100).toFixed(1);
        
        console.log('📊 BENCHMARK SUMMARY');
        console.log('===================');
        console.log(`Total skills in system: ${this.allSkillsCount}`);
        console.log(`Total traditional loading: ${totalTraditional} skills`);
        console.log(`Total optimized loading: ${totalOptimized} skills`);
        console.log(`Total savings: ${totalSavings} skills (${totalSavingsPercent}%)`);
        console.log(`Total missing skills: ${totalMissing}`);
        console.log('');
        console.log('🎯 EXPECTED PERFORMANCE:');
        console.log(`• Token reduction: ~${totalSavingsPercent}%`);
        console.log(`• Start context: 20% → ~${(20 * (1 - totalSavingsPercent/100)).toFixed(1)}%`);
        console.log(`• Missing skills: ${totalMissing} (needs fixing)`);
        
        return {
            totalSkills: this.allSkillsCount,
            traditional: totalTraditional,
            optimized: totalOptimized,
            savingsPercent: parseFloat(totalSavingsPercent),
            missingSkills: totalMissing
        };
    }
}

// CLI Interface
async function main() {
    const loader = new FixedSmartSkillLoader();
    await loader.initialize();

    const args = process.argv.slice(2);
    
    if (args.includes('--mode')) {
        const modeIndex = args.indexOf('--mode');
        const mode = args[modeIndex + 1] || 'chat';
        
        const messageIndex = args.indexOf('--message');
        const message = messageIndex >= 0 ? args[messageIndex + 1] : '';
        
        const result = loader.loadSkillsForMode(mode, message);
        
        // Output as JSON for wzrd-mode
        console.log('\n📦 OUTPUT (JSON):');
        console.log(JSON.stringify(result, null, 2));
        
    } else if (args.includes('--benchmark')) {
        loader.benchmark();
        
    } else {
        console.log('🚀 Fixed Smart Skill Loader');
        console.log('===========================');
        console.log('');
        console.log('Usage:');
        console.log('  node smart-skill-loader-fixed.js --mode <mode> [--message <text>]');
        console.log('  node smart-skill-loader-fixed.js --benchmark');
        console.log('');
        console.log('Modes: chat, thinker, coder, debug, research');
        console.log('');
        console.log('Example:');
        console.log('  node smart-skill-loader-fixed.js --mode chat --message "Build a React component"');
        console.log('');
        console.log('✅ Features:');
        console.log('  • Uses CORRECT skill names');
        console.log('  • Loads from both sources (lock file + local dirs)');
        console.log('  • Calculates actual token savings');
        console.log('  • Detects missing skills');
    }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Run main
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Main error:', error);
        process.exit(1);
    });
}

module.exports = FixedSmartSkillLoader;