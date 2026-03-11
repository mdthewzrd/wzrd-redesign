# Load From External Source

This skill directory exists as a placeholder/symlink target.

**Actual skill content loads from:**
```
/home/mdwzrd/wzrd-redesign/.claude/skills/gold-standard/SKILL.md
```

**Why this structure?**
- Maintains tool shed skill discovery
- Enables lazy loading via symlink/redirect
- Keeps skill count accurate (175 skills)
- Allows skills to exist in multiple locations

**To use this skill:**
The skill loader will automatically resolve to the actual skill location.

**For development:**
Update the actual skill at the source location, not here.