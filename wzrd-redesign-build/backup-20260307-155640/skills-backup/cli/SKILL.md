---
name: cli
description: Command line operations, Bash scripting, and terminal workflows
category: tools
priority: P1
tags: [cli, bash, shell, automation, terminal]
subskills:
  - shell-basics
  - bash-scripting
  - process-management
  - text-processing
---

# CLI Skill

## Purpose
Navigate and control systems using command line efficiently.

## Core Principle
**"The CLI is faster and more powerful than any GUI. Master it."**

## Shell Basics

### Navigation

```bash
# Current directory
pwd

# List files
ls
ls -la              # Detailed, hidden files
ls -lh              # Human readable sizes

# Change directory
cd /path/to/dir
cd ~                 # Home directory
cd -                # Previous directory

# Create directory
mkdir -p path/to/dir  # -p creates parents

# Remove
rm file.txt
rm -rf directory     # Recursive, force (dangerous!)
```

### File Operations

```bash
# Copy
cp file.txt file.backup

# Move/rename
mv old.txt new.txt

# View file
cat file.txt
less file.txt       # Scrollable
head -n 10 file.txt  # First 10 lines
tail -n 10 file.txt  # Last 10 lines
tail -f file.txt     # Follow (live updates)

# Edit files
nano file.txt
vim file.txt
```

## Bash Scripting

### Shebang & Permissions

```bash
#!/bin/bash
# ^^^ Shebang - tells system how to run script

echo "Hello, World!"

# Make executable
chmod +x script.sh
./script.sh
```

### Variables

```bash
# Define variable
NAME="World"

# Use variable
echo "Hello, $NAME!"

# Environment variables
export PATH=$PATH:/new/path

# Command substitution
FILES=$(ls | wc -l)
echo "Found $FILES files"

# Command arguments
echo "First arg: $1"
echo "All args: $@"
```

### Conditionals

```bash
if [ "$1" == "start" ]; then
  echo "Starting..."
elif [ "$1" == "stop" ]; then
  echo "Stopping..."
else
  echo "Usage: $0 {start|stop}"
  exit 1
fi
```

### Loops

```bash
# For loop
for file in *.txt; do
  echo "Processing: $file"
done

# While loop
count=0
while [ $count -lt 10 ]; do
  echo "Count: $count"
  ((count++))
done
```

### Functions

```bash
greet() {
  echo "Hello, $1!"
}

# Call function
greet "World"
```

## Process Management

### Viewing Processes

```bash
# List all processes
ps aux

# Filter processes
ps aux | grep node

# Interactive process viewer
htop
top

# Process tree
pstree
```

### Control Processes

```bash
# Kill process by PID
kill 1234

# Kill by name
pkill node

# Force kill
kill -9 1234
```

### Background Processes

```bash
# Run in background
sleep 60 &

# Bring to foreground
fg

# List background jobs
jobs

# Background specific job
sleep 100 &       # Job 1
sleep 200 &       # Job 2
fg %1             # Bring job 1 to foreground
```

## Text Processing

### Grep

```bash
# Search pattern in file
grep "pattern" file.txt

# Recursive search
grep -r "pattern" .

# Case insensitive
grep -i "pattern" file.txt

# Invert match (show lines without pattern)
grep -v "comment" file.txt

# Show line numbers
grep -n "pattern" file.txt

# Show only filenames
grep -l "pattern" -r .

# Extended regex
grep -E "error|warning" file.log
```

### Sed (Stream Editor)

```bash
# Replace text
sed 's/old/new/g' file.txt

# Delete lines
sed '/pattern/d' file.txt

# Print specific lines
sed -n '10,20p' file.txt

# In-place edit
sed -i 's/old/new/g' file.txt
```

### Awk

```bash
# Print specific column
awk '{print $1}' file.txt

# Filter rows
awk '$3 > 100' file.txt

# Sum column
awk '{sum += $1} END {print sum}' file.txt
```

## Pipelines

### Chaining Commands

```bash
# Find large files
find . -type f -size +100M | du -sh

# Count file types
find . -type f -name "*.py" | wc -l

# Find and process
find . -name "*.log" -exec gzip {} \;

# Complex pipeline
cat file.txt | grep "error" | awk '{print $3}' | sort | uniq -c
```

## Input/Output Redirection

```bash
# Redirect output to file
echo "Hello" > file.txt

# Append to file
echo "World" >> file.txt

# Redirect error
command 2> error.log

# Redirect both
command > output.log 2>&1

# Read from file
command < input.txt

# Pipe chain
cat input.txt | grep "pattern" | wc -l > count.txt
```

## SSH & Remote

### SSH Connection

```bash
# Basic SSH
ssh user@host

# SSH with command
ssh user@host "ls -la"

# SSH with key
ssh -i ~/.ssh/key.pem user@host

# SSH tunnel
ssh -L 8080:localhost:80 user@host
```

### SCP (Secure Copy)

```bash
# Copy to remote
scp file.txt user@host:/path/

# Copy from remote
scp user@host:/path/file.txt .

# Copy directory
scp -r directory/ user@host:/path/
```

## System Monitoring

### System Resources

```bash
# Disk usage
du -sh *
df -h

# Memory
free -h

# CPU
top -bn 1 | head -20

# System info
uname -a
```

### Logs

```bash
# View system log
tail -f /var/log/syslog

# View auth log
sudo tail -f /var/log/auth.log

# Journalctl (systemd)
sudo journalctl -f
sudo journalctl -u nginx
```

## Automation

### Cron Jobs

```bash
# Edit crontab
crontab -e

# Crontab format
# * * * * * * command
# │ │ │ │ │
# │ │ │ │ └─ Day of week (0-7, 0 = Sunday)
# │ │ │ └───── Month (1-12)
# │ │ └──────── Day of month (1-31)
# │ └─────────── Hour (0-23)
# └──────────────── Minute (0-59)

# Examples
0 0 * * * /path/to/script.sh           # Daily at midnight
*/15 * * * * /path/to/check.sh          # Every 15 minutes
0 */2 * * * npm run backup             # Every 2 hours
```

### Watch

```bash
# Watch command output
watch -n 1 'ls -la'

# Watch process
watch -n 1 'ps aux | grep node'

# Watch disk space
watch -n 60 'df -h'
```

## Power Tools

### Find

```bash
# Find files by name
find . -name "*.log"

# Find by size
find . -size +100M

# Find by modification time
find . -mtime -7              # Modified in last 7 days
find . -mtime +30 -delete      # Delete files older than 30 days

# Find and execute
find . -name "*.tmp" -delete
find . -type f -exec chmod 644 {} \;
```

### Xargs

```bash
# Run command on each file
find . -name "*.log" | xargs gzip

# Parallel processing
find . -name "*.py" | xargs -P 4 python -m py_compile

# Limit items
ls | xargs -n 1 head
```

### Parallel (GNU Parallel)

```bash
# Run on 4 cores in parallel
find . -name "*.py" | parallel -j 4 python -m py_compile {}

# Run on all CPU cores
find . -name "*.sh" | parallel -j 0 bash -n {}
```

## Role-Shifting

When shifting **to** CLI mode:
```
"Switching to terminal mode..."
→ Use Bash commands
→ Chain with pipes
→ Automate with scripts
```

## Gold Standard Integration

### Read-Back Verification
- Verify script runs successfully
- Check that output is correct
- Confirm files were created/modified

### Executable Proof
- Show script output
- Demonstrate command results
- Test in fresh shell

---

**"The CLI is where experts work. GUIs are for tourists."**
