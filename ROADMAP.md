# Roadmap

This roadmap tracks the first version described in `docs/interactive_ai_history_codex_handoff.md`.

## MVP Complete Surface

- Static Astro site with MDX chapter support.
- Svelte demo islands and shared demo shell/stepper/SVG scene primitives.
- Chapter spine: overview, search, expert systems, Bayes, decision boundary, CNN, Attention, LLM systems, RAG, and Agent.
- Eight teaching demos with simplification notes, references, and Playwright smoke coverage.
- Complete Chinese and English routes with resumable local learning progress,
  chapter completion, and previous/next navigation.
- Timeline, lineage map, diagram source page, reusable RAG SVG, and contributor guides.
- Cloudflare Pages production and pull-request previews backed by formatting,
  type, data, build, unit, browser, visual, accessibility, and teaching
  correctness checks.

## Post-MVP Iterations

The bilingual MVP and learning-path foundation are complete. Post-MVP work now
follows the staged process in
[Post-MVP iteration process](docs/POST_MVP_ITERATION_PROCESS.md):

- **v1.0.1 — Release closure and extension architecture:** align contributor
  docs, add publishing metadata and deployment guidance, split chapter-owned
  content, and derive more navigation and test coverage from the chapter
  registry.
- **v1.1 — Safety / Evaluation and diagram assets:** add the next teaching
  chapter and turn the diagram page into a reusable asset library covering all
  demos.
- **v1.2 — Historical depth and learning validation:** add source-backed
  milestone events, lightweight concept checks, and privacy-reviewed product
  signals.

Each milestone must keep the static, scripted teaching boundary and pass the
format, data, type, build, unit, browser, visual, accessibility, and teaching
correctness gates defined in the process document.

## Non-Goals For MVP

- No real model inference, training, vector database, backend service, user system, or API-key workflow.
- No WebGL or Three.js as a primary implementation path.
