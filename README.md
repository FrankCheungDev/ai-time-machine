# Interactive AI History

An interactive atlas for explaining how AI evolved from symbolic search and expert systems to statistical learning, deep learning, LLM systems, RAG, and agents.

The project is an explorable explanation, not a real AI training or inference platform. Demos are scripted, precomputed, or illustrative so learners can focus on mechanism intuition without API keys, backend services, GPUs, or databases.

Visit the public site at [atlas.z-ai.cc](https://atlas.z-ai.cc). Chinese is the
default language, with a complete English learning path under `/en/`.

## Current Release

v1.7 is deployed from `main` at `79daf69`. PR #37 delivered the device-local
review loop; PRs #39–#43 closed the shared Guided Story and review-flow
VoiceOver findings. PR-head CI run 31703100783, main CI run 31703484976, the
Cloudflare Pages production check, the 2026-08-12 production privacy /
interaction smoke, and five documented production VoiceOver checks on
2026-08-13 all passed. Production serves the closing
`ChapterJourney.ClIOeOOI.js` asset.

- Astro static site with MDX and Svelte islands.
- Thirteen chapters from overview through Safety / Evaluation, including a feedback-learning bridge between CNN and Attention.
- Twelve teaching demos: search tree, expert-system rules, Bayes update, decision boundary, CNN kernel, feedback learning, Attention map, foundation-model lifecycle, LLM system boundaries, RAG pipeline, Agent loop, and the Safety / Eval release feedback loop.
- Complete Chinese and English routes, copy, demo state, and references.
- Resumable local learning progress, one bilingual concept check per chapter,
  previous/next navigation, and a deterministic, clearable device-local review
  queue ordered by the learning path.
- A 27-event, source-backed history layer with shareable chapter/lineage filters, focused lineage deep links, and three bilingual curated stories, plus a manifest-driven library of twelve downloadable SVG/PNG diagram pairs.
- Public privacy pages and a reviewed learning-signal allowlist; client-side learning collection is disabled, and deployment headers reject automatic RUM injection. Cloudflare hosting-level edge metrics are not treated as learner data.
- CI coverage for formatting, types, data contracts, static builds, unit tests, browser behavior, visual regressions, accessibility controls, and teaching correctness.
- Contributor docs for design, motion, diagrams, demos, and templates.

## Local Development

```bash
pnpm install
pnpm dev
pnpm validate:data
pnpm lint
pnpm build
pnpm test
pnpm format:check
```

## Key Routes

- `/chapters/overview/`
- `/chapters/search/`
- `/chapters/expert-system/`
- `/chapters/bayes/`
- `/chapters/decision-boundary/`
- `/chapters/cnn/`
- `/chapters/reinforcement-learning/`
- `/chapters/attention/`
- `/chapters/foundation-model/`
- `/chapters/llm-system/`
- `/chapters/rag/`
- `/chapters/agent/`
- `/chapters/safety/`
- `/timeline/`
- `/lineage/`
- `/diagrams/`
- `/privacy/`

Prefix any route with `/en` for its English version, for example
`/en/chapters/rag/`.

## Roadmap

Post-MVP work is sequenced in
[`docs/POST_MVP_ITERATION_PROCESS.md`](docs/POST_MVP_ITERATION_PROCESS.md).
Release hardening, extension architecture, Safety / Evaluation, diagram assets,
source-backed historical depth, causal atlas navigation, a foundation-model
lifecycle chapter, chapter self-checks, and the v1.5 feedback-learning slice are
implemented and published. v1.6 Guided Causal Learning and v1.7 device-local
review are complete and published, and their shared automated and real
VoiceOver release gates are closed. The
P2-05 real-usage loop is paused: the provider decision is open again, no data
source is approved or scheduled, and automated traffic is not treated as
learner data. The in-page event contract and aggregate analyzer remain
available without enabling network collection. The next sequence is the v1.8-01
route JavaScript baseline and regression gate, followed by the two remaining
independent v1.8 engineering baselines and a separately approved v1.9 Timeline
single-story Reader prototype. See the
[v1.5 release brief](docs/V1_5_FEEDBACK_LEARNING_BRIEF.md), the
[v1.6 brief](docs/V1_6_GUIDED_CAUSAL_LEARNING_BRIEF.md), and the
[v1.7 implementation brief](docs/V1_7_LOCAL_REVIEW_LOOP_BRIEF.md). The detailed
scope, dependencies, non-goals, and evidence gates are fixed in the
[post-v1.7 iteration plan](docs/POST_V1_7_ITERATION_PLAN.md).

## Deployment

Production and pull-request preview checks, release steps, smoke tests, rollback,
and the analytics decision are documented in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Contributing

See `CONTRIBUTING.md`, `docs/DEMO_GUIDE.md`, `docs/DIAGRAM_GUIDE.md`, `docs/DESIGN.md`, and `docs/MOTION.md`.
