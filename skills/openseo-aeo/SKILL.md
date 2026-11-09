---
name: openseo-aeo
description: SEO & Answer Engine Optimization (AEO) quality gate running OpenSEO, Unlighthouse, and llms.txt generation.
---

# OpenSEO & AEO Skill

## Capabilities
- Audit generated HTML/Astro pages for single H1, structured metadata, and speed.
- Validate dynamic `robots.txt` directives targeting modern AI search crawlers.
- Maintain `llms.txt` markdown index containing high-density knowledge summaries for LLM retrieval engines.

## Usage in Pipeline
The Validation Gate audits every candidate page:
```json
{
  "target_html": "...",
  "rules": ["single_h1", "meta_description_length", "schema_org_medical", "contrast_ratio"]
}
```
If score >= 90, the page is flagged as `validation_status = 'PASSED'` and added to the A/B test pipeline.
