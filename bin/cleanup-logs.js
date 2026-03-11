#!/usr/bin/env node
/**
 * Log cleanup and rotation script
 * Phase 2 Week 2: Job Scheduler support
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LogCleanup {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.logsPath = path.join(this.basePath, 'logs');
    this.backupPath = path.join(this.basePath, 'logs', 'backup');
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  /**
   * Main cleanup routine
   */
  async run() {
    console.log('🧹 Starting log cleanup and rotation...\n');
    
    const results = {
      compressed: 0,
      deleted: 0,
      archived: 0,
      errors: []
    };

    try {
      // 1. Compress logs older than 7 days
      results.compressed = await this.compressOldLogs(7);
      
      // 2. Delete compressed logs older than 90 days
      results.deleted = await this.deleteOldCompressedLogs(90);
      
      // 3. Archive important logs
      results.archived = await this.archiveImportantLogs();
      
      // 4. Update log index
      await this.updateLogIndex();
      
      // 5. Cleanup empty directories
      await this.cleanupEmptyDirectories();
      
      console.log('\n✅ Log cleanup completed:');
      console.log(`  • Compressed ${results.compressed} old log files`);
      console.log(`  • Deleted ${results.deleted} old compressed logs`);
      console.log(`  • Archived ${results.archived} important logs`);
      
      if (results.errors.length > 0) {
        console.log(`  • ${results.errors.length} errors (see logs/cleanup-errors.log)`);
        this.saveErrors(results.errors);
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Log cleanup failed:', error.message);
      results.errors.push(error.message);
      this.saveErrors(results.errors);
      throw error;
    }
  }

  /**
   * Compress logs older than specified days
   */
  async compressOldLogs(days = 7) {
    console.log(`📦 Compressing logs older than ${days} days...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.getTime();
    
    let compressedCount = 0;
    const logFiles = this.getLogFiles();
    
    for (const file of logFiles) {
      try {
        const stats = fs.statSync(file.path);
        
        if (stats.mtimeMs < cutoffTime && !file.path.endsWith('.gz')) {
          // Compress using gzip
          const compressedPath = `${file.path}.gz`;
          
          if (!fs.existsSync(compressedPath)) {
            execSync(`gzip -c "${file.path}" > "${compressedPath}"`);
            console.log(`  • Compressed: ${file.name}`);
            compressedCount++;
            
            // Remove original after successful compression
            fs.unlinkSync(file.path);
          }
        }
      } catch (error) {
        console.error(`  ⚠️ Failed to compress ${file.name}:`, error.message);
      }
    }
    
    return compressedCount;
  }

  /**
   * Delete compressed logs older than specified days
   */
  async deleteOldCompressedLogs(days = 90) {
    console.log(`🗑️ Deleting compressed logs older than ${days} days...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.getTime();
    
    let deletedCount = 0;
    const logFiles = this.getLogFiles();
    
    for (const file of logFiles) {
      try {
        if (file.path.endsWith('.gz')) {
          const stats = fs.statSync(file.path);
          
          if (stats.mtimeMs < cutoffTime) {
            fs.unlinkSync(file.path);
            console.log(`  • Deleted: ${file.name}`);
            deletedCount++;
          }
        }
      } catch (error) {
        console.error(`  ⚠️ Failed to delete ${file.name}:`, error.message);
      }
    }
    
    return deletedCount;
  }

  /**
   * Archive important logs (cost tracking, job results)
   */
  async archiveImportantLogs() {
    console.log('📚 Archiving important logs...');
    
    let archivedCount = 0;
    const importantPatterns = [
      /cost-.*\.log$/,
      /job_.*\.log$/,
      /skill-.*\.json$/,
      /memory-.*\.json$/
    ];
    
    const logFiles = this.getLogFiles();
    
    for (const file of logFiles) {
      try {
        const isImportant = importantPatterns.some(pattern => pattern.test(file.name));
        
        if (isImportant && !file.path.endsWith('.gz')) {
          const archivePath = path.join(this.backupPath, file.name);
          
          if (!fs.existsSync(archivePath)) {
            fs.copyFileSync(file.path, archivePath);
            console.log(`  • Archived: ${file.name}`);
            archivedCount++;
          }
        }
      } catch (error) {
        console.error(`  ⚠️ Failed to archive ${file.name}:`, error.message);
      }
    }
    
    return archivedCount;
  }

  /**
   * Update log index for quick search
   */
  async updateLogIndex() {
    console.log('📝 Updating log index...');
    
    const index = {
      timestamp: new Date().toISOString(),
      totalLogs: 0,
      logsByType: {},
      recentLogs: []
    };
    
    const logFiles = this.getLogFiles();
    index.totalLogs = logFiles.length;
    
    // Categorize logs
    for (const file of logFiles) {
      const type = this.categorizeLog(file.name);
      index.logsByType[type] = (index.logsByType[type] || 0) + 1;
      
      if (index.recentLogs.length < 20) {
        const stats = fs.statSync(file.path);
        index.recentLogs.push({
          name: file.name,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          type: type
        });
      }
    }
    
    // Sort recent logs by modification time (newest first)
    index.recentLogs.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    // Save index
    const indexPath = path.join(this.logsPath, 'log-index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    
    console.log(`  • Indexed ${logFiles.length} log files`);
    console.log('  • Categories:', Object.keys(index.logsByType).join(', '));
  }

  /**
   * Cleanup empty directories
   */
  async cleanupEmptyDirectories() {
    console.log('🧼 Cleaning up empty directories...');
    
    const dirs = this.getAllDirectories(this.logsPath);
    let cleanedCount = 0;
    
    for (const dir of dirs) {
      try {
        const files = fs.readdirSync(dir);
        
        if (files.length === 0) {
          fs.rmdirSync(dir);
          cleanedCount++;
        }
      } catch (error) {
        // Ignore directories we can't read
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`  • Removed ${cleanedCount} empty directories`);
    }
  }

  /**
   * Get all log files
   */
  getLogFiles() {
    const files = [];
    
    function walk(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile()) {
          files.push({
            name: item,
            path: fullPath,
            relative: path.relative(this.logsPath, fullPath)
          });
        }
      }
    }
    
    walk.call(this, this.logsPath);
    return files;
  }

  /**
   * Get all directories recursively
   */
  getAllDirectories(startPath) {
    const dirs = [];
    
    function walk(dir) {
      dirs.push(dir);
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        }
      }
    }
    
    walk(startPath);
    return dirs;
  }

  /**
   * Categorize log file by name pattern
   */
  categorizeLog(filename) {
    if (filename.includes('cost')) return 'cost';
    if (filename.includes('job')) return 'jobs';
    if (filename.includes('skill')) return 'skills';
    if (filename.includes('memory')) return 'memory';
    if (filename.includes('error')) return 'errors';
    if (filename.includes('debug')) return 'debug';
    return 'general';
  }

  /**
   * Save errors to error log
   */
  saveErrors(errors) {
    const errorLogPath = path.join(this.logsPath, 'cleanup-errors.log');
    const errorEntry = {
      timestamp: new Date().toISOString(),
      errors: errors
    };
    
    fs.appendFileSync(errorLogPath, JSON.stringify(errorEntry) + '\n');
  }
}

// CLI interface
if (require.main === module) {
  const cleanup = new LogCleanup();
  
  const days = process.argv[2] ? parseInt(process.argv[2]) : 7;
  
  cleanup.run(days)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = LogCleanup;