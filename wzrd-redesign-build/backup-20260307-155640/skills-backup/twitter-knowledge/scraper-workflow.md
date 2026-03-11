# Twitter Learning Workflow

## How It Works

1. **User provides a Twitter/X URL**
2. **I scrape the content** using web_reader MCP
3. **Extract knowledge** into categories:
   - Technical Insights → `technical-insights.md`
   - Market Intelligence → `market-intel.md`
   - Network/Resources → `network.md`
   - Signals → `signals.md`
   - Discussions → `discussions.md`
4. **Recommend implementations** based on findings

---

## Usage

```
You: Learn from this tweet: https://x.com/username/status/123456789

Me: [Scrapes] → [Analyzes] → [Stores] → [Recommends]
```

---

## Example Output Structure

### Extracted Knowledge
| Category | Findings |
|----------|----------|
| Technical | New patterns, tools, techniques |
| Market | Trends, news, sentiment |
| Network | People, projects, resources |
| Signals | Early indicators, predictions |

### Recommendations
- Skills to build
- Code to implement
- Resources to follow

---

## Memory File Locations

```
~/.claude/projects/-home-mdwzrd/memory/twitter-knowledge/
├── technical-insights.md
├── market-intel.md
├── network.md
├── signals.md
├── discussions.md
```
