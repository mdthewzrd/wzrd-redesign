# MIGRATION CHECKLIST
**Based on Dry-Run Results**  
**Status**: ✅ READY WITH MINOR TWEAKS

---

## ✅ CONFIRMED READY

1. **Disk space**: 802GB free (more than enough)
2. **Data sizes**: Accurate (projects 3.9GB, opencode 3.0GB)
3. **Backup strategy**: Works
4. **Service stopping**: Will work gracefully
5. **Cron update**: Path substitution works

---

## ⚠️ NEEDS ADJUSTMENT

### **1. opencode port check**
**Issue**: Script checks port 4096 but opencode not there
**Fix**: Remove port check, add generic opencode detection
```bash
# Replace port check with:
if pgrep -f "opencode" >/dev/null; then
    echo "⚠️ opencode processes running"
    # Ask user to stop
```

### **2. PM2 processes**
**Issue**: PM2 daemon running (manages multiple services)
**Fix**: Add PM2 handling
```bash
# Check for PM2
if command -v pm2 >/dev/null && pm2 list | grep -q "wzrd"; then
    echo "⚠️ PM2 manages wzrd services"
    pm2 stop wzrd
fi
```

### **3. Service discovery**
**Issue**: Only checks specific services
**Fix**: Generic wzrd service detection
```bash
# Find ALL wzrd-related processes
ps aux | grep -E "(wzrd|remi|opencode|gateway)" | grep -v grep
```

---

## 🚨 POTENTIAL ISSUES

### **1. Bot dependencies**
Old system might have:
- Environment variables
- Configuration files
- API keys in scripts

**Check**: `grep -r "DISCORD\|API\|KEY\|SECRET" "$OLD_DIR/"`

### **2. Data consistency**
Copying while services might be writing:
- Projects might be in use
- Memory might be updating

**Mitigation**: Stop services FIRST, copy SECOND

### **3. Path hardcoding**
Old scripts might hardcode `/home/mdwzrd/wzrd.dev`

**Check**: `grep -r "wzrd\.dev" "$OLD_DIR/scripts/"`

---

## 📋 FINAL MIGRATION STEPS

### **Step 0: PREPARATION** (5 min)
```bash
# 1. Document current state
ps aux | grep wzrd > current-services.txt
crontab -l > current-cron.txt

# 2. Check for hardcoded paths
grep -r "wzrd\.dev" /home/mdwzrd/wzrd.dev/scripts/ || echo "No hardcoded paths"

# 3. Stop non-critical services manually
pkill -f "wzrd-dashboard.js"
```

### **Step 1: BACKUP** (15-30 min)
```bash
# Run backup only
./wzrd-migration.sh --phase backup
```

### **Step 2: STOP SERVICES** (2 min)
```bash
# Stop services gracefully
./wzrd-migration.sh --phase stop
```

### **Step 3: COPY DATA** (30-60 min)
```bash
# Copy data only
./wzrd-migration.sh --phase copy
```

### **Step 4: UPDATE AUTOMATION** (5 min)
```bash
# Update cron only
./wzrd-migration.sh --phase cron
```

### **Step 5: START NEW** (2 min)
```bash
# Start new services
./wzrd-migration.sh --phase start
```

---

## 🎯 SUCCESS CRITERIA

**After migration, verify**:

1. **✅ Services running**:
   ```bash
   ps aux | grep wzrd-redesign
   ```

2. **✅ Data present**:
   ```bash
   ls -la /home/mdwzrd/wzrd-redesign/projects/ | head -5
   ls -la /home/mdwzrd/wzrd-redesign/opencode/ | head -5
   ```

3. **✅ Automation working**:
   ```bash
   crontab -l | grep wzrd-redesign
   ```

4. **✅ Logs clean**:
   ```bash
   tail -20 /home/mdwzrd/wzrd-redesign/logs/migration-*.log
   ```

5. **✅ Old system intact**:
   ```bash
   ls -la /home/mdwzrd/wzrd.dev/ | head -5
   ```

---

## ⏱️ TIME ESTIMATE

**Total**: 1-2 hours
- Backup: 15-30 min
- Stop services: 2 min  
- Copy data: 30-60 min (depends on disk speed)
- Update cron: 5 min
- Start services: 2 min
- Verification: 10 min

**Best time**: Low-activity period (evening/weekend)

---

## 🔄 ROLLBACK PLAN

**If something fails**:
1. **Restore cron** from backup
2. **Restart old services**
3. **Delete copied data** if corrupted

**Script**:
```bash
# Restore cron
crontab "$BACKUP_DIR/cron-backup-*.txt"

# Restart old services
cd /home/mdwzrd/wzrd.dev
nohup ./bot-health-monitor.sh --daemon &

# Remove migrated data (if needed)
rm -rf /home/mdwzrd/wzrd-redesign/projects/
rm -rf /home/mdwzrd/wzrd-redesign/opencode/
```

---

## 🚀 FINAL DECISION

**Migration is SAFE because**:
1. Old system stays intact (backup + no deletion)
2. Services stopped gracefully
3. Data verified after copy
4. Rollback possible

**Risks are MINIMAL**:
- Worst case: Restore from backup
- Data preserved in old system
- No permanent changes until verification

---

**Recommendation**: ✅ **PROCEED WITH MIGRATION**

**Next**: Update script with fixes, then run full migration.