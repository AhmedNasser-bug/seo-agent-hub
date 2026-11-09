"""
Chainlit Observation Deck Adapter for SEO Agent Hub
Connects directly to ./state/seo_hub.db and the Jules Orchestrator + Stitch MCP Page Generator.
"""
import os
import sqlite3
import urllib.request
import json

try:
    import chainlit as cl
except ImportError:
    cl = None

DB_PATH = os.environ.get("SEO_HUB_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "state", "seo_hub.db"))
API_BASE = f"http://localhost:{os.environ.get('SEO_HUB_PORT', '4325')}"

if cl:
    @cl.on_chat_start
    async def on_start():
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM stitch_generated_pages")
        pages_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM growthbook_experiments WHERE status IN ('RUNNING', 'APPROVED')")
        exp_count = cur.fetchone()[0]
        conn.close()
        await cl.Message(
            content=(
                f"**Jules Core Orchestrator Connected.**\n"
                f"- Stitch Generated Pages: `{pages_count}`\n"
                f"- Active 6-Cohort GrowthBook A/B Experiments: `{exp_count}` (Primary Cohort: `18-24`)\n"
                f"- Type `Create page with Stitch for 35-44` or `Approve 18-24` to steer the loop."
            )
        ).send()

    @cl.on_message
    async def on_message(message: cl.Message):
        req = urllib.request.Request(
            f"{API_BASE}/api/orchestrator/chat",
            data=json.dumps({"message": message.content}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        await cl.Message(content=payload.get("reply", "Processed by Jules Orchestrator.")).send()
