# Demo Guide

Each demo is a scripted teaching model, not a real AI system. The goal is mechanism intuition.

## Structure

Add new demos in three places:

- `packages/data/src/demos/<demo-id>.ts` for content and state.
- `apps/site/src/demos/<demo-id>/<DemoName>.svelte` for interaction.
- `apps/site/src/pages/chapters/<slug>.astro` for the chapter route.

Also export data from `packages/data/src/index.ts` and add a Playwright smoke test in `apps/site/tests/rag-pipeline.spec.ts`.

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
