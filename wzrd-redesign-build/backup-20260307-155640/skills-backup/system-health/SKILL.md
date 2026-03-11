---
name: system-health
description: Health monitoring, metrics collection, alerting, and system status tracking
category: operations
priority: P0
tags: [health, monitoring, metrics, alerts, status]
dependencies: [heartbeat, system-audit]
---

# System Health Skill

## Purpose

Monitor system health, collect metrics, alert on issues, and provide visibility into WZRD.dev's operational status.

## Core Principle

**"You can't fix what you can't see. Monitor everything, alert intelligently."**

---

## Health Dimensions

### 1. System Resources
- CPU usage
- Memory usage
- Disk usage
- Network I/O

### 2. Application Health
- Processes running
- Services responding
- Ports accessible
- Logs error-free

### 3. Memory System
- MEMORY_SUMMARY.md size
- learnings.md activity
- MEMORY.md patterns
- Archive status

### 4. Development Metrics
- Test pass rate
- Build success rate
- Coverage trend
- Dependency freshness

### 5. Learning Loop
- Feedback frequency
- Pattern confirmations
- Flagged entries
- Stagnation detection

---

## Health Check Framework

### Health Status Levels

```yaml
statuses:
  healthy:
    color: green
    description: "All systems operational"
    threshold: "0-2 minor issues"

  degraded:
    color: yellow
    description: "Some issues, system functional"
    threshold: "1-2 medium issues OR 3-5 minor"

  critical:
    color: orange
    description: "Significant issues, attention needed"
    threshold: "1+ high issues OR multiple medium"

  down:
    color: red
    description: "System non-functional"
    threshold: "1+ critical issues OR core services down"
```

### Health Check Structure

```typescript
interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "critical" | "down";
  checks: Check[];
  metrics: Metrics;
  alerts: Alert[];
  timestamp: string;
}

interface Check {
  name: string;
  status: "pass" | "fail" | "warn";
  value: number | string;
  threshold: number | string;
  message: string;
}

interface Metrics {
  cpu_percent: number;
  memory_mb: number;
  disk_percent: number;
  uptime_seconds: number;
  active_processes: number;
  open_ports: number;
  error_rate: number;
  response_time_ms: number;
}
```

---

## Core Health Checks

### CPU Check

```typescript
async function checkCPU(): Promise<Check> {
  const usage = await getCPUUsage();

  return {
    name: "cpu",
    status: usage > 90 ? "fail" : usage > 75 ? "warn" : "pass",
    value: `${usage}%`,
    threshold: "< 75%",
    message: usage > 90 ? "CPU critically high" : "CPU normal",
  };
}
```

### Memory Check

```typescript
async function checkMemory(): Promise<Check> {
  const usage = await getMemoryUsage();
  const total = await getTotalMemory();
  const percent = (usage / total) * 100;

  return {
    name: "memory",
    status: percent > 90 ? "fail" : percent > 75 ? "warn" : "pass",
    value: `${Math.round(usage / 1024 / 1024)}MB (${percent.toFixed(1)}%)`,
    threshold: "< 75%",
    message: percent > 90 ? "Memory critically high" : "Memory normal",
  };
}
```

### Disk Check

```typescript
async function checkDisk(): Promise<Check> {
  const usage = await getDiskUsage("/wzrd.dev");
  const percent = (usage.used / usage.total) * 100;

  return {
    name: "disk",
    status: percent > 90 ? "fail" : percent > 80 ? "warn" : "pass",
    value: `${usage.used_gb}GB / ${usage.total_gb}GB (${percent.toFixed(1)}%)`,
    threshold: "< 80%",
    message: percent > 90 ? "Disk almost full" : "Disk normal",
  };
}
```

### Process Check

```typescript
async function checkProcesses(): Promise<Check> {
  const expected = ["gateway", "telegram-bot"];
  const running = await getRunningProcesses();
  const missing = expected.filter(p => !running.includes(p));

  return {
    name: "processes",
    status: missing.length > 0 ? "fail" : "pass",
    value: `${running.length}/${expected.length} running`,
    threshold: "All expected processes",
    message: missing.length > 0 ? `Missing: ${missing.join(", ")}` : "All processes running",
  };
}
```

---

## Memory System Health

### MEMORY_SUMMARY.md Check

```typescript
async function checkMemorySummary(): Promise<Check> {
  const content = await readFile("/wzrd.dev/memory/MEMORY_SUMMARY.md");
  const tokens = estimateTokens(content);

  return {
    name: "memory_summary",
    status: tokens > 1500 ? "fail" : tokens > 1200 ? "warn" : "pass",
    value: `${tokens} tokens`,
    threshold: "< 1200",
    message: tokens > 1500 ? "Memory summary too large" : "Memory summary healthy",
  };
}
```

### Learning Loop Activity Check

