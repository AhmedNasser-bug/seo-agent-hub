import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { agentRegistry, GenericAgentAdapter } from '../adapters/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'state', 'seo_hub.db');
const BASE_URL = `http://localhost:${process.env.SEO_HUB_PORT || 4325}`;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

test('1. Cloned Upstream Skill Repositories Verification (Zero Custom Rewrites)', () => {
  const expectedRepos = [
    'open-seo',
    'open-seo-mcp-skills',
    'claude-seo',
    'agentic-seo-skill',
    'firecrawl-skills',
    'firecrawl-mcp-server',
    'stitch-mcp',
    'stitch-mcp-server',
    'stitch-skills',
    'arxiv-mcp-server',
    'jules-extension'
  ];

  for (const repo of expectedRepos) {
    const repoPath = path.join(ROOT_DIR, 'skills', repo);
    assert.equal(fs.existsSync(repoPath), true, `Missing cloned upstream repo: skills/${repo}`);
  }

  // Verify specific real upstream SKILL.md files exist
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, 'skills', 'stitch-skills', 'plugins', 'stitch-utilities', 'skills', 'stitch-loop', 'SKILL.md')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, 'skills', 'open-seo', '.agents', 'skills', 'seo-audit', 'SKILL.md')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, 'skills', 'firecrawl-skills', 'skills', 'workflows', 'firecrawl-competitive-intel', 'SKILL.md')),
    true
  );
});

test('2. Universal Agent Adapter Layer: Antigravity Primary, Jules Sunset & Dynamic Switching', async () => {
  // Step 2a: Query registered adapters
  const res = await fetchWithTimeout(`${BASE_URL}/api/adapters`);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.active_primary, 'antigravity');
  assert.equal(data.active_adapter.name, 'antigravity');
  assert.equal(data.active_adapter.type, 'remote_session');
  assert.equal(data.active_adapter.sunsetScheduled, false);

  const julesInfo = data.adapters.find((a) => a.name === 'jules');
  assert.ok(julesInfo, 'Jules adapter should be registered');
  assert.equal(julesInfo.sunsetScheduled, true, 'Jules must have sunsetScheduled: true');
  assert.match(julesInfo.sunsetNotice, /sunset/i);

  // Step 2b: Switch active adapter to Jules
  const switchRes = await fetchWithTimeout(`${BASE_URL}/api/adapters/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adapter: 'jules' })
  });
  assert.equal(switchRes.status, 200);
  const switchData = await switchRes.json();
  assert.equal(switchData.ok, true);
  assert.equal(switchData.switched.current, 'jules');

  // Verify chat turn reflects Jules sunsetting engine
  const chatJulesRes = await fetchWithTimeout(`${BASE_URL}/api/orchestrator/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Status check while on Jules adapter' })
  });
  assert.equal(chatJulesRes.status, 200);
  const chatJulesData = await chatJulesRes.json();
  assert.match(chatJulesData.reply, /Jules/i);

  // Step 2c: Switch active adapter back to Antigravity (primary)
  const switchBackRes = await fetchWithTimeout(`${BASE_URL}/api/adapters/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adapter: 'antigravity' })
  });
  assert.equal(switchBackRes.status, 200);
  const switchBackData = await switchBackRes.json();
  assert.equal(switchBackData.switched.current, 'antigravity');

  // Verify unknown adapter rejection
  const badSwitchRes = await fetchWithTimeout(`${BASE_URL}/api/adapters/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adapter: 'non-existent-agent' })
  });
  assert.equal(badSwitchRes.status, 400);

  // Step 2d: Test pluggable generic adapter registration
  const customAgent = new GenericAgentAdapter({
    name: 'claude-code',
    displayName: 'Anthropic Claude Code Driver',
    type: 'cli_runner'
  });
  agentRegistry.register(customAgent);
  assert.equal(agentRegistry.has('claude-code'), true);
  const customCapabilities = customAgent.getCapabilities();
  assert.equal(customCapabilities.name, 'claude-code');
  assert.equal(customCapabilities.sunsetScheduled, false);
});

