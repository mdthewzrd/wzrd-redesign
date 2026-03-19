# WZRD.dev Automation Roadmap
## From Manual to OpenClaw-Level Proactive Agents

**Status:** Planning Phase  
**Priority:** Post Web UI & Discord Implementation  
**Goal:** Achieve NanoClaw-level automation with persistent memory, scheduled tasks, and proactive agents

---

## 🎯 Executive Summary

**Current State:**
- 69 production-ready skills (documented, not running)
- Manual context management (`.context/` files)
- On-demand agent execution
- Single-threaded workflows

**Target State:**
- Running automation services (24/7)
- Auto-persistent memory (no manual files)
- Scheduled + threshold-based triggers
- True parallel background agents
- Event-driven reactive agents

**The Gap:** Skills exist as documentation, not running systems.

---

## 📊 Compare: WZRD.dev vs NanoClaw

| Feature | NanoClaw | Current WZRD.dev | After Roadmap |
|---------|----------|------------------|---------------|
| **Scheduled Tasks** | ✅ Native cron | ❌ None | ✅ Heartbeat system |
| **Auto-Memory** | ✅ Per-group CLAUDE.md | ⚠️ Manual `.context/` | ✅ Auto-persistence |
| **Background Jobs** | ✅ Agent swarms | ⚠️ Gateway V2 (partial) | ✅ True parallelism |
| **Event Triggers** | ✅ File/git/webhook | ❌ None | ✅ Reactive agents |
| **Persistent State** | ✅ SQLite | ❌ Session-only | ✅ State DB |
| **Notifications** | ✅ Multi-channel | ❌ None | ✅ Proactive alerts |
| **Multi-Channel** | ✅ WhatsApp, Slack, etc. | 🔄 Building (Web+Discord) | ✅ Full multi-channel |

---

## 🏗️ The 7 Core Components

### **1. 🔥 HEARTBEAT SYSTEM (The Engine)**

**Purpose:** Cron scheduler + threshold monitoring running 24/7

**Current State:** Documented in `/skills/heartbeat/SKILL.md`

**What to Build:**
```typescript
// /wzrd.dev/ops/heartbeat/index.ts
class HeartbeatService {
  // Time-based triggers (cron)
  scheduleJob("0 2 * * *", runMemoryCurator);     // Daily @ 2 AM
  scheduleJob("0 * * * *", runHealthCheck);      // Hourly
  scheduleJob("0 */6 * * *", runContextCleanup); // Every 6 hours
  scheduleJob("0 3 * * 0", runWeeklyBackup);     // Weekly Sunday

  // Event-based triggers (thresholds)
  monitorThreshold("context_usage", {
    warning: 40,   // 40% - warn
    action: 65,    // 65% - auto-summarize NOW
    critical: 75,  // 75% - emergency stop
  });

  monitorThreshold("memory_summary_tokens", {
    warning: 1400,
    action: 1600,
    critical: 1800,
  });

  monitorThreshold("disk_usage", {
    warning: 80,
    action: 85,
    critical: 90,
  });
}
```

**Scheduled Jobs:**
- **Memory Curator** - Daily @ 2 AM (extract patterns, update MEMORY.md, archive old)
- **Health Check** - Hourly (check memory size, disk, learning rate)
- **Log Rotation** - Daily @ 3 AM (compress, delete >90 days)
- **Backup Verification** - Weekly @ 4 AM Sunday
- **Context Cleanup** - Every 6 hours (threshold-based)

**CLI Commands:**
```bash
wzrd heartbeat list              # Show all jobs
wzrd heartbeat status [job]      # Check job status
wzrd heartbeat run [job]         # Manual run
wzrd heartbeat logs [job]        # View logs
wzrd heartbeat next [job]        # Show next run time
```

---

### **2. 💾 AUTO-PERSIST MEMORY SYSTEM**

**Purpose:** Automatic context saving/loading without manual `.context/` files

**Current State:** Documented in `/skills/memory-curation/SKILL.md`

**Current Flow (Manual):**
```
User writes .context/learnings.md
User runs memory curator manually
User manages MEMORY_SUMMARY.md size
```

