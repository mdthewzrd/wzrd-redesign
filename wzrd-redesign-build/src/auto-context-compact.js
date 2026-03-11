#!/usr/bin/env node
/**
 * Auto Context Compact
 * Monitors context usage and triggers compact at 75%
 * Run as background process or integrate with agent
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  THRESHOLD_PERCENT: 75,      // Auto-compact at 75% usage
  CHECK_INTERVAL_MS: 30000,   // Check every 30 seconds
  HISTORY_FILE: path.join(process.env.HOME, '.local/state/opencode/prompt-history.jsonl'),
  COMPACT_SCRIPT: path.join(process.env.HOME, 'wzrd-redesign/wzrd-compact-solution.sh'),
  LOG_FILE: path.join(process.env.HOME, '.local/state/opencode/auto-compact.log'),
  ENABLED: true,
  NOTIFY: true
};

// Logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  
  // Append to log file
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
  } catch (err) {
    // Silently fail if log file can't be written
  }
}

// Estimate token usage (simple heuristic)
function estimateTokenUsage() {
  try {
    const stats = fs.statSync(CONFIG.HISTORY_FILE);
    const fileSizeKB = stats.size / 1024;
    
    // Rough heuristic: 1KB ≈ 250 tokens
    const estimatedTokens = Math.round(fileSizeKB * 250);
    
    return estimatedTokens;
  } catch (err) {
    log(`Error estimating tokens: ${err.message}`);
    return 0;
  }
}

// Get context limit (default 100K tokens for deepseek-v3)
function getContextLimit() {
  // Default context window for deepseek-v3.2
  return 128000; // 128K tokens
}

// Check if we should compact
function shouldCompact() {
  if (!CONFIG.ENABLED) return false;
  
  const currentTokens = estimateTokenUsage();
  const limit = getContextLimit();
  const threshold = limit * (CONFIG.THRESHOLD_PERCENT / 100);
  
  const percentUsed = (currentTokens / limit) * 100;
  
  log(`Token usage: ${currentTokens}/${limit} (${percentUsed.toFixed(1)}%)`);
  
  return currentTokens > threshold;
}

// Run compact
function runCompact() {
  log(`Auto-compact triggered at ${CONFIG.THRESHOLD_PERCENT}% threshold`);
  
  try {
    // Run our true compact script
    execSync(`${CONFIG.COMPACT_SCRIPT} compact`, { stdio: 'inherit' });
    
    log('Auto-compact completed successfully');
    return true;
  } catch (err) {
    log(`Compact failed: ${err.message}`);
    return false;
  }
}

// Main monitoring loop
function startMonitor() {
  log('Starting Auto Context Compact Monitor');
  log(`Configuration: ${CONFIG.THRESHOLD_PERCENT}% threshold, check every ${CONFIG.CHECK_INTERVAL_MS/1000}s`);
  log(`History file: ${CONFIG.HISTORY_FILE}`);
  log(`Compact script: ${CONFIG.COMPACT_SCRIPT}`);
  
  setInterval(() => {
    try {
      if (shouldCompact()) {
        runCompact();
      }
    } catch (err) {
      log(`Monitoring error: ${err.message}`);
    }
  }, CONFIG.CHECK_INTERVAL_MS);
  
  // Also check immediately
  if (shouldCompact()) {
    runCompact();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'monitor';
  
  switch (command) {
    case 'monitor':
      startMonitor();
      // Keep process alive
      process.stdin.resume();
      break;
      
    case 'check':
      const tokens = estimateTokenUsage();
      const limit = getContextLimit();
      const percent = (tokens / limit) * 100;
      
      console.log(`Token usage: ${tokens}/${limit} (${percent.toFixed(1)}%)`);
      console.log(`Threshold: ${CONFIG.THRESHOLD_PERCENT}% (${Math.round(limit * (CONFIG.THRESHOLD_PERCENT/100))} tokens)`);
      
      if (shouldCompact()) {
        console.log('✅ Should compact: YES');
        process.exit(1); // Exit code 1 = should compact
      } else {
        console.log('✅ Should compact: NO');
        process.exit(0); // Exit code 0 = don't compact
      }
      break;
      
    case 'compact':
      runCompact();
      break;
      
    case 'config':
      console.log('Configuration:');
      console.log(JSON.stringify(CONFIG, null, 2));
      break;
      
    default:
      console.log('Usage: node auto-context-compact.js [command]');
      console.log('Commands:');
      console.log('  monitor   - Start continuous monitoring');
      console.log('  check     - Check once and exit with status');
      console.log('  compact   - Run compact immediately');
      console.log('  config    - Show configuration');
      break;
  }
}

module.exports = {
  estimateTokenUsage,
  shouldCompact,
  runCompact,
  startMonitor
};