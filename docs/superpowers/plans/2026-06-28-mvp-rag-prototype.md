# MVP RAG Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable static prototype from `docs/interactive_ai_history_codex_handoff.md`: an Astro site with a Chinese-first homepage, a RAG chapter, reusable Svelte demo primitives, and an interactive RAG pipeline SVG demo.

**Architecture:** Use a pnpm workspace with `apps/site` as the Astro shell, `packages/demo-core` for shared Svelte demo UI, and `packages/data` for typed demo content. Keep the demo fully static and illustrative; no backend, API keys, real vector database, or model calls.

**Tech Stack:** pnpm workspace, Astro, MDX, Svelte, TypeScript, CSS variables, SVG, Vitest, Playwright.

---

## File Structure

- Create `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, and workspace package configs.
- Create `apps/site/src/pages/index.astro` and `apps/site/src/pages/chapters/rag.astro`.
- Create `apps/site/src/components/layout/BaseLayout.astro` and `apps/site/src/styles/tokens.css`.
- Create `apps/site/src/demos/rag-pipeline/RagPipelineDemo.svelte`.
- Create `packages/demo-core/src/{DemoShell.svelte,StepperDemo.svelte,SvgScene.svelte,types.ts,index.ts}`.
- Create `packages/data/src/demos/rag-pipeline.ts` and `packages/data/src/index.ts`.
- Create `apps/site/tests/rag-pipeline.spec.ts` and `packages/demo-core/src/StepperDemo.test.ts`.

### Task 1: Workspace Scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add workspace metadata**

Use root scripts: `dev`, `build`, `preview`, `test`, `lint`, `format`, and `validate:data`. Configure workspaces for `apps/*` and `packages/*`.

- [ ] **Step 2: Add ignore rules**

Ignore `node_modules/`, `.astro/`, `dist/`, `coverage/`, and Playwright reports.

- [ ] **Step 3: Verify package discovery**

Run: `pnpm -r list --depth -1`
Expected: root, `site`, `@ai-history/demo-core`, and `@ai-history/data` after package files exist.

### Task 2: Site Shell

**Files:**
- Create: `apps/site/package.json`
- Create: `apps/site/astro.config.mjs`
- Create: `apps/site/src/components/layout/BaseLayout.astro`
- Create: `apps/site/src/styles/tokens.css`
- Create: `apps/site/src/pages/index.astro`

- [ ] **Step 1: Configure Astro**

Add `@astrojs/svelte` and `@astrojs/mdx` integrations. Use `src/styles/tokens.css` globally through the layout.

- [ ] **Step 2: Implement homepage**

Homepage content must state the project position, show the MVP route, and link to `/chapters/rag/`. Use Chinese-first copy from the handoff and avoid a marketing-only landing page.

- [ ] **Step 3: Verify static shell**

Run: `pnpm --filter site build`
Expected: Astro builds static pages without TypeScript errors.

### Task 3: Demo Core Package

**Files:**
- Create: `packages/demo-core/package.json`
- Create: `packages/demo-core/src/types.ts`
- Create: `packages/demo-core/src/DemoShell.svelte`
- Create: `packages/demo-core/src/StepperDemo.svelte`
- Create: `packages/demo-core/src/SvgScene.svelte`
- Create: `packages/demo-core/src/index.ts`
- Create: `packages/demo-core/src/StepperDemo.test.ts`

- [ ] **Step 1: Define shared types**

Define `DemoStep`, `PipelineNode`, and `PipelineEdge` with stable ids, labels, descriptions, and highlight metadata.

- [ ] **Step 2: Build reusable Svelte primitives**

`DemoShell` owns title, question, simplification note, and slots. `StepperDemo` owns previous/next buttons and current step state. `SvgScene` exposes a responsive SVG frame.

- [ ] **Step 3: Add state tests**

Vitest should verify step bounds: previous at index `0` stays `0`, next at last index stays last.

### Task 4: RAG Data and Chapter

**Files:**
- Create: `packages/data/package.json`
- Create: `packages/data/src/demos/rag-pipeline.ts`
- Create: `packages/data/src/index.ts`
- Create: `apps/site/src/pages/chapters/rag.astro`

- [ ] **Step 1: Encode RAG content**

Create seven nodes: `query`, `embedding`, `vector-db`, `reranker`, `prompt`, `llm`, `answer`. Create at least six steps with Chinese explanatory text.

- [ ] **Step 2: Create RAG chapter**

Render title `RAG：大模型如何连接外部知识？`, core question `为什么只靠模型参数回答问题不够？`, and the demo island with `client:load`.

### Task 5: RAG Pipeline Demo

**Files:**
- Create: `apps/site/src/demos/rag-pipeline/RagPipelineDemo.svelte`

- [ ] **Step 1: Render SVG flow**

Use a responsive SVG with labeled rounded nodes and arrows in this order: Query -> Embedding -> Vector DB -> Reranker -> Prompt -> LLM -> Answer.

- [ ] **Step 2: Implement highlighting**

Highlight the active node and active edge for each step. Dim inactive nodes. Keep controls to previous/next only.

- [ ] **Step 3: Add simplification note**

Show that the example is a teaching illustration and does not call a real vector database or LLM.

### Task 6: Verification

**Files:**
- Create: `apps/site/tests/rag-pipeline.spec.ts`

- [ ] **Step 1: Install dependencies**

Run: `pnpm install`
Expected: install completes and writes `pnpm-lock.yaml`.

- [ ] **Step 2: Run unit tests**

Run: `pnpm test`
Expected: Vitest reports passing tests.

- [ ] **Step 3: Run static build**

Run: `pnpm build`
Expected: Astro builds the site and emits static output.

- [ ] **Step 4: Run dev smoke check**

Run: `pnpm dev -- --host 127.0.0.1`
Expected: local site serves homepage and `/chapters/rag/`.

- [ ] **Step 5: Commit**

Commit message: `Build MVP RAG prototype scaffold`.
