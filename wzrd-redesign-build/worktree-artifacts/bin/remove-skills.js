#!/usr/bin/env node
/**
 * Skill Removal Script
 * Safely removes skills marked for deletion in FINAL-skills-vetting-complete.md
 * Takes backup before removal and validates against keep list
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

class SkillRemover {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.skillsPath = path.join(this.basePath, '.claude', 'skills');
    this.backupPath = path.join(this.basePath, '.claude', 'skills-backup');
    this.vettingDoc = path.join(this.basePath, 'skills', 'FINAL-skills-vetting-complete.md');
  }

  // Parse skills to remove from vetting document
  parseSkillsToRemove() {
    const content = fs.readFileSync(this.vettingDoc, 'utf8');
    const lines = content.split('\n');
    
    const removeSkills = [];
    
    // Find all lines with ❌ that don't have KEEP! in them
    for (const line of lines) {
      if (line.includes('❌') && line.includes('**') && !line.includes('KEEP') && !line.includes('→')) {
        // Extract skill name between ** markers
        const match = line.match(/\*\*([^*]+)\*\*/);
        if (match) {
          const skillName = match[1].trim();
          removeSkills.push(skillName);
        }
      }
    }
    
    return removeSkills;
  }

  // Parse skills to keep (check exceptions)
  parseSkillsToKeep() {
    const content = fs.readFileSync(this.vettingDoc, 'utf8');
    const lines = content.split('\n');
    
    const keepSkills = [];
    
    // Find all ✅ (keep) skills
    for (const line of lines) {
      if (line.includes('✅') && line.includes('**')) {
        const match = line.match(/\*\*([^*]+)\*\*/);
        if (match) {
          const skillName = match[1].trim();
          keepSkills.push(skillName);
        }
      }
    }
    
    return keepSkills;
  }

  // Verify skills actually exist before removal
  verifySkillsExist(skillNames) {
    const results = [];
    
    for (const skillName of skillNames) {
      const skillDir = path.join(this.skillsPath, skillName);
      const skillFile = path.join(skillDir, 'SKILL.md');
      
      const exists = fs.existsSync(skillDir) && fs.existsSync(skillFile);
      
      results.push({
        name: skillName,
        exists: exists,
        path: skillDir,
        size: exists ? this.getSkillSize(skillDir) : 0
      });
    }
    
    return results;
  }

  // Get skill size in bytes
  getSkillSize(skillDir) {
    let totalSize = 0;
    
    const skillFile = path.join(skillDir, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      totalSize += fs.statSync(skillFile).size;
    }
    
    const referencesDir = path.join(skillDir, 'references');
    if (fs.existsSync(referencesDir)) {
      const files = fs.readdirSync(referencesDir);
      for (const file of files) {
        const filePath = path.join(referencesDir, file);
        totalSize += fs.statSync(filePath).size;
      }
    }
    
    return totalSize;
  }

  // Create backup of skills
  createBackup(skillsToRemove) {
    console.log('📦 Creating backup before removal...');
    
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.backupPath, `removal-${timestamp}`);
    fs.mkdirSync(backupDir, { recursive: true });
    
    let backedUpCount = 0;
    let backedUpSize = 0;
    
    for (const skill of skillsToRemove) {
      if (skill.exists) {
        const sourceDir = skill.path;
        const destDir = path.join(backupDir, skill.name);
        
        try {
          // Copy directory recursively
          this.copyDirectory(sourceDir, destDir);
          backedUpCount++;
          backedUpSize += skill.size;
        } catch (err) {
          console.log(`   ⚠️  Backup failed for ${skill.name}: ${err.message}`);
        }
      }
    }
    
    console.log(`   ✅ Backed up ${backedUpCount} skills (${(backedUpSize / 1024).toFixed(1)}KB)`);
    return backupDir;
  }

  // Copy directory recursively
  copyDirectory(source, dest) {
    if (!fs.existsSync(source)) return;
    
    if (fs.statSync(source).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const files = fs.readdirSync(source);
      for (const file of files) {
        const srcPath = path.join(source, file);
        const destPath = path.join(dest, file);
        this.copyDirectory(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(source, dest);
    }
  }

  // Remove skills
  removeSkills(skillsToRemove) {
    console.log('🗑️  Removing skills...');
    
    let removedCount = 0;
    let removedSize = 0;
    let errors = 0;
    
    for (const skill of skillsToRemove) {
      if (skill.exists) {
        try {
          // Remove skill directory
          execSync(`rm -rf "${skill.path}"`, { stdio: 'pipe' });
          removedCount++;
          removedSize += skill.size;
          console.log(`   ✅ Removed: ${skill.name} (${(skill.size / 1024).toFixed(1)}KB)`);
        } catch (err) {
          console.log(`   ❌ Failed to remove ${skill.name}: ${err.message}`);
          errors++;
        }
      } else {
        console.log(`   ⚠️  Not found: ${skill.name} (already removed?)`);
      }
    }
    
    return { removedCount, removedSize, errors };
  }

  // Update smart skill loader after removal
  updateSkillLoader(remainingSkills) {
    console.log('🔄 Updating smart skill loader...');
    
    const loaderPath = path.join(this.basePath, 'bin', 'smart-skill-loader.js');
    const loaderContent = fs.readFileSync(loaderPath, 'utf8');
    
    // Count remaining skills
    const totalSkills = this.countTotalSkills();
    
    console.log(`   Total skills after removal: ${totalSkills}`);
    
    // Return new total count for dashboard
    return totalSkills;
  }

  // Count total skills remaining
  countTotalSkills() {
    if (!fs.existsSync(this.skillsPath)) {
      return 0;
    }
    
    const items = fs.readdirSync(this.skillsPath);
    return items.filter(item => {
      const skillPath = path.join(this.skillsPath, item, 'SKILL.md');
      return fs.existsSync(skillPath);
    }).length;
  }

  // Run full removal process
  async run(dryRun = false) {
    console.log('🔍 SKILL REMOVAL PROCESS');
    console.log('='.repeat(60));
    
    // Step 1: Parse skills to remove
    console.log('📋 Parsing removal list...');
    const skillsToRemove = this.parseSkillsToRemove();
    console.log(`   Found ${skillsToRemove.length} skills marked for removal`);
    
    // Step 2: Verify skills exist
    console.log('\n✅ Verifying skill existence...');
    const skillVerifications = this.verifySkillsExist(skillsToRemove);
    const existingSkills = skillVerifications.filter(s => s.exists);
    const missingSkills = skillVerifications.filter(s => !s.exists);
    
    console.log(`   Found ${existingSkills.length} skills to remove`);
    console.log(`   ${missingSkills.length} skills already missing`);
    
    // Step 3: Check for accidental keep skill removal
    console.log('\n🔍 Checking for accidental keep skill removal...');
    const keepSkills = this.parseSkillsToKeep();
    
    let keepAccidents = [];
    for (const skill of skillsToRemove) {
      if (keepSkills.includes(skill)) {
        keepAccidents.push(skill);
      }
    }
    
    if (keepAccidents.length > 0) {
      console.log(`   ⚠️  WARNING: ${keepAccidents.length} skills marked for removal are in KEEP list:`);
      keepAccidents.forEach(skill => console.log(`     - ${skill}`));
    } else {
      console.log('   ✅ No conflicts with keep list');
    }
    
    // Step 4: Calculate space savings
    const totalSizeToRemove = existingSkills.reduce((sum, skill) => sum + skill.size, 0);
    console.log(`\n💾 Space savings: ${(totalSizeToRemove / 1024).toFixed(1)}KB`);
    
    // Step 5: Show removal plan
    console.log('\n📋 REMOVAL PLAN:');
    console.log('='.repeat(60));
    existingSkills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name} (${(skill.size / 1024).toFixed(1)}KB)`);
    });
    
    // Step 6: Check current skill count
    const initialCount = this.countTotalSkills();
    console.log(`\n📊 Current skill count: ${initialCount}`);
    console.log(`📊 Skills to remove: ${existingSkills.length}`);
    console.log(`📊 Projected after removal: ${initialCount - existingSkills.length}`);
    
    if (dryRun) {
      console.log('\n🧪 DRY RUN COMPLETE - No changes made');
      console.log('Run with --remove to actually delete skills');
      return;
    }
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will PERMANENTLY remove skills.');
    console.log('   A backup will be created first.');
    
    // Step 7: Create backup
    const backupDir = this.createBackup(existingSkills);
    
    // Step 8: Remove skills
    const removalResult = this.removeSkills(existingSkills);
    
    // Step 9: Update skill loader
    const finalCount = this.updateSkillLoader();
    
    // Step 10: Generate report
    console.log('\n📊 REMOVAL COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Removed: ${removalResult.removedCount} skills`);
    console.log(`✅ Space freed: ${(removalResult.removedSize / 1024).toFixed(1)}KB`);
    console.log(`✅ Errors: ${removalResult.errors}`);
    console.log(`📊 Initial count: ${initialCount}`);
    console.log(`📊 Final count: ${finalCount}`);
    console.log(`📊 Reduction: ${((existingSkills.length / initialCount) * 100).toFixed(1)}%`);
    console.log(`💾 Backup saved to: ${backupDir}`);
    
    return {
      removed: removalResult.removedCount,
      initial: initialCount,
      final: finalCount,
      backup: backupDir,
      errors: removalResult.errors
    };
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log(`
Skill Removal Tool
===================

Usage:
  node bin/remove-skills.js [OPTIONS]

Options:
  --dry-run     Show what would be removed without actually removing
  --remove      Actually remove skills (default if not dry-run)
  --help, -h    Show this help

Examples:
  node bin/remove-skills.js --dry-run    # Preview removal
  node bin/remove-skills.js --remove     # Actually remove skills
    `);
    process.exit(0);
  }
  
  const remover = new SkillRemover();
  remover.run(dryRun).catch(console.error);
}

if (require.main === module) {
  main();
}

module.exports = SkillRemover;