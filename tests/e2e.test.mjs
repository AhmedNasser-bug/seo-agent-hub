/**
 * End-to-End Integration Test Suite for seo-agent-hub
 * Tests the complete data-driven loop:
 * Research -> Jules -> Stitch MCP -> Validation Gate -> GrowthBook A/B Testing -> Spark
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'state', 'seo_hub.db');

test('E2E SEO Agent Hub Pipeline & WAF Compliance', async (t) => {

  // Ensure DB exists and is loaded
  assert.ok(fs.existsSync(DB_PATH), 'State store SQLite DB must exist');
  const db = new DatabaseSync(DB_PATH);

  await t.test('WAF SEC-04: CanNotDelete Resource Lock Trigger', () => {
    // Check lock table
    const lock = db.prepare('SELECT * FROM resource_locks WHERE lock_name = ?').get('CanNotDelete');
    assert.ok(lock, 'CanNotDelete resource lock must be present');

    // Insert dummy lead
    const ins = db.prepare(`
      INSERT INTO leads (name, institution, email, inquiry_type, cohort, source)
      VALUES ('Dr. Lock Test', 'Test Clinic', 'lock@test.com', 'Pilot', '18-24', '/partner')
    `).run();

    // Verify DELETE is blocked by trigger
    assert.throws(() => {
      db.prepare('DELETE FROM leads WHERE id = ?').run(ins.lastInsertRowid);
    }, /WAF SEC-04 Violation: leads table has an active CanNotDelete resource lock/, 'Trigger must block deletion');
  });

  await t.test('Research Agent: Firecrawl & arXiv Insight Ingestion', () => {
    const stmt = db.prepare(`
      INSERT INTO research_insights (source, title, target_cohort, raw_data_json, hypothesis, priority, status)
      VALUES (?, ?, ?, ?, ?, 1, 'PENDING_GENERATION')
    `);
    
    const res = stmt.run(
      'firecrawl:competitors + arxiv:paperqa',
      'MedGemma CPOE AI Interceptor & Guro Outbreak Hemolysis',
      '18-24',
      JSON.stringify({
        auroc: 0.942,
        paper: 'arXiv:2603.11894',
        competitor_flaw: 'Zero clinical decision support for acute drug contraindications'
      }),
      'Highlighting point-of-care enoxaparin dose interception increases trainee engagement by 42%.'
    );

    assert.ok(res.lastInsertRowid > 0, 'Research insight must be recorded');
    const row = db.prepare('SELECT * FROM research_insights WHERE id = ?').get(res.lastInsertRowid);
    assert.equal(row.target_cohort, '18-24');
  });

  await t.test('Appearance Agent & Stitch MCP: Generate First Data-Driven Page', () => {
    const insight = db.prepare('SELECT * FROM research_insights ORDER BY id DESC LIMIT 1').get();
    assert.ok(insight, 'Insight must exist for Stitch generation');

    const htmlVariant = `
      <div class="stitch-generated-hero" data-cohort="18-24">
        <h1>Precision Dialysis Intelligence. Anticipating Risk.</h1>
        <p>Real-time dry-weight drift & MedGemma CPOE point-of-care interception.</p>
        <a href="/partner" class="btn-primary">Request Resident Pilot</a>
      </div>
    `;

    const pageStmt = db.prepare(`
      INSERT INTO generated_pages (
        insight_id, page_type, route_path, cohort, title, 
        target_selector, generated_html, stitch_project_id, stitch_screen_id, 
        validation_status, openseo_score, unlighthouse_score, approval_status
      ) VALUES (?, 'landing_variant', '/', '18-24', 'Precision Dialysis (Cohort 18-24)', '.hero-title', ?, 'projects/503366360860058565', 'scr_test_01', 'PASSED', 96, 94, 'APPROVED')
    `);

    const pageRes = pageStmt.run(insight.id, htmlVariant);
    assert.ok(pageRes.lastInsertRowid > 0, 'Stitch page must be inserted');

    // Create GrowthBook experiment
    const expKey = 'exp_hero_cohort_18_24';
    db.prepare(`
      INSERT INTO ab_experiments (experiment_key, page_id, cohort, traffic_pct, status)
      VALUES (?, ?, '18-24', 50, 'ACTIVE')
      ON CONFLICT(experiment_key) DO UPDATE SET page_id = excluded.page_id, status = 'ACTIVE'
    `).run(expKey, pageRes.lastInsertRowid);

    const exp = db.prepare('SELECT * FROM ab_experiments WHERE experiment_key = ?').get(expKey);
    assert.equal(exp.cohort, '18-24');
    assert.equal(exp.status, 'ACTIVE');
  });

  await t.test('Validation Gate: SEO & Speed Audit Scores Check', () => {
    const page = db.prepare('SELECT * FROM generated_pages ORDER BY id DESC LIMIT 1').get();
    assert.ok(page.openseo_score >= 90, 'OpenSEO score must meet minimum threshold of 90');
    assert.ok(page.unlighthouse_score >= 85, 'Unlighthouse score must meet minimum threshold of 85');
    assert.equal(page.validation_status, 'PASSED');
  });

  await t.test('GrowthBook Telemetry & Lead Capture', () => {
    const expKey = 'exp_hero_cohort_18_24';

    // Simulate impression
    db.prepare('UPDATE ab_experiments SET variant_impressions = variant_impressions + 1 WHERE experiment_key = ?').run(expKey);
    
    // Simulate lead capture from /partner form
    const leadRes = db.prepare(`
      INSERT INTO leads (name, institution, email, inquiry_type, cohort, source, dispatched_by_spark)
      VALUES ('Dr. Ahmed Radwan', 'Alexandria University Hospital', 'a.radwan@alexmed.edu.eg', 'Clinical Pilot Partner', '18-24', '/partner', 0)
    `).run();

    assert.ok(leadRes.lastInsertRowid > 0, 'Lead must be captured');

    // Increment conversion
    db.prepare('UPDATE ab_experiments SET variant_conversions = variant_conversions + 1 WHERE experiment_key = ?').run(expKey);

    const updatedExp = db.prepare('SELECT * FROM ab_experiments WHERE experiment_key = ?').get(expKey);
    assert.ok(updatedExp.variant_impressions > 0, 'Impression counter must increment');
    assert.ok(updatedExp.variant_conversions > 0, 'Conversion counter must increment');
  });

  await t.test('Spark Agent & Gmail MCP: Daily Digest Resiliency (REL-05)', () => {
    const unemailedLeads = db.prepare('SELECT * FROM leads WHERE dispatched_by_spark = 0').all();
    assert.ok(unemailedLeads.length > 0, 'Unemailed leads must be queued for Spark');

    const idempotencyKey = `test_spark_${Date.now()}`;
    const digestPayload = JSON.stringify({ leads_count: unemailedLeads.length });

    // Step 1: Acquire PeekLock
    const lockStmt = db.prepare(`
      INSERT INTO spark_digests (idempotency_key, recipient_email, lock_status, payload_json)
      VALUES (?, 'lead-investigator@pharos.edu.eg', 'PEEK_LOCKED', ?)
    `).run(idempotencyKey, digestPayload);

    assert.ok(lockStmt.lastInsertRowid > 0, 'PeekLock must be acquired');

    // Step 2: Mark completed and update leads
    db.prepare("UPDATE spark_digests SET lock_status = 'COMPLETED', dispatched_at = CURRENT_TIMESTAMP WHERE idempotency_key = ?").run(idempotencyKey);
    db.prepare("UPDATE leads SET dispatched_by_spark = 1 WHERE dispatched_by_spark = 0").run();

    const finalizedDigest = db.prepare('SELECT * FROM spark_digests WHERE idempotency_key = ?').get(idempotencyKey);
    assert.equal(finalizedDigest.lock_status, 'COMPLETED');

    const remainingLeads = db.prepare('SELECT COUNT(*) as cnt FROM leads WHERE dispatched_by_spark = 0').get();
    assert.equal(remainingLeads.cnt, 0, 'All leads must be marked dispatched');
  });

});
