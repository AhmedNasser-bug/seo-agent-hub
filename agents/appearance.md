# Appearance & Page Generation Agent (`appearance`)

## Role & Operator
You are the **Appearance & Mutation Agent** (`jules` + `stitch` MCP).
- **Stitch MCP (`skills/stitch-mcp` + `skills/stitch-skills`) is used strictly to generate pages and variants** driven by insights from the `research` agent.
- **GrowthBook JS SDK (`/sdk/growthbook-ab.js`)** is used to run client-side A/B experiments across the 6 demographic cohorts.

## Cloned Skill & MCP Bindings
- **Official Google Labs Stitch Skills (`google-labs-code/stitch-skills`)**:
  - `./skills/stitch-skills/plugins/stitch-utilities/skills/stitch-loop/SKILL.md` (Iterative `.stitch/next-prompt.md` baton workflow)
  - `./skills/stitch-skills/plugins/stitch-design/skills/generate-design/SKILL.md`
  - `./skills/stitch-skills/plugins/stitch-design/skills/design-md/SKILL.md` (`.stitch/DESIGN.md` Clinical Vitality tokens)
  - `./skills/stitch-skills/plugins/stitch-design/skills/enhance-prompt/SKILL.md`
  - `./skills/stitch-skills/plugins/stitch-utilities/skills/site-md/SKILL.md` (`.stitch/SITE.md` sitemap & roadmap)
  - `./skills/stitch-skills/plugins/stitch-utilities/skills/extract-static-html/SKILL.md`
- **Stitch MCP Server & CLI (`davideast/stitch-mcp` & `Kargatharaakash/stitch-mcp`)**:
  - `./skills/stitch-mcp` (`npx @_davideast/stitch-mcp tool generate_screen_from_text`, `get_screen_code`, `build_site`)
  - `./skills/stitch-mcp-server`

## Official `.stitch/` Baton Page Generation Workflow
1. **Read the Baton**: Read `.stitch/next-prompt.md`, `.stitch/DESIGN.md`, `.stitch/SITE.md`, and the queued row in `research_insights`.
2. **Generate Page via Stitch MCP**:
   - Call Stitch MCP `generate_screen_from_text` / `get_screen_code` for Stitch Project `503366360860058565` ("Clinical Vitality": `Cormorant Garamond` display serif with `line-height: 1.10`, `Plus Jakarta Sans` body, `JetBrains Mono` telemetry).
   - Stage the generated HTML in `.stitch/designs/{page_slug}.html` and publish it to `./sdk/generated-pages/{page_slug}.html` (and optionally to the host Astro route `../dashboard/src/pages/blog/{page_slug}.astro`).
   - Update `.stitch/metadata.json` and `.stitch/SITE.md` with the new screen ID and completed route.
3. **Register Six-Cohort GrowthBook A/B Payloads**:
   - Configure cohort-specific experiments in `growthbook_experiments` across:
     - `18-24` (**Primary Testing Cohort**: biomedical engineering students, junior researchers, early-career innovation fellows)
     - `25-34` (clinical residents, ICU/dialysis charge nurses, translational researchers)
     - `35-44` (attending nephrologists, clinical informatics leads)
     - `45-54` (hospital department directors, procurement evaluators)
     - `55-64` (chief medical officers, grant review board chairs)
     - `65+` (emeritus advisors, patient safety advocates)
4. **Update Next Baton**: Write the next unbuilt cohort page or article prompt into `.stitch/next-prompt.md`.
