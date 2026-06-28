# Modern AI Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the MVP from one RAG demo to the handoff's Phase 2 "现代 AI 三件套" by adding Attention Map and Agent Loop demos, chapters, homepage entries, and smoke coverage.

**Architecture:** Reuse the existing Astro site, `@ai-history/demo-core` Svelte primitives, and `@ai-history/data` package. Each demo remains static, scripted, Chinese-first, and self-contained, with stable ids for SVG elements and no real AI runtime.

**Tech Stack:** Astro, Svelte, TypeScript, SVG, CSS variables, Vitest, Playwright.

---

## File Structure

- Modify `packages/demo-core/src/types.ts` to add reusable demo data types for token attention and story-branch/agent steps.
- Create `packages/data/src/demos/attention-map.ts` and `packages/data/src/demos/agent-loop.ts`.
- Modify `packages/data/src/index.ts` to export the new demo data.
- Create `apps/site/src/demos/attention-map/AttentionMapDemo.svelte`.
- Create `apps/site/src/demos/agent-loop/AgentLoopDemo.svelte`.
- Create `apps/site/src/pages/chapters/attention.astro` and `apps/site/src/pages/chapters/agent.astro`.
- Modify `apps/site/src/pages/index.astro`, `apps/site/src/components/layout/BaseLayout.astro`, and `README.zh-CN.md`.
- Modify `apps/site/tests/rag-pipeline.spec.ts` to cover the three demo routes.

### Task 1: Red Tests For Phase 2 Routes

**Files:**
- Modify: `apps/site/tests/rag-pipeline.spec.ts`

- [ ] **Step 1: Add failing route and interaction tests**

Add Playwright checks for `/chapters/attention/` and `/chapters/agent/`. The Attention test should click a token button and expect the selected token explanation to change. The Agent test should click "下一步", then choose a failure path and expect a repair/revise step.

- [ ] **Step 2: Verify red state**

Run: `pnpm --filter site test`
Expected: FAIL because the new routes do not exist yet.

### Task 2: Demo Data Contracts

**Files:**
- Modify: `packages/demo-core/src/types.ts`
- Create: `packages/data/src/demos/attention-map.ts`
- Create: `packages/data/src/demos/agent-loop.ts`
- Modify: `packages/data/src/index.ts`

- [ ] **Step 1: Add typed content models**

Add `AttentionToken`, `AttentionLink`, `AttentionMapDemo`, `AgentLoopStep`, `AgentBranchOption`, and `AgentLoopDemo` interfaces. Keep ids stable and data serializable.

- [ ] **Step 2: Add Attention data**

Create a Chinese sentence with six tokens, preset attention links, RNN comparison copy, and simplification note: weights are teaching presets, not real Transformer outputs.

- [ ] **Step 3: Add Agent data**

Create plan, tool call, observation, revise, and final answer steps plus one failure branch that demonstrates repair after a bad tool result.

- [ ] **Step 4: Verify data typecheck**

Run: `pnpm validate:data`
Expected: PASS with `tsc --noEmit`.

### Task 3: Attention Map Demo

**Files:**
- Create: `apps/site/src/demos/attention-map/AttentionMapDemo.svelte`
- Create: `apps/site/src/pages/chapters/attention.astro`

- [ ] **Step 1: Implement token interaction**

Render token buttons and an SVG connection map. Clicking a token updates the selected token, active links, and explanation panel.

- [ ] **Step 2: Implement mode comparison**

Add a two-option segmented control for `Attention` and `RNN`. Attention shows direct links; RNN shows weaker chain-style context.

- [ ] **Step 3: Create chapter**

Render the title `Attention 与 Transformer：token 为什么可以直接互相关注？`, core question, historical context, observation guidance, solved/unsolved notes, and simplification note.

### Task 4: Agent Loop Demo

**Files:**
- Create: `apps/site/src/demos/agent-loop/AgentLoopDemo.svelte`
- Create: `apps/site/src/pages/chapters/agent.astro`

- [ ] **Step 1: Implement loop stepper**

Render an SVG loop for plan -> tool call -> observation -> revise -> final answer. Use existing `StepperDemo` for next/previous controls.

- [ ] **Step 2: Implement failure branch**

Add one button labeled `模拟工具失败` that switches to the repair path and shows the revise step as active.

- [ ] **Step 3: Create chapter**

Render the title `Agent：大模型如何执行多步任务？`, core question, historical context, observation guidance, solved/unsolved notes, and simplification note.

### Task 5: Navigation, Homepage, And Docs

**Files:**
- Modify: `apps/site/src/components/layout/BaseLayout.astro`
- Modify: `apps/site/src/pages/index.astro`
- Modify: `README.zh-CN.md`

- [ ] **Step 1: Add route links**

Add nav links and homepage cards for RAG, Attention, and Agent. Keep cards compact and within the existing visual system.

- [ ] **Step 2: Update README**

List the three implemented demos and their routes.

### Task 6: Verification And Commit

**Files:**
- All files above

- [ ] **Step 1: Run full checks**

Run: `pnpm validate:data`, `pnpm lint`, `pnpm build`, and `pnpm test`.
Expected: all commands exit `0`; Playwright covers all three demo routes.

- [ ] **Step 2: Commit**

Commit message: `Add Attention and Agent demos`.
