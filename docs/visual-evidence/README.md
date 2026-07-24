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
