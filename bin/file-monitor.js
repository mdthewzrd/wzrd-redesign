#!/usr/bin/env node
/**
 * File System Monitor for WZRD CLI
 * Watches files/directories and triggers proactive responses
 * Phase 2 Week 2: Autonomy Features - Event Detection
 */

const fs = require('fs');
const path = require('path');
// Simple file watching using fs.watch
const { exec } = require('child_process');

class FileMonitor {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.watchers = new Map();
    this.triggers = new Map();
    this.configPath = path.join(this.basePath, 'configs', 'file-monitor.json');
    
    this.loadConfig();
  }

  /**
   * Load monitoring configuration
   */
  loadConfig() {
    if (fs.existsSync(this.configPath)) {
      try {
        this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } catch (error) {
        console.error('Failed to load monitor config:', error.message);
        this.config = this.getDefaultConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
      this.saveConfig();
    }
  }

  /**
   * Default monitoring configuration
   */
  getDefaultConfig() {
    return {
      enabled: true,
      watchPaths: [
        {
          path: './src',
          events: ['add', 'change'],
          triggers: [
            {
              pattern: '**/*.test.js',
              action: 'run tests',
              command: 'npm test'
            },
            {
              pattern: '**/*.ts',
              action: 'check types',
              command: 'npx tsc --noEmit'
            }
          ]
        },
        {
          path: './package.json',
          events: ['change'],
          triggers: [
            {
              pattern: 'package.json',
              action: 'install dependencies',
              command: 'npm install'
            }
          ]
        }
      ],
      debounceMs: 1000,
      maxConcurrent: 2
    };
  }

  /**
   * Save configuration
   */
  saveConfig() {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Initialize all watchers
   */
  async initialize() {
    console.log('👁️  Initializing File System Monitor...\n');
    
    if (!this.config.enabled) {
      console.log('⚠️  File monitoring is disabled in config');
      return;
    }

    for (const watchConfig of this.config.watchPaths) {
      await this.watchPath(watchConfig);
    }

    console.log(`✅ Monitoring ${this.config.watchPaths.length} paths`);
    console.log('📋 Active watchers:');
    for (const [watchedPath] of this.watchers) {
      console.log(`  • ${watchedPath}`);
    }
  }

  /**
   * Watch a specific path
   */
  async watchPath(watchConfig) {
    const { path: watchPath, events = ['add', 'change', 'unlink'], triggers = [] } = watchConfig;
    const absolutePath = path.resolve(this.basePath, watchPath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️  Path does not exist: ${absolutePath}`);
      return;
    }

    console.log(`👁️  Watching: ${watchPath} (events: ${events.join(', ')})`);

    console.log(`✅ Now watching: ${watchPath}`);
    
    // Simple fs.watch implementation
    const watcher = fs.watch(absolutePath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        const filePath = path.join(absolutePath, filename);
        this.handleEvent('change', filePath, watchConfig);
      }
    });

    // Store watcher
    this.watchers.set(watchPath, watcher);
  }

  /**
   * Handle file system event
   */
  async handleEvent(event, filePath, watchConfig) {
    const relativePath = path.relative(this.basePath, filePath);
    
    console.log(`📁 ${event.toUpperCase()}: ${relativePath} (${new Date().toLocaleTimeString()})`);

    // Check triggers for this path
    for (const trigger of watchConfig.triggers || []) {
      if (this.matchesPattern(relativePath, trigger.pattern)) {
        console.log(`⚡ Trigger matched: ${trigger.action}`);
        await this.executeTrigger(trigger, relativePath, event);
      }
    }
  }

  /**
   * Check if file matches pattern
   */
  matchesPattern(filePath, pattern) {
    // Simple pattern matching
    if (pattern === '**/*') return true;
    if (pattern === filePath) return true;
    if (pattern.endsWith('*') && filePath.startsWith(pattern.slice(0, -1))) return true;
    if (pattern.includes('*')) {
      // Basic wildcard support
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(filePath);
    }
    return false;
  }

  /**
   * Execute trigger command
   */
  async executeTrigger(trigger, filePath, event) {
    const { action, command } = trigger;
    const triggerId = `${action}-${Date.now()}`;
    
    console.log(`🚀 Executing trigger: ${action}`);
    console.log(`📝 Command: ${command}`);
    
    try {
      // Execute command
      const output = await this.executeCommand(command, {
        cwd: this.basePath,
        env: {
          ...process.env,
          WZRD_MONITOR_FILE: filePath,
          WZRD_MONITOR_EVENT: event,
          WZRD_MONITOR_ACTION: action
        }
      });

      console.log(`✅ Trigger executed: ${action}`);
      
      // Log success
      this.logTrigger({
        triggerId,
        action,
        filePath,
        event,
        command,
        status: 'success',
        output: output.slice(0, 500) // First 500 chars
      });

    } catch (error) {
      console.error(`❌ Trigger failed: ${action}`, error.message);
      
      // Log failure
      this.logTrigger({
        triggerId,
        action,
        filePath,
        event,
        command,
        status: 'error',
        error: error.message
      });
    }
  }

  /**
   * Execute command with timeout
   */
  executeCommand(command, options) {
    return new Promise((resolve, reject) => {
      const process = exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\n${stderr}`));
        } else {
          resolve(stdout || stderr);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        process.kill();
        reject(new Error('Command timeout after 30 seconds'));
      }, 30000);
    });
  }

  /**
   * Log trigger execution
   */
  logTrigger(entry) {
    const logsDir = path.join(this.basePath, 'logs', 'monitor');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFile = path.join(logsDir, `triggers-${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  /**
   * Add new watch configuration
   */
  addWatch(path, config) {
    const watchConfig = {
      path,
      events: config.events || ['add', 'change'],
      triggers: config.triggers || []
    };

    this.config.watchPaths.push(watchConfig);
    this.saveConfig();
    
    this.watchPath(watchConfig);
    console.log(`✅ Added watch for: ${path}`);
  }

  /**
   * List active watchers
   */
  listWatchers() {
    console.log('\n📋 Active File Monitors:\n');
    
    for (const watchConfig of this.config.watchPaths) {
      console.log(`• ${watchConfig.path}`);
      console.log(`  Events: ${watchConfig.events.join(', ')}`);
      
      if (watchConfig.triggers.length > 0) {
        console.log('  Triggers:');
        for (const trigger of watchConfig.triggers) {
          console.log(`    - ${trigger.pattern} → ${trigger.action}`);
        }
      }
      console.log('');
    }
  }

  /**
   * Stop all watchers
   */
  stopAll() {
    console.log('🛑 Stopping all file monitors...');
    
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      console.log(`✅ Stopped: ${path}`);
    }
    
    this.watchers.clear();
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new FileMonitor();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      monitor.initialize();
      console.log('\n👁️  File monitor started. Watching for changes...');
      console.log('Press Ctrl+C to stop.\n');
      
      // Keep process alive
      process.stdin.resume();
      break;

    case 'list':
      monitor.initialize();
      monitor.listWatchers();
      break;

    case 'add':
      const watchPath = process.argv[3];
      const events = process.argv[4]?.split(',') || ['add', 'change'];
      const pattern = process.argv[5] || '**/*';
      const action = process.argv[6] || 'run command';
      const cmd = process.argv[7] || 'echo "File changed"';
      
      if (!watchPath) {
        console.log('Usage: node file-monitor.js add <path> [events] [pattern] [action] [command]');
        console.log('Example: node file-monitor.js add ./src add,change **/*.test.js "run tests" "npm test"');
        break;
      }
      
      const config = {
        events,
        triggers: [{
          pattern,
          action,
          command: cmd
        }]
      };
      
      monitor.addWatch(watchPath, config);
      break;

    case 'stop':
      monitor.stopAll();
      break;

    case 'test':
      // Test event simulation
      const testFile = path.join(__dirname, '..', 'test-monitor.txt');
      fs.writeFileSync(testFile, 'Test file for monitoring');
      console.log('🧪 Created test file:', testFile);
      
      setTimeout(() => {
        fs.unlinkSync(testFile);
        console.log('🧪 Deleted test file');
      }, 1000);
      break;

    default:
      console.log('Usage: node file-monitor.js [command]');
      console.log('Commands:');
      console.log('  start   - Start file monitoring');
      console.log('  list    - List active monitors');
      console.log('  add     - Add new watch path');
      console.log('  stop    - Stop all monitors');
      console.log('  test    - Create test file');
      break;
  }
}

module.exports = FileMonitor;