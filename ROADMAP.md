# Roadmap

This roadmap tracks the first version described in `docs/interactive_ai_history_codex_handoff.md`.

## v1.1 Complete Surface

- Static Astro site with MDX chapter support.
- Svelte demo islands and shared demo shell/stepper/SVG scene primitives.
- Chapter spine: overview, search, expert systems, Bayes, decision boundary, CNN, Attention, LLM systems, RAG, Agent, and Safety / Eval.
- Nine teaching demos with simplification notes, references, and Playwright smoke coverage.
- Complete Chinese and English routes with resumable local learning progress,
  chapter completion, and previous/next navigation.
- Timeline, lineage map, and a manifest-driven diagram library with SVG and PNG assets for all nine demos.
- Twenty-two source-backed milestone events linked to the chapter and lineage models.
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
- **v1.2 — Implementation complete, observation pending — Historical depth and
  learning validation:** source-backed milestone events, lightweight concept
  checks, and privacy-reviewed in-page product signals are implemented. Client
  collection remains disabled and deployment policy blocks automatic RUM until
  a provider and real aggregate-data access pass the privacy gate.

Each milestone must keep the static, scripted teaching boundary and pass the
format, data, type, build, unit, browser, visual, accessibility, and teaching
correctness gates defined in the process document.

## Real-Usage Evidence Gate

The next adjustment cycle must use an approved observation window and genuine
aggregate learner traffic. CI, Playwright, preview checks, production smoke, and
developer interactions are excluded from product metrics. See
[`docs/P2_HISTORY_LEARNING_PRIVACY_BRIEF.md`](docs/P2_HISTORY_LEARNING_PRIVACY_BRIEF.md)
for the provider gate, event allowlist, and fact-check record.

## Non-Goals For MVP

- No real model inference, training, vector database, backend service, user system, or API-key workflow.
- No WebGL or Three.js as a primary implementation path.
