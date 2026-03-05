---
name: automation
description: Task automation, cron jobs, scheduled tasks, and workflow automation
category: automation
priority: P1
tags: [automation, cron, scheduling, workflows]
subskills:
  - cron-jobs
  - scheduled-tasks
  - workflow-automation
  - task-triggers
---

# Automation Skill

## Purpose
Automate repetitive tasks, schedule jobs, and build workflow systems that run without manual intervention.

## Core Principle
**"If you do it more than once, automate it. If it's still manual, you're not done."**

## Automation Types

### 1. Cron Jobs (Linux/Unix)
Schedule tasks to run at specific times or intervals.

```bash
# Cron format: * * * * * command
# │ │ │ │ │
# │ │ │ │ └─ Day of week (0-7, Sunday = 0 or 7)
# │ │ │ └─── Month (1-12)
# │ │ └───── Day of month (1-31)
# │ └─────── Hour (0-23)
# └───────── Minute (0-59)

# Examples
0 0 * * * /path/to/backup.sh              # Daily at midnight
0 */6 * * * /path/to/check.sh             # Every 6 hours
0 2 * * 0 /path/to/weekly-cleanup.sh      # Weekly (Sunday) at 2 AM
*/15 * * * * /path/to/monitor.sh          # Every 15 minutes
@reboot /path/to/startup.sh               # Run on system boot
```

### 2. Scheduled Tasks (Windows)
```powershell
# Create a scheduled task
schtasks /create /tn "MyTask" /tr "C:\scripts\task.ps1" /sc daily /st 09:00

# List all tasks
schtasks /query /fo LIST

# Delete a task
schtasks /delete /tn "MyTask" /f
```

### 3. GitHub Actions (CI/CD)
```yaml
name: Automated Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint
```

### 4. Python Schedule
```python
import schedule
import time

def job():
    print("Running scheduled task...")

# Schedule jobs
schedule.every(10).minutes.do(job)
schedule.every().hour.do(job)
schedule.every().day.at("09:00").do(job)
schedule.every().monday.do(job)
schedule.every().wednesday.at("13:15").do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
```

### 5. Node.js with node-cron
```typescript
import cron from 'node-cron';

// Run every minute
cron.schedule('* * * * *', () => {
  console.log('Running every minute');
});

// Run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running daily backup');
  backupDatabase();
});

// Run every Monday at 8 AM
cron.schedule('0 8 * * 1', () => {
  console.log('Weekly report generation');
  generateReport();
});
```

## Common Automation Use Cases

### Backup Automation
```bash
#!/bin/bash
# backup.sh - Daily database backup

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="myapp"

# Create backup
pg_dump $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Log Rotation
```bash
#!/bin/bash
# rotate-logs.sh - Rotate and compress logs

LOG_DIR="/var/log/myapp"
MAX_AGE_DAYS=30

# Compress logs older than 1 day
find $LOG_DIR -name "*.log" -mtime +1 -exec gzip {} \;

# Delete logs older than MAX_AGE_DAYS
find $LOG_DIR -name "*.gz" -mtime +$MAX_AGE_DAYS -delete

echo "Log rotation completed"
```

### Health Check Automation
```typescript
// health-check.ts - Automated service health checks
import https from 'https';

const services = [
  { name: 'API', url: 'https://api.example.com/health' },
  { name: 'Web', url: 'https://example.com/health' },
  { name: 'Auth', url: 'https://auth.example.com/health' }
];

