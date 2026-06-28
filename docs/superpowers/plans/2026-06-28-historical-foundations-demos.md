# Historical Foundations Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the handoff's Phase 3 historical-mainline demo set by adding expert systems, search tree, Bayes update, decision boundary, and CNN kernel demos with independent chapter routes.

**Architecture:** Reuse the existing Astro/Svelte/data package pattern. Keep demo copy in `@ai-history/data`, each demo as a focused Svelte island under `apps/site/src/demos/<id>/`, and each chapter as a static Astro page with the content acceptance sections from the handoff.

**Tech Stack:** Astro, Svelte, TypeScript, SVG, CSS variables, Playwright.

---

## File Structure

- Create five data files in `packages/data/src/demos/`: `expert-system.ts`, `search-tree.ts`, `bayes-update.ts`, `decision-boundary.ts`, `cnn-kernel.ts`.
- Export them from `packages/data/src/index.ts`.
- Extend `packages/demo-core/src/types.ts` with typed data contracts for the five demos.
- Create five Svelte islands in `apps/site/src/demos/`.
- Create five routes in `apps/site/src/pages/chapters/`.
- Update `apps/site/tests/rag-pipeline.spec.ts`, navigation, homepage cards, and `README.zh-CN.md`.

### Task 1: Red Route And Interaction Tests

**Files:**
- Modify: `apps/site/tests/rag-pipeline.spec.ts`

- [ ] **Step 1: Add failing smoke tests**

Add tests for `/chapters/search/`, `/chapters/expert-system/`, `/chapters/bayes/`, `/chapters/decision-boundary/`, and `/chapters/cnn/`. Each test must verify the H1, core question, and one visible interaction result.

- [ ] **Step 2: Verify red state**

Run: `pnpm --filter site test`
Expected: FAIL because the new routes do not exist yet.

### Task 2: Data Contracts And Content

**Files:**
- Modify: `packages/demo-core/src/types.ts`
- Create: five demo data files under `packages/data/src/demos/`
- Modify: `packages/data/src/index.ts`

- [ ] **Step 1: Add data types**

Add serializable interfaces for rules, search nodes/strategies, Bayes scenarios, decision-boundary modes/points, and CNN kernels/scan steps.

- [ ] **Step 2: Add demo manifests**

Each manifest must include title, question, simplification note, controls, and teaching copy. Keep all explanatory content in data files, not hardcoded inside components.

- [ ] **Step 3: Verify typecheck**

Run: `pnpm validate:data`
Expected: PASS with `tsc --noEmit`.

### Task 3: Expert System And Search Tree

**Files:**
- Create: `apps/site/src/demos/expert-system/ExpertSystemDemo.svelte`
- Create: `apps/site/src/demos/search-tree/SearchTreeDemo.svelte`
- Create: `apps/site/src/pages/chapters/expert-system.astro`
- Create: `apps/site/src/pages/chapters/search.astro`

- [ ] **Step 1: Build expert system cards**

Implement condition toggles plus an exception toggle. Show matched rules, conflict state, and the aha moment about brittle exception handling.

- [ ] **Step 2: Build search tree SVG**

Implement strategy buttons for BFS, DFS, and A*. Show expanded nodes and frontier cost changing by strategy.

### Task 4: Bayes, Decision Boundary, And CNN

**Files:**
- Create: `apps/site/src/demos/bayes-update/BayesUpdateDemo.svelte`
- Create: `apps/site/src/demos/decision-boundary/DecisionBoundaryDemo.svelte`
- Create: `apps/site/src/demos/cnn-kernel/CnnKernelDemo.svelte`
- Create: `apps/site/src/pages/chapters/bayes.astro`
- Create: `apps/site/src/pages/chapters/decision-boundary.astro`
- Create: `apps/site/src/pages/chapters/cnn.astro`

- [ ] **Step 1: Build Bayes slider demo**

Use prior and evidence strength sliders to compute a posterior probability and show the update visually.

- [ ] **Step 2: Build decision-boundary SVG demo**

Use mode controls for linear, nonlinear, and overfit boundaries plus one draggable-style sample control to show how a point can affect the boundary.

- [ ] **Step 3: Build CNN kernel demo**

Use kernel selection and scan-step controls to show a sliding window and feature map response.

### Task 5: Navigation, Homepage, And Docs

**Files:**
- Modify: `apps/site/src/components/layout/BaseLayout.astro`
- Modify: `apps/site/src/pages/index.astro`
- Modify: `apps/site/src/styles/tokens.css`
- Modify: `README.zh-CN.md`

- [ ] **Step 1: Add route access**

Add compact homepage cards for all eight demos and keep header navigation readable.

- [ ] **Step 2: Update docs**

README must list all eight implemented demo routes.

### Task 6: Verification And Commit

**Files:**
- All files above

- [ ] **Step 1: Run full checks**

Run: `pnpm validate:data`, `pnpm lint`, `pnpm build`, and `pnpm test`.
Expected: all commands exit `0`; Playwright covers the eight demo routes.

- [ ] **Step 2: Commit**

Commit message: `Add historical foundations demos`.
