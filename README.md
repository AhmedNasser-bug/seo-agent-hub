# SEO Agent Hub (`seo-agent-hub`)

> **Declarative Model Context Protocol (MCP) & GrowthBook 6-Cohort A/B Stack for Data-Driven Page Generation (`Jules` + `Stitch MCP`), Reconnaissance (`Firecrawl` + `arXiv`), and SEO/AEO Auditing (`OpenSEO` + `claude-seo` + `llms.txt`).**

---

## 1. Architectural Overview & Upstream Open-Source Registry

Instead of custom scrapers, custom SEO linters, or hand-written `SKILL.md` rewrites, `seo-agent-hub` vendors and binds **11 established open-source MCP servers and agent skill repositories** directly inside [`./skills/`](./skills/mcp-registry.json):

| System Layer | Cloned Upstream Public Repositories (`./skills/`) | Primary Operator | Role in the Loop |
|---|---|---|---|
| **Web Reconnaissance** | [`firecrawl/skills`](https://github.com/firecrawl/skills) (`./skills/firecrawl-skills`)<br>[`firecrawl/firecrawl-mcp-server`](https://github.com/firecrawl/firecrawl-mcp-server) (`./skills/firecrawl-mcp-server`) | **Antigravity** (or **Jules**) | Competitor intelligence (`firecrawl-competitive-intel`), research paper scraping, and lead discovery |
| **Academic Discovery** | [`blazickjp/arxiv-mcp-server`](https://github.com/blazickjp/arxiv-mcp-server) (`./skills/arxiv-mcp-server`) | **Antigravity** (or **Jules**) | Queries arXiv for peer-reviewed clinical & engineering benchmarks (`search_papers`, `read_paper`) |
| **Page & Variant Creation** | [`google-labs-code/stitch-skills`](https://github.com/google-labs-code/stitch-skills) (`./skills/stitch-skills`)<br>[`davideast/stitch-mcp`](https://github.com/davideast/stitch-mcp) (`./skills/stitch-mcp`)<br>[`Kargatharaakash/stitch-mcp`](https://github.com/Kargatharaakash/stitch-mcp) (`./skills/stitch-mcp-server`) | **Jules + Stitch MCP** | **Strictly generates pages and cohort variants** via the official `.stitch/next-prompt.md` baton protocol |
| **SEO & AEO Validation Gate** | [`every-app/open-seo`](https://github.com/every-app/open-seo) (`./skills/open-seo`)<br>[`AgriciDaniel/claude-seo`](https://github.com/AgriciDaniel/claude-seo) (`./skills/claude-seo`)<br>[`Bhanunamikaze/Agentic-SEO-Skill`](https://github.com/Bhanunamikaze/Agentic-SEO-Skill) (`./skills/agentic-seo-skill`)<br>[`Ryze-AI-Adgent/open-seo-mcp-skills`](https://github.com/Ryze-AI-Adgent/open-seo-mcp-skills) (`./skills/open-seo-mcp-skills`) | **Validation Gate (`Jules Worker`)** | Audits Stitch-generated pages (`openseo_score >= 88`), JSON-LD schema, and Answer Engine `/llms.txt` + `/robots.txt` |
| **Client-Side 6-Cohort A/B Testing** | **GrowthBook JS SDK** (`./sdk/growthbook-ab.js`) | **GrowthBook Auto-Wrapper** | Zero-backend client-side DOM swaps & conversion tracking across `18-24` (primary), `25-34`, `35-44`, `45-54`, `55-64`, `65+` |
| **Orchestration & Observation Deck** | [`gemini-cli-extensions/jules`](https://github.com/gemini-cli-extensions/jules) (`./skills/jules-extension`)<br>SQLite WAL + Observation Deck (`./dashboard/`) | **Jules Core Orchestrator** | Conversational steering bridge, live preview of Stitch-generated pages, and `CanNotDelete`-locked SQLite state |

---

## 2. Declarative Repository Blueprint

```text
seo-agent-hub/
├── init                          # Minimal 5-step setup wrapper (zero business logic)
├── .env.example                  # Environment variable template (WAF SEC-01)
├── .stitch/                      # Official google-labs-code/stitch-skills baton directory
│   ├── DESIGN.md                 # Stitch Project 503366360860058565 ("Clinical Vitality") design tokens
│   ├── SITE.md                   # Site vision, sitemap of generated pages, and roadmap
│   ├── metadata.json             # Stitch screen IDs, dimensions, and cohort mappings
│   ├── next-prompt.md            # Active baton prompt consumed by Jules + Stitch Loop
│   └── designs/                  # Staged HTML screens synthesized by Stitch MCP
├── config/
│   ├── jules.manifest.json       # Agent topology, cloned skill paths, and 6-cohort definitions
│   ├── stitch.mcp.json           # @_davideast/stitch-mcp proxy & .stitch/ baton configuration
│   ├── antigravity.routing.yaml  # Optional Antigravity CLI detection & fallback routing
│   └── sqlite.schema.sql         # SQLite WAL schema + SEC-04 CanNotDelete triggers
├── agents/
│   ├── orchestrator.md           # Jules Core Orchestrator system prompt
│   ├── research.md               # Firecrawl + arXiv Reconnaissance system prompt
│   ├── validation.md             # OpenSEO + claude-seo + llms.txt Validation Gate prompt
│   └── appearance.md             # Jules + Stitch Page Generator + GrowthBook cohort routing prompt
├── skills/                       # 11 Cloned Public Repositories (no custom rewrites)
│   ├── mcp-registry.json         # Declarative registry mapping all cloned repos & SKILL.md paths
│   ├── open-seo/                 # Cloned from every-app/open-seo
│   ├── open-seo-mcp-skills/      # Cloned from Ryze-AI-Adgent/open-seo-mcp-skills
│   ├── claude-seo/               # Cloned from AgriciDaniel/claude-seo
│   ├── agentic-seo-skill/        # Cloned from Bhanunamikaze/Agentic-SEO-Skill
│   ├── firecrawl-skills/         # Cloned from firecrawl/skills
│   ├── firecrawl-mcp-server/     # Cloned from firecrawl/firecrawl-mcp-server
│   ├── stitch-skills/            # Cloned from google-labs-code/stitch-skills
│   ├── stitch-mcp/               # Cloned from davideast/stitch-mcp
│   ├── stitch-mcp-server/        # Cloned from Kargatharaakash/stitch-mcp
│   ├── arxiv-mcp-server/         # Cloned from blazickjp/arxiv-mcp-server
│   └── jules-extension/          # Cloned from gemini-cli-extensions/jules
├── sdk/
│   ├── growthbook-ab.js          # Single-tag GrowthBook 6-cohort client injection script
│   └── generated-pages/          # Production HTML pages generated by Jules + Stitch MCP
├── dashboard/
│   ├── server.mjs                # Zero-dependency Node 24 Observation Deck & Stitch Loop server
│   ├── index.html                # Unified Observation Deck UI + Jules Orchestrator Live Chat
│   └── chainlit_app.py           # Optional Chainlit Python UI adapter
└── tests/
    └── e2e.test.mjs              # Automated E2E verification suite (Stitch page gen + 6-cohort A/B)
```

---

## 3. Quickstart: Fork, Initialize & Inject in 60 Seconds

### Step 1: Clone & Run `./init`
```bash
git clone https://github.com/AhmedNasser-bug/seo-agent-hub.git
cd seo-agent-hub
cp .env.example .env
./init --daemon
```

What `./init` executes sequentially:
1. **Jules Authentication**: Authenticates the Jules CLI via Google OAuth (`./skills/jules-extension`) and exports session config to `./state/jules.session.json`.
2. **Stitch MCP Binding**: Binds `@_davideast/stitch-mcp` (`./skills/stitch-mcp`) and `./skills/stitch-skills` strictly for page and variant generation using `.stitch/next-prompt.md`.
3. **Optional Antigravity Handshake**: Detects whether `antigravity` is installed; if present, binds it as the primary execution engine for the `research` agent, otherwise defaults back to `jules`.
4. **Cloned Skills Verification & SQLite Provisioning**: Verifies all 11 cloned upstream skill repositories in `./skills/` and provisions `./state/seo_hub.db` with `CanNotDelete` resource locks (`SEC-04`).
5. **Observation Deck Launch & Snippet Output**: Starts the Observation Deck on `http://localhost:4325` and prints the single HTML `<script>` tag for your landing page.

### Step 2: Paste the Single Script Tag into Your Host Landing Page `<head>`
```html
<script
  src="http://localhost:4325/sdk/growthbook-ab.js"
  data-seo-hub="http://localhost:4325"
  data-client-key="sdk-pharos-clinical-2026"
  data-default-cohort="18-24"
  defer
></script>
```

---

## 4. Reference Case Study: Pharos University Hemodialysis Safety Platform (`Grad_project_landing`)

This stack was built, tested, and verified live on **[`AhmedNasser-bug/Grad_project_landing`](https://github.com/AhmedNasser-bug/Grad_project_landing)** — the **Dual-Shield Clinical AI Hemodialysis Safety Platform** developed at Pharos University in Alexandria.

### End-to-End Data-Driven Page Creation Loop Verified on `Grad_project_landing`:
1. **Reconnaissance (`Firecrawl` + `arXiv MCP`)**:
   - Extracted peer-reviewed evidence (`arXiv:2507.11842` & `arXiv:2509.04119`) benchmarking **MedGemma-4B CPOE prescription guardrails** + **0.941 AUROC intradialytic hypotension (IDH) prediction** (22-minute lead time, 180ms quantized ONNX edge latency).
   - Ran `firecrawl-competitive-intel` across commercial dialysis platforms, identifying a major search and clinical documentation gap around proactive CPOE dry-weight auditing and alert-fatigue reduction.
2. **Pages Created by Jules + Stitch MCP (`.stitch/` Baton Workflow)**:
   - **Page 1 (`18-24` Primary Testing Cohort)**: [`medgemma-cpoe-idh-prediction-2026.html`](./sdk/generated-pages/medgemma-cpoe-idh-prediction-2026.html) — *Predicting Intradialytic Hypotension 22 Minutes Before Collapse with MedGemma-4B* (OpenSEO Score: **96/100**).
   - **Page 2 (`35-44` Attending Nephrologists Cohort)**: [`nephrology-ward-cpoe-override-audit-2026.html`](./sdk/generated-pages/nephrology-ward-cpoe-override-audit-2026.html) — *Zero-Override Dialysis Ward Protocol: Cutting Alert Fatigue by 64% with Dual-Shield AI* (OpenSEO Score: **98/100**).
   - **Page 3 (`25-34` Clinical Engineering Residents Cohort)**: [`edge-onnx-dialysis-telemetry-benchmarks-2026.html`](./sdk/generated-pages/edge-onnx-dialysis-telemetry-benchmarks-2026.html) — *Quantized ONNX Runtime Inference on Bedside Embedded SoCs for Zero-Cloud Telemetry* (OpenSEO Score: **98/100**).
3. **Six-Cohort GrowthBook A/B Routing**:
   - Visitors are dynamically bucketed into cohorts `18-24` (Primary Testing Cohort), `25-34`, `35-44`, `45-54`, `55-64`, and `65+`, receiving cohort-tailored headlines, subheadlines, and CTAs pointing to the Stitch-generated evidence pages.

---

## 5. Running the Automated Verification Suite

```bash
node --test tests/e2e.test.mjs
```
