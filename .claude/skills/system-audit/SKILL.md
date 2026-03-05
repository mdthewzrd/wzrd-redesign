---
name: system-audit
description: System auditing, compliance checking, security review, and change verification
category: operations
priority: P1
tags: [audit, compliance, security, verification, review]
dependencies: [system-health, gold-standard]
---

# System Audit Skill

## Purpose

Audit system changes, verify compliance with Gold Standard, check security posture, and ensure nothing breaks unexpectedly.

## Core Principle

**"Trust but verify. Every change is audited. Every deployment is reviewed."**

---

## What Gets Audited

### 1. File Changes
- New files created
- Files modified
- Files deleted
- Permission changes

### 2. System State
- Processes running
- Ports open
- Disk usage
- Memory usage

### 3. Security
- Secrets exposure
- Dependencies (vulnerabilities)
- Permissions (too broad)
- Configuration (hardcoded values)

### 4. Compliance
- Gold Standard adherence
- PROTOCOL.md followed
- Learning loop active
- Memory health maintained

---

## Audit Types

### Pre-Deployment Audit

**Before deploying:**

```yaml
checklist:
  - code_reviewed: true
  - tests_passing: true
  - security_scan: clean
  - dependencies_updated: true
  - documentation_updated: true
  - learning_loop_logged: true
```

**Output:**
```
✅ Code reviewed by peer
✅ All tests passing (47/47)
✅ No security vulnerabilities
✅ Dependencies up to date
✅ Documentation updated
✅ Learning loop logged

Audit Result: APPROVED for deployment
```

### Post-Deployment Audit

**After deploying:**

```yaml
verification:
  - deployment_successful: true
  - services_healthy: true
  - no_errors_in_logs: true
  - performance_acceptable: true
  - rollback_available: true
```

**Output:**
```
✅ Deployment successful
✅ All services healthy
✅ No errors in logs (last 15 min)
✅ Performance: p95 < 200ms
✅ Rollback ready

Audit Result: DEPLOYMENT VERIFIED
```

### Weekly Security Audit

**Every week:**

```yaml
security_checks:
  - dependency_vulnerabilities: npm audit
  - secrets_exposure: grep -r "password\|api_key\|secret"
  - permissions_review: ls -laR /wzrd.dev/
  - port_scan: nmap localhost
  - log_analysis: grep -i "error\|fail" /var/log/
```

### Monthly Compliance Audit

**Every month:**

```yaml
compliance_checks:
  - gold_standard_adherence: review recent commits
  - protocol_followed: check learnings.md activity
  - memory_health: curator health check
  - backup_integrity: verify backups
  - documentation_current: update STATUS.md
```

---

## Audit Framework

### Audit Template

```typescript
interface Audit {
  id: string;
  type: "pre-deploy" | "post-deploy" | "security" | "compliance";
  timestamp: string;
  auditor: string;
  scope: string[];
  findings: Finding[];
  status: "pass" | "fail" | "warning";
  recommendations: string[];
}

interface Finding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  evidence: string;
  remediation: string;
}
```

### Running an Audit

```typescript
async function runAudit(type: AuditType): Promise<Audit> {
  const audit: Audit = {
    id: generateId(),
    type,
    timestamp: new Date().toISOString(),
    auditor: "system",
    scope: getAuditScope(type),
    findings: [],
    status: "pass",
    recommendations: [],
  };

  // Run checks based on type
  switch (type) {
    case "security":
      audit.findings = await runSecurityChecks();
      break;
    case "compliance":
      audit.findings = await runComplianceChecks();
      break;
    case "pre-deploy":
      audit.findings = await runPreDeployChecks();
      break;
  }

  // Determine status
  if (audit.findings.some(f => f.severity === "critical")) {
    audit.status = "fail";
  } else if (audit.findings.some(f => f.severity === "high")) {
    audit.status = "warning";
  }

  return audit;
}
```

---

## Security Audits

