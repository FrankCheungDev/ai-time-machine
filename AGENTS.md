# Repository Guidelines

## Project Structure & Module Organization

This pnpm workspace implements the AI history atlas described in `docs/interactive_ai_history_codex_handoff.md`.

- `apps/site/` contains the Astro site, chapter routes, Svelte demo islands, global tokens, Playwright tests, and public diagram exports.
- `packages/demo-core/` contains reusable Svelte primitives such as `DemoShell`, `StepperDemo`, `SvgScene`, shared types, and Vitest coverage.
- `packages/data/` contains typed demo manifests plus timeline, lineage, and LLM-system data.
- `docs/` contains contributor guides, motion/design/diagram rules, templates, and implementation plans.

Keep Chinese explanatory copy near the page, demo, or data file that owns it. Keep demos static, scripted, and free of backend, API-key, database, or real model dependencies.

## Build, Test, and Development Commands

- `pnpm install` installs workspace dependencies.
- `pnpm dev` starts the Astro dev server for `apps/site`.
- `pnpm validate:data` runs TypeScript validation for `packages/data`.
- `pnpm lint` runs Astro checks and package TypeScript checks.
- `pnpm build` checks and builds the static site.
- `pnpm test` runs Vitest package tests and Playwright smoke tests.
- `pnpm format` runs Prettier across the repo.

## Coding Style & Naming Conventions

Use TypeScript for shared logic and Svelte components. Prefer explicit interfaces, small modules, and data-driven demos. Use `PascalCase` for components, `camelCase` for variables/functions, and kebab-case for route or demo folders such as `rag-pipeline/`.

Use CSS variables from `apps/site/src/styles/tokens.css`. Keep cards at the established 8px radius and avoid adding a new visual system unless the handoff requires it.

## Testing Guidelines

Use Vitest for package logic and Playwright for site/demo smoke coverage. Name unit tests near their target, for example `StepperDemo.test.ts` or `demos.test.ts`; keep browser specs under `apps/site/tests/`.

Every demo should prove that the page loads, controls respond, active nodes or explanations change, references and simplification notes render, and `pnpm build` passes without TypeScript errors.

## Commit & Pull Request Guidelines

History uses concise imperative commits such as `Add RAG SVG draw-in motion` and `Add root project docs`. Follow that style.

Do all development on feature branches, preferably `codex/<short-task-name>`. Push the branch to GitHub and open a pull request; never develop, commit, or push directly on `main`.

Pull requests should include a short summary, linked task or issue, verification commands, and screenshots or recordings for visual/demo changes. Call out teaching simplifications and any source references added.

## Security & Configuration Tips

Never commit secrets, API keys, `.env*`, `.dev.vars`, `.npmrc`, or private keys. Configure deployment secrets in Cloudflare Pages environment variables instead.
