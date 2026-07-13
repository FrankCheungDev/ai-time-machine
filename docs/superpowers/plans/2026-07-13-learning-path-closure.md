# Learning Path Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing 10-chapter AI history atlas into a continuous, bilingual learning path with durable local progress, progressive enhancement, clear chapter closure, tighter demo titles, and a mobile-first stepper order.

**Architecture:** Keep the ordered path and storage adapter as framework-independent TypeScript, keep all bilingual learning-path presentation copy in one i18n module, and render the experience through one static Astro position component plus two progressively enhanced Svelte islands. Existing page shells remain the integration boundary, so route files and teaching manifests do not duplicate state logic.

**Tech Stack:** Astro, Svelte, TypeScript, Vitest, Playwright, pnpm workspace, CSS custom properties from `apps/site/src/styles/tokens.css`.

## Global Constraints

- Work only in `/Users/frank/Projects/ai-time-machine/.worktrees/learning-path-closure` on `codex/learning-path-closure`; keep the primary checkout on `main`.
- Follow red-green-refactor for every behavior change: write the focused failing test, run it and inspect the expected failure, implement the minimum behavior, rerun the focused test, then commit.
- Preserve all existing chapter routes, stable SVG IDs, demo topology, teaching simplification notes, references, and static deployment.
- Do not add backend calls, accounts, API keys, database state, chapter locking, quizzes, badges, or a new visual system.
- Use the existing 8px radius and tokens from `apps/site/src/styles/tokens.css`; all new interactive controls must be at least 44px high.
- Keep complete server-rendered links for previous/next navigation. JavaScript may add persistence, but it must not be required to read or navigate the chapters.
- Use the shared key `ai-history-learning-progress` and schema version `1` for both locales. Never overwrite malformed or unknown-version storage during a read.
- A path is complete only when all 10 stable chapter IDs are complete. Completing `agent` alone must lead back to the first incomplete chapter, not show whole-path completion.
- Run Prettier only on files touched by the current task, not across the dirty workspace.
- Before claiming completion, run `pnpm validate:data`, `pnpm lint`, `pnpm build`, and `pnpm test`, and inspect their exit status and summaries.

---

### Task 1: Define the ordered path and bilingual presentation contract

**Files:**

- Create: `apps/site/src/learning/learningPath.ts`
- Create: `apps/site/src/learning/learningPath.test.ts`
- Create: `apps/site/src/i18n/learning.ts`
- Create: `apps/site/src/i18n/learning.test.ts`

- [ ] **Step 1: Write failing tests for the path contract**

Create `apps/site/src/learning/learningPath.test.ts` with assertions for the exact IDs, routes, types, order, uniqueness, previous/next boundaries, ID validation, and first-incomplete behavior:

```ts
import { describe, expect, it } from "vitest";
import {
  getFirstIncompleteChapter,
  getLearningPathContext,
  isLearningChapterId,
  learningPath,
} from "./learningPath";

const expected = [
  ["overview", "/chapters/overview/", "chapter"],
  ["search", "/chapters/search/", "demo"],
  ["expert-system", "/chapters/expert-system/", "demo"],
  ["bayes", "/chapters/bayes/", "demo"],
  ["decision-boundary", "/chapters/decision-boundary/", "demo"],
  ["cnn", "/chapters/cnn/", "demo"],
  ["attention", "/chapters/attention/", "demo"],
  ["llm-system", "/chapters/llm-system/", "chapter"],
  ["rag", "/chapters/rag/", "demo"],
  ["agent", "/chapters/agent/", "demo"],
] as const;

describe("learningPath", () => {
  it("keeps the release order as a stable product contract", () => {
    expect(learningPath.map(({ id, route, kind }) => [id, route, kind])).toEqual(
      expected,
    );
    expect(new Set(learningPath.map(({ id }) => id)).size).toBe(10);
    expect(new Set(learningPath.map(({ route }) => route)).size).toBe(10);
  });

  it("returns bounded previous and next chapters", () => {
    expect(getLearningPathContext("overview").previous).toBeUndefined();
    expect(getLearningPathContext("overview").next?.id).toBe("search");
    expect(getLearningPathContext("rag").previous?.id).toBe("llm-system");
    expect(getLearningPathContext("rag").next?.id).toBe("agent");
    expect(getLearningPathContext("agent").next).toBeUndefined();
  });

  it("finds the earliest gap regardless of completion order", () => {
    expect(getFirstIncompleteChapter([])?.id).toBe("overview");
    expect(getFirstIncompleteChapter(["overview", "expert-system"])?.id).toBe(
      "search",
    );
    expect(getFirstIncompleteChapter(learningPath.map(({ id }) => id))).toBeUndefined();
  });

  it("validates only known IDs", () => {
    expect(isLearningChapterId("rag")).toBe(true);
    expect(isLearningChapterId("future-model")).toBe(false);
    expect(isLearningChapterId(9)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the path test and verify it fails for the missing module**

Run:

```bash
pnpm --filter site exec vitest run src/learning/learningPath.test.ts
```

Expected: FAIL with an import-resolution error for `./learningPath`.

- [ ] **Step 3: Implement the framework-independent path module**

Create `apps/site/src/learning/learningPath.ts` around this public contract:

```ts
const definitions = [
  { id: "overview", route: "/chapters/overview/", kind: "chapter" },
  { id: "search", route: "/chapters/search/", kind: "demo" },
  { id: "expert-system", route: "/chapters/expert-system/", kind: "demo" },
  { id: "bayes", route: "/chapters/bayes/", kind: "demo" },
  {
    id: "decision-boundary",
    route: "/chapters/decision-boundary/",
    kind: "demo",
  },
  { id: "cnn", route: "/chapters/cnn/", kind: "demo" },
  { id: "attention", route: "/chapters/attention/", kind: "demo" },
  { id: "llm-system", route: "/chapters/llm-system/", kind: "chapter" },
  { id: "rag", route: "/chapters/rag/", kind: "demo" },
  { id: "agent", route: "/chapters/agent/", kind: "demo" },
] as const;

