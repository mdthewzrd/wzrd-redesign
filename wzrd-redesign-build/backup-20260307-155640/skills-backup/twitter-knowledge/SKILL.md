---
name: twitter-knowledge
description: Extract knowledge and insights from Twitter/X tweets
category: research
priority: P1
tags: [twitter, x, grok, knowledge-extraction, social-intelligence, learning]
subskills:
  - tweet-fetch
  - knowledge-extract
  - memory-integrate
---

# Twitter Knowledge Skill

## Purpose
Fetch tweets from Twitter/X, analyze them for knowledge and insights, and integrate valuable information into the WZRD.dev ecosystem memory.

## Core Principle
**"Every tweet has potential signal. Filter, extract, remember."**

---

## Architecture

### Data Source Priority Order

1. **Grok API** (x.ai) - Native X integration, preferred
2. **Twitter API v2** - Official fallback, higher costs
3. **RSS/Feeds** - For public user timelines
4. **Manual Input** - User provides tweets directly

```
┌─────────────┐
│   Trigger   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│        Tweet Fetch Strategy         │
│  ┌──────────┐  ┌─────────────────┐  │
│  │  Grok    │→ │ Twitter API v2  │  │
│  │  API     │  │   (fallback)    │  │
│  └──────────┘  └─────────────────┘  │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│     Knowledge Extraction Layer       │
│  • Identify key insights             │
│  • Extract patterns/trends           │
│  • Link to existing knowledge       │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│     WZRD.dev Memory Integration      │
│  • Update MEMORY.md                  │
│  • Create topic-specific .md files   │
│  • Link related concepts             │
└──────────────────────────────────────┘
```

---

## API Endpoints (To Be Verified)

### Grok API (x.ai)
```bash
# Base URL
https://api.x.ai/v1

# Endpoints (subject to verification)
GET  /tweets/:id              # Get tweet by ID
GET  /users/:username/tweets  # Get user timeline
GET  /search/tweets           # Search tweets
POST /chat/completions        # Grok analysis
```

### Twitter API v2
```bash
# Base URL
https://api.twitter.com/2

# Endpoints
GET  /tweets/:id                      # Get tweet
GET  /users/:id/tweets                # Get user tweets
GET  /tweets/search/recent            # Search tweets
POST  /tweets/search/stream/rules     # Stream filtering
```

---

## Triggers

- `/twitter <handle>` - Extract knowledge from specific user
- `/twitter <url>` - Extract knowledge from specific tweet
- `/twitter search <query>` - Search and extract knowledge
- "learn from these tweets", "extract insights from twitter"

---

## Behavior

### 1. Tweet Fetch Phase

**Source Selection:**
```python
def fetch_tweets(source, params):
    # Try Grok API first (native X access)
    if has_grok_credentials():
        result = grok_api_fetch(source, params)
        if result.success:
            return result

    # Fallback to Twitter API v2
    if has_twitter_credentials():
        result = twitter_api_fetch(source, params)
        if result.success:
            return result

    # Manual input as last resort
    return request_manual_input()
```

**Fetch Types:**
- `handle` → Get user's recent tweets
- `url` → Fetch specific tweet and thread
- `search` → Search by hashtag/keyword

### 2. Knowledge Extraction Phase

**Extraction Categories:**

| Category | What to Extract | Memory Location |
|----------|-----------------|-----------------|
| **Technical Insights** | Code patterns, tips, tutorials | `technical-insights.md` |
| **Market Intelligence** | Trends, news, sentiment | `market-intel.md` |
| **Connections** | People, projects, resources | `network.md` |
| **Signals** | Early indicators, predictions | `signals.md` |
| **Discussions** | Threads, debates, consensus | `discussions.md` |

**Analysis Process:**
1. **Classify** - Categorize tweet content
2. **Extract** - Pull key entities, concepts, links
3. **Validate** - Check credibility, recency
4. **Link** - Connect to existing knowledge
5. **Summarize** - Create digestible insights

### 3. Memory Integration Phase

**Memory Update Strategy:**
```markdown
## [Category]

### [Date] - [Topic]
**Source**: @username (twitter.com/user/status/123)

**Key Insight**:
[Extracted knowledge]

**Related**:
- [[link-to-existing-memory]]
- [[another-concept]]

**Signals**:
- [ ] Actionable
- [ ] Requires verification
- [ ] Time-sensitive
```

---

## Commands

### `/twitter <handle>`
Fetch recent tweets from user and extract knowledge.

```
User: /twitter @gdb
Me: Fetching tweets from @gdb...

[Analysis]
Found 50 tweets. Key insights:

1. **Rust Async Pattern** (twitter.com/gdb/status/123)
   - Uses `async fn` with `tokio::spawn`
   - Related: [[rust-patterns.md]]

2. **LLM Optimization Tip** (twitter.com/gdb/status/456)
   - Cache embeddings, not just vectors
   - Related: [[llm-optimization.md]]

Memory updated: technical-insights.md (+2 insights)
```

### `/twitter <url>`
Analyze specific tweet/thread.

```
User: /twitter https://twitter.com/user/status/123
Me: [Analyzes thread]

**Thread Summary**: 12 tweets about distributed systems

**Extracted Knowledge**:
- CAP theorem nuances in edge cases
- New consensus algorithm mentioned
- 3 related papers linked

Updated: distributed-systems.md
```

