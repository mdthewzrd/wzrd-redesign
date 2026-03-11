#!/usr/bin/env node
/**
 * Job Scheduler for WZRD CLI
 * Implements background job system with cron scheduling
 * Phase 2 Week 2: Autonomy Features
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { CronJob } = require('cron');

class JobScheduler {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.jobsPath = path.join(this.basePath, 'jobs');
    this.logsPath = path.join(this.basePath, 'logs');
    
    // Ensure directories exist
    if (!fs.existsSync(this.jobsPath)) {
      fs.mkdirSync(this.jobsPath, { recursive: true });
    }
    
    this.jobs = new Map();
    this.runningJobs = new Set();
  }

  /**
   * Initialize scheduler with default jobs
   */
  async initialize() {
    console.log('⏰ Initializing WZRD Job Scheduler...\n');
    
    // Default jobs from heartbeat skill
    const defaultJobs = [
      {
        id: 'health-check',
        name: 'System Health Check',
        schedule: '0 * * * *', // Every hour
        timeout: 60,
        command: 'node bin/health-monitor.js',
        description: 'Check system health, token savings, and integration status'
      },
      {
        id: 'memory-curator',
        name: 'Memory Curator',
        schedule: '0 2 * * *', // Daily at 2 AM
        timeout: 300,
        command: 'node bin/integrate-memory.js',
        description: 'Consolidate daily logs, extract patterns, update memory summary'
      },
      {
        id: 'log-rotation',
        name: 'Log Rotation',
        schedule: '0 3 * * *', // Daily at 3 AM
        timeout: 120,
        command: 'node bin/cleanup-logs.js',
        description: 'Compress old logs, delete logs older than 90 days'
      },
      {
        id: 'cost-analysis',
        name: 'Cost Analysis',
        schedule: '0 6 * * *', // Daily at 6 AM
        timeout: 90,
        command: 'node bin/token-dashboard.js --daily-report',
        description: 'Analyze daily cost trends and budget usage'
      },
      {
        id: 'skill-effectiveness',
        name: 'Skill Effectiveness Tracking',
        schedule: '0 4 * * 0', // Weekly on Sunday at 4 AM
        timeout: 180,
        command: 'node bin/analyze-skill-usage.js',
        description: 'Track which skills are most effective for different tasks'
      }
    ];

    // Load jobs configuration
    const jobsConfig = this.loadJobsConfig();
    const allJobs = [...defaultJobs, ...(jobsConfig.customJobs || [])];

    // Schedule all jobs
    for (const jobConfig of allJobs) {
      this.scheduleJob(jobConfig);
    }

    console.log(`✅ Scheduled ${allJobs.length} jobs`);
    console.log('📊 Next scheduled runs:');
    
    for (const [id, job] of this.jobs) {
      const nextRun = job.nextDates(1)[0];
      console.log(`  • ${id}: ${nextRun.toLocaleString()}`);
    }
  }

  /**
   * Schedule a cron job
   */
  scheduleJob(config) {
    try {
      const job = new CronJob(
        config.schedule,
        () => this.executeJob(config),
        null, // onComplete
        true, // start immediately
        'America/Los_Angeles'
      );

      this.jobs.set(config.id, job);
      console.log(`✅ Scheduled job: ${config.name} (${config.schedule})`);
      
      // Save job metadata
      this.saveJobMetadata(config);
      
    } catch (error) {
      console.error(`❌ Failed to schedule job ${config.name}:`, error.message);
    }
  }

  /**
   * Execute a job
   */
  async executeJob(config) {
    if (this.runningJobs.has(config.id)) {
      console.log(`⚠️ Job ${config.name} already running, skipping`);
      return;
    }

    this.runningJobs.add(config.id);
    const startTime = Date.now();
    const jobLogFile = path.join(this.logsPath, `job_${Date.now()}_${config.id}.log`);

    console.log(`\n🔄 Starting job: ${config.name} (${new Date().toLocaleTimeString()})`);

    try {
      // Create job log
      const logEntry = {
        jobId: config.id,
        jobName: config.name,
        startTime: new Date().toISOString(),
        schedule: config.schedule,
        command: config.command
      };

      fs.writeFileSync(jobLogFile, JSON.stringify(logEntry, null, 2) + '\n\n');

      // Execute command
      const output = execSync(config.command, {
        timeout: config.timeout * 1000,
        encoding: 'utf8'
      });

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      // Log success
      const successEntry = {
        status: 'success',
        endTime: new Date().toISOString(),
        duration: `${duration}s`,
        output: output.trim().split('\n').slice(-10).join('\n') // Last 10 lines
      };

      fs.appendFileSync(jobLogFile, JSON.stringify(successEntry, null, 2) + '\n');
      console.log(`✅ Job ${config.name} completed in ${duration}s`);

      // Update job metrics
      this.updateJobMetrics(config.id, {
        lastRun: new Date().toISOString(),
        lastDuration: duration,
        lastStatus: 'success',
        totalRuns: (this.getJobMetrics(config.id).totalRuns || 0) + 1,
        successCount: (this.getJobMetrics(config.id).successCount || 0) + 1
      });

    } catch (error) {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      // Log failure
      const errorEntry = {
        status: 'error',
        endTime: new Date().toISOString(),
        duration: `${duration}s`,
        error: error.message,
        stderr: error.stderr?.toString() || '',
        stdout: error.stdout?.toString() || ''
      };

      fs.appendFileSync(jobLogFile, JSON.stringify(errorEntry, null, 2) + '\n');
      console.error(`❌ Job ${config.name} failed in ${duration}s:`, error.message);

      // Update job metrics
      this.updateJobMetrics(config.id, {
        lastRun: new Date().toISOString(),
        lastDuration: duration,
        lastStatus: 'error',
        totalRuns: (this.getJobMetrics(config.id).totalRuns || 0) + 1,
        errorCount: (this.getJobMetrics(config.id).errorCount || 0) + 1,
        lastError: error.message
      });

      // Send alert for critical jobs
      if (config.critical) {
        this.sendAlert(`Job ${config.name} failed: ${error.message}`);
      }
    } finally {
      this.runningJobs.delete(config.id);
    }
  }

  /**
   * Load jobs configuration
   */
  loadJobsConfig() {
    const configPath = path.join(this.basePath, 'configs', 'jobs.json');
    
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.error('Failed to load jobs config:', error.message);
      }
    }

    // Default config
    return {
      enabled: true,
      maxConcurrentJobs: 3,
      alertOnFailure: true,
      customJobs: []
    };
  }

  /**
   * Save job metadata
   */
  saveJobMetadata(config) {
    const metadataPath = path.join(this.jobsPath, `${config.id}.json`);
    const metadata = {
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        totalRuns: 0,
        successCount: 0,
        errorCount: 0,
        avgDuration: 0
      }
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Update job metrics
   */
  updateJobMetrics(jobId, updates) {
    const metadataPath = path.join(this.jobsPath, `${jobId}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return;
    }

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      metadata.metrics = { ...metadata.metrics, ...updates };
      metadata.updatedAt = new Date().toISOString();
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error(`Failed to update metrics for ${jobId}:`, error.message);
    }
  }

  /**
   * Get job metrics
   */
  getJobMetrics(jobId) {
    const metadataPath = path.join(this.jobsPath, `${jobId}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return {};
    }

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      return metadata.metrics || {};
    } catch (error) {
      console.error(`Failed to get metrics for ${jobId}:`, error.message);
      return {};
    }
  }

  /**
   * Send alert
   */
  sendAlert(message) {
    console.log(`🚨 ALERT: ${message}`);
    
    // In a real implementation, this would send email, Slack, etc.
    // For now, just log to alert file
    const alertPath = path.join(this.logsPath, 'alerts.log');
    const alertEntry = {
      timestamp: new Date().toISOString(),
      message: message,
      severity: 'high'
    };

    fs.appendFileSync(alertPath, JSON.stringify(alertEntry) + '\n');
  }

  /**
   * List all scheduled jobs
   */
  listJobs() {
    console.log('\n📋 Scheduled Jobs:\n');
    
    for (const [id, job] of this.jobs) {
      const nextRun = job.nextDates(1)[0];
      const metadataPath = path.join(this.jobsPath, `${id}.json`);
      
      let info = `• ${id}`;
      info += `\n  Next run: ${nextRun.toLocaleString()}`;
      
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          info += `\n  Description: ${metadata.description}`;
          info += `\n  Schedule: ${metadata.schedule}`;
          info += `\n  Total runs: ${metadata.metrics?.totalRuns || 0}`;
        } catch (error) {
          // Ignore metadata errors
        }
      }
      
      console.log(info + '\n');
    }
  }

  /**
   * Stop all jobs
   */
  stopAll() {
    console.log('🛑 Stopping all jobs...');
    
    for (const [id, job] of this.jobs) {
      job.stop();
      console.log(`✅ Stopped job: ${id}`);
    }
    
    this.jobs.clear();
    this.runningJobs.clear();
  }
}

// CLI interface
if (require.main === module) {
  const scheduler = new JobScheduler();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      scheduler.initialize();
      console.log('\n⏰ Job scheduler started. Jobs will run according to schedule.');
      console.log('Press Ctrl+C to stop.\n');
      
      // Keep process alive
      process.stdin.resume();
      break;

    case 'list':
      scheduler.initialize();
      scheduler.listJobs();
      break;

    case 'stop':
      scheduler.stopAll();
      break;

    case 'test':
      // Test job execution
      const testJob = {
        id: 'test-job',
        name: 'Test Job',
        schedule: '* * * * *', // Every minute for testing
        timeout: 30,
        command: 'echo "Test job executed successfully"',
        description: 'Test job for scheduler validation'
      };
      
      scheduler.scheduleJob(testJob);
      console.log('🧪 Test job scheduled to run every minute');
      break;

    default:
      console.log('Usage: node job-scheduler.js [command]');
      console.log('Commands:');
      console.log('  start   - Start the job scheduler');
      console.log('  list    - List all scheduled jobs');
      console.log('  stop    - Stop all jobs');
      console.log('  test    - Schedule a test job');
      break;
  }
}

module.exports = JobScheduler;