export type LearningChapterId = (typeof definitions)[number]["id"];
export type LearningChapterKind = (typeof definitions)[number]["kind"];

export interface LearningChapter {
  id: LearningChapterId;
  route: string;
  kind: LearningChapterKind;
}

export interface LearningPathContext {
  current: LearningChapter;
  position: number;
  total: number;
  previous?: LearningChapter;
  next?: LearningChapter;
}

export const learningPath: readonly LearningChapter[] = definitions;

export function isLearningChapterId(value: unknown): value is LearningChapterId;
export function getLearningPathContext(id: LearningChapterId): LearningPathContext;
export function getFirstIncompleteChapter(
  completedIds: readonly LearningChapterId[],
): LearningChapter | undefined;
export function isLearningPathComplete(
  completedIds: readonly LearningChapterId[],
): boolean;
```

Use a `Set` for ID validation and completion lookup. Throw from `getLearningPathContext` only for an impossible internal lookup, not for user storage.

- [ ] **Step 4: Run the path test and verify it passes**

Run:

```bash
pnpm --filter site exec vitest run src/learning/learningPath.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Write failing tests for localized titles, activity titles, and localized routes**

Create `apps/site/src/i18n/learning.test.ts`. Assert all 10 IDs have Chinese and English short titles; all eight `kind: "demo"` entries have an activity title; `overview` and `llm-system` do not; English paths gain `/en`; and dynamic labels interpolate the title/count:

```ts
import { describe, expect, it } from "vitest";
import { learningPath } from "../learning/learningPath";
import {
  getLocalizedLearningChapter,
  learningUiCopy,
} from "./learning";

describe("learning i18n", () => {
  it("localizes every chapter without changing stable IDs", () => {
    for (const chapter of learningPath) {
      const zh = getLocalizedLearningChapter(chapter.id, "zh-CN");
      const en = getLocalizedLearningChapter(chapter.id, "en");
      expect(zh.id).toBe(chapter.id);
      expect(en.id).toBe(chapter.id);
      expect(zh.title.length).toBeGreaterThan(0);
      expect(en.title.length).toBeGreaterThan(0);
      expect(zh.href).toBe(chapter.route);
      expect(en.href).toBe(`/en${chapter.route}`);
    }
  });

  it("provides short activity titles only for demo chapters", () => {
    for (const chapter of learningPath) {
      const localized = getLocalizedLearningChapter(chapter.id, "en");
      expect(Boolean(localized.activityTitle)).toBe(chapter.kind === "demo");
    }
    expect(getLocalizedLearningChapter("rag", "zh-CN").activityTitle).toBe(
      "RAG 流程演示",
    );
    expect(getLocalizedLearningChapter("rag", "en").activityTitle).toBe(
      "RAG Pipeline Walkthrough",
    );
  });

  it("formats dynamic progress copy", () => {
    expect(learningUiCopy["zh-CN"].completedCount(3, 10)).toBe("已完成 3 / 10");
    expect(learningUiCopy.en.continueLearning("Search Trees")).toBe(
      "Continue: Search Trees",
    );
  });
});
```

- [ ] **Step 6: Run the i18n test and verify it fails**

Run:

```bash
pnpm --filter site exec vitest run src/i18n/learning.test.ts
```

Expected: FAIL with an import-resolution error for `./learning`.

- [ ] **Step 7: Implement the centralized learning copy**

