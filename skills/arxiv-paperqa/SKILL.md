---
name: arxiv-paperqa
description: Academic discovery engine querying arXiv, IEEE Xplore, and PubMed for clinical AI safety, dialysis water treatment, and mathematical predictive models.
---

# arXiv MCP & PaperQA2 Skill

## Capabilities
- Search recent peer-reviewed preprints and publications.
- Extract abstract, methodology, AUROC benchmarks, and clinical conclusion paragraphs.
- Provide ground-truth citations to back up conversion claims on Stitch-generated pages.

## Usage in Pipeline
The Research Agent queries arXiv for recent advancements:
```json
{
  "query": "hemodialysis intradialytic hypotension machine learning prediction auROC",
  "max_results": 5
}
```
Extracted statistics (e.g. RNN 0.94 AUROC, XGBoost 0.936 AUROC) are structured into `raw_data_json` to supply the Appearance Agent with empirical proof points.
