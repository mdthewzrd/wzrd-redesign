---
name: heartbeat
description: Cron job scheduling, background job monitoring, and periodic task execution
category: operations
priority: P1
tags: [cron, jobs, scheduling, monitoring, background]
dependencies: [system-health]
---

# Heartbeat Skill

## Purpose

Schedule and monitor background jobs (cron tasks), ensure system processes are alive and healthy, and handle periodic maintenance.

## Core Principle

**"The system should take care of itself. Cron jobs do the boring work automatically."**

---

## What is a Heartbeat?

A **heartbeat** is a periodic check that verifies:
1. Scheduled jobs are running
2. Background processes are alive
3. System components are responsive
4. Nothing has silently failed
5. **Thresholds aren't exceeded** (context, memory, disk)

**Think of it as:** The system's pulse. If it stops beating, something is wrong.

---

## Two Types of Triggers

### Time-Based (Cron)

Jobs run on schedule regardless of system state.

```yaml
schedule_triggers:
  - "0 2 * * *"     # Daily at 2 AM
  - "0 * * * *"     # Every hour
  - "0 3 * * 0"     # Weekly
```

### Event-Based (Thresholds)

Jobs run immediately when thresholds are exceeded.

```yaml
threshold_triggers:
  memory_summary_too_large:
    condition: "tokens > 1200"
    action: "immediate_summarization"
    priority: "high"

  context_approaching_limit:
    condition: "tokens_used > 65%"
    action: "summarize_now"
    priority: "critical"

  disk_almost_full:
    condition: "disk_usage > 85%"
    action: "archive_old_logs"
    priority: "high"

  learning_loop_stagnant:
    condition: "days_since_last_learning > 7"
    action: "alert_user"
    priority: "warning"
```

**Threshold triggers are FAIL-SAFES.** They fire even if cron job hasn't run yet.

---

## Cron Job Patterns

### Basic Cron Syntax

```bash
# ┌───────────── minute (0 - 59)
# │ ┌───────────── hour (0 - 23)
# │ │ ┌───────────── day of month (1 - 31)
# │ │ │ ┌───────────── month (1 - 12)
# │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
# │ │ │ │ │
# * * * * * command
```

### Common Schedules

| Schedule | Cron Expression | Purpose |
|----------|----------------|---------|
| Every hour | `0 * * * *` | Health checks |
| Every 6 hours | `0 */6 * * *` | Backup checks |
| Daily at 2 AM | `0 2 * * *` | Memory curation |
| Daily at 3 AM | `0 3 * * *` | Log rotation |
| Weekly (Sunday) | `0 3 * * 0` | Full backup |
| Monthly (1st) | `0 2 1 * *` | Archive cleanup |

---

## WZRD.dev Scheduled Jobs

### Memory Curator (Daily @ 2 AM)

```yaml
name: memory-curator
schedule: "0 2 * * *"
timeout: 300
location: /wzrd.dev/memory/curator/
actions:
  - consolidate_daily_logs
  - extract_patterns
  - update_memory_summary
  - archive_stale_content
```

### Health Check (Hourly)

```yaml
name: health-check
schedule: "0 * * * *"
timeout: 30
actions:
  - check_memory_size
  - check_disk_usage
  - check_learning_rate
  - verify_pattern_health
```

### Log Rotation (Daily @ 3 AM)

```yaml
name: log-rotation
schedule: "0 3 * * *"
timeout: 60
actions:
  - compress_old_logs
  - delete_logs_older_than_90days
  - update_log_index
```

### Backup Verification (Weekly)

```yaml
name: backup-check
schedule: "0 4 * * 0"
timeout: 120
actions:
  - verify_backup_integrity
  - test_restore_process
  - report_backup_status
```

---

## Job Implementation Template

```typescript
// /wzrd.dev/ops/jobs/[job-name].ts

interface CronJob {
  name: string;
  schedule: string;  // cron expression
  timeout: number;   // seconds
  handler: () => Promise<JobResult>;
}

interface JobResult {
  success: boolean;
  duration: number;
  metrics: Record<string, number>;
  errors?: string[];
  alerts?: string[];
}

export const job: CronJob = {
  name: "memory-curator",
  schedule: "0 2 * * *",
  timeout: 300,

  async handler(): Promise<JobResult> {
    const start = Date.now();

    try {
      // Do the work
      const result = await doMemoryCuration();

      return {
        success: true,
        duration: Date.now() - start,
        metrics: {
          patterns_extracted: result.patterns.length,
          entries_archived: result.archived,
        }
      };
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - start,
        errors: [error.message]
      };
    }
  }
};
```