Create `apps/site/src/i18n/learning.ts` with:

- 10 bilingual short chapter titles keyed by `LearningChapterId`.
- Eight bilingual activity titles: 搜索树逐步探索 / Search Tree Walkthrough, 专家系统推理演示 / Expert System Inference, 贝叶斯更新实验 / Bayesian Update Lab, 决策边界探索 / Decision Boundary Explorer, CNN 卷积核实验 / CNN Kernel Explorer, 注意力热图探索 / Attention Map Explorer, RAG 流程演示 / RAG Pipeline Walkthrough, Agent 循环演示 / Agent Loop Walkthrough.
- UI labels for position, start, completed count, continue, current-complete, complete-and-continue, previous/next, first-incomplete, path-complete, reset/confirm/cancel, storage warning, no-save continuation, timeline/lineage/diagrams review, and browse-all-chapters.
- A localized view model that always derives `href` through `toLocalizedPath`:

```ts
export interface LocalizedLearningChapter {
  id: LearningChapterId;
  kind: LearningChapterKind;
  title: string;
  href: string;
  activityTitle?: string;
}

export function getLocalizedLearningChapter(
  id: LearningChapterId,
  locale: Locale,
): LocalizedLearningChapter;
```

Keep dynamic sentence construction in functions such as `positionLabel(position, total)`, `positionAriaLabel(position, total)`, `completedCount(completed, total)`, `continueLearning(title)`, `previousChapter(title)`, and `nextChapter(title)` so components do not splice localized fragments.

- [ ] **Step 8: Run both focused tests and commit**

Run:

```bash
pnpm --filter site exec vitest run src/learning/learningPath.test.ts src/i18n/learning.test.ts
pnpm exec prettier --write apps/site/src/learning/learningPath.ts apps/site/src/learning/learningPath.test.ts apps/site/src/i18n/learning.ts apps/site/src/i18n/learning.test.ts
git add apps/site/src/learning/learningPath.ts apps/site/src/learning/learningPath.test.ts apps/site/src/i18n/learning.ts apps/site/src/i18n/learning.test.ts
git commit -m "Define learning path contract"
```

Expected: PASS, 7 tests; commit succeeds.

---

### Task 2: Add the defensive local progress adapter

**Files:**

- Create: `apps/site/src/learning/learningProgress.ts`
- Create: `apps/site/src/learning/learningProgress.test.ts`

- [ ] **Step 1: Write failing normalization, read, write, and reset tests**

Create a small in-memory `StorageLike` fake in `apps/site/src/learning/learningProgress.test.ts`. Cover:

- `null`, malformed JSON, arrays, unknown versions, and invalid field shapes return empty v1 progress.
- Valid v1 data filters unknown IDs, non-strings, and duplicates while preserving learning-path order.
- A read failure returns `{ storageAvailable: false }` without throwing or writing.
- Completing a chapter is idempotent and writes normalized v1 JSON.
- A write failure returns `{ persisted: false, storageAvailable: false }` without claiming completion.
- Reset uses `removeItem`; a reset failure preserves the prior snapshot.

Use this public contract in the tests:

```ts
export const learningProgressStorageKey = "ai-history-learning-progress";
export const learningProgressChangedEventName =
  "ai-history:learning-progress-changed";

export interface LearningProgress {
  version: 1;
  completedChapterIds: LearningChapterId[];
}

export interface LearningProgressSnapshot {
  progress: LearningProgress;
  storageAvailable: boolean;
}

export interface LearningProgressWriteResult extends LearningProgressSnapshot {
  persisted: boolean;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createEmptyLearningProgress(): LearningProgress;
export function parseLearningProgress(raw: string | null): LearningProgress;
export function readLearningProgress(
  storage?: StorageLike | null,
): LearningProgressSnapshot;
export function completeLearningChapter(
  id: LearningChapterId,
  storage?: StorageLike | null,
): LearningProgressWriteResult;
export function resetLearningProgress(
  storage?: StorageLike | null,
): LearningProgressWriteResult;
```

- [ ] **Step 2: Run the adapter test and verify it fails**

Run:

```bash
pnpm --filter site exec vitest run src/learning/learningProgress.test.ts
```

Expected: FAIL with an import-resolution error for `./learningProgress`.

- [ ] **Step 3: Implement safe parsing and browser storage resolution**

Create `apps/site/src/learning/learningProgress.ts`. The default storage resolver must use `typeof window !== "undefined"` and catch access to `window.localStorage`; it must never probe by writing. `parseLearningProgress` must return a new object and sort retained IDs by `learningPath`, not by the untrusted stored array.

For writes:

