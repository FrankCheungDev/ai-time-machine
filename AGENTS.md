# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains the product and technical handoff in `docs/interactive_ai_history_codex_handoff.md`. Treat it as the source of truth until the runnable scaffold exists.

The planned structure is a pnpm workspace:

- `apps/site/` for Astro pages, layouts, styles, and Svelte demo islands.
- `packages/demo-core/` for reusable demo shells, steppers, scene helpers, and shared types.
- `packages/data/` for demo manifests, concepts, timeline data, and references.
- `packages/diagrams/` for source diagrams plus exported SVG/PNG assets.
- `scripts/` for validation, SVG optimization, and generated indexes.

Keep Chinese-first explanatory content near the page, demo, or data file that owns it.

## Build, Test, and Development Commands

No package scaffold is present yet, so root commands may not run today. After the workspace is created, use:

- `pnpm install` to install dependencies.
- `pnpm dev` to run the local Astro site.
- `pnpm build` to verify static output.
- `pnpm preview` to inspect the built site locally.
- `pnpm test` to run workspace tests.
- `pnpm lint` and `pnpm format` to check and format code.
- `pnpm validate:data` to validate demo and timeline data.

## Coding Style & Naming Conventions

Use TypeScript for shared logic and Svelte components. Prefer small, typed modules with explicit exported interfaces. Use `PascalCase` for components, `camelCase` for functions and variables, and kebab-case route or demo folders such as `rag-pipeline/`.

Use CSS variables for design tokens. Tailwind is optional; do not make defaults the visual identity. Keep demos static-first and free of backend, API key, or real model dependencies.

## Testing Guidelines

Use Vitest for unit tests and Playwright for interaction smoke tests once the scaffold exists. Co-locate tests near the module when practical: `StepperDemo.test.ts`, `rag-pipeline.spec.ts`.

Every demo should prove the core flow: page loads, controls respond, active nodes/arrows highlight, and `pnpm build` passes without TypeScript errors.

## Commit & Pull Request Guidelines

No Git history is available, so no convention can be inferred. Use concise, imperative commits such as `Add RAG pipeline demo scaffold`.

Pull requests should include a short summary, linked issue or task, verification commands, and screenshots or recordings for visual/demo changes. Note teaching simplifications explicitly.

## Agent-Specific Instructions

Do not invent runnable commands or files that are not present. When bootstrapping, follow the handoff document before adding new architecture. Preserve the project boundary: static explorable explanations, not a real AI inference platform.
