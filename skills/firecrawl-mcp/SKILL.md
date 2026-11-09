---
name: firecrawl-mcp
description: Execute web reconnaissance, competitor scraping, and keyword structure extraction via the official Firecrawl MCP server or Crawl4AI.
---

# Firecrawl MCP Skill

## Capabilities
- Extract clean Markdown and HTML AST from competitor websites.
- Identify missing H1-H3 headers, meta descriptions, and conversion hooks.
- Map external citation links and academic authority references.

## Usage in Pipeline
The Research Agent invokes `firecrawl_scrape` or `firecrawl_crawl` against competitor URLs or search terms:
```json
{
  "url": "https://competitor-dialysis.example.com/solutions",
  "formats": ["markdown", "extract"],
  "extract": {
    "schema": {
      "type": "object",
      "properties": {
        "hero_headline": { "type": "string" },
        "value_propositions": { "type": "array", "items": { "type": "string" } },
        "target_audience": { "type": "string" }
      }
    }
  }
}
```
Findings are synthesized into a `research_insight` row in SQLite.
