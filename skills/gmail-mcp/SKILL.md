---
name: gmail-mcp
description: Google Workspace & Gmail MCP server integration for daily executive action digests and newly captured email leads dispatch.
---

# Gmail MCP Skill

## Capabilities
- Authenticate via Google OAuth credentials stored in `config/.session/`.
- Compose and transmit structured HTML digests.
- Enforce PeekLock and retry resiliency with Dead-Letter Queue fallback.

## Usage in Pipeline
The Spark Agent invokes `send_message`:
```json
{
  "tool": "send_message",
  "arguments": {
    "to": "user@example.com",
    "subject": "[Daily SEO & Lead Digest] Dual Shield Hemodialysis",
    "html": "..."
  }
}
```
Records success or transient failure in `spark_digests`.