**Target Flow (Auto):**
```
Session start → Auto-load MEMORY_SUMMARY + active project
During session → Track patterns in real-time
Session end → Auto-save to learnings.md
Daily @ 2 AM → Curator extracts → MEMORY.md
On threshold hit → Immediate summarization
```

**What to Build:**
```typescript
// /wzrd.dev/ops/memory/auto-persist.ts
class AutoMemory {
  onSessionStart() {
    // Auto-load from state DB
    const summary = await db.getMemorySummary();
    const recentLearnings = await db.getRecentLearnings(10);
    const activeProject = await db.getActiveProject();

    // Inject into context automatically
    context.inject(summary);
    context.inject(recentLearnings);
    context.inject(activeProject);
  }

  onSessionEnd() {
    // Auto-save tracked patterns
    const patterns = context.extractPatterns();
    await db.saveLearnings(patterns);

    // Queue for curator
    await db.queueForCuration(patterns);
  }

  onThresholdHit(threshold) {
    // Immediate action, no waiting
    switch(threshold) {
      case 'context_65%':
        await this.summarizeContext();
        break;
      case 'memory_summary_1600_tokens':
        await this.compressMemorySummary();
        break;
    }
  }

  // Real-time pattern tracking
  trackPattern(pattern) {
    this.pendingPatterns.push({
      ...pattern,
      timestamp: Date.now(),
      session: getCurrentSession(),
    });
  }
}
```

**Key Changes:**
- ❌ No more manual `.context/` file management
- ❌ No manual `npx curator run`
- ✅ Auto-extract patterns from every session
- ✅ Auto-archive old content
- ✅ Auto-optimize MEMORY_SUMMARY.md size
- ✅ Never lose learnings again

---

### **3. ⚡ EVENT-DRIVEN TRIGGERS (Reactive Agents)**

**Purpose:** Agents respond to events, not just commands

**Current State:** ❌ Not implemented

**What to Build:**

#### **3.1 File System Watcher**
```typescript
// /wzrd.dev/ops/triggers/file-watcher.ts
class FileWatcher {
  watch("./src", {
    onChange: async (file) => {
      // Auto-run affected tests
      await runBackgroundAgent("test-runner", {
        files: [file],
        coverage: false,
      });

      // Auto-lint changed files
      await runBackgroundAgent("linter", {
        files: [file],
        fix: true,
      });

      // Auto-format
      await runBackgroundAgent("formatter", {
        files: [file],
      });
    },

    onAdd: async (file) => {
      // New file - check naming conventions
      await runBackgroundAgent("naming-check", { file });

      // Suggest tests
      await runBackgroundAgent("test-suggester", { file });
    },

    onDelete: async (file) => {
      // Check for orphaned imports
      await runBackgroundAgent("orphan-check", { file });
    },
  });
}
```

#### **3.2 Git Hooks**
```typescript
// /wzrd.dev/ops/triggers/git-hooks.ts
class GitTriggers {
  onPreCommit: async () => {
    // Run tests
    const results = await runTests();
    if (!results.pass) {
      return { reject: true, message: "Tests failed" };
    }

    // Lint staged files
    const lint = await lintStaged();
    if (!lint.pass) {
      return { reject: true, message: "Lint errors" };
    }

    // Check commit message format
    const msg = await validateCommitMessage();
    if (!msg.valid) {
      return { reject: true, message: "Invalid commit message" };
    }
  };

  onPrePush: async (branch) => {
    // Full test suite
    const results = await runFullTestSuite();
    if (!results.pass) {
      return { reject: true };
    }

    // Security scan
    const security = await runSecurityScan();
    if (security.vulnerabilities > 0) {
      return { reject: true, message: "Security issues found" };
    }
  };

  onPostMerge: async (branch) => {
    // Update dependencies if needed
    await runBackgroundAgent("dependency-check");

    // Trigger build
    await runBackgroundAgent("builder", { branch });
  };
}
```

