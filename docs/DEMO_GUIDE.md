# Demo Guide

Each demo is a scripted teaching model, not a real AI system. The goal is mechanism intuition.

## Structure

Add a new demo through the canonical chapter contract:

- `packages/data/src/chapters.ts` for order, route, timeline, and lineage IDs.
- `packages/data/src/demos/<demo-id>.ts` for content and state.
- `apps/site/src/demos/<demo-id>/<DemoName>.svelte` for interaction.
- `apps/site/src/pages/chapters/<slug>.astro` and its `/en/` counterpart for routes.
- `apps/site/src/i18n/pages/demoChapters.ts` and `apps/site/src/i18n/learning.ts` for chapter and activity copy.
- `packages/data/src/learning/concept-checks.ts` for one bilingual check.
- `packages/data/src/overview/` for the timeline entry, source-backed events, and lineage node/edges.
- `packages/data/src/assets/diagram-assets.ts` plus `scripts/render-diagram-assets.mjs` for the reusable diagram pair.

Export data from `packages/data/src/index.ts`. Home order, progress, chapter journeys, most route matrices, and diagram cards derive from these registries; tests should fail if one of the contracts is missing. Add focused browser behavior, English, mobile, accessibility, and teaching-correctness coverage under `apps/site/tests/`.

## Content Rules

Each demo needs:

- one core question
- one visible result per interaction
- a simplification note
- stable ids for SVG nodes and arrows
- no backend, API key, real model call, or database dependency

## Controls

Keep main controls to three or fewer. Use buttons for steps/modes, sliders for numeric values, checkboxes for binary conditions, and SVG highlights for the current focus.

## Verification

Run:

```bash
pnpm validate:data
pnpm lint
pnpm build
pnpm test
```
