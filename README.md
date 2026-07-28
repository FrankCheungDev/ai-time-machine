# Interactive AI History

An interactive atlas for explaining how AI evolved from symbolic search and expert systems to statistical learning, deep learning, LLM systems, RAG, and agents.

The project is an explorable explanation, not a real AI training or inference platform. Demos are scripted, precomputed, or illustrative so learners can focus on mechanism intuition without API keys, backend services, GPUs, or databases.

Visit the public site at [atlas.z-ai.cc](https://atlas.z-ai.cc). Chinese is the
default language, with a complete English learning path under `/en/`.

## Current Release

- Astro static site with MDX and Svelte islands.
- Eleven chapter routes from overview through Safety / Evaluation.
- Nine teaching demos: search tree, expert-system rules, Bayes update, decision boundary, CNN kernel, Attention map, RAG pipeline, Agent loop, and the Safety / Eval release feedback loop.
- Complete Chinese and English routes, copy, demo state, and references.
- Resumable local learning progress, one bilingual concept check per chapter, and previous/next navigation.
- A 22-event, source-backed history layer linked to chapters and lineage, plus a manifest-driven library of nine downloadable SVG/PNG diagram pairs.
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
- `/chapters/attention/`
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
source-backed historical depth, and chapter self-checks are implemented. The
P2-05 real-usage loop is paused: the provider decision is open again, no data
source is approved or scheduled, and automated traffic is not treated as learner
data. The in-page event contract and aggregate analyzer remain available without
enabling network collection.

## Deployment

Production and pull-request preview checks, release steps, smoke tests, rollback,
and the analytics decision are documented in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Contributing

See `CONTRIBUTING.md`, `docs/DEMO_GUIDE.md`, `docs/DIAGRAM_GUIDE.md`, `docs/DESIGN.md`, and `docs/MOTION.md`.