#### **3.3 Webhook Server**
```typescript
// /wzrd.dev/ops/triggers/webhooks.ts
class WebhookServer {
  // GitHub webhooks
  onPRCreate: async (pr) => {
    // Auto-assign reviewer
    await autoAssignReviewer(pr);

    // Run security scan
    await runBackgroundAgent("security-scan", { pr });

    // Post initial review
    await runBackgroundAgent("pr-reviewer", { pr });
  };

  onPRUpdate: async (pr) => {
    // Re-run tests
    await runBackgroundAgent("test-runner", { pr });
  };

  onPRMerge: async (pr) => {
    // Trigger deployment
    await runBackgroundAgent("deploy", {
      branch: pr.base,
      environment: "staging",
    });
  };

  // External service webhooks
  onSlackCommand: async (command) => {
    // Parse command
    // Spawn appropriate agent
    // Return result to Slack
  };

  onDiscordMessage: async (message) => {
    // Parse intent
    // Route to agent
    // Return response
  };
}
```

**Event Types:**
- ✅ File changes (create, modify, delete)
- ✅ Git events (commit, push, merge, PR)
- ✅ Webhooks (GitHub, Slack, Discord, custom)
- ✅ Threshold breaches (context, memory, disk)
- ✅ Scheduled events (cron)
- ✅ Manual triggers (user-initiated)

---

### **4. 🚀 BACKGROUND AGENT RUNNER**

**Purpose:** True parallel background execution without blocking

**Current State:** Documented in `/skills/background-agents/SKILL.md`, Gateway V2 partial

**What to Build:**
```typescript
// /wzrd.dev/ops/background/runner.ts
class BackgroundAgentRunner {
  // Spawn via Gateway V2 (true process isolation)
  async spawn(agent, task, options = {}) {
    const jobId = generateJobId();

    // Spawn via Gateway V2
    const job = await gatewayV2.spawn({
      agent: agent,           // "raya", "ted", "remi"
      task: task,            // Task description
      background: true,      // Non-blocking
      jobId: jobId,
      model: options.model,  // Optional model override
      priority: options.priority || "normal",
      timeout: options.timeout || 1800, // 30 min default
    });

    // Save to state DB
    await db.saveJob({
      id: jobId,
      agent: agent,
      status: "running",
      createdAt: Date.now(),
      ...options,
    });

    // Return immediately (non-blocking)
    return jobId;
  }

  // Check status anytime
  async checkStatus(jobId) {
    const job = await db.getJob(jobId);
    return {
      id: job.id,
      status: job.status,      // pending|running|completed|failed
      progress: job.progress,  // 0-100
      result: job.result,      // If completed
      error: job.error,        // If failed
      duration: Date.now() - job.createdAt,
    };
  }

  // Get results
  async getResults(jobId) {
    const job = await db.getJob(jobId);
    if (job.status === "completed") {
      return job.result;
    }
    if (job.status === "failed") {
      throw new Error(job.error);
    }
    return null; // Still running
  }

  // Wait for completion
  async waitFor(jobId, timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const job = await this.checkStatus(jobId);
      if (job.status === "completed") return job.result;
      if (job.status === "failed") throw new Error(job.error);
      await sleep(1000);
    }
    throw new Error("Timeout waiting for job");
  }

  // Cancel job
  async cancel(jobId) {
    await gatewayV2.kill(jobId);
    await db.updateJob(jobId, { status: "cancelled" });
  }
}

// Usage
const runner = new BackgroundAgentRunner();

// Spawn and continue immediately
const jobId = await runner.spawn("raya", "Research OAuth2 best practices");

// Check later
const status = await runner.checkStatus(jobId);

// Or wait
const results = await runner.waitFor(jobId, 60000);
```

**CLI Commands:**
```bash
# Spawn background agent
wzrd bg-spawn --agent raya --prompt "Research auth patterns"

# List running jobs
wzrd bg-jobs

# Check status
wzrd bg-status <job-id>

# Get results
wzrd bg-results <job-id>

# Cancel job
wzrd bg-kill <job-id>

# Stream logs
wzrd bg-logs <job-id> --follow
```

---

### **5. 🗄️ STATE MANAGEMENT LAYER**

