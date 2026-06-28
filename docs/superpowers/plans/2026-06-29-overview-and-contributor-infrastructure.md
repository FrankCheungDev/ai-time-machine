# Overview And Contributor Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the remaining handoff infrastructure around the eight demos: AI overview timeline, technical lineage map, diagram/export page, visual/contribution docs, and a reusable demo creation template.

**Architecture:** Keep overview content data-driven in `@ai-history/data`, render static Astro routes in `apps/site`, and keep contributor-facing process in root/docs Markdown files. Use existing CSS variables and card/SVG visual language so phase 4 polish improves consistency instead of creating a new design system.

**Tech Stack:** Astro, TypeScript data modules, SVG, CSS variables, Playwright, Markdown docs.

---

## File Structure

- Create `packages/data/src/overview/timeline.ts`, `packages/data/src/overview/lineage.ts`, and export them.
- Create `apps/site/src/pages/timeline.astro`, `apps/site/src/pages/lineage.astro`, and `apps/site/src/pages/diagrams.astro`.
- Modify `apps/site/src/components/layout/BaseLayout.astro`, `apps/site/src/pages/index.astro`, and `apps/site/src/styles/tokens.css`.
- Modify `apps/site/tests/rag-pipeline.spec.ts` to cover the new routes.
- Create `CONTRIBUTING.md`, `docs/DESIGN.md`, `docs/MOTION.md`, `docs/DIAGRAM_GUIDE.md`, `docs/DEMO_GUIDE.md`, and `docs/templates/demo-template.md`.

### Task 1: Red Tests For Overview Routes

**Files:**
- Modify: `apps/site/tests/rag-pipeline.spec.ts`

- [ ] **Step 1: Add failing route tests**

Add Playwright tests for `/timeline/`, `/lineage/`, and `/diagrams/`. Verify each H1 and at least one key item: `Transformer` on timeline, `符号主义` on lineage, and `node-*` on diagrams.

- [ ] **Step 2: Verify red state**

Run: `pnpm --filter site test`
Expected: FAIL because the routes do not exist yet.

### Task 2: Overview Data

**Files:**
- Create: `packages/data/src/overview/timeline.ts`
- Create: `packages/data/src/overview/lineage.ts`
- Modify: `packages/data/src/index.ts`

- [ ] **Step 1: Add timeline data**

Create stable entries for symbolic search, expert systems, Bayes/statistical learning, CNN/deep learning, Attention/Transformer, LLM/RAG, and Agent.

- [ ] **Step 2: Add lineage data**

Create category nodes and edges for symbolic, statistical, neural, foundation-model, RAG, Agent, and Safety/Eval concepts.

- [ ] **Step 3: Verify data typecheck**

Run: `pnpm validate:data`
Expected: PASS.

### Task 3: Overview Routes

**Files:**
- Create: `apps/site/src/pages/timeline.astro`
- Create: `apps/site/src/pages/lineage.astro`
- Create: `apps/site/src/pages/diagrams.astro`
- Modify: `apps/site/src/styles/tokens.css`

- [ ] **Step 1: Implement timeline**

Render a scannable chronological page with era labels, event cards, and links back to relevant demos.

- [ ] **Step 2: Implement lineage map**

Render an SVG technical lineage map showing paradigms and transitions.

- [ ] **Step 3: Implement diagrams/export page**

Explain screenshot-friendly diagram export, SVG id conventions, and reusable diagram assets.

### Task 4: Navigation And Homepage

**Files:**
- Modify: `apps/site/src/components/layout/BaseLayout.astro`
- Modify: `apps/site/src/pages/index.astro`

- [ ] **Step 1: Add route links**

Add navigation and homepage access for timeline, lineage, and diagrams without crowding the header.

### Task 5: Contributor Docs And Template

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `docs/DESIGN.md`
- Create: `docs/MOTION.md`
- Create: `docs/DIAGRAM_GUIDE.md`
- Create: `docs/DEMO_GUIDE.md`
- Create: `docs/templates/demo-template.md`

- [ ] **Step 1: Write contribution guide**

Cover contribution types, fact-check expectations, demo acceptance, and verification commands.

- [ ] **Step 2: Write visual/motion/diagram guides**

Document tokens, SVG naming, reduced motion, screenshot/export workflow, and consistency rules from the handoff.

- [ ] **Step 3: Write demo template**

Provide a concise template for adding a future demo with data, Svelte island, route, and Playwright smoke test.

### Task 6: Verification And Commit

**Files:**
- All files above

- [ ] **Step 1: Run full checks**

Run: `pnpm validate:data`, `pnpm lint`, `pnpm build`, and `pnpm test`.
Expected: all commands exit `0`; Playwright covers the eight demo routes plus timeline, lineage, and diagrams.

- [ ] **Step 2: Commit**

Commit message: `Add overview pages and contributor guides`.
