# Visual Evidence

These screenshots are release evidence for visual teaching changes. They are not
pixel-diff baselines; Playwright regression snapshots remain under
`apps/site/tests/*-snapshots/`.

## Safety / Eval v1.1

- `safety-normal-desktop.png`: normal request at the first control step.
- `safety-risk-mobile.png`: risky request blocked by the independent permission boundary at 390px.
- `safety-fixed-desktop.png`: RT-017 repaired state at the release gate.

Recreate them after `pnpm build` and while the site preview is available at
`http://127.0.0.1:4330`:

```sh
pnpm --filter site preview --host 127.0.0.1 --port 4330
pnpm capture:safety-evidence
```

## Historical Depth And Learning Checks v1.2

- `p2-timeline-event-desktop.png`: source, impact, chapter, and lineage links on a representative Lighthill event card.
- `p2-concept-check-mobile.png`: incorrect Search answer with the explanation open at 390px.
- `p2-concept-check-english.png`: correct English Safety / Eval answer with its explanation open.

Recreate them against the same local preview:

```sh
pnpm --filter site preview --host 127.0.0.1 --port 4330
pnpm capture:p2-evidence
```

## LLM System Boundary Lab v1.3

- `llm-system-policy-gap-desktop.png`: the current-policy scenario at the model-only evidence gap.
- `llm-system-action-english-mobile.png`: the English resume-and-submit scenario at the verified end of its controlled action path on a 390px viewport.

Recreate them against the same local preview:

```sh
pnpm --filter site preview --host 127.0.0.1 --port 4330
pnpm capture:llm-system-evidence
```

## Causal Atlas And Foundation Model Lifecycle v1.4

- `v1-4-foundation-runtime-desktop.png`: the Chinese lifecycle at the runtime-context / fixed-weight boundary.
- `v1-4-foundation-preference-english-mobile.png`: the English preference-feedback step at 390px.
- `v1-4-lineage-foundation-focus-desktop.png`: the lineage deep link focused on the new foundation-model node and its adjacent causal edges.

Recreate them against the same local preview:

```sh
pnpm --filter site preview --host 127.0.0.1 --port 4330
pnpm capture:v1.4-evidence
```