**Purpose:** Persistent SQLite database for agent state across sessions

**Current State:** ❌ Not implemented

**What to Build:**

#### **Database Schema**
```sql
-- /wzrd.dev/ops/db/schema.sql

-- Jobs table (background tasks)
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  agent TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result TEXT,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  duration_ms INTEGER,
  model TEXT,
  cost_estimate REAL,
  priority TEXT DEFAULT 'normal'
);

-- Memory table (patterns, learnings)
CREATE TABLE memory (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('pattern', 'decision', 'learning', 'asset')),
  content TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  session_count INTEGER DEFAULT 1,
  sessions TEXT, -- JSON array of session IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  archived BOOLEAN DEFAULT FALSE,
  archived_at DATETIME,
  tags TEXT -- JSON array
);

-- Agent state (current status)
CREATE TABLE agent_state (
  agent TEXT PRIMARY KEY,
  current_task TEXT,
  current_job_id TEXT,
  context_json TEXT, -- JSON blob of current context
  last_heartbeat DATETIME,
  status TEXT CHECK(status IN ('idle', 'busy', 'error', 'offline')),
  total_jobs_completed INTEGER DEFAULT 0,
  total_jobs_failed INTEGER DEFAULT 0
);

-- Sessions (tracking)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  agent TEXT,
  project TEXT,
  patterns_extracted INTEGER DEFAULT 0,
  learnings_count INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('active', 'completed', 'error'))
);

-- Events (audit log)
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  agent TEXT,
  job_id TEXT,
  session_id TEXT,
  details TEXT, -- JSON blob
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled jobs configuration
CREATE TABLE scheduled_jobs (
  name TEXT PRIMARY KEY,
  schedule TEXT NOT NULL, -- cron expression
  handler TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  last_run DATETIME,
  last_status TEXT,
  consecutive_failures INTEGER DEFAULT 0,
  timeout_seconds INTEGER DEFAULT 300
);

-- Thresholds configuration
CREATE TABLE thresholds (
  name TEXT PRIMARY KEY,
  metric TEXT NOT NULL,
  warning_value REAL,
  action_value REAL,
  critical_value REAL,
  last_triggered DATETIME,
  cooldown_seconds INTEGER DEFAULT 300
);

-- Notifications
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL,
  title TEXT,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME
);
```

#### **API Layer**
```typescript
// /wzrd.dev/ops/db/api.ts
class StateDB {
  // Jobs
  async createJob(job: Job): Promise<string>;
  async getJob(id: string): Promise<Job>;
  async updateJob(id: string, updates: Partial<Job>): Promise<void>;
  async listJobs(filters: JobFilters): Promise<Job[]>;
  async deleteOldJobs(olderThanDays: number): Promise<number>;

  // Memory
  async savePattern(pattern: Pattern): Promise<void>;
  async getConfirmedPatterns(): Promise<Pattern[]>;
  async updatePatternConfirmation(id: string, confirmed: boolean): Promise<void>;
  async archiveOldPatterns(olderThanDays: number): Promise<number>;

  // Agent state
  async updateAgentState(agent: string, state: AgentState): Promise<void>;
  async getAgentState(agent: string): Promise<AgentState>;
  async getAllAgentStates(): Promise<AgentState[]>;

  // Sessions
  async startSession(session: Session): Promise<string>;
  async endSession(id: string): Promise<void>;
  async getActiveSessions(): Promise<Session[]>;

  // Events
  async logEvent(event: Event): Promise<void>;
  async getEvents(filters: EventFilters): Promise<Event[]>;

  // Scheduled jobs
  async registerScheduledJob(job: ScheduledJob): Promise<void>;
  async getScheduledJobs(): Promise<ScheduledJob[]>;
  async updateJobRunStatus(name: string, status: string): Promise<void>;

  // Thresholds
  async registerThreshold(threshold: Threshold): Promise<void>;
  async checkThresholds(): Promise<TriggeredThreshold[]>;
  async recordThresholdTrigger(name: string): Promise<void>;

  // Notifications
  async queueNotification(notification: Notification): Promise<void>;
  async getPendingNotifications(): Promise<Notification[]>;
  async markNotificationSent(id: number): Promise<void>;
}
```

