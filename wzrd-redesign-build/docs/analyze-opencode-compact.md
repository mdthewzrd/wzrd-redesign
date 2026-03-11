# OpenCode `/compact` Command Analysis

## Current Understanding:

### 1. **Standard `/compact` Behavior**:
```
User types: /compact
→ OpenCode creates "compaction" part in messages
→ Generates summary of conversation  
→ Marks old messages as "compacted"
→ Adds "continue" message: "Continue if you have next steps..."
→ **BUT: Keeps all messages in prompt-history.jsonl**
→ **Result: TUI context grows indefinitely**
```

### 2. **The `/new` Command**:
```
User types: /new  
→ Creates fresh session
→ Clears prompt-history.jsonl (or starts new file)
→ **Result: True context reset**
```

### 3. **Key Discovery**: OpenCode has internal events:
- `session.compact` - The compaction event
- `session.new` - New session event  
- `tui.prompt.append` - Append text to prompt event

## The Real Problem:

**`/compact` doesn't call `/new`** - it just summarizes. The conversation stays in TUI memory, causing slowdown.

## Potential Solutions:

### **Solution A: Hook into `/compact` command**
Modify OpenCode to make `/compact`:
1. Run standard compaction
2. **THEN execute `/new`**
3. Inject continuation prompt

**Pros**: Clean, integrated
**Cons**: Requires OpenCode modification

### **Solution B: External Automation Script**
Create script that:
1. Monitors `prompt-history.jsonl` size
2. When threshold reached:
   - Save conversation to topic memory
   - Send `session.new` event via API
   - Inject continuation via `tui.prompt.append`

**Pros**: Works with current OpenCode
**Cons**: Complex, needs API access

### **Solution C: Enhanced `/wzrd-compact` Command**
Create OpenCode command that:
1. Returns special prompt with instructions
2. User confirms once
3. Script handles automation

**Pros**: User-friendly, less manual
**Cons**: Still requires some user action

## Technical Investigation Needed:

1. **Can we send events to OpenCode TUI?**
   ```javascript
   // Example: Send session.new event
   Bus.publish("tui.command.execute", { command: "session.new" })
   ```

2. **Can we append to prompt programmatically?**
   ```javascript
   Bus.publish("tui.prompt.append", { text: "continuation prompt" })
   ```

3. **Is there a REST API?**
   Looking at `src/server/routes/tui.ts` suggests HTTP API

## Immediate Test:

Let me check if we can interact with OpenCode API:

<｜DSML｜function_calls>
<｜DSML｜invoke name="bash">
<｜DSML｜parameter name="command" string="true">curl -s http://localhost:3000 2>&1 | head -5