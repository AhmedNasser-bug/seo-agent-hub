# Project Milestones, Task Breakdown & Execution Schedule (`seo-agent-hub`)

**Baseline Date**: November 10, 2026  
**Standards**: Microsoft Well-Architected Framework (WAF 2026) + Spec-Driven Development (`SPEC-DIR-01`) + Stitch `Clinical Vitality` Design System (`Project ID: 503366360860058565`).

---

## 1. Executive Milestone Schedule & Ownership Matrix

| Milestone Phase | Target Window | Primary Owner / Agent | Secondary Collaborators | Core Deliverable & Exit Gate |
|---|---|---|---|---|
| **M0: Foundation, Design System & MCP Provisioning (`Epic 0`)** | **Nov 10 – Nov 14, 2026** | **Antigravity** (Lead Architect) | **Jules Core** + Project Lead | `./init` wrapper, 11 cloned upstream skill repos in `./skills/`, SQLite WAL schema with `SEC-04` locks, and `.stitch/DESIGN.md`. |
| **M1: Reconnaissance & Academic Discovery Loop** | **Nov 15 – Nov 22, 2026** | **Research Agent** (`Antigravity` / `Jules`) | **Firecrawl MCP** + **arXiv MCP** | Automated competitor gap matrix (`firecrawl-competitive-intel`) + peer-reviewed clinical benchmarks (`arxiv-mcp-server`) stored in `research_insights`. |
| **M2: Data-Driven Page Creation via Stitch Baton Loop** | **Nov 23 – Dec 02, 2026** | **Appearance Agent** (`Jules` + `Stitch MCP`) | **Jules Core Orchestrator** | Multi-cohort clinical pages synthesized via `.stitch/next-prompt.md` into `.stitch/designs/` and published to `sdk/generated-pages/` + Astro `/blog/*`. |
| **M3: OpenSEO, Unlighthouse & AEO Validation Gate** | **Dec 03 – Dec 10, 2026** | **Validation Gate Agent** (`Jules Worker`) | **OpenSEO** + **Claude-SEO** | 100% of Stitch-generated pages achieve `openseo_score >= 88`, `unlighthouse_seo >= 90`, valid JSON-LD schema, and synchronized `llms.txt`. |
| **M4: 6-Cohort GrowthBook A/B Testing & Observation Deck** | **Dec 11 – Dec 21, 2026** | **Jules Core Orchestrator** | **GrowthBook JS SDK** + Project Lead | Live client-side cohort routing (`18-24` primary cohort + `25-34`, `35-44`, `45-54`, `55-64`, `65+`), conversion tracking, and conversational approval/rollback. |
| **M5: Standalone Module Release & Clinical Pilot Scale-Out** | **Dec 22 – Dec 30, 2026** | **Project Lead** + **Antigravity** | **Jules Core Orchestrator** | Tagged release on `AhmedNasser-bug/seo-agent-hub`, verified production deployment on Vercel (`VERCEL-MONO-01`), and clinical partner lead handover. |

---

## 2. Phase-by-Phase Tasks, Responsibilities & Deadlines

### Milestone 0 (Epic 0): Reusable Design System, WAF Guardrails & MCP Binding (Nov 10 – Nov 14, 2026)
- **M0.1 — Discovery & Design Token Lock (Due: Nov 11, 2026)**
  - *Owner*: Antigravity + Project Lead
  - *Task*: Lock Stitch Project `503366360860058565` (`Clinical Vitality`) tokens (`Cormorant Garamond` `line-height: 1.10`, `Plus Jakarta Sans`, `JetBrains Mono`) in `.stitch/DESIGN.md` and `dashboard/src/styles/global.css` (`CSS-ARCH-01`, `UI-AESTHETIC-01`).
- **M0.2 — Upstream Skill Repository Vendoring (Due: Nov 12, 2026)**
  - *Owner*: Antigravity
  - *Task*: Maintain all 11 cloned public repositories inside `./skills/` (`open-seo`, `open-seo-mcp-skills`, `claude-seo`, `agentic-seo-skill`, `firecrawl-skills`, `firecrawl-mcp-server`, `stitch-skills`, `stitch-mcp`, `stitch-mcp-server`, `arxiv-mcp-server`, `jules-extension`).
- **M0.3 — Zero-Logic Initialization Wrapper `./init` (Due: Nov 14, 2026)**
  - *Owner*: Antigravity + Jules Core
  - *Task*: Provision Google OAuth session for Jules, bind Stitch MCP, detect optional Antigravity CLI, and initialize SQLite WAL state with `CanNotDelete` triggers (`SEC-04`).

### Milestone 1: Web Reconnaissance & Academic Discovery Loop (Nov 15 – Nov 22, 2026)
- **M1.1 — Competitor Intelligence Sweep (Due: Nov 18, 2026)**
  - *Owner*: Research Agent (`Antigravity` / `Jules`) using `firecrawl-skills`
  - *Task*: Audit commercial dialysis and clinical AI platforms for content and keyword gaps with `5000ms` timeouts (`REL-01`).