**Why SQLite:**
- ✅ Single file, no server needed
- ✅ Persistent across restarts
- ✅ Fast local queries
- ✅ Easy to backup/version control
- ✅ Perfect for agent state

---

### **6. 🎛️ AGENT ORCHESTRATOR**

**Purpose:** Coordinate multiple agents, distribute tasks, manage swarms

**Current State:** ⚠️ Partial - documented, not fully implemented

**What to Build:**
```typescript
// /wzrd.dev/ops/orchestrator/index.ts
class AgentOrchestrator {
  // Define specialized agent teams
  teams = {
    "code-review": ["remi", "security-agent", "performance-agent"],
    "refactor": ["remi", "ted", "testing-agent"],
    "architecture": ["ted", "remi"],
    "security-audit": ["security-agent", "remi"],
    "full-stack": ["remi", "ui-ux-master", "testing-agent"],
  };

  // Distribute task across team
  async distribute(task, teamName, options = {}) {
    const agents = this.teams[teamName];
    const subtasks = this.breakIntoSubtasks(task, agents.length);

    // Parallel execution
    const jobs = await Promise.all(
      agents.map((agent, i) =>
        backgroundRunner.spawn(agent, subtasks[i], {
          priority: options.priority,
          timeout: options.timeout,
        })
      )
    );

    // Wait for all
    const results = await Promise.all(
      jobs.map(id => backgroundRunner.waitFor(id, options.timeout))
    );

    // Merge results
    return this.mergeResults(results, teamName);
  }

  // Swarm mode - multiple agents work on same task
  async swarm(task, count = 3, options = {}) {
    // Spawn N agents with same task
    // Different models/prompts for diversity
    const jobs = await Promise.all(
      Array(count).fill().map((_, i) =>
        backgroundRunner.spawn(
          this.selectAgent(i),
          task,
          { model: this.selectModel(i), ...options }
        )
      )
    );

    // Vote on best result
    const results = await Promise.all(
      jobs.map(id => backgroundRunner.waitFor(id))
    );

    return this.voteOnResults(results);
  }

  // Pipeline mode - sequential agents
  async pipeline(stages, initialInput) {
    let result = initialInput;

    for (const stage of stages) {
      const jobId = await backgroundRunner.spawn(
        stage.agent,
        { input: result, task: stage.task }
      );
      result = await backgroundRunner.waitFor(jobId);
    }

    return result;
  }

  // Watchdog - monitor running agents
  async startWatchdog() {
    setInterval(async () => {
      const running = await db.getRunningJobs();

      for (const job of running) {
        // Check if stalled
        const duration = Date.now() - job.started_at;
        if (duration > job.timeout * 1000) {
          await this.handleStalledJob(job);
        }

        // Update heartbeat
        await db.updateAgentState(job.agent, {
          last_heartbeat: Date.now(),
        });
      }
    }, 30000); // Check every 30s
  }

  // Auto-recovery for failed jobs
  async handleFailedJob(job) {
    if (job.consecutive_failures < 3) {
      // Retry with backoff
      await sleep(Math.pow(2, job.consecutive_failures) * 1000);
      await backgroundRunner.spawn(job.agent, job.prompt, {
        jobId: job.id,
        retry: true,
      });
    } else {
      // Escalate to human
      await notificationSystem.notify("Job Failed", {
        job: job.id,
        agent: job.agent,
        error: job.error,
        action: "Manual intervention required",
      });
    }
  }
}
```

---

### **7. 📢 NOTIFICATION SYSTEM**

**Purpose:** Proactive alerts when jobs complete, thresholds hit, or action needed

**Current State:** ❌ Not implemented