### Dependency Vulnerability Scan

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Output:
# found 0 vulnerabilities
```

### Secrets Exposure Scan

```bash
# Scan for hardcoded secrets
grep -rE "(password|api_key|secret|token)\s*=\s*['\"]" /wzrd.dev/

# Scan .env files (should be gitignored)
find /wzrd.dev -name ".env" -o -name "*.env"

# Check git history for secrets
git log --all --full-history --source -- "*password*"
```

**If secrets found:**
1. Immediate alert
2. Rotate exposed credentials
3. Remove from git history
4. Add to .gitignore
5. Document incident

### Permission Audit

```bash
# Check file permissions
find /wzrd.dev -type f -perm /o=rwx -ls

# Look for world-writable files
find /wzrd.dev -type f -perm /o=w

# Check ownership
find /wzrd.dev ! -user mdwzrd
```

**Secure defaults:**
- Directories: 755 (rwxr-xr-x)
- Files: 644 (rw-r--r--)
- Scripts: 755 (rwxr-xr-x)
- Secrets: 600 (rw-------)

---

## Compliance Audits

### Gold Standard Check

```yaml
checklist:
  read_back_verification:
    method: "grep recent files for 'read back'"
    threshold: "100% of writes verified"

  executable_proof:
    method: "grep for test results, file paths"
    threshold: "every claim has evidence"

  loop_prevention:
    method: "check for repeated failures"
    threshold: "no 3+ attempts on same approach"

  soul_first:
    method: "check SOUL.md loaded first"
    threshold: "soul before operational content"
```

### Learning Loop Check

```yaml
checks:
  - recent_deliverables_have_feedback: true
  - learnings_md_being_updated: true
  - patterns_emerging: true
  - no_flagged_patterns_repeated: true

failure_mode:
  if: no_learnings_in_7_days
  alert: "Learning loop inactive"
  action: "Check if skills calling learning-loop"
```

### Memory Health Check

```yaml
metrics:
  memory_summary_size: "< 1500 tokens"
  learnings_count: "growing (not stagnant)"
  memory_patterns: "confirmed patterns > 0"
  archive_size: "tracked (not exceeding limits)"
```

---

## Change Audit Trail

### Git Commit Audit

Every commit is audited for:

```yaml
commit_checks:
  - message_format: "conventional commits"
  - no_secrets: "grep for passwords, keys"
  - tests_passing: "CI passed"
  - files_changed: "review diff"
  - scope_appropriate: "not too broad"
```

**Automated hooks:**
```bash
# .git/hooks/pre-commit
npm run audit:secrets || exit 1
npm run lint || exit 1
npm test || exit 1
```

### File Change Log

```typescript
interface FileChange {
  path: string;
  action: "created" | "modified" | "deleted";
  size_delta: number;
  author: string;
  timestamp: string;
  commit: string;
}

async function auditChanges(): Promise<FileChange[]> {
  const diff = await gitDiff();
  const changes: FileChange[] = [];

  for (const file of diff) {
    changes.push({
      path: file.path,
      action: file.action,
      size_delta: file.size_delta,
      author: await getGitAuthor(),
      timestamp: new Date().toISOString(),
      commit: await getCurrentCommit(),
    });
  }

  // Log to audit trail
  await appendToFile("/wzrd.dev/audit/changes.log", JSON.stringify(changes));

  return changes;
}
```

---

## Audit Reports

### Report Structure

```markdown
# System Audit Report

**Date:** 2026-02-19
**Type:** Security Audit
**Auditor:** System
**Status:** PASS

## Summary

- Critical findings: 0
- High findings: 0
- Medium findings: 1
- Low findings: 3

## Findings

### [MEDIUM] Dependency Out of Date
**Package:** express 4.18.2
**Recommendation:** Update to 4.19.0
**Evidence:** npm audit output
**Remediation:** npm update express

### [LOW] Unused Dependencies
**Packages:** debug, chalk
**Recommendation:** Remove unused deps
**Evidence:** Code search shows no imports
**Remediation:** npm uninstall debug chalk

## Recommendations

1. Update express to 4.19.0
2. Remove unused dependencies
3. Set up automated dependency scanning