1. Read the current normalized snapshot.
2. If reading is unavailable, return the current empty snapshot with `persisted: false`.
3. Build the next normalized value.
4. Call `setItem` or `removeItem` in `try/catch`.
5. On failure, return the pre-write snapshot with `persisted: false` and `storageAvailable: false`.

Also export browser-only helpers used by both islands:

```ts
export function dispatchLearningProgressChanged(
  progress: LearningProgress,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(learningProgressChangedEventName, { detail: progress }),
  );
}
```

Do not dispatch from the adapter's pure write functions; dispatch only after a component confirms `persisted: true`.

- [ ] **Step 4: Run focused unit coverage and commit**

Run:

```bash
pnpm --filter site exec vitest run src/learning/learningProgress.test.ts src/learning/learningPath.test.ts
pnpm exec prettier --write apps/site/src/learning/learningProgress.ts apps/site/src/learning/learningProgress.test.ts
git add apps/site/src/learning/learningProgress.ts apps/site/src/learning/learningProgress.test.ts
git commit -m "Add learning progress adapter"
```

Expected: all focused tests pass; commit succeeds.

---

### Task 3: Add static chapter position and progressively enhanced chapter closure

**Files:**

- Create: `apps/site/src/components/learning/ChapterProgress.astro`
- Create: `apps/site/src/components/learning/ChapterJourney.svelte`
- Create: `apps/site/tests/learning-path.spec.ts`
- Modify: `apps/site/src/components/pages/StandardDemoChapter.astro`
- Modify: `apps/site/src/components/pages/OverviewChapter.astro`
- Modify: `apps/site/src/components/pages/LlmSystemChapter.astro`
- Modify: `apps/site/src/styles/tokens.css`

- [ ] **Step 1: Write failing browser tests for all 10 chapter shells**

Create `apps/site/tests/learning-path.spec.ts` with the exact route order from Task 1. For each Chinese route, assert:

- `[data-testid="chapter-progress"]` shows `第 n / 10 章` and contains `<progress value="n" max="10">` with the localized accessible name.
- The previous link is absent only for `overview`; otherwise it points to the prior route.
- The next/completion anchor is present for chapters 1–9 and points to the following route.
- The Agent page exposes the previous link, a final completion control, and static timeline/lineage/diagrams review links.

Add a no-JavaScript test using a fresh context:

```ts
test("keeps chapter navigation usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/chapters/rag/");
  await expect(
    page.getByTestId("chapter-journey").getByRole("link", {
      name: /Agent/,
    }),
  ).toHaveAttribute("href", "/chapters/agent/");
  await context.close();
});
```

- [ ] **Step 2: Run the new browser file and verify the first missing-selector failure**

Run:

```bash
pnpm --filter site exec playwright test tests/learning-path.spec.ts
```

Expected: FAIL because `chapter-progress` and `chapter-journey` are absent.

- [ ] **Step 3: Implement `ChapterProgress.astro`**

Props:

```ts
interface Props {
  locale: Locale;
  chapterId: LearningChapterId;
}
```

Derive `position`, `total`, and localized copy internally. Render a compact `<aside data-testid="chapter-progress">` containing visible position text and a semantic `<progress value={position} max={total}>`. Style it with existing green, line, muted, and surface tokens; do not introduce a card shadow or a new radius.

- [ ] **Step 4: Implement `ChapterJourney.svelte` with static links as its SSR baseline**

Props:

```ts
export let locale: Locale;
export let chapterId: LearningChapterId;
```

The component must:

- Derive localized previous, next, first-incomplete, and review links from the central modules.
- Initialize to empty progress so SSR always emits the static previous/next path.
- Read storage in `onMount`, and subscribe to both `learningProgressChangedEventName` and the native `storage` event.
- Use a real anchor for chapters 1–9. Its click handler writes completion, dispatches the custom event on success, and allows native navigation.
- On an unexpected write failure, call `preventDefault()` once, show the polite warning, and switch the same CTA to a plain no-save link so the second click navigates.
- Use a button on the final chapter. On success, show whole-path completion only if `isLearningPathComplete` is true; otherwise show current-chapter completion and a link to `getFirstIncompleteChapter`.
- Keep review links visible on the final chapter even without JavaScript.
- Focus the final completion heading only after a successful user-triggered completion, using `bind:this` and `tabindex="-1"`.

Use `data-testid="chapter-journey"`, `data-testid="complete-and-continue"`, and `data-testid="storage-warning"` as stable browser hooks. Status and warning containers use `aria-live="polite"`.

- [ ] **Step 5: Integrate once per page shell**

In each page shell, import both learning components and pass a stable ID:

- `StandardDemoChapter.astro`: use its existing `chapterId` prop.
- `OverviewChapter.astro`: pass `chapterId="overview"`.
- `LlmSystemChapter.astro`: pass `chapterId="llm-system"`.

