---
name: sqlite-mcp
description: Declarative SQLite state store tool binding with WAF SEC-02 parameterization, SEC-04 CanNotDelete triggers, and REL-06 connection pooling.
---

# SQLite MCP Skill

## Capabilities
- Query and mutate the centralized agent state store (`state/seo_hub.db`).
- Execute parameterized prepared statements with explicit 5000ms timeout bounds.
- Enforce resource locks preventing accidental deletion of leads and action items.

## Usage in Pipeline
Agents query and persist state:
```json
{
  "tool": "read_query",
  "arguments": {
    "query": "SELECT * FROM research_insights WHERE status = ? ORDER BY priority ASC LIMIT 5",
    "params": ["PENDING_GENERATION"]
  }
}
```