**What to Build:**
```typescript
// /wzrd.dev/ops/notifications/index.ts
class NotificationSystem {
  channels = {
    discord: new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL),
    email: new EmailSender({
      smtp: process.env.SMTP_HOST,
      from: "wzrd@localhost",
    }),
    desktop: new DesktopNotifier(),
    web: new WebSocketNotifier(),
    slack: new SlackWebhook(process.env.SLACK_WEBHOOK_URL),
  };

  async notify(event, message, options = {}) {
    const notification = {
      id: generateId(),
      event,
      message,
      priority: options.priority || "normal",
      channels: options.channels || ["discord"],
      timestamp: Date.now(),
      metadata: options.metadata || {},
    };

    // Save to DB
    await db.queueNotification(notification);

    // Send to each channel
    for (const channel of notification.channels) {
      try {
        await this.channels[channel].send({
          title: event,
          message,
          priority: notification.priority,
          timestamp: notification.timestamp,
          metadata: notification.metadata,
        });
        await db.markNotificationSent(notification.id);
      } catch (error) {
        console.error(`Failed to send to ${channel}:`, error);
      }
    }
  }

  // Pre-defined notification templates
  async jobComplete(job) {
    await this.notify(
      "✅ Job Complete",
      `${job.agent} finished: ${job.prompt.substring(0, 100)}...`,
      {
        priority: "low",
        channels: ["desktop", "discord"],
        metadata: { jobId: job.id, duration: job.duration },
      }
    );
  }

  async jobFailed(job) {
    await this.notify(
      "❌ Job Failed",
      `${job.agent} failed after ${job.consecutive_failures} attempts`,
      {
        priority: "high",
        channels: ["discord", "email"],
        metadata: { jobId: job.id, error: job.error },
      }
    );
  }

  async thresholdWarning(threshold, value) {
    await this.notify(
      `⚠️ ${threshold.name} Warning`,
      `${threshold.metric} at ${value}% (threshold: ${threshold.warning_value}%)`,
      {
        priority: threshold.priority || "normal",
        channels: ["desktop", "discord"],
      }
    );
  }

  async thresholdCritical(threshold, value) {
    await this.notify(
      `🚨 ${threshold.name} CRITICAL`,
      `${threshold.metric} at ${value}% (threshold: ${threshold.critical_value}%) - Action taken`,
      {
        priority: "critical",
        channels: ["discord", "email", "desktop"],
      }
    );
  }

  async agentOffline(agent) {
    await this.notify(
      "🔴 Agent Offline",
      `${agent} has not sent heartbeat in 5 minutes`,
      {
        priority: "high",
        channels: ["discord", "email"],
      }
    );
  }

  async dailySummary(stats) {
    await this.notify(
      "📊 Daily Summary",
      `Jobs: ${stats.jobs_completed} completed, ${stats.jobs_failed} failed. ` +
      `Patterns extracted: ${stats.patterns_extracted}.`,
      {
        priority: "low",
        channels: ["discord"],
      }
    );
  }
}
```

---

## 🏁 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**
**Goal:** Core infrastructure running

- [ ] **Setup SQLite database** - Schema, migrations, basic API
- [ ] **Implement Heartbeat Service** - Cron scheduler + threshold monitoring
- [ ] **Build Auto-Memory layer** - Automatic context save/load
- [ ] **Test integration** - Verify all components work together

**Success Criteria:**
- Heartbeat runs cron jobs on schedule
- Memory auto-saves on session end
- Thresholds trigger immediate actions
- Database persists across restarts

---

### **Phase 2: Reactive Layer (Week 2-3)**
**Goal:** Event-driven triggers working

- [ ] **File Watcher** - chokidar integration, auto-test on save
- [ ] **Git Hooks** - Pre-commit tests, pre-push validation
- [ ] **Webhook Server** - Express server for external events
- [ ] **Event Router** - Route events to appropriate agents

**Success Criteria:**
- File changes trigger background jobs
- Git hooks block bad commits
- Webhooks receive and process events
- Events are logged and tracked

---

### **Phase 3: Background Execution (Week 3-4)**
**Goal:** True parallel agents

- [ ] **Productionize Gateway V2** - Ensure stable background execution
- [ ] **Background Agent API** - spawn, status, results, cancel
- [ ] **Job State Management** - Track all jobs in DB
- [ ] **CLI Commands** - wzrd bg-spawn, bg-status, bg-results