Render `ChapterProgress` at the beginning of `<main class="chapter-main">`. Render `<ChapterJourney client:load>` after the references/simplification content. Remove the old Overview bottom action pair and the old LLM System RAG/Agent action pair so there is one authoritative closure area.

- [ ] **Step 6: Add shared chapter journey styles**

Modify `apps/site/src/styles/tokens.css` with `.chapter-progress`, `.chapter-position-bar`, `.chapter-journey`, `.chapter-journey-status`, `.chapter-journey-links`, `.learning-warning`, and `.review-links`. Reuse `.button` for anchors and add a `.button.subtle` variant only if needed for reset/review hierarchy. Ensure all anchor/button targets remain 44px high at desktop and mobile.

- [ ] **Step 7: Run chapter tests, unit tests, lint, and commit**

Run:

```bash
pnpm --filter site exec playwright test tests/learning-path.spec.ts
pnpm --filter site test:unit
pnpm --filter site lint
pnpm exec prettier --write apps/site/src/components/learning/ChapterProgress.astro apps/site/src/components/learning/ChapterJourney.svelte apps/site/src/components/pages/StandardDemoChapter.astro apps/site/src/components/pages/OverviewChapter.astro apps/site/src/components/pages/LlmSystemChapter.astro apps/site/src/styles/tokens.css apps/site/tests/learning-path.spec.ts
git add apps/site/src/components/learning/ChapterProgress.astro apps/site/src/components/learning/ChapterJourney.svelte apps/site/src/components/pages/StandardDemoChapter.astro apps/site/src/components/pages/OverviewChapter.astro apps/site/src/components/pages/LlmSystemChapter.astro apps/site/src/styles/tokens.css apps/site/tests/learning-path.spec.ts
git commit -m "Add chapter learning journey"
```

Expected: focused browser tests, site unit tests, and Astro checks pass; commit succeeds.

---

### Task 4: Make the homepage start, continue, complete, and reset the path

**Files:**

- Create: `apps/site/src/components/learning/HomeLearningProgress.svelte`
- Modify: `apps/site/src/components/pages/HomePage.astro`
- Modify: `apps/site/src/styles/tokens.css`
- Modify: `apps/site/tests/learning-path.spec.ts`

- [ ] **Step 1: Add failing homepage state and persistence tests**

Extend `apps/site/tests/learning-path.spec.ts` with deterministic helpers that set storage through `page.addInitScript` before navigation. Cover:

1. Empty storage: primary link says “从总览开始” and targets `/chapters/overview/`.
2. Partial, out-of-order storage containing `overview` and `expert-system`: progress says `已完成 2 / 10`, and the primary link continues to `/chapters/search/`.
3. All 10 IDs: path-complete status and timeline, lineage, and diagrams links are visible.
4. Reset opens inline confirmation; cancel preserves state; confirm removes storage and returns to the start state.
5. Completing Overview through its CTA survives reload and makes Search the home continuation.
6. Completing a Chinese chapter then opening `/en/` shows the same count and an English continuation to `/en/chapters/search/`.
7. Completing only Agent never shows whole-path completion and links to Overview as the first gap.

Run:

```bash
pnpm --filter site exec playwright test tests/learning-path.spec.ts --grep "home|persist|locale|Agent"
```

Expected: FAIL because the home hero still has only static actions.

- [ ] **Step 2: Implement `HomeLearningProgress.svelte`**

Props:

```ts
export let locale: Locale;
```

Behavior:

- SSR/initial state renders the existing start link and a secondary browse-all link to `#mvp`.
- `onMount` reads the adapter, then chooses empty, partial, or complete presentation.
- Partial state uses `getFirstIncompleteChapter` and displays the localized completed count.
- Complete state renders the three review destinations through `toLocalizedPath`.
- Reset is a low-emphasis button. First click reveals inline confirm/cancel controls; cancel only closes them; confirm calls the adapter, dispatches the custom event on success, and returns the island to empty state.
- Subscribe to the same custom and native storage events as `ChapterJourney`.
- Storage failures show the shared polite warning and keep all ordinary navigation available.

Use a fixed/minimum block size on `.home-learning-progress` so hydration from start to partial/complete does not visibly shift the hero.

- [ ] **Step 3: Replace only the hero action block**

In `apps/site/src/components/pages/HomePage.astro`, import `HomeLearningProgress` and replace the current hero `<div class="actions">` with:

```astro
<HomeLearningProgress locale={locale} client:load />
```

Keep the learning-path card section, map, and all existing content intact.

- [ ] **Step 4: Add read/write failure browser tests**

Extend the spec with two cases:

- Patch `Storage.prototype.getItem` to throw before page load; assert the warning is visible and a normal chapter link remains usable.
- Patch `Storage.prototype.setItem` to throw; on a non-final chapter, assert the first click stays on the page and reveals the warning, then the second click follows the real next-chapter `href`.

