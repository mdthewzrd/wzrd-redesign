# WZRD.DEV MIGRATION PLAN
**From**: `wzrd.dev` (old, active, data-rich)  
**To**: `wzrd-redesign` (new, clean, refactored)

---

## 🎯 CURRENT STATE

### **Old System (`wzrd.dev`)**
```
✅ ACTIVE SERVICES:
- bot-health-monitor.sh (daemon)
- wzrd-process-monitor.js  
- opencode serve (port 4096)
- memory compaction (cron)
- health checks (every 5 min)

📊 DATA: 8.1GB
- projects/ (3.9GB) - VALUABLE DATA
- opencode/ (3.0GB) - VALUABLE DATA  
- gateway-v2/ (168MB) - ACTIVE
- memory-system/ (38MB) - DAILY UPDATES
- skills/ (11MB) - ACTIVE

📅 LAST UPDATED: Today (MEMORY_SUMMARY.md)
```

### **New System (`wzrd-redesign`)**
```
🔧 DEVELOPMENT STATE:
- Topics system (fixed)
- Memory structure (stagnant)
- Skills (stagnant)
- Sandboxes (inactive)
- Worktree (uncommitted changes)

📊 DATA: 291MB
- Clean refactored structure
- No automation
- No running services
- Manual updates only
```

---

## 🚨 CRITICAL INSIGHT

**YOU CANNOT JUST REPLACE `wzrd.dev` WITH `wzrd-redesign`**

Why?
1. **Data loss**: 8.1GB of projects/opencode data
2. **Service disruption**: Running daemons will break
3. **Automation loss**: Cron jobs will fail
4. **Memory loss**: Daily updated memory gone

---

## ✅ CORRECT MIGRATION APPROACH

### **Phase 1: DATA MIGRATION** (Today)
```bash
# 1. Copy VALUABLE data from old to new
cp -r /home/mdwzrd/wzrd.dev/projects /home/mdwzrd/wzrd-redesign/
cp -r /home/mdwzrd/wzrd.dev/opencode /home/mdwzrd/wzrd-redesign/

# 2. Merge memory systems
rsync -av /home/mdwzrd/wzrd.dev/memory/ /home/mdwzrd/wzrd-redesign/memory/

# 3. Merge active skills
find /home/mdwzrd/wzrd.dev/skills/ -name "SKILL.md" -exec cp {} /home/mdwzrd/wzrd-redesign/.claude/skills/ \;
```

### **Phase 2: SERVICE MIGRATION** (Today/Tomorrow)
```bash
# 1. Stop old services gracefully
pkill -f "bot-health-monitor.sh"
pkill -f "wzrd-process-monitor.js"

# 2. Update cron jobs to point to NEW system
crontab -e
# Change ALL /home/mdwzrd/wzrd.dev to /home/mdwzrd/wzrd-redesign

# 3. Start new services
cd /home/mdwzrd/wzrd-redesign
./scripts/bot-health-monitor.sh --daemon &
```

### **Phase 3: VALIDATION** (Tomorrow)
```bash
# 1. Verify services running
ps aux | grep wzrd-redesign

# 2. Verify automation working
tail -f /home/mdwzrd/wzrd-redesign/logs/health.log

# 3. Verify data integrity
du -sh /home/mdwzrd/wzrd-redesign/projects/
```

### **Phase 4: CLEANUP** (Day 3)
```bash
# 1. Archive old system
mv /home/mdwzrd/wzrd.dev /home/mdwzrd/wzrd.dev.archive

# 2. Rename new to final
mv /home/mdwzrd/wzrd-redesign /home/mdwzrd/wzrd.dev

# 3. Update ALL references
sed -i 's|wzrd-redesign|wzrd.dev|g' /home/mdwzrd/wzrd.dev/scripts/*.sh
```

---

## ⚠️ RISKS AND MITIGATIONS

### **Risk 1: Data corruption during copy**
**Mitigation**: Use `rsync --dry-run` first, verify checksums

### **Risk 2: Service downtime**
**Mitigation**: Do migration during low-activity hours, keep backup