**Success Criteria:**
- Can spawn agent and continue working immediately
- Job status persists across sessions
- Results available after completion
- Failed jobs retry automatically

---

### **Phase 4: Orchestration (Week 4-5)**
**Goal:** Multi-agent coordination

- [ ] **Agent Teams** - Define specialized teams
- [ ] **Task Distribution** - Parallel execution across agents
- [ ] **Swarm Mode** - Multiple agents vote on results
- [ ] **Pipeline Mode** - Sequential agent chains
- [ ] **Watchdog** - Monitor and recover stalled jobs

**Success Criteria:**
- Can run "code-review" team on PR
- Swarm mode returns consensus
- Failed jobs auto-retry then escalate

---

### **Phase 5: Polish (Week 5-6)**
**Goal:** Production-ready system

- [ ] **Notification System** - Multi-channel alerts
- [ ] **Dashboard** - Web UI for monitoring
- [ ] **Health Monitoring** - System metrics, alerts
- [ ] **Documentation** - Full setup guide
- [ ] **Testing** - Integration tests, stress tests

**Success Criteria:**
- Notifications sent for all critical events
- Dashboard shows real-time status
- System health monitored automatically
- Full test coverage

---

## 🎯 Success Metrics

**Automation Level:**
- [ ] 90% of memory management automated (vs 0% now)
- [ ] 100% of context optimization automated (vs manual)
- [ ] 50% of testing automated via file watching
- [ ] 100% of scheduled jobs running without intervention

**Agent Productivity:**
- [ ] Can spawn 5+ background jobs simultaneously
- [ ] Jobs complete without blocking main session
- [ ] Failed jobs retry automatically (3x then escalate)
- [ ] Average job latency < 30 seconds

**System Health:**
- [ ] Heartbeat runs every minute without failure
- [ ] Context stays under 65% threshold automatically
- [ ] Memory curator runs daily without manual trigger
- [ ] Zero data loss across restarts

---

## 🔗 Dependencies

### **Before Starting This Roadmap:**
1. ✅ **Web UI** - Must be complete for dashboard integration
2. ✅ **Discord Integration** - For notifications and commands
3. ✅ **Gateway V2** - Must be production-ready for background agents

### **Can Build In Parallel:**
- SQLite database (no deps)
- Heartbeat service (needs DB)
- Auto-memory (needs DB + Heartbeat)
- File watcher (standalone)
- Notification system (needs Discord)

---

## 📚 Related Documentation

- `/skills/heartbeat/SKILL.md` - Heartbeat implementation guide
- `/skills/automation/SKILL.md` - Automation patterns
- `/skills/background-agents/SKILL.md` - Parallel execution
- `/skills/memory-curation/SKILL.md` - Memory management
- `/skills/orchestration/SKILL.md` - Multi-agent coordination
- `/skills/system-health/SKILL.md` - Health monitoring

---

## 💭 Design Decisions

### **Why SQLite over PostgreSQL?**
- Single file, easier backup/restore
- No separate server to manage
- Perfect for agent state (not high-throughput)
- Can migrate to PG later if needed

### **Why Node.js over Python?**
- Consistent with rest of WZRD.dev
- Better async/await support
- Gateway V2 already Node.js
- Single language stack

### **Why not use existing job queues (Bull, Agenda)?**
- Want full control over job lifecycle
- Need tight integration with agent system
- Custom threshold monitoring
- Learning experience

---

## 🚀 Quick Start (When Ready)

```bash
# 1. Install dependencies
npm install better-sqlite3 node-cron chokidar express

# 2. Initialize database
wzrd db:migrate

# 3. Start heartbeat service
wzrd heartbeat start

# 4. Start webhook server
wzrd webhooks start

# 5. Start file watcher
wzrd watch start

# 6. Verify everything running
wzrd status
```

---

**Last Updated:** 2026-03-12  
**Status:** Planning - Ready to implement after Web UI + Discord  
**Estimated Effort:** 6 weeks  
**Priority:** P1 (High - blocking proactive agents)
