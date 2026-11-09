# Design System: Clinical Vitality (Pharos Dual Shield Hemodialysis Safety)
**Stitch Project ID:** `503366360860058565`

## 1. Visual Direction & Editorial Persona
High-trust clinical AI documentation and evidence hub combining academic precision (Nature Medicine / NEJM editorial authority) with real-time ICU/dialysis telemetry clarity.

## 2. Color Palette
- **Warm Ivory Surface (`--bg-surface`)**: `#FAF8F5` (soft alabaster background for long-form clinical readability)
- **Pure Clinical Card (`--bg-card`)**: `#FFFFFF` with subtle border `rgba(15, 23, 42, 0.08)`
- **Deep Slate Dark Card (`--bg-dark`)**: `#0F172A` (used for real-time telemetry callouts and A/B test evidence banners)
- **Primary Ink (`--text-primary`)**: `#0F172A`
- **Muted Slate (`--text-muted`)**: `#475569`
- **Clinical Teal Accent (`--accent-teal`)**: `#0D9488` (used for verified safety badges, primary CTAs, and confidence metrics)
- **Alert Coral (`--accent-coral`)**: `#E11D48` (used strictly for shock index / hypotension warning thresholds)

## 3. Typography Rules (`UI-AESTHETIC-01`)
- **Display Headlines (`h1`, `h2`, `.serif-title`)**: `'Cormorant Garamond', Georgia, serif`, weight `600`, `line-height: 1.10`, `letter-spacing: -0.02em`, italic accent spans for clinical emphasis.
- **Body Copy (`body`, `p`)**: `'Plus Jakarta Sans', -apple-system, sans-serif`, weight `400`/`500`, `line-height: 1.65`.
- **Telemetry & Benchmarks (`code`, `.mono-label`)**: `'JetBrains Mono', monospace`, uppercase tracking for badges and p-value/AUROC metrics.

## 4. Layout & Component Primitives (`CSS-ARCH-01`)
- **Container (`.container-custom`)**: `max-width: 1120px`, centered with `1.5rem` horizontal padding.
- **Navigation**: Floating pill header with rounded-full links and clinical badge chip.
- **Cards (`.card-white`, `.card-dark`)**: `border-radius: 20px`, `padding: 2rem`, elevated subtle shadow.
- **Anti-Modal Rule (`UX-NO-MODAL-01`)**: Zero popup modals. All CTAs link directly to dedicated routes (`/partner`, `/blog/...`) or smooth in-page anchor sections.