### `/twitter search <query>`
Search and learn from tweets.

```
User: /twitter search #rustlang memory safety
Me: [Searches and analyzes]

Found 200+ tweets. Top insights:

1. **Arena Allocators in Rust** - gaining adoption
2. **New Borrow Checker RFC** - vote coming
3. **Memory Safety Paper** - linked in thread

Updated: rust-trends.md, technical-insights.md
```

---

## Credential Management

### Required Environment Variables

```bash
# Grok API (Primary)
export GROK_API_KEY="sk-..."
export GROK_API_BASE="https://api.x.ai/v1"

# Twitter API v2 (Fallback)
export TWITTER_BEARER_TOKEN="AAAAAAAA..."
export TWITTER_API_KEY="..."
export TWITTER_API_SECRET="..."
export TWITTER_ACCESS_TOKEN="..."
export TWITTER_ACCESS_SECRET="..."

# Optional: Twitter OAuth 2.0 (for user context)
export TWITTER_CLIENT_ID="..."
export TWITTER_CLIENT_SECRET="..."
```

### Credential Check
```python
def check_credentials():
    """Verify available API access"""
    creds = {
        "grok": bool(os.getenv("GROK_API_KEY")),
        "twitter_v2": bool(os.getenv("TWITTER_BEARER_TOKEN"))
    }
    return creds
```

---

## Knowledge Templates

### Technical Insight Template
```markdown
### [YYYY-MM-DD] - [Brief Title]

**Source**: [@username](https://twitter.com/username/status/123456)

**Insight**:
[One sentence summary of the technical insight]

**Details**:
- Key point 1
- Key point 2
- Code example or pattern mentioned

**Tags**: #tag1 #tag2

**Related**:
- [[existing-memory-file]]
- [[related-concept]]

**Action Items**:
- [ ] Research mentioned library
- [ ] Test described pattern
- [ ] Follow author for more
```

### Market Signal Template
```markdown
### [YYYY-MM-DD] - [Signal Type]

**Source**: [@username](https://twitter.com/username/status/123456)

**Signal**: [Bullish/Bearish/Neutral]

**Context**:
[What market/sector/topic is being discussed]

**Key Points**:
- Data point mentioned
- Trend identified
- Source credibility

**Confidence**: [Low/Medium/High]

**Related**:
- [[market-intel.md]]
- [[specific-stock-or-sector]]
```

---

## Gold Standard Integration

### Read-Back Verification
- After memory update, read back the file to verify
- Confirm tweet URLs are preserved
- Check that related links are valid

### Executable Proof
- Show fetched tweet content
- Display extracted knowledge
- Demonstrate memory file was updated

### Loop Prevention
Max 3 attempts per:
- API fetch failure
- Extraction ambiguity
- Memory write error

---

## Examples

### Example 1: Single Tweet Analysis
```
User: /twitter https://twitter.com/anthropic/status/123456

Me: Fetching tweet...

**Tweet**: @anthropic
"New technique for context window optimization:
use compression on rarely-accessed tokens. Gains 40%."

**Analysis**:
- Category: Technical Insight
- Confidence: High (official source)
- Actionable: Yes

**Memory Updated**:
File: llm-optimization.md
+ Added: Context compression technique
+ Linked: [[llm-patterns.md]]
```

### Example 2: User Timeline
```
User: /twitter @verlor

Me: Fetching @verlor timeline...

**Fetched**: 50 tweets (last 7 days)

**Insights Extracted**:
1. New Rust async pattern (5 tweets)
2. AI safety paper discussion (12 tweets)
3. Web framework comparison (8 tweets)

**Memory Updates**:
- rust-patterns.md (+3 insights)
- ai-safety.md (+1 paper link)
- web-frameworks.md (+2 comparisons)

**New Signals**:
- @verlor working on new async runtime
- Growing consensus on AI safety approach
```

### Example 3: Search and Learn
```
User: /twitter search "system design" rate limiting

Me: Searching tweets...

**Found**: 150+ tweets

**Top Insights**:
1. **Token bucket vs. Leaky bucket** - trend toward token bucket
2. **Redis rate limiting** - @antsmartian warned about race conditions
3. **Edge rate limiting** - @cloudflare blog mentioned new approach

**Memory Updated**:
- system-design.md (+3 patterns)
- signals.md (rate limiting trend)

**New Connections**:
- [[distributed-systems.md]] - related consensus patterns
- [[scalability.md]] - mentioned CADDY implementation
```

---

## Checklist

Before considering knowledge extraction complete:
- [ ] Tweets fetched successfully
- [ ] Content categorized correctly
- [ ] Key insights extracted
- [ ] Sources preserved (URLs, @handles)
- [ ] Memory updated with links
- [ ] Related knowledge connected
- [ ] Action items identified
- [ ] File read back for verification

---

## Next Steps

### Phase 1: API Access
1. Get Grok API credentials
2. Document exact endpoints
3. Test basic fetch operations

### Phase 2: Extraction Logic
1. Build tweet categorization
2. Implement entity extraction
3. Create knowledge templates

### Phase 3: Memory Integration
1. Design memory file structure
2. Implement update logic
3. Add related-link discovery

### Phase 4: Feedback Loop
1. Track learning progress
2. Identify high-value sources
3. Refine extraction prompts

---

**"The timeline is a firehose. We catch the drops that matter."**