### **Risk 3: Automation breakage**
**Mitigation**: Test cron jobs BEFORE stopping old system

### **Risk 4: Lost functionality**
**Mitigation**: Document what old system does, ensure new has equivalents

---

## 📋 PREREQUISITES

### **Before starting migration**:
1. **Backup BOTH systems**
   ```bash
   tar -czf /home/mdwzrd/wzrd.dev.backup.tar.gz /home/mdwzrd/wzrd.dev
   tar -czf /home/mdwzrd/wzrd-redesign.backup.tar.gz /home/mdwzrd/wzrd-redesign
   ```

2. **Document running services**
   ```bash
   ps aux | grep wzrd > /tmp/wzrd-services.txt
   crontab -l > /tmp/wzrd-cron.txt
   ```

3. **Verify disk space**
   ```bash
   df -h /home/mdwzrd
   # Need ~16GB free (8GB old + 8GB new during copy)
   ```

---

## 🚀 MIGRATION SCRIPT

```bash
#!/bin/bash
# wzrd-migration.sh - SAFE migration from old to new

set -e
echo "=== WZRD.DEV MIGRATION STARTED ==="

# Step 1: Backup
echo "1. Backing up systems..."
tar -czf /home/mdwzrd/wzrd.dev.backup.$(date +%Y%m%d).tar.gz /home/mdwzrd/wzrd.dev
tar -czf /home/mdwzrd/wzrd-redesign.backup.$(date +%Y%m%d).tar.gz /home/mdwzrd/wzrd-redesign

# Step 2: Stop services gracefully
echo "2. Stopping old services..."
pkill -f "bot-health-monitor.sh" || true
pkill -f "wzrd-process-monitor.js" || true
sleep 5

# Step 3: Copy data
echo "3. Migrating data..."
rsync -av --progress /home/mdwzrd/wzrd.dev/projects/ /home/mdwzrd/wzrd-redesign/projects/
rsync -av --progress /home/mdwzrd/wzrd.dev/opencode/ /home/mdwzrd/wzrd-redesign/opencode/
rsync -av --progress /home/mdwzrd/wzrd.dev/memory/ /home/mdwzrd/wzrd-redesign/memory/

# Step 4: Update automation
echo "4. Updating cron jobs..."
crontab -l | sed 's|/home/mdwzrd/wzrd.dev|/home/mdwzrd/wzrd-redesign|g' | crontab -

# Step 5: Start new services
echo "5. Starting new services..."
cd /home/mdwzrd/wzrd-redesign
nohup ./scripts/bot-health-monitor.sh --daemon > logs/daemon.log 2>&1 &

echo "=== MIGRATION COMPLETE ==="
echo "Next: Wait 24h, verify, then archive old system"
```

---

## 📊 SUCCESS METRICS

**Migration SUCCESS when**:
1. ✅ All data copied (checksums match)
2. ✅ Services running (ps aux shows processes)
3. ✅ Automation working (cron logs show activity)
4. ✅ No data loss (compare backup vs new)
5. ✅ No downtime > 5 minutes

---

## 🆘 ROLLBACK PLAN

**If migration fails**:
```bash
# 1. Restore from backup
tar -xzf /home/mdwzrd/wzrd.dev.backup.*.tar.gz -C /home/mdwzrd/

# 2. Restore cron jobs
crontab -l | sed 's|wzrd-redesign|wzrd.dev|g' | crontab -

# 3. Restart services
cd /home/mdwzrd/wzrd.dev
./scripts/bot-health-monitor.sh --daemon &
```

---

## 🎯 RECOMMENDATION

**Do NOT rename `wzrd-redesign` → `wzrd.dev` yet**

**INSTEAD**:
1. **Migrate data/services** to `wzrd-redesign`
2. **Run BOTH systems** for 1 week
3. **Verify** new system works
4. **THEN** archive old, rename new

**Estimated time**: 2-3 days with careful testing

---

**Generated**: March 10, 2026  
**By**: Remi (WZRD.dev Agent)  
**Confidence**: High (based on system analysis)