- **M1.2 — Peer-Reviewed Benchmark Extraction (Due: Nov 20, 2026)**
  - *Owner*: Research Agent (`Antigravity` / `Jules`) using `arxiv-mcp-server`
  - *Task*: Extract MedGemma CPOE, 0.941 AUROC intradialytic hypotension prediction, and 180ms quantized ONNX edge telemetry papers into `research_insights`.
- **M1.3 — Action Item & Baton Prioritization (Due: Nov 22, 2026)**
  - *Owner*: Jules Core Orchestrator
  - *Task*: Populate `action_items` (`P0`/`P1`) and write the next page generation spec into `.stitch/next-prompt.md`.

### Milestone 2: Data-Driven Page Creation via Stitch Baton Loop (Nov 23 – Dec 02, 2026)
- **M2.1 — Primary Cohort (`18-24`) Technical Architecture Pages (Due: Nov 26, 2026)**
  - *Owner*: Appearance Agent (`Jules` + `Stitch MCP`)
  - *Task*: Generate `medgemma-cpoe-idh-prediction-2026` via Stitch MCP for biomedical AI fellows and junior researchers.
- **M2.2 — Clinician (`35-44`) & Engineering (`25-34`) Cohort Pages (Due: Nov 29, 2026)**
  - *Owner*: Appearance Agent (`Jules` + `Stitch MCP`)
  - *Task*: Generate `nephrology-ward-cpoe-override-audit-2026` (`35-44`) and `edge-onnx-dialysis-telemetry-benchmarks-2026` (`25-34`) via the `.stitch/next-prompt.md` baton loop.
- **M2.3 — Executive & Patient Cohort Variants (`45-54`, `55-64`, `65+`) (Due: Dec 02, 2026)**
  - *Owner*: Appearance Agent (`Jules` + `Stitch MCP`)
  - *Task*: Synthesize tailored pages and GrowthBook variants for Hospital Directors (`45-54`), CMOs (`55-64`), and Patient Safety Advocates (`65+`).

### Milestone 3: OpenSEO, Unlighthouse & AEO Validation Gate (Dec 03 – Dec 10, 2026)
- **M3.1 — Automated OpenSEO & Structured Data Audit (Due: Dec 06, 2026)**
  - *Owner*: Validation Gate Agent (`Jules Worker`) using `every-app/open-seo` & `AgriciDaniel/claude-seo`
  - *Task*: Enforce `openseo_score >= 88`, `unlighthouse_seo >= 90`, semantic heading hierarchy, and `MedicalWebPage` JSON-LD schema.
- **M3.2 — Dynamic AEO Index Synchronization (Due: Dec 10, 2026)**
  - *Owner*: Validation Gate Agent (`Jules Worker`) using `claude-seo/seo-geo`
  - *Task*: Synchronize `/llms.txt` and `/robots.txt` for AI answer engines (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Googlebot`).

### Milestone 4: 6-Cohort GrowthBook A/B Testing & Observation Deck (Dec 11 – Dec 21, 2026)
- **M4.1 — Client-Side 6-Cohort Experiment Rollout (Due: Dec 15, 2026)**
  - *Owner*: GrowthBook JS SDK (`sdk/growthbook-ab.js`) + Jules Core Orchestrator
  - *Task*: Route live landing page traffic across all 6 cohorts with zero-backend source mutation.
- **M4.2 — Conversational Steering, Approval & Rollback (Due: Dec 18, 2026)**
  - *Owner*: Project Lead + Jules Core Orchestrator
  - *Task*: Monitor CVR and statistical confidence in the Observation Deck (`http://localhost:4325`) to approve winning variants or roll back underperformers.
- **M4.3 — Protected Clinical Lead Capture (Due: Dec 21, 2026)**
  - *Owner*: Jules Core Orchestrator
  - *Task*: Capture partner hospital and research leads into SQLite `leads` under `SEC-04` `CanNotDelete` protection.

### Milestone 5: Standalone Module Release & Clinical Pilot Handover (Dec 22 – Dec 30, 2026)
- **M5.1 — Automated E2E Regression Verification (Due: Dec 26, 2026)**
  - *Owner*: Antigravity
  - *Task*: Run `node --test tests/e2e.test.mjs` and verify WAF `COST-01` resource teardown and `OPS-01` structured telemetry.
- **M5.2 — GitHub Release & Production Sync (Due: Dec 30, 2026)**
  - *Owner*: Project Lead + Antigravity
  - *Task*: Tag release on `AhmedNasser-bug/seo-agent-hub` and merge host integration into `AhmedNasser-bug/Grad_project_landing`.
