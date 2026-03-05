---
name: mcp
description: Model Context Protocol - connecting Claude to external tools and data
category: integration
priority: P1
tags: [mcp, integration, tools, external-systems]
subskills:
  - mcp-basics
  - mcp-servers
  - mcp-configuration
  - custom-mcp
---

# MCP Skill

## Purpose
Connect Claude to external tools, databases, and APIs using Model Context Protocol.

## Core Principle
**"MCPs extend Claude's capabilities. They're like plugins for AI."**

## CRITICAL: MCP Rate Limiting (NON-NEGOTIABLE)

**STOP**: Before ANY MCP tool call that makes external requests (search, API calls, etc.), you MUST respect rate limits.

### Hard Limits for External MCP Tools

| Time Window | Max External Calls | Action When Reached |
|-------------|-------------------|---------------------|
| Per Task | 5 external calls | Stop, consolidate results |
| Per 60 Seconds | 3 external calls | Wait 30s, then continue |
| Per 5 Minutes | 10 external calls | Must stop, escalate to user |
| Per Session | 20 external calls | Critical - requires approval |

**External MCP Tools Include:**
- Brave Search MCP (`brave_web_search`)
- GitHub MCP (API calls to GitHub)
- Slack MCP (external API)
- Any MCP that makes HTTP requests

**Local MCP Tools (No Limits):**
- Filesystem MCP (local file access)
- Postgres MCP (local database)
- Custom MCPs running locally

### MCP Optimization

Before making external MCP calls:

1. **Is this call necessary?**
   - Check memory/context first
   - Use local tools when possible
   - Cache results for reuse

2. **Can I combine calls?**
   - Batch similar operations
   - Use query filters instead of multiple calls

3. **Am I in a loop?**
   - Similar calls = consolidate
   - 3+ similar requests = pivot strategy

**Violating MCP rate limits is a critical system error.**

## What is MCP?

Model Context Protocol (MCP) is an open standard that allows AI assistants to:
- Connect to external data sources
- Use tools and capabilities
- Execute code in controlled environments
- Access real-time information

**Think of MCPs like browser extensions for Claude.**

## Common MCP Servers

### Filesystem MCP
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed"]
    }
  }
}
```

**Provides:** File read/write, directory operations

### GitHub MCP
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

**Provides:** Repository search, issue/PR access, file browsing

### Brave Search MCP
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"]
    }
  }
}
```

**Provides:** Web search capabilities

### Postgres MCP
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://..."]
    }
  }
}
```

**Provides:** Database queries, schema inspection

## MCP Configuration

### Claude Desktop Settings

```json
// ~/.claude/settings.json (macOS)
// %APPDATA%/Claude/settings.json (Windows)
{
  "mcpServers": {
    "server-name": {
      "command": "command-name",
      "args": ["--arg1", "--arg2"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

### Environment Variables

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost/db"
      }
    }
  }
}
```

## Finding MCP Servers

### Official MCP Servers

```
# Browse all official servers
https://github.com/modelcontextprotocol/servers

# Popular servers:
- @modelcontextprotocol/server-filesystem
- @modelcontextprotocol/server-github
- @modelcontextprotocol/server-brave-search
- @modelcontextprotocol/server-postgres
- @modelcontextprotocol/server-puppeteer
```

### Community Servers

```bash
# Search GitHub
topic:mcp-server stars:>10

# Browse MCP tag
https://github.com/topics/mcp-server
```

## Using MCPs

### File Operations

```
1. Load filesystem MCP
2. Use tools:
   - read_file(path)
   - write_file(path, content)
   - list_directory(path)
   - create_directory(path)
```

### Database Queries

```
1. Load postgres MCP
2. Use tools:
   - query(sql) - Execute SQL
   - list_tables() - Show tables
   - describe_table(table) - Show schema
```

### GitHub Integration

```
1. Load github MCP
2. Use tools:
   - search_repositories(query)
   - get_file_contents(owner, repo, path)
   - create_issue(owner, repo, title, body)
   - search_code(query)
```

## Custom MCP Servers

### Simple MCP Server (Python)

```python
#!/usr/bin/env python3
import mcp
from mcp.server.stdio import stdio_server

@mcp.tool("calculate")
def calculate(expression: str) -> str:
    """Calculate a math expression"""
    try:
        result = eval(expression)
        return str(result)
    except:
        return "Error"

@mcp.tool("get_time")
def get_time() -> str:
    """Get current time"""
    from datetime import datetime
    return datetime.now().isoformat()

if __name__ == "__main__":
    stdio_server.run()
```

**Configure:**
```json
{
  "mcpServers": {
    "my-tools": {
      "command": "python3",
      "args": ["/path/to/server.py"]
    }
  }
}
```

## MCP Tools

### What MCP Tools Provide

| MCP | Tools Available |
|-----|-----------------|
| Filesystem | read_file, write_file, list_directory, create_directory |
| GitHub | search_repos, get_file, create_issue, search_code |
| Brave | brave_web_search |
| Postgres | query, list_tables, describe_table |
| Puppeteer | navigate_to_page, screenshot, click |
| Slack | list_channels, send_message, get_history |

## Troubleshooting MCPs

### MCP Not Loading

```
1. Check settings.json syntax
2. Verify command path is correct
3. Check npx is installed
4. Review MCP server logs
5. Test MCP server manually
```

### Testing MCP Server

```bash
# Test filesystem MCP
npx -y @modelcontextprotocol/server-filesystem /tmp

# Test with Claude Desktop
# Restart Claude Desktop after configuration
```

## Best Practices

### Security

```
❌ DON'T expose:
- Entire filesystem (/)
- Production database credentials
- Secret keys

✅ DO:
- Limit to specific directories
- Use read-only when possible
- Use environment variables for secrets
```

### Performance

```
- Use stdio servers (faster than HTTP)
- Limit server output size
- Cache when appropriate
- Close connections when done
```

## Role-Shifting

When shifting **to** MCP mode:
```
"Using MCP integration..."
→ Check available MCPs
→ Select appropriate MCP server
→ Use provided tools
→ Handle responses
```

## Gold Standard Integration

### Read-Back Verification
- Verify MCP configuration is valid
- Confirm tools work as expected
- Check that MCP server is running

### Executable Proof
- Show MCP tool output
- Demonstrate file/database operations
- Verify tool availability

---

**"MCPs multiply Claude's capabilities. Use them wisely."**