---

## Job Monitoring

### Health Check Process

Every heartbeat run checks:

```yaml
for each scheduled_job:
  - last_run_status: success|failure|never
  - last_run_time: timestamp
  - next_run_time: timestamp
  - consecutive_failures: count

  if consecutive_failures >= 3:
    alert: "Job failing: {job_name}"
```

### Alert Thresholds

| Condition | Alert Level | Action |
|-----------|-------------|--------|
| Job fails once | Warning | Log only |
| Job fails 3x consecutively | Error | Send notification |
| Job timeout | Error | Kill + restart |
| Job never ran | Critical | Manual intervention |

---

## Job Logging

All jobs log to:

```
/wzrd.dev/ops/logs/jobs/
├── memory-curator/
│   ├── 2026-02-19.log
│   └── 2026-02-18.log
├── health-check/
│   ├── 2026-02-19.log
│   └── 2026-02-18.log
└── job-status.log  # Aggregate status
```

**Log format:**
```yaml
---
timestamp: 2026-02-19T02:00:00Z
job: memory-curator
status: success
duration: 12.3s
metrics:
  patterns_extracted: 3
  entries_archived: 12
alerts: []
---
```

---

## Manual Job Control

```bash
# List all jobs
npx heartbeat list

# Run job manually (test)
npx heartbeat run memory-curator --dry-run

# Show job status
npx heartbeat status memory-curator

# Enable/disable job
npx heartbeat disable memory-curator
npx heartbeat enable memory-curator

# View job logs
npx heartbeat logs memory-curator --today
```

---

## Background Process Monitoring

### Process Health Checks

For long-running processes (gateway, telegram bot, etc.):

```typescript
interface ProcessHealth {
  pid: number;
  name: string;
  uptime: number;
  memory_mb: number;
  cpu_percent: number;
  status: "healthy" | "unhealthy" | "dead";
  last_check: timestamp;
}

async function checkProcess(name: string): Promise<ProcessHealth> {
  const pid = await getPid(name);

  if (!pid) {
    return { status: "dead", name };
  }

  const stats = await getProcessStats(pid);

  return {
    pid,
    name,
    uptime: stats.uptime,
    memory_mb: stats.memory / 1024 / 1024,
    cpu_percent: stats.cpu,
    status: stats.cpu > 90 ? "unhealthy" : "healthy",
    last_check: Date.now(),
  };
}
```

### Auto-Restart Policy

```yaml
auto_restart:
  enabled: true
  max_restarts: 3
  restart_delay: 30  # seconds
  backoff: exponential  # 30s, 60s, 120s

on_max_restarts_reached:
  alert: true
  action: "manual_intervention_required"
```

---

## Cron Implementation Options

### Option 1: Node-Cron (Simple)

```typescript
import cron from 'node-cron';

cron.schedule('0 2 * * *', async () => {
  console.log('Running memory curator...');
  await runMemoryCurator();
});
```

### Option 2: Custom Scheduler (More Control)

```typescript
class CronScheduler {
  private jobs: Map<string, CronJob> = new Map();

  schedule(job: CronJob): void {
    this.jobs.set(job.name, job);

    // Calculate next run time
    const nextRun = this.getNextRunTime(job.schedule);

    // Set timeout
    setTimeout(() => this.executeJob(job), nextRun - Date.now());
  }

  async executeJob(job: CronJob): Promise<void> {
    const timeout = setTimeout(() => {
      throw new Error(`Job timeout: ${job.name}`);
    }, job.timeout * 1000);

    try {
      const result = await job.handler();
      await this.logResult(job.name, result);
    } finally {
      clearTimeout(timeout);
    }

    // Reschedule
    this.schedule(job);
  }
}
```

---

## Event-Based Triggers (Thresholds)

### Why We Need Both

**Time-based (cron):** "Run maintenance every night at 2 AM"
**Event-based (thresholds):** "Run NOW if context is 75% full"

