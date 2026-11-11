-- SQLite Schema for SEO Agent Hub (WAF SEC-02 & SEC-04 Compliant)
-- Enforces CanNotDelete resource locks on critical state tables via triggers.
-- Architecture: Research (Firecrawl + arXiv) -> Stitch Page Generation (.stitch/ Baton Loop) -> OpenSEO Validation -> GrowthBook 6-Cohort A/B Testing

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1. Research Insights (Firecrawl Competitive Intel & arXiv / IEEE Papers)
CREATE TABLE IF NOT EXISTS research_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL CHECK(source_type IN ('firecrawl', 'arxiv', 'ieee', 'manual')),
    source_url TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    keywords_json TEXT NOT NULL DEFAULT '[]',
    target_cohort TEXT NOT NULL DEFAULT '18-24',
    relevance_score REAL NOT NULL DEFAULT 0.85,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'QUEUED_FOR_STITCH', 'PAGE_GENERATED', 'ARCHIVED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Stitch Generated Pages & Variants (Created by Jules + Stitch MCP via .stitch/next-prompt.md baton)
CREATE TABLE IF NOT EXISTS stitch_generated_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_slug TEXT NOT NULL UNIQUE,
    page_title TEXT NOT NULL,
    page_type TEXT NOT NULL CHECK(page_type IN ('blog_post', 'landing_variant', 'cohort_page')),
    target_cohort TEXT NOT NULL CHECK(target_cohort IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'all')),
    research_insight_id INTEGER REFERENCES research_insights(id),
    stitch_project_id TEXT NOT NULL DEFAULT '503366360860058565',
    stitch_screen_id TEXT,
    stitch_prompt TEXT NOT NULL,
    html_path TEXT NOT NULL,
    host_route_path TEXT,
    headline TEXT NOT NULL,
    subheadline TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'VALIDATED', 'AB_TESTING', 'PROMOTED', 'ROLLED_BACK')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. SEO & AEO Validation Audits (OpenSEO / claude-seo / agentic-seo-skill & llms.txt)
CREATE TABLE IF NOT EXISTS validation_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER REFERENCES stitch_generated_pages(id),
    target_url TEXT NOT NULL,
    skill_used TEXT NOT NULL DEFAULT 'every-app/open-seo + AgriciDaniel/claude-seo',
    openseo_score INTEGER NOT NULL CHECK(openseo_score BETWEEN 0 AND 100),
    unlighthouse_perf INTEGER NOT NULL CHECK(unlighthouse_perf BETWEEN 0 AND 100),
    unlighthouse_seo INTEGER NOT NULL CHECK(unlighthouse_seo BETWEEN 0 AND 100),
    aeo_llms_txt_valid INTEGER NOT NULL DEFAULT 1 CHECK(aeo_llms_txt_valid IN (0, 1)),
    robots_txt_valid INTEGER NOT NULL DEFAULT 1 CHECK(robots_txt_valid IN (0, 1)),
    findings_json TEXT NOT NULL DEFAULT '{}',
    gate_passed INTEGER NOT NULL DEFAULT 1 CHECK(gate_passed IN (0, 1)),
    audited_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. GrowthBook A/B Experiments across 6 Demographic Cohorts
CREATE TABLE IF NOT EXISTS growthbook_experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_key TEXT NOT NULL UNIQUE,
    page_id INTEGER NOT NULL REFERENCES stitch_generated_pages(id),
    cohort TEXT NOT NULL CHECK(cohort IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
    is_primary_cohort INTEGER NOT NULL DEFAULT 0 CHECK(is_primary_cohort IN (0, 1)),
    control_payload_json TEXT NOT NULL,
    variant_payload_json TEXT NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    conversion_rate REAL NOT NULL DEFAULT 0.0,
    confidence_pct REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'RUNNING', 'APPROVED', 'ROLLED_BACK')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Captured Leads & Email Waitlist
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    organization TEXT NOT NULL DEFAULT '',
    role_cohort TEXT NOT NULL DEFAULT '18-24',
    source_page_slug TEXT NOT NULL DEFAULT '/',
    experiment_key TEXT NOT NULL DEFAULT 'baseline',
    can_not_delete INTEGER NOT NULL DEFAULT 1,
    captured_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- WAF SEC-04: CanNotDelete Resource Lock Trigger on Critical Lead Store
CREATE TRIGGER IF NOT EXISTS enforce_leads_cannot_delete
BEFORE DELETE ON leads
WHEN OLD.can_not_delete = 1
BEGIN
    SELECT RAISE(ABORT, 'SEC-04 Violation: CanNotDelete resource lock is active on leads table.');
END;

-- 6. Prioritized Daily Action Items (Synthesized by Research & Validation Agents)
CREATE TABLE IF NOT EXISTS action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    priority TEXT NOT NULL CHECK(priority IN ('P0', 'P1', 'P2')),
    category TEXT NOT NULL CHECK(category IN ('RESEARCH', 'STITCH_PAGE_GEN', 'SEO_AUDIT', 'AB_TEST')),
    title TEXT NOT NULL,
    rationale TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Universal Orchestrator Conversation Log
CREATE TABLE IF NOT EXISTS orchestrator_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL CHECK(sender IN ('user', 'orchestrator_agent', 'antigravity_orchestrator', 'jules_orchestrator', 'research_agent', 'validation_agent', 'appearance_agent')),
    message TEXT NOT NULL,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
