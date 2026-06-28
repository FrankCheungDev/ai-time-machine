# Demo Template

Use this checklist when adding a new interactive explanation.

## Concept

- Demo id:
- Chapter route:
- Core question:
- Aha moment:
- Simplification note:

## Data File

Create `packages/data/src/demos/<demo-id>.ts`.

Include:

- `title`
- `question`
- `simplificationNote`
- stable node/step/control ids
- all learner-facing copy

Export it from `packages/data/src/index.ts`.

## Svelte Island

Create `apps/site/src/demos/<demo-id>/<DemoName>.svelte`.

Requirements:

- import content from `@ai-history/data`
- use existing CSS variables
- keep main controls to three or fewer
- add stable SVG ids such as `node-*` and `arrow-*`
- avoid timers and real AI calls

## Chapter

Create `apps/site/src/pages/chapters/<slug>.astro`.

Include:

- one-sentence explanation
- historical position
- prior problem
- interactive demo
- observation guidance
- solved and unsolved notes
- later impact
- references

## Test

Add a Playwright smoke test that verifies:

- the route loads
- the H1 is visible
- the core question is visible
- one interaction changes visible output
