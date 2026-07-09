# Interactive AI History

An interactive atlas for explaining how AI evolved from symbolic search and expert systems to statistical learning, deep learning, LLM systems, RAG, and agents.

The project is an explorable explanation, not a real AI training or inference platform. Demos are scripted, precomputed, or illustrative so learners can focus on mechanism intuition without API keys, backend services, GPUs, or databases.

## Current MVP

- Astro static site with MDX and Svelte islands.
- Ten chapter routes from overview through Agent.
- Eight teaching demos: search tree, expert-system rules, Bayes update, decision boundary, CNN kernel, Attention map, RAG pipeline, and Agent loop.
- Overview pages for timeline, technical lineage, and reusable diagram sources.
- Contributor docs for design, motion, diagrams, demos, and templates.

## Local Development

```bash
pnpm install
pnpm dev
pnpm validate:data
pnpm lint
pnpm build
pnpm test
```

## Key Routes

- `/chapters/overview/`
- `/chapters/search/`
- `/chapters/attention/`
- `/chapters/llm-system/`
- `/chapters/rag/`
- `/chapters/agent/`
- `/timeline/`
- `/lineage/`
- `/diagrams/`

## Contributing

See `CONTRIBUTING.md`, `docs/DEMO_GUIDE.md`, `docs/DIAGRAM_GUIDE.md`, `docs/DESIGN.md`, and `docs/MOTION.md`.
