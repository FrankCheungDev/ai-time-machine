# Contributing

This project is a Chinese-first interactive atlas of AI history. Contributions should help learners understand where a technique sits historically, what problem it solved, and what tradeoffs remained.

## What To Contribute

- Chapter copy and historical explanations.
- Demo data, Svelte demo islands, and SVG diagrams.
- Fact-checking, references, accessibility fixes, and mobile QA.
- Diagram source improvements and screenshot/export guidance.

## Demo Acceptance

Each demo must teach one core intuition in about three minutes. Keep main controls to three or fewer, add a simplification note, and avoid real model calls, API keys, databases, or backend services.

Every chapter should include: one-sentence explanation, historical position, prior problem, interaction guidance, solved/unsolved notes, later impact, references, and simplification boundaries.

## Fact-Check Expectations

Use references for named papers, models, systems, and dates. PRs that touch historical claims should include a `fact-check` note in the description and list the sources checked.

## Verification

Run these before opening a PR:

```bash
pnpm validate:data
pnpm lint
pnpm build
pnpm test
```

Include screenshots or short recordings for visual and interaction changes.
