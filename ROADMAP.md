# Roadmap

This roadmap tracks the first version described in `docs/interactive_ai_history_codex_handoff.md`.

## Current Surface

The v1.5 implementation described below is complete on its feature branch and
awaits review, preview checks, merge, and production smoke before it is called
published.

- Static Astro site with MDX chapter support.
- Svelte demo islands and shared demo shell/stepper/SVG scene primitives.
- Chapter spine: overview, search, expert systems, Bayes, decision boundary, CNN, feedback learning, Attention, foundation-model lifecycle, LLM systems, RAG, Agent, and Safety / Eval.
- Twelve teaching demos with simplification notes, references, and Playwright smoke coverage.
- Complete Chinese and English routes with resumable local learning progress,
  chapter completion, and previous/next navigation.
- Timeline and lineage views with shareable causal filters/focus and one curated feedback-learning story, plus a manifest-driven diagram library with SVG and PNG assets for all twelve demos.
- Twenty-seven source-backed milestone events linked to the chapter and lineage models.
- One bilingual, non-blocking concept check per chapter with clearable local records.
- Public privacy documentation and a typed in-page signal allowlist with client
  collection disabled, automatic RUM blocked, and hosting-layer edge metrics
  excluded from learning evidence.
- Cloudflare Pages production and pull-request previews backed by formatting,
  type, data, build, unit, browser, visual, accessibility, and teaching
  correctness checks.

## Post-MVP Iterations

The bilingual MVP and learning-path foundation are complete. Post-MVP work now
follows the staged process in
[Post-MVP iteration process](docs/POST_MVP_ITERATION_PROCESS.md):

- **v1.0.1 — Complete — Release closure and extension architecture:** align contributor
  docs, add publishing metadata and deployment guidance, split chapter-owned
  content, and derive more navigation and test coverage from the chapter
  registry.
- **v1.1 — Complete — Safety / Evaluation and diagram assets:** add the next teaching
  chapter and turn the diagram page into a reusable asset library covering all
  demos.
- **v1.2 — P2-01 through P2-04 complete; P2-05 paused — Historical depth and
  learning validation:** source-backed milestone events, lightweight concept
  checks, privacy-reviewed in-page product signals, and a provider-neutral
  aggregate analyzer are implemented. On 2026-07-28, the project owner declined
  Plausible Hosted because the required learning-metrics features need a paid
  plan; Draft PR #26 was closed without merging. No hosted analytics provider is
  approved or scheduled. Client collection remains disabled, and deployment
  policy continues to block browser analytics and RUM.
- **v1.3 — Complete — Interactive LLM system boundaries:** the release
  upgrades the static LLM systems chapter into a bilingual, two-scenario
  scripted demo. Learners compare a retrieval-backed policy answer with a
  memory-and-tool action path, while the diagram library gains its tenth asset
  pair. See
  [the v1.3 interaction brief](docs/V1_3_LLM_SYSTEM_INTERACTION_BRIEF.md).
- **v1.4 — Complete — Causal atlas and foundation-model lifecycle:** close
  v1.3 release evidence, add shareable timeline/lineage navigation, and teach
  the boundary between pretraining, post-training, and runtime context with a
  new bilingual chapter and eleventh diagram pair. See
  [the v1.4 teaching brief](docs/V1_4_CAUSAL_ATLAS_FOUNDATION_BRIEF.md).
- **v1.5 — Implementation complete; awaiting review and release — Feedback learning and a guided causal path:** adds a
  bilingual reinforcement-learning chapter that separates supervised targets,
  rewards, preference feedback, and runtime observations, then connects the
  existing history through one curated, shareable feedback-learning story. See
  [the v1.5 teaching brief](docs/V1_5_FEEDBACK_LEARNING_BRIEF.md).

Each milestone must keep the static, scripted teaching boundary and pass the
format, data, type, build, unit, browser, visual, accessibility, and teaching
correctness gates defined in the process document.

## Real-Usage Evidence Gate

Any future metrics-driven adjustment cycle must use an approved observation
window and genuine aggregate learner traffic. CI, Playwright, preview checks,
production smoke, and developer interactions are excluded from product metrics;
Cloudflare Web Analytics and simulated exports are not substitutes. The
provider-neutral analyzer and typed local `CustomEvent` contract remain
available without sending data over the network. Any future hosted-provider
proposal requires a separate privacy, cost, implementation, and
production-release approval. See
[`docs/P2_HISTORY_LEARNING_PRIVACY_BRIEF.md`](docs/P2_HISTORY_LEARNING_PRIVACY_BRIEF.md)
for the provider gate, event allowlist, and fact-check record.

## Non-Goals For MVP

- No real model inference, training, vector database, backend service, user system, or API-key workflow.
- No WebGL or Three.js as a primary implementation path.