```typescript
async function checkLearningLoop(): Promise<Check> {
  const learnings = await loadLearnings();
  const lastEntry = learnings[learnings.length - 1];
  const daysSince = daysBetween(lastEntry.date, new Date());

  return {
    name: "learning_loop",
    status: daysSince > 7 ? "fail" : daysSince > 3 ? "warn" : "pass",
    value: `${daysSince} days since last entry`,
    threshold: "< 3 days",
    message: daysSince > 7 ? "Learning loop stagnant" : "Learning loop active",
  };
}
```

### Pattern Health Check

```typescript
async function checkPatterns(): Promise<Check> {
  const memory = await loadMemory();
  const confirmed = memory.patterns.filter(p => p.status === "confirmed").length;
  const flagged = memory.patterns.filter(p => p.status === "flagged").length;

  return {
    name: "patterns",
    status: confirmed < 5 ? "warn" : "pass",
    value: `${confirmed} confirmed, ${flagged} flagged`,
    threshold: "5+ confirmed patterns",
    message: confirmed < 5 ? "Few patterns confirmed" : "Patterns healthy",
  };
}
```

---

## Development Health

### Test Pass Rate

```typescript
async function checkTests(): Promise<Check> {
  const result = await runTests();

  return {
    name: "tests",
    status: result.failed > 0 ? "fail" : "pass",
    value: `${result.passed}/${result.total} passing`,
    threshold: "100% passing",
    message: result.failed > 0 ? `${result.failed} tests failing` : "All tests passing",
  };
}
```

### Dependency Freshness

```typescript
async function checkDependencies(): Promise<Check> {
  const outdated = await getOutdatedPackages();

  return {
    name: "dependencies",
    status: outdated.length > 5 ? "warn" : "pass",
    value: `${outdated.length} outdated`,
    threshold: "< 5 outdated",
    message: outdated.length > 5 ? "Many packages outdated" : "Dependencies fresh",
  };
}
```

---

## Health Check Runner

### Main Health Function

```typescript
async function checkSystemHealth(): Promise<HealthCheck> {
  const checks = await Promise.all([
    checkCPU(),
    checkMemory(),
    checkDisk(),
    checkProcesses(),
    checkMemorySummary(),
    checkLearningLoop(),
    checkPatterns(),
    checkTests(),
    checkDependencies(),
  ]);

  const failed = checks.filter(c => c.status === "fail").length;
  const warned = checks.filter(c => c.status === "warn").length;

  // Determine overall status
  let status: HealthStatus;
  if (failed > 0) {
    status = failed >= 1 ? "down" : "critical";
  } else if (warned >= 3) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  // Collect metrics
  const metrics = await collectMetrics();

  // Generate alerts
  const alerts = generateAlerts(checks);

  return {
    status,
    checks,
    metrics,
    alerts,
    timestamp: new Date().toISOString(),
  };
}
```

### Metrics Collection

```typescript
async function collectMetrics(): Promise<Metrics> {
  const [cpu, memory, disk, uptime] = await Promise.all([
    getCPUUsage(),
    getMemoryUsage(),
    getDiskUsage("/wzrd.dev"),
    getSystemUptime(),
  ]);

  return {
    cpu_percent: cpu,
    memory_mb: Math.round(memory / 1024 / 1024),
    disk_percent: (disk.used / disk.total) * 100,
    uptime_seconds: uptime,
    active_processes: await getProcessCount(),
    open_ports: await getOpenPortCount(),
    error_rate: await getErrorRate(),
    response_time_ms: await getAverageResponseTime(),
  };
}
```

---

## Alerting

### Alert Generation

```typescript
function generateAlerts(checks: Check[]): Alert[] {
  const alerts: Alert[] = [];

  for (const check of checks) {
    if (check.status === "fail") {
      alerts.push({
        severity: "critical",
        check: check.name,
        message: check.message,
        timestamp: new Date().toISOString(),
      });
    } else if (check.status === "warn") {
      alerts.push({
        severity: "warning",
        check: check.name,
        message: check.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}
```

### Alert Thresholds

| Check | Warning | Critical |
|-------|---------|----------|
| CPU | > 75% | > 90% |
| Memory | > 75% | > 90% |
| Disk | > 80% | > 90% |
| MEMORY_SUMMARY | > 1200 tokens | > 1500 tokens |
| Learning loop | > 3 days | > 7 days |
| Tests | Any fail | > 10% fail |

### Alert Delivery

```yaml
channels:
  critical:
    - immediate_notification
    - email
    - slack

  warning:
    - daily_digest
    - slack

  info:
    - weekly_report
```

---

## Health Dashboard

### Dashboard Data

```typescript
interface Dashboard {
  status: HealthStatus;
  uptime: string;
  last_check: string;
  checks: CheckSummary[];
  metrics: Metrics;
  recent_alerts: Alert[];
  trends: Trend[];
}

async function getDashboard(): Promise<Dashboard> {
  const health = await checkSystemHealth();
  const history = await getHealthHistory(24);  // Last 24h

  return {
    status: health.status,
    uptime: formatUptime(await getSystemUptime()),
    last_check: health.timestamp,
    checks: summarizeChecks(health.checks),
    metrics: health.metrics,
    recent_alerts: await getRecentAlerts(24),
    trends: calculateTrends(history),
  };
}
```

### Web Display

```html
<!-- /dashboard -->
<div class="health-dashboard">
  <div class="status-badge status-{{status}}">
    {{status}}
  </div>

  <div class="metrics">
    <div class="metric">
      <span class="label">CPU</span>
      <span class="value">{{metrics.cpu_percent}}%</span>
    </div>
    <div class="metric">
      <span class="label">Memory</span>
      <span class="value">{{metrics.memory_mb}}MB</span>
    </div>
    <div class="metric">
      <span class="label">Disk</span>
      <span class="value">{{metrics.disk_percent}}%</span>
    </div>
  </div>

  <div class="checks">
    {{#each checks}}
      <div class="check check-{{status}}">
        <span class="name">{{name}}</span>
        <span class="value">{{value}}</span>
        <span class="message">{{message}}</span>
      </div>
    {{/each}}
  </div>

  <div class="alerts">
    {{#each recent_alerts}}
      <div class="alert alert-{{severity}}">
        {{message}}
      </div>
    {{/each}}
  </div>
</div>
```

---

## Health History

### Recording Health

```typescript
async function recordHealth(health: HealthCheck): Promise<void> {
  const logEntry = {
    timestamp: health.timestamp,
    status: health.status,
    metrics: health.metrics,
    alerts: health.alerts.map(a => ({
      severity: a.severity,
      check: a.check,
    })),
  };

  const logPath = `/wzrd.dev/ops/health/logs/${dateToFile(health.timestamp)}.log`;
  await appendToFile(logPath, JSON.stringify(logEntry));
}
```

### Health Trends

```typescript
interface Trend {
  metric: string;
  direction: "up" | "down" | "stable";
  change_percent: number;
  period: string;
}

function calculateTrends(history: HealthCheck[]): Trend[] {
  return [
    {
      metric: "cpu",
      direction: compare(history[0].metrics.cpu_percent, history[history.length - 1].metrics.cpu_percent),
      change_percent: percentChange(history[0].metrics.cpu_percent, history[history.length - 1].metrics.cpu_percent),
      period: "24h",
    },
    // ... other metrics
  ];
}
```

---

## CLI Commands

```bash
# Check health now
npx health check

# Show detailed status
npx health status --verbose

# Show specific check
npx health check memory
npx health check learning-loop

# Show health history
npx health history --last 24h

# Watch mode (refresh every 30s)
npx health watch

# Generate report
npx health report --output health.md

# Show alerts
npx health alerts --active

# Test a check
npx health test cpu --threshold 90
```

---

## Health Check Schedule

### Cron: Hourly

```yaml
name: health-check
schedule: "0 * * * *"
timeout: 30
actions:
  - run_all_health_checks
  - record_health_metrics
  - send_alerts_if_needed
  - update_dashboard
```

### Ad-Hoc Checks

```bash
# Before deployment
npx health check --pre-deploy

# After deployment
npx health check --post-deploy

# Investigate issue
npx health check --full --verbose
```

---

## Gold Standard Compliance

### Read-Back Verification
- After health check, verify log written
- Confirm dashboard updated
- Validate alerts sent correctly

### Executable Proof
- Show health status: `npx health check`
- Show metrics: `npx health status --verbose`
- Show history: `npx health history`

### Loop Prevention
If health check fails:
1. Check if monitoring service is down
2. Verify check logic is correct
3. Don't spam alerts (throttle)

---

## Health Checklist

System is healthy when:
- [ ] CPU < 75%
- [ ] Memory < 75%
- [ ] Disk < 80%
- [ ] All processes running
- [ ] MEMORY_SUMMARY.md < 1200 tokens
- [ ] Learning loop active (< 3 days)
- [ ] All tests passing
- [ ] No critical alerts
- [ ] Uptime > 99%

---

## Summary

**Health monitoring = visibility = control.**

```
                   ┌─────────────────┐
                   │  Health Check   │
                   │  (hourly)       │
                   └────────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
      ┌──────────┐    ┌──────────┐    ┌──────────┐
      │ Checks   │    │ Metrics  │    │ Alerts   │
      │ (CPU/etc)│    │ (collect)│    │ (notify) │
      └──────────┘    └──────────┘    └──────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                   ┌─────────────────┐
                   │   Dashboard     │
                   │   (visibility)  │
                   └─────────────────┘
```

---

**"Monitor everything. Alert intelligently. Fix proactively."**