## Next Audit

**Scheduled:** 2026-02-26
```

### Audit Log Storage

```
/wzrd.dev/audit/
├── reports/
│   ├── 2026-02-19-security.md
│   ├── 2026-02-19-compliance.md
│   └── 2026-02-12-security.md
├── changes.log
└── incidents/
    ├── 2026-02-15-secret-exposure.md
    └── 2026-01-20-downtime.md
```

---

## Incident Response

### When Audit Finds Issues

```yaml
critical_finding:
  action: "immediate_remediation"
  timeline: "within 1 hour"
  escalation: "notify_owner"

high_finding:
  action: "fix_today"
  timeline: "within 24 hours"
  escalation: "log_to_backlog"

medium_finding:
  action: "fix_this_week"
  timeline: "within 7 days"
  escalation: "track_in_project"

low_finding:
  action: "fix_when_convenient"
  timeline: "next_sprint"
  escalation: "optional"
```

### Incident Template

```markdown
# Incident: [Title]

**Date:** 2026-02-19
**Severity:** Critical
**Status:** Resolved

## Summary
[Brief description]

## Timeline
- 14:30 - Issue detected
- 14:35 - Investigation started
- 14:45 - Root cause identified
- 15:00 - Fix deployed
- 15:10 - Verification complete

## Root Cause
[What happened and why]

## Impact
[What was affected]

## Resolution
[How it was fixed]

## Prevention
[How to prevent recurrence]
```

---

## Automated Audits

### Cron Schedule

```yaml
audits:
  security_scan:
    schedule: "0 3 * * 1"  # Weekly, Monday 3 AM
    timeout: 300

  compliance_check:
    schedule: "0 4 1 * *"  # Monthly, 1st 3 AM
    timeout: 600

  dependency_audit:
    schedule: "0 5 * * *"  # Daily, 5 AM
    timeout: 60
```

### Alerting

```yaml
alerts:
  critical_finding:
    channel: "immediate_notification"
    recipients: ["owner"]

  high_finding:
    channel: "daily_digest"
    recipients: ["owner", "team"]

  medium_finding:
    channel: "weekly_report"
    recipients: ["owner"]

  low_finding:
    channel: "monthly_report"
    recipients: ["owner"]
```

---

## CLI Commands

```bash
# Run full audit
npx audit run --full

# Run specific audit type
npx audit run --type security
npx audit run --type compliance

# Show audit history
npx audit history --last 7

# Show open findings
npx audit findings --open

# Generate report
npx audit report --type security --output audit.md

# Check specific item
npx audit check secrets
npx audit check dependencies
npx audit check permissions
```

---

## Gold Standard Compliance

### Read-Back Verification
- After audit, read back report
- Verify findings are accurate
- Confirm remediation steps work

### Executable Proof
- Show scan results: `npx audit run`
- Show findings: `npx audit findings`
- Show remediation: Proof that fix works

### Loop Prevention
If audit fails repeatedly:
1. Investigate root cause
2. Fix underlying issue
3. Don't just suppress finding

---

## Audit Checklist

Before considering system "healthy":
- [ ] Security scan clean (0 vulnerabilities)
- [ ] No secrets exposed
- [ ] Permissions correct
- [ ] Dependencies up to date
- [ ] Gold Standard followed
- [ ] Learning loop active
- [ ] Memory healthy
- [ ] Backups verified
- [ ] Documentation current
- [ ] No critical findings

---

## Summary

**Audits catch issues before they become problems.**

```
                   ┌─────────────────┐
                   │   Trigger       │
                   │ (time/event)    │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   Run Audit    │
                   │ (checks)        │
                   └────────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
      ┌──────────┐    ┌──────────┐    ┌──────────┐
      │ Findings │    │ Report   │    │ Alerts   │
      └──────────┘    └──────────┘    └──────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                   ┌─────────────────┐
                   │  Remediate      │
                   │  (fix issues)   │
                   └─────────────────┘
```

---

**"Audit everything. Trust nothing. Verify everything."**