test('3. Data-Driven Page Creation via Stitch Baton Loop (.stitch/) using Active Adapter', async () => {
  // Step 3a: Generate 35-44 Nephrology Ward Protocol page via Stitch MCP
  const genRes = await fetchWithTimeout(`${BASE_URL}/api/stitch/generate-page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      insight_id: 2,
      target_cohort: '35-44',
      page_slug: 'nephrology-ward-cpoe-override-audit-2026',
      page_title: 'Zero-Override Dialysis Ward Protocol: Cutting Alert Fatigue by 64% with Dual-Shield AI',
      headline: 'Zero-Override Dialysis Ward Protocol: Cutting Alert Fatigue by 64% with Dual-Shield AI',
      subheadline: 'How Pharos University’s MedGemma-4B CPOE gate and 22-minute shock-index forecast eliminate false-positive dialysis alarms for attending nephrologists.',
      cta_text: 'Review the 35-44 Attending Nephrologist Clinical Protocol'
    })
  });
  assert.equal(genRes.status, 201);
  const genData = await genRes.json();
  assert.equal(genData.ok, true);
  assert.equal(genData.generated.page_slug, 'nephrology-ward-cpoe-override-audit-2026');
  assert.equal(genData.generated.target_cohort, '35-44');
  assert.equal(genData.generated.adapter, 'antigravity');
  assert.ok(genData.generated.openseo_score >= 95);

  // Verify Stitch staging file, SDK published file, and Host Astro page exist
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, '.stitch', 'designs', 'nephrology-ward-cpoe-override-audit-2026.html')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, 'sdk', 'generated-pages', 'nephrology-ward-cpoe-override-audit-2026.html')),
    true
  );
  assert.equal(
    fs.existsSync(path.resolve(ROOT_DIR, '..', 'dashboard', 'src', 'pages', 'blog', 'nephrology-ward-cpoe-override-audit-2026.astro')),
    true
  );

  // Step 3b: Instruct Orchestrator via Chat to create a page for Cohort 25-34
  const chatGenRes = await fetchWithTimeout(`${BASE_URL}/api/orchestrator/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generate_stitch_page',
      cohort: '25-34',
      insight_id: 3,
      page_slug: 'edge-onnx-dialysis-telemetry-benchmarks-2026',
      message: 'Create page with Stitch for 25-34 clinical engineering cohort using arXiv edge ONNX insight'
    })
  });
  assert.equal(chatGenRes.status, 200);
  const chatGenData = await chatGenRes.json();
  assert.equal(chatGenData.ok, true);
  assert.match(chatGenData.reply, /edge-onnx-dialysis-telemetry-benchmarks-2026/);

  // Verify the page is served and includes the active engine attribution
  const previewRes = await fetchWithTimeout(`${BASE_URL}/sdk/generated-pages/nephrology-ward-cpoe-override-audit-2026.html`);
  assert.equal(previewRes.status, 200);
  const previewHtml = await previewRes.text();
  assert.match(previewHtml, /Zero-Override Dialysis Ward Protocol/);
  assert.match(previewHtml, /Antigravity Remote Sessions/);
  assert.match(previewHtml, /0\.941 AUROC/);
});

test('4. Six-Cohort GrowthBook A/B Routing & Conversion Tracking', async () => {
  const cohorts = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  for (const cohort of cohorts) {
    const res = await fetchWithTimeout(`${BASE_URL}/api/experiments?cohort=${encodeURIComponent(cohort)}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.primary_testing_cohort, '18-24');
    assert.equal(data.active_experiment.cohort, cohort);
  }

  // Record a conversion on the primary 18-24 cohort
  const evRes = await fetchWithTimeout(`${BASE_URL}/api/experiments/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      experiment_key: 'exp-dual-shield-18-24',
      event_type: 'conversion'
    })
  });
  assert.equal(evRes.status, 200);
  const evData = await evRes.json();
  assert.equal(evData.ok, true);
  assert.ok(evData.conversions >= 69);
});

test('5. Orchestrator Approval / Rollback Loop & WAF SEC-04 CanNotDelete Lock', async () => {
  // Approve 18-24 cohort experiment
  const approveRes = await fetchWithTimeout(`${BASE_URL}/api/orchestrator/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cohort: '18-24',
      action: 'approve_experiment',
      message: 'Approve 18-24 primary cohort experiment'
    })
  });
  assert.equal(approveRes.status, 200);

  // Capture a new clinical partner lead
  const leadRes = await fetchWithTimeout(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'prof.nadia.elmasry@pharos.edu.eg',
      name: 'Prof. Nadia El-Masry',
      organization: 'Pharos University Faculty of Allied Medical Sciences',
      role_cohort: '18-24',
      source_page_slug: '/blog/medgemma-cpoe-idh-prediction-2026',
      experiment_key: 'exp-dual-shield-18-24'
    })
  });
  assert.equal(leadRes.status, 201);

  // Verify WAF SEC-04 CanNotDelete trigger blocks deletion on leads table
  const db = new DatabaseSync(DB_PATH);
  assert.throws(() => {
    db.prepare("DELETE FROM leads WHERE email = 'prof.nadia.elmasry@pharos.edu.eg'").run();
  }, /SEC-04 Violation: CanNotDelete resource lock is active on leads table/);
  db.close();
});
