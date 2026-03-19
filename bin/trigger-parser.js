#!/usr/bin/env node
/**
 * Natural Language Trigger Parser for WZRD CLI
 * Parses "@Remi every Monday at 8am" style triggers
 * Phase 2 Week 2: Autonomy Features - Proactive Language
 */

const fs = require('fs');
const path = require('path');
// Simple cron parser - using manual logic instead of external dependency

class TriggerParser {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.triggersPath = path.join(this.basePath, 'configs', 'triggers.json');
    this.jobScheduler = null;
    
    this.loadTriggers();
    
    // Try to load job scheduler
    try {
      const JobScheduler = require('./job-scheduler');
      this.jobScheduler = new JobScheduler();
    } catch (error) {
      console.warn('Job scheduler not available:', error.message);
    }
  }

  /**
   * Load saved triggers
   */
  loadTriggers() {
    if (fs.existsSync(this.triggersPath)) {
      try {
        this.triggers = JSON.parse(fs.readFileSync(this.triggersPath, 'utf8'));
      } catch (error) {
        console.error('Failed to load triggers:', error.message);
        this.triggers = [];
      }
    } else {
      this.triggers = [];
      this.saveTriggers();
    }
  }

  /**
   * Save triggers
   */
  saveTriggers() {
    const dir = path.dirname(this.triggersPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.triggersPath, JSON.stringify(this.triggers, null, 2));
  }

  /**
   * Parse natural language trigger
   * Examples:
   * - "@Remi every Monday at 8am, compile AI news"
   * - "if file changes in ./src, run tests"
   * - "when git commit, update changelog"
   * - "check for updates daily at 9am"
   */
  parse(text) {
    console.log(`🧠 Parsing trigger: "${text}"`);
    
    const result = {
      original: text,
      type: 'unknown',
      schedule: null,
      command: null,
      conditions: [],
      parsed: false
    };

    // Extract command/task
    const commandMatch = this.extractCommand(text);
    if (commandMatch) {
      result.command = commandMatch;
    }

    // Extract schedule
    const scheduleMatch = this.extractSchedule(text);
    if (scheduleMatch) {
      result.schedule = scheduleMatch.cron;
      result.type = 'scheduled';
      result.humanReadable = scheduleMatch.human;
      result.parsed = true;
    }

    // Extract file condition
    const fileCondition = this.extractFileCondition(text);
    if (fileCondition) {
      result.type = 'file_watch';
      result.conditions.push(fileCondition);
      result.parsed = true;
    }

    // Extract event condition
    const eventCondition = this.extractEventCondition(text);
    if (eventCondition) {
      result.type = 'event';
      result.conditions.push(eventCondition);
      result.parsed = true;
    }

    // If we have command but no type, it's manual
    if (result.command && !result.parsed) {
      result.type = 'manual';
      result.parsed = true;
    }

    return result;
  }

  /**
   * Extract command/task from text
   */
  extractCommand(text) {
    // Remove trigger phrases
    const cleaned = text
      .replace(/^@?(Remi|WZRD|wzrd)\s*/i, '')
      .replace(/^(hey|hi|hello)\s+/i, '')
      .trim();

    // Common patterns
    const patterns = [
      /(?:,|then)\s*(.+)$/i, // "... , compile news"
      /(?:do|perform|execute|run)\s+(.+)$/i, // "... do compile news"
      /(?:task|job)\s*:\s*(.+)$/i, // "... task: compile news"
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // If no pattern matched, return the cleaned text
    return cleaned || null;
  }

  /**
   * Extract schedule from text
   */
  extractSchedule(text) {
    const schedulePatterns = [
      // "every Monday at 8am"
      {
        pattern: /every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
        handler: (match) => {
          const day = match[1].toLowerCase();
          let hour = parseInt(match[2]);
          const minute = match[3] ? parseInt(match[3]) : 0;
          const ampm = match[4] ? match[4].toLowerCase() : null;
          
          // Convert 12-hour to 24-hour
          if (ampm === 'pm' && hour < 12) hour += 12;
          if (ampm === 'am' && hour === 12) hour = 0;
          
          const dayMap = {
            monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
            friday: 5, saturday: 6, sunday: 0
          };
          
          return {
            cron: `0 ${minute} ${hour} * * ${dayMap[day]}`,
            human: `Every ${day.charAt(0).toUpperCase() + day.slice(1)} at ${match[2]}${match[3] ? ':' + match[3] : ''}${ampm || ''}`
          };
        }
      },
      // "daily at 9am"
      {
        pattern: /(daily|every day)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
        handler: (match) => {
          let hour = parseInt(match[2]);
          const minute = match[3] ? parseInt(match[3]) : 0;
          const ampm = match[4] ? match[4].toLowerCase() : null;
          
          if (ampm === 'pm' && hour < 12) hour += 12;
          if (ampm === 'am' && hour === 12) hour = 0;
          
          return {
            cron: `0 ${minute} ${hour} * * *`,
            human: `Daily at ${match[2]}${match[3] ? ':' + match[3] : ''}${ampm || ''}`
          };
        }
      },
      // "hourly"
      {
        pattern: /hourly/i,
        handler: () => ({
          cron: '0 * * * *',
          human: 'Every hour'
        })
      },
      // "every 5 minutes"
      {
        pattern: /every\s+(\d+)\s+minutes?/i,
        handler: (match) => {
          const minutes = parseInt(match[1]);
          return {
            cron: `*/${minutes} * * * *`,
            human: `Every ${minutes} minutes`
          };
        }
      },
      // "weekly on Monday"
      {
        pattern: /weekly\s+(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
        handler: (match) => {
          const day = match[1].toLowerCase();
          const dayMap = {
            monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
            friday: 5, saturday: 6, sunday: 0
          };
          
          return {
            cron: `0 9 * * ${dayMap[day]}`,
            human: `Weekly on ${day.charAt(0).toUpperCase() + day.slice(1)} at 9am`
          };
        }
      }
    ];

    for (const { pattern, handler } of schedulePatterns) {
      const match = text.match(pattern);
      if (match) {
        return handler(match);
      }
    }

    return null;
  }

  /**
   * Extract file condition
   */
  extractFileCondition(text) {
    const patterns = [
      // "if file changes in ./src"
      {
        pattern: /(?:if|when)\s+(?:file|files?)\s+(?:change|changes|modified?)\s+(?:in|at)\s+([^\s,]+)/i,
        handler: (match) => ({
          type: 'file_change',
          path: match[1],
          events: ['change']
        })
      },
      // "when ./src changes"
      {
        pattern: /when\s+([^\s,]+)\s+changes?/i,
        handler: (match) => ({
          type: 'file_change',
          path: match[1],
          events: ['change']
        })
      }
    ];

    for (const { pattern, handler } of patterns) {
      const match = text.match(pattern);
      if (match) {
        return handler(match);
      }
    }

    return null;
  }

  /**
   * Extract event condition
   */
  extractEventCondition(text) {
    const patterns = [
      // "when git commit"
      {
        pattern: /when\s+git\s+(commit|push|pull)/i,
        handler: (match) => ({
          type: 'git_event',
          event: match[1],
          command: `git ${match[1]}`
        })
      },
      // "on system startup"
      {
        pattern: /(?:on|at)\s+system\s+(startup|boot|restart)/i,
        handler: (match) => ({
          type: 'system_event',
          event: match[1]
        })
      }
    ];

    for (const { pattern, handler } of patterns) {
      const match = text.match(pattern);
      if (match) {
        return handler(match);
      }
    }

    return null;
  }

  /**
   * Create job from parsed trigger
   */
  async createJob(parsedTrigger, userId = 'system') {
    const jobId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job = {
      id: jobId,
      name: `Trigger: ${parsedTrigger.command?.slice(0, 50) || 'Unnamed'}`,
      schedule: parsedTrigger.schedule || '* * * * *', // Default: every minute
      timeout: 300, // 5 minutes
      command: this.buildCommand(parsedTrigger),
      description: `Created from trigger: ${parsedTrigger.original}`,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      type: parsedTrigger.type,
      conditions: parsedTrigger.conditions
    };

    // Save trigger
    this.triggers.push({
      ...job,
      originalText: parsedTrigger.original,
      parsedAt: new Date().toISOString()
    });
    
    this.saveTriggers();

    // Schedule job if scheduler available
    if (this.jobScheduler && parsedTrigger.type === 'scheduled') {
      this.jobScheduler.scheduleJob(job);
      console.log(`✅ Scheduled job: ${job.name} (${parsedTrigger.humanReadable})`);
    } else if (parsedTrigger.type === 'file_watch') {
      console.log(`✅ Created file watch trigger: ${job.name}`);
      console.log(`   Watch path: ${parsedTrigger.conditions[0]?.path}`);
      console.log(`   Command: ${job.command}`);
    }

    return job;
  }

  /**
   * Build command from parsed trigger
   */
  buildCommand(parsedTrigger) {
    if (parsedTrigger.command) {
      // Simple command execution
      return `echo "Executing: ${parsedTrigger.command}" && wzrd "${parsedTrigger.command}"`;
    }
    
    // Default fallback
    return `echo "Trigger executed: ${parsedTrigger.original}"`;
  }

  /**
   * List all triggers
   */
  listTriggers() {
    console.log('\n📋 Active Triggers:\n');
    
    if (this.triggers.length === 0) {
      console.log('No triggers configured.');
      return;
    }

    for (const trigger of this.triggers) {
      console.log(`• ${trigger.name}`);
      console.log(`  ID: ${trigger.id}`);
      console.log(`  Type: ${trigger.type}`);
      
      if (trigger.schedule && trigger.schedule !== '* * * * *') {
        console.log(`  Schedule: ${trigger.schedule}`);
      }
      
      if (trigger.command) {
        console.log(`  Command: ${trigger.command.slice(0, 100)}${trigger.command.length > 100 ? '...' : ''}`);
      }
      
      console.log(`  Created: ${new Date(trigger.createdAt).toLocaleString()}`);
      console.log('');
    }
  }

  /**
   * Remove trigger
   */
  removeTrigger(triggerId) {
    const index = this.triggers.findIndex(t => t.id === triggerId);
    
    if (index === -1) {
      console.log(`❌ Trigger not found: ${triggerId}`);
      return false;
    }
    
    const removed = this.triggers.splice(index, 1)[0];
    this.saveTriggers();
    
    console.log(`✅ Removed trigger: ${removed.name}`);
    return true;
  }

  /**
   * Test parsing
   */
  testParse(text) {
    const result = this.parse(text);
    
    console.log('\n🧪 Trigger Parsing Test:');
    console.log(`Input: "${text}"`);
    console.log(`Type: ${result.type}`);
    console.log(`Parsed: ${result.parsed ? '✅' : '❌'}`);
    
    if (result.schedule) {
      console.log(`Schedule: ${result.schedule}`);
      console.log(`Human: ${result.humanReadable}`);
    }
    
    if (result.command) {
      console.log(`Command: ${result.command}`);
    }
    
    if (result.conditions.length > 0) {
      console.log(`Conditions: ${JSON.stringify(result.conditions, null, 2)}`);
    }
    
    return result;
  }
}

// CLI interface
if (require.main === module) {
  const parser = new TriggerParser();
  const command = process.argv[2];

  switch (command) {
    case 'parse':
      const text = process.argv.slice(3).join(' ');
      if (!text) {
        console.log('Usage: node trigger-parser.js parse "<trigger text>"');
        console.log('Example: node trigger-parser.js parse "@Remi every Monday at 8am, compile AI news"');
        break;
      }
      
      const result = parser.testParse(text);
      break;

    case 'create':
      const triggerText = process.argv.slice(3).join(' ');
      if (!triggerText) {
        console.log('Usage: node trigger-parser.js create "<trigger text>"');
        console.log('Example: node trigger-parser.js create "@Remi every Monday at 8am, compile AI news"');
        break;
      }
      
      const parsed = parser.parse(triggerText);
      if (parsed.parsed) {
        parser.createJob(parsed);
      } else {
        console.log('❌ Could not parse trigger');
      }
      break;

    case 'list':
      parser.listTriggers();
      break;

    case 'remove':
      const triggerId = process.argv[3];
      if (!triggerId) {
        console.log('Usage: node trigger-parser.js remove <trigger-id>');
        console.log('Use "list" command to see trigger IDs');
        break;
      }
      
      parser.removeTrigger(triggerId);
      break;

    case 'test':
      // Test examples
      const testCases = [
        '@Remi every Monday at 8am, compile AI news from Hacker News',
        'if file changes in ./src, run tests',
        'when git commit, update changelog automatically',
        'check for system updates daily at 9am',
        'every 5 minutes, check website status',
        'weekly on Friday, send productivity report',
        'when package.json changes, install dependencies'
      ];
      
      console.log('🧪 Running test cases:\n');
      for (const testCase of testCases) {
        parser.testParse(testCase);
        console.log('---\n');
      }
      break;

    default:
      console.log('Usage: node trigger-parser.js [command]');
      console.log('Commands:');
      console.log('  parse <text>   - Parse trigger text');
      console.log('  create <text>  - Create trigger from text');
      console.log('  list           - List all triggers');
      console.log('  remove <id>    - Remove trigger by ID');
      console.log('  test           - Run test cases');
      console.log('\nExamples:');
      console.log('  node trigger-parser.js parse "@Remi every Monday at 8am, compile news"');
      console.log('  node trigger-parser.js create "if ./src changes, run tests"');
      console.log('  node trigger-parser.js list');
      break;
  }
}

module.exports = TriggerParser;