Run the focused failure tests before implementation changes and confirm the first one fails on the missing warning.

- [ ] **Step 5: Run focused behavior tests, lint, and commit**

Run:

```bash
pnpm --filter site exec playwright test tests/learning-path.spec.ts
pnpm --filter site lint
pnpm exec prettier --write apps/site/src/components/learning/HomeLearningProgress.svelte apps/site/src/components/pages/HomePage.astro apps/site/src/styles/tokens.css apps/site/tests/learning-path.spec.ts
git add apps/site/src/components/learning/HomeLearningProgress.svelte apps/site/src/components/pages/HomePage.astro apps/site/src/styles/tokens.css apps/site/tests/learning-path.spec.ts
git commit -m "Add resumable home learning progress"
```

Expected: all learning-path browser tests and Astro checks pass; commit succeeds.

---

### Task 5: Shorten demo activity headings and put the mobile scene first

**Files:**

- Modify: `apps/site/src/demos/search-tree/SearchTreeDemo.svelte`
- Modify: `apps/site/src/demos/expert-system/ExpertSystemDemo.svelte`
- Modify: `apps/site/src/demos/bayes-update/BayesUpdateDemo.svelte`
- Modify: `apps/site/src/demos/decision-boundary/DecisionBoundaryDemo.svelte`
- Modify: `apps/site/src/demos/cnn-kernel/CnnKernelDemo.svelte`
- Modify: `apps/site/src/demos/attention-map/AttentionMapDemo.svelte`
- Modify: `apps/site/src/demos/rag-pipeline/RagPipelineDemo.svelte`
- Modify: `apps/site/src/demos/agent-loop/AgentLoopDemo.svelte`
- Modify: `packages/demo-core/src/StepperDemo.svelte`
- Modify: `apps/site/tests/rag-pipeline.spec.ts`
- Modify: `apps/site/tests/i18n.spec.ts`

- [ ] **Step 1: Add failing short-heading assertions**

In the existing Chinese RAG test, assert the DemoShell H2 is `RAG 流程演示`; in the English RAG test, assert it is `RAG Pipeline Walkthrough`. Add one table-driven browser test across all eight chapter routes/locales to ensure each short activity title is the region's level-two heading while the full pedagogical question remains the page H1.

Run:

```bash
pnpm --filter site exec playwright test tests/rag-pipeline.spec.ts tests/i18n.spec.ts --grep "activity title|RAG chapter|English RAG"
```

Expected: FAIL because DemoShell still receives each manifest's long `title`.

- [ ] **Step 2: Feed localized activity titles to all eight demos**

In each demo component, import `getLocalizedLearningChapter` from `../../i18n/learning`, derive the matching chapter's `activityTitle` from the existing `locale` prop, and pass it to `DemoShell`:

```svelte
<script lang="ts">
  import { getLocalizedLearningChapter } from "../../i18n/learning";

  $: activityTitle = getLocalizedLearningChapter("rag", locale).activityTitle;
</script>

<DemoShell title={activityTitle ?? ragPipelineDemo.title}>
</DemoShell>
```

Use the corresponding stable ID in each file. Keep the manifest's question, goals, notes, scenarios, and graph data unchanged. Retain the manifest title only as the type-safe fallback shown above.

- [ ] **Step 3: Rewrite the existing mobile-order test before changing CSS**

Rename `shows stepper instructions and controls before mobile diagrams` to `shows the mobile diagram before its explanation and controls`. For each stepper route at 375×667 and 390×844:

- Scroll `.stepper` to `{ block: "start" }`, not the entire `.demo-shell`.
- Read bounding boxes for `.step-scene`, `.step-content h3`, and the enabled next button.
- Assert `scene.top < heading.top < control.top`.
- At 390×844, assert the scene, current heading, and next control all intersect the viewport.

Run:

```bash
pnpm --filter site exec playwright test tests/rag-pipeline.spec.ts --grep "mobile diagram"
```

Expected: FAIL because current mobile grid areas are content, controls, scene.

- [ ] **Step 4: Change only the mobile Stepper grid order**

In `packages/demo-core/src/StepperDemo.svelte`, change the `max-width: 900px` declaration to:

```css
.stepper {
  grid-template-areas:
    "scene"
    "content"
    "controls";
  grid-template-columns: 1fr;
}
```

Do not alter desktop areas, state functions, button behavior, slots, SVG IDs, or motion.

- [ ] **Step 5: Run focused tests, package tests, lint, and commit**

Run:

```bash
pnpm --filter site exec playwright test tests/rag-pipeline.spec.ts tests/i18n.spec.ts
pnpm --filter @ai-history/demo-core test
pnpm --filter site lint
pnpm exec prettier --write apps/site/src/demos/search-tree/SearchTreeDemo.svelte apps/site/src/demos/expert-system/ExpertSystemDemo.svelte apps/site/src/demos/bayes-update/BayesUpdateDemo.svelte apps/site/src/demos/decision-boundary/DecisionBoundaryDemo.svelte apps/site/src/demos/cnn-kernel/CnnKernelDemo.svelte apps/site/src/demos/attention-map/AttentionMapDemo.svelte apps/site/src/demos/rag-pipeline/RagPipelineDemo.svelte apps/site/src/demos/agent-loop/AgentLoopDemo.svelte packages/demo-core/src/StepperDemo.svelte apps/site/tests/rag-pipeline.spec.ts apps/site/tests/i18n.spec.ts
git add apps/site/src/demos/search-tree/SearchTreeDemo.svelte apps/site/src/demos/expert-system/ExpertSystemDemo.svelte apps/site/src/demos/bayes-update/BayesUpdateDemo.svelte apps/site/src/demos/decision-boundary/DecisionBoundaryDemo.svelte apps/site/src/demos/cnn-kernel/CnnKernelDemo.svelte apps/site/src/demos/attention-map/AttentionMapDemo.svelte apps/site/src/demos/rag-pipeline/RagPipelineDemo.svelte apps/site/src/demos/agent-loop/AgentLoopDemo.svelte packages/demo-core/src/StepperDemo.svelte apps/site/tests/rag-pipeline.spec.ts apps/site/tests/i18n.spec.ts
git commit -m "Polish demo headings and mobile flow"
```

Expected: both browser files, demo-core unit tests, and Astro checks pass; commit succeeds.

---

### Task 6: Remove internal Overview acceptance copy

**Files:**

- Modify: `apps/site/src/components/pages/OverviewChapter.astro`
- Modify: `apps/site/src/i18n/pages.ts`
- Modify: `apps/site/tests/rag-pipeline.spec.ts`

- [ ] **Step 1: Replace the obsolete positive assertion with a failing absence test**

Update `Overview MDX chapter renders the chapter-zero narrative` to assert that Chinese and English pages do not contain `Technical Closure`, `MDX 章节可渲染`, `The MDX Chapter Renders`, or the Astro/MDX verification sentence. Preserve positive assertions for the H1, historical spine, reading guidance, simplification, and references.

Run:

```bash
pnpm --filter site exec playwright test tests/rag-pipeline.spec.ts --grep "Overview"
```

Expected: FAIL because the internal section still renders.

- [ ] **Step 2: Remove the section and dead copy fields**

Delete the `aria-labelledby="mdx-proof"` section from `OverviewChapter.astro`. Remove `closureEyebrow`, `closureHeading`, and `closureBody` in both locales from `overviewChapterCopy`. Do not replace the section with promotional content and do not remove the historical spine, reading, simplification, or reference sections.

- [ ] **Step 3: Run focused regression, lint, and commit**

Run:

```bash
pnpm --filter site exec playwright test tests/rag-pipeline.spec.ts --grep "Overview"
pnpm --filter site lint
pnpm exec prettier --write apps/site/src/components/pages/OverviewChapter.astro apps/site/src/i18n/pages.ts apps/site/tests/rag-pipeline.spec.ts
git add apps/site/src/components/pages/OverviewChapter.astro apps/site/src/i18n/pages.ts apps/site/tests/rag-pipeline.spec.ts
git commit -m "Remove overview prototype copy"
```

Expected: focused browser regression and Astro checks pass; commit succeeds.

---

### Task 7: Add deterministic mobile screenshot coverage

**Files:**

- Create: `apps/site/tests/learning-path-visual.spec.ts`
- Create: `apps/site/tests/learning-path-visual.spec.ts-snapshots/home-partial-progress.png`
- Create: `apps/site/tests/learning-path-visual.spec.ts-snapshots/rag-mobile-step.png`
- Modify: `apps/site/playwright.config.ts`

- [ ] **Step 1: Make snapshot paths platform-independent**

Add this top-level option to `apps/site/playwright.config.ts`:

```ts
snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
```

This keeps the two committed filenames stable across local macOS and Linux CI.

- [ ] **Step 2: Write the two screenshot tests**

Create `apps/site/tests/learning-path-visual.spec.ts` with a 390×844 viewport and reduced motion. For `home-partial-progress.png`, inject v1 storage containing `overview` and `expert-system`, open `/`, wait for `已完成 2 / 10`, and capture the hero. For `rag-mobile-step.png`, open `/chapters/rag/`, wait for the demo, scroll `.stepper` to the top of the viewport, and capture the viewport containing the scene, current explanation, and enabled next control.

Use:

```ts
await expect(page).toHaveScreenshot("home-partial-progress.png", {
  animations: "disabled",
});
```

and the same options for `rag-mobile-step.png`. Do not hide product UI or use loose pixel-difference thresholds to mask instability.

- [ ] **Step 3: Run without baselines and verify the expected snapshot failure**

Run:

```bash
pnpm --filter site exec playwright test tests/learning-path-visual.spec.ts
```

Expected: FAIL because the two approved baseline files do not exist; Playwright writes actual images for inspection.

- [ ] **Step 4: Generate baselines, inspect them, and rerun**

Run:

```bash
pnpm --filter site exec playwright test tests/learning-path-visual.spec.ts --update-snapshots
```

Open both generated PNGs and verify:

- The home hero has no clipped text, overlap, unexpected layout jump, or non-token styling.
- The RAG viewport visibly contains the diagram before the step heading and at least one usable next control.
- Borders remain 8px, spacing follows the existing page rhythm, and 44px controls are not cropped.

Then run:

```bash
pnpm --filter site exec playwright test tests/learning-path-visual.spec.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Format, stage exact baselines, and commit**

Run:

```bash
pnpm exec prettier --write apps/site/playwright.config.ts apps/site/tests/learning-path-visual.spec.ts
git add apps/site/playwright.config.ts apps/site/tests/learning-path-visual.spec.ts apps/site/tests/learning-path-visual.spec.ts-snapshots/home-partial-progress.png apps/site/tests/learning-path-visual.spec.ts-snapshots/rag-mobile-step.png
git commit -m "Add learning path visual regression"
```

Expected: commit succeeds with exactly two new PNG baselines.

---

### Task 8: Run release verification and prepare the pull request

**Files:**

- Modify only if verification exposes a regression in a file already listed above.

- [ ] **Step 1: Confirm the branch diff matches the approved scope**

Run:

```bash
git status --short
git diff --stat main...HEAD
git diff --check main...HEAD
git log --oneline --decorate main..HEAD
```

Expected: no whitespace errors, no secrets/config files, no unrelated route or data-topology changes, and only the design/plan plus Tasks 1–7 commits.

- [ ] **Step 2: Run all repository quality gates from the worktree root**

Run each command separately and inspect the complete result:

```bash
pnpm validate:data
pnpm lint
pnpm build
pnpm test
```

Expected:

- Data TypeScript validation exits 0.
- Astro and package TypeScript checks exit 0.
- Static build exits 0 and preserves all Chinese and English routes.
- Vitest package/site suites and the complete Playwright suite, including the two visual tests, exit 0.

- [ ] **Step 3: Inspect the two final product states at release viewports**

Start the built preview with `pnpm --filter site preview --host 127.0.0.1`, then inspect at minimum:

- `/` at 390×844 with partial progress.
- `/chapters/rag/` at 390×844 at the initial step.
- `/chapters/agent/` at desktop width before and after full completion.
- `/en/` after completing a Chinese chapter.

Check focus visibility, 44px targets, no clipping/overflow, correct bilingual links, true whole-path completion, and the storage warning fallback. Stop the preview after inspection.

- [ ] **Step 4: Fix only evidence-backed regressions and rerun the affected gate plus the full gate**

For any failure, first add or tighten the reproducing test, make the smallest correction, rerun the focused command, then rerun all four quality gates. Commit a concise imperative fix such as:

```bash
git add apps/site/src/components/learning/ChapterJourney.svelte apps/site/tests/learning-path.spec.ts
git commit -m "Fix learning path regression"
```

The shown paths are the concrete example for a chapter-journey regression. If a different verified regression occurs, stage only its actual implementation and reproducing test files.

- [ ] **Step 5: Push the feature branch and open a pull request**

After all gates are green and the worktree is clean:

```bash
git push -u origin codex/learning-path-closure
gh pr create --base main --head codex/learning-path-closure --title "Add continuous learning path" --body-file /tmp/ai-time-machine-learning-path-pr.md
```

Create `/tmp/ai-time-machine-learning-path-pr.md` with `apply_patch` and include:

- Summary: shared 10-chapter progress, chapter closure, homepage resume/reset, short demo headings, mobile scene-first order, and Overview cleanup.
- Verification: `pnpm validate:data`, `pnpm lint`, `pnpm build`, `pnpm test`.
- Teaching simplifications: completion is explicit and local-only; no quiz, lock, account, or cloud sync.
- Visual evidence: attach the 390px partial-home and RAG initial-step screenshots to the PR.
- Linked task/issue if one exists; otherwise explicitly state that this continues the approved learning-path iteration.

Expected: remote branch exists and a pull request URL is returned. Do not merge from this task.
