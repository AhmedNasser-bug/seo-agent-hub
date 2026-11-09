---
name: stitch-mcp
description: Google Stitch MCP integration for automated UI design generation, screen synthesis, and code retrieval based on Design DNA.
---

# Google Stitch MCP Skill

## Capabilities
- Connects to Google's official Stitch MCP server endpoint (`https://stitch.googleapis.com/mcp`).
- Calls `generate_screen_from_text` to synthesize landing page variants, component cards, or blog layouts based on research prompts.
- Calls `get_screen` to retrieve clean, production-ready HTML/CSS.
- Integrates design tokens from Stitch Project `503366360860058565` ("Clinical Vitality").

## Usage in Pipeline
The Appearance Agent prompts Stitch with structured design context:
```json
{
  "tool": "generate_screen_from_text",
  "arguments": {
    "project_id": "projects/503366360860058565",
    "prompt": "Design a high-converting, clinical white hero section tailored for medical residents and trainees (Cohort 18-24). Include real-time MedGemma CPOE safety validation badge, live telemetry indicators, and editorial serif headline: 'Empirical Precision in Hemodialysis Care'. Apply Clinical Vitality design system.",
    "device": "desktop"
  }
}
```
The resulting screen code is extracted via `get_screen` and stored in SQLite `generated_pages`.
