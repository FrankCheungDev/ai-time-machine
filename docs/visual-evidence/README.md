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
- `p2-completion-next-chinese.png`: Chinese RAG post-completion UI at desktop width, with the separate Agent Loop continuation link visible.
- `p2-completion-next-english-mobile.png`: the same post-completion UI in English at 390px.
- `p2-plausible-privacy-chinese.png`: Chinese production-only Plausible disclosure and provider-processing boundary.
- `p2-plausible-privacy-english.png`: English production-only Plausible disclosure and provider-processing boundary.

Before taking either completion screenshot, the capture script asserts that the
next-chapter link is absent before completion, the route remains unchanged,
completion emits exactly one `core_interaction_completed` signal and no
`next_chapter_continued` signal, and the newly visible link has the expected
localized destination. The production network boundary remains covered by
`scripts/smoke-production-privacy.mjs` rather than by these cropped images.

Recreate them against the same local preview:

```sh
pnpm --filter site preview --host 127.0.0.1 --port 4330
pnpm capture:p2-evidence
```