async function checkService(service: typeof services[0]) {
  return new Promise((resolve) => {
    https.get(service.url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${service.name}: Healthy`);
        resolve(true);
      } else {
        console.log(`❌ ${service.name}: Unhealthy (${res.statusCode})`);
        resolve(false);
      }
    }).on('error', () => {
      console.log(`❌ ${service.name}: Connection failed`);
      resolve(false);
    });
  });
}

async function runHealthChecks() {
  console.log(`Running health checks at ${new Date().toISOString()}`);
  for (const service of services) {
    await checkService(service);
  }
}

// Run every 5 minutes
setInterval(runHealthChecks, 5 * 60 * 1000);
runHealthChecks();
```

### Email Notifications
```python
#!/usr/bin/env python3
# notify.py - Send email notifications on events

import smtplib
from email.message import EmailMessage
from datetime import datetime

def send_notification(subject, body):
    msg = EmailMessage()
    msg['Subject'] = f'[Automated Alert] {subject}'
    msg['From'] = 'automation@example.com'
    msg['To'] = 'admin@example.com'
    msg.set_content(body)

    with smtplib.SMTP('smtp.example.com', 587) as s:
        s.starttls()
        s.login('user', 'pass')
        s.send_message(msg)

# Example: Disk space alert
import shutil
def check_disk_space():
    usage = shutil.disk_usage('/')
    percent_used = (usage.used / usage.total) * 100

    if percent_used > 90:
        send_notification(
            'Disk Space Critical',
            f'Disk usage is at {percent_used:.1f}%\n'
            f'Free: {usage.free / (1024**3):.1f} GB\n'
            f'Time: {datetime.now()}'
        )

check_disk_space()
```

## Workflow Automation

### Git Workflow Automation
```bash
#!/bin/bash
# git-deploy.sh - Automated deployment workflow

#!/bin/bash
BRANCH=$1

if [ -z "$BRANCH" ]; then
  echo "Usage: $0 <branch>"
  exit 1
fi

# Checkout branch
git checkout $BRANCH
git pull origin $BRANCH

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Aborting deployment."
  exit 1
fi

# Build
npm run build

# Deploy
rsync -avz --delete dist/ server:/var/www/app/

# Notify
echo "Deployed $BRANCH to production" | slack-notify
```

### Database Migration Automation
```python
#!/usr/bin/env python3
# migrate.py - Automated database migrations

import subprocess
import sys

def run_command(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr.decode()}")
        sys.exit(1)
    return result.stdout.decode()

# Backup before migration
print("Creating database backup...")
backup_name = run_command("pg_dump mydb | gzip > backup.sql.gz")

# Run migrations
print("Running migrations...")
run_command("alembic upgrade head")

# Verify migration
print("Verifying schema...")
run_command("alembic check")

print("Migration completed successfully!")
```

## Task Triggers

### File Watcher (Node.js)
```typescript
import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Watch for file changes
const watcher = chokidar.watch('./src', {
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', async (path) => {
    console.log(`File ${path} has been added`);
    await runTests();
  })
  .on('change', async (path) => {
    console.log(`File ${path} has been changed`);
    await runTests();
  })
  .on('unlink', (path) => {
    console.log(`File ${path} has been removed`);
  });

async function runTests() {
  try {
    const { stdout } = await execAsync('npm test');
    console.log('Tests passed:', stdout);
  } catch (error) {
    console.error('Tests failed:', error.stderr);
  }
}

console.log('Watching for file changes...');
```

### Webhook Triggers
```python
# webhook-server.py - Respond to webhooks
from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json

    if data.get('ref') == 'refs/heads/main':
        print("Push to main detected - deploying...")
        try:
            # Pull latest changes
            subprocess.run(['git', 'pull'], check=True)
            # Restart service
            subprocess.run(['systemctl', 'restart', 'myapp'], check=True)
            return jsonify({'status': 'deployed'}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

    return jsonify({'status': 'ignored'}), 200

if __name__ == '__main__':
    app.run(port=5678)
```

## Automation Best Practices

### 1. Logging
```bash
# Always log automation output
#!/bin/bash
LOG_FILE="/var/log/automation.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

log "Starting backup task..."
# ... task ...
log "Backup completed"
```

### 2. Error Handling
```python
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    risky_operation()
except Exception as e:
    logger.error(f"Task failed: {e}")
    send_alert(f"Automation failed: {e}")
    sys.exit(1)
```

### 3. Idempotency
```bash
# Make scripts idempotent - safe to run multiple times
#!/bin/bash

# Check if already done
if [ -f "/var/run/task-completed" ]; then
  echo "Task already completed, skipping"
  exit 0
fi

# Run task
perform_task

# Mark as done
touch /var/run/task-completed
```

### 4. Lock Files
```bash
# Prevent overlapping executions
LOCK_FILE="/tmp/my-task.lock"

if [ -f "$LOCK_FILE" ]; then
  echo "Task is already running"
  exit 1
fi

touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# Task here
```

## Gold Standard Integration

### Read-Back Verification
After creating automation scripts:
```bash
# Write script
cat > /usr/local/bin/backup.sh << 'EOF'
#!/bin/bash
# backup script
EOF

# Verify
cat /usr/local/bin/backup.sh
chmod +x /usr/local/bin/backup.sh

# Test
/usr/local/bin/backup.sh
echo "✅ Automation script created and tested"
```

### Executable Proof
- Show cron entry exists: `crontab -l | grep backup`
- Run script manually to verify: `/path/to/script.sh`
- Check logs: `tail -f /var/log/automation.log`

---

**"Automation is the art of making yourself obsolete. Do it well."**