Thresholds are **fail-safes**. They fire when the system can't wait for the next scheduled run.

### Threshold Monitor

```typescript
interface ThresholdTrigger {
  name: string;
  condition: () => Promise<boolean>;
  action: () => Promise<void>;
  priority: "critical" | "high" | "warning";
  cooldown: number;  // Don't fire more often than this (ms)
}

class ThresholdMonitor {
  private triggers: ThresholdTrigger[] = [];
  private lastFired: Map<string, number> = new Map();

  register(trigger: ThresholdTrigger): void {
    this.triggers.push(trigger);
  }

  async check(): Promise<void> {
    for (const trigger of this.triggers) {
      const conditionMet = await trigger.condition();

      if (conditionMet) {
        const lastRun = this.lastFired.get(trigger.name) || 0;
        const cooldownExpired = Date.now() - lastRun > trigger.cooldown;

        if (cooldownExpired) {
          console.log(`Threshold triggered: ${trigger.name}`);
          await trigger.action();
          this.lastFired.set(trigger.name, Date.now());
        }
      }
    }
  }
}
```

### Critical Thresholds

```typescript
// Context overload protection
const contextThreshold: ThresholdTrigger = {
  name: "context_overload",
  condition: async () => {
    const usage = await getContextUsage();
    return usage.percent > 65;  // 65% = action needed
  },
  action: async () => {
    console.log("Context at 65%+, summarizing now...");
    await summarizeContext();
  },
  priority: "critical",
  cooldown: 60000,  // Don't spam - max once per minute
};

// Memory summary size protection
const memorySummaryThreshold: ThresholdTrigger = {
  name: "memory_summary_too_large",
  condition: async () => {
    const content = await readFile("/wzrd.dev/memory/MEMORY_SUMMARY.md");
    const tokens = estimateTokens(content);
    return tokens > 1600;  // 60% buffer before action
  },
  action: async () => {
    console.log("MEMORY_SUMMARY.md too large, summarizing...");
    await summarizeMemorySummary();
  },
  priority: "high",
  cooldown: 300000,  // Max once per 5 minutes
};

/**
 * CRITICAL: Where does removed content go?
 *
 * When summarizing MEMORY_SUMMARY.md:
 * 1. Proven patterns (3+ confirmations) → MEMORY.md (curated wisdom)
 * 2. Everything else → archive/memory_summary/YYYY-MM.md (fully preserved)
 * 3. NOTHING is deleted, only moved
 *
 * See memory-curation skill for details
 */

// Disk space protection
const diskThreshold: ThresholdTrigger = {
  name: "disk_almost_full",
  condition: async () => {
    const usage = await getDiskUsage("/wzrd.dev");
    return (usage.used / usage.total) > 0.85;  // 85% full
  },
  action: async () => {
    console.log("Disk at 85%+, archiving old logs...");
    await archiveOldLogs();
  },
  priority: "high",
  cooldown: 3600000,  // Max once per hour
};

// Learning loop stagnation check
const learningLoopThreshold: ThresholdTrigger = {
  name: "learning_loop_stagnant",
  condition: async () => {
    const learnings = await loadLearnings();
    if (learnings.length === 0) return false;
    const lastEntry = learnings[learnings.length - 1];
    const daysSince = daysBetween(lastEntry.date, new Date());
    return daysSince > 7;  // No learning in 7 days
  },
  action: async () => {
    console.log("Learning loop stagnant! Alerting...");
    await sendAlert({
      severity: "warning",
      message: "No learning loop entries in 7+ days",
      action: "Check if system is being used",
    });
  },
  priority: "warning",
  cooldown: 86400000,  // Max once per day
};
```

### Combined System

```typescript
// /wzrd.dev/ops/heartbeat/index.ts

const monitor = new ThresholdMonitor();
const scheduler = new CronScheduler();

// Register threshold triggers (event-based)
monitor.register(contextThreshold);
monitor.register(memorySummaryThreshold);
monitor.register(diskThreshold);
monitor.register(learningLoopThreshold);

// Register scheduled jobs (time-based)
scheduler.schedule({
  name: "memory-curator",
  schedule: "0 2 * * *",
  handler: runMemoryCurator,
});

// Check thresholds every minute
setInterval(() => monitor.check(), 60000);

// Also check before expensive operations
async function beforeExpensiveOperation() {
  await monitor.check();  // Fire if needed
  // Then proceed with operation
}
```

### Threshold Configuration

```yaml
# /wzrd.dev/ops/config/thresholds.yaml

thresholds:
  context_usage:
    warning: 40
    action: 65
    critical: 75
    on_critical: "emergency_summarization"

  memory_summary_tokens:
    target: 1000      # Optimal size
    warning: 1400     # 40% buffer
    action: 1600      # 60% buffer
    critical: 1800    # 80% buffer
    on_action: "summarize_and_archive"
    # IMPORTANT: Removed content goes to:
    # - Proven patterns → MEMORY.md (curated wisdom)
    # - Everything else → archive/memory_summary/ (preserved)
    # NOTHING is deleted

  disk_usage:
    warning: 80
    action: 85
    critical: 90
    on_critical: "archive_and_purge"

  learning_loop_stagnant:
    warning: 3  # days
    action: 7
    critical: 14
    on_critical: "alert_and_investigate"
```

---

## Heartbeat Integration with System Health

```typescript
// /wzrd.dev/ops/heartbeat/index.ts

import { checkSystemHealth } from '../system-health';

export async function heartbeatJob(): Promise<JobResult> {
  const health = await checkSystemHealth();

  return {
    success: health.status === 'healthy',
    duration: health.check_time,
    metrics: health.metrics,
    alerts: health.alerts,
  };
}
```

---

## Testing Cron Jobs

### Dry Run Mode

```bash
# Test without making changes
npx heartbeat run memory-curator --dry-run

# Output:
# Would extract 3 patterns from learnings.md
# Would archive 12 entries
# Would update MEMORY_SUMMARY.md
# Duration: 2.3s (estimated)
```

### Test Schedule

```bash
# Show when next run will occur
npx heartbeat next memory-curator

# Output:
# memory-curator: Next run in 6h 23m (2026-02-20 02:00:00)
```

---

## Monitoring Dashboard

```typescript
// /wzrd.dev/ops/dashboard/jobs.ts

interface JobDashboard {
  jobs: JobStatus[];
  system_health: HealthStatus;
  recent_activity: ActivityLog[];
}

async function getDashboard(): Promise<JobDashboard> {
  return {
    jobs: await getAllJobStatus(),
    system_health: await checkSystemHealth(),
    recent_activity: await getRecentActivity(24),  // last 24h
  };
}
```

**Web UI:** `http://localhost:3000/dashboard` (when gateway running)

---

## Failure Recovery

### On Job Failure

1. **Log the error** with full stack trace
2. **Send alert** if 3rd consecutive failure
3. **Create incident report** in `/wzrd.dev/ops/incidents/`
4. **Attempt auto-recovery** based on error type
5. **Escalate** if auto-recovery fails

### Recovery Strategies

```yaml
error_types:
  timeout:
    action: "kill_and_restart"
    max_retries: 1

  network_error:
    action: "retry_with_backoff"
    max_retries: 3
    backoff: [5s, 30s, 120s]

  disk_full:
    action: "alert_and_stop"
    requires: "manual_intervention"

  dependency_missing:
    action: "alert_and_stop"
    requires: "fix_dependencies"
```

---

## Gold Standard Compliance

### Read-Back Verification
- After scheduling job, verify it's registered
- After job runs, verify log entry created
- Confirm metrics recorded correctly

### Executable Proof
- Show cron schedule: `npx heartbeat list`
- Show job status: `npx heartbeat status [job]`
- Show recent runs: `npx heartbeat history [job]`

### Loop Prevention
If job fails 3x with same error:
1. Stop scheduling
2. Alert administrator
3. Don't retry without intervention

---

## Heartbeat Checklist

Before deploying a new job:
- [ ] Test with --dry-run
- [ ] Verify schedule expression
- [ ] Check timeout is reasonable
- [ ] Confirm error handling
- [ ] Test failure recovery
- [ ] Verify logging works
- [ ] Document alerts
- [ ] Add to monitoring

---

**"A healthy system has a strong heartbeat. Monitor it, trust it, fix it when it fails."**
