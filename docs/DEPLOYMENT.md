# Deployment Guide

The site is a static Astro build hosted by Cloudflare Pages.

## Environments

| Environment          | Source                       | Purpose                                               |
| -------------------- | ---------------------------- | ----------------------------------------------------- |
| Local                | Current worktree             | Development and complete verification                 |
| Pull-request preview | A pushed pull-request branch | Visual, interaction, metadata, and content review     |
| Production           | `main`                       | Public site at [atlas.z-ai.cc](https://atlas.z-ai.cc) |

Cloudflare Pages project:

- Project name: `ai-time-machine`
- Production branch: `main`
- Build command: `pnpm build`
- Build output: `apps/site/dist`
- Node version: read from `.node-version`
- Package manager: read from the root `packageManager` field

The repository does not require runtime secrets, API keys, databases, or
backend services. Never add Cloudflare credentials, private preview URLs, or
environment files to Git.

## Pull-Request Preview

1. Update `main`, create a `codex/*` branch, and work in a dedicated
   worktree.
2. Run the complete local gate:

       pnpm format:check
       pnpm validate:data
       pnpm lint
       pnpm build
       pnpm test

3. Push the branch and open a Draft PR.
4. Wait for all three remote checks:
   - Quality and build
   - Chromium integration and visual tests
   - Cloudflare Pages
5. Open the Cloudflare preview from the PR check and inspect every route
   affected by the change.
6. Add screenshots or recordings to the PR for visible changes.

Do not merge while any required check is pending or failing.

## Production Release

1. Mark the PR ready only after content, fact, interaction, accessibility, and
   engineering review are complete.
2. Merge through GitHub; never push directly to `main`.
3. Confirm the `main` CI run and Cloudflare Pages deployment succeed.
4. Smoke-test:
   - [Chinese home](https://atlas.z-ai.cc/)
   - [English home](https://atlas.z-ai.cc/en/)
   - [Feedback learning chapter](https://atlas.z-ai.cc/chapters/reinforcement-learning/)
   - [English feedback learning chapter](https://atlas.z-ai.cc/en/chapters/reinforcement-learning/)
   - [Foundation model chapter](https://atlas.z-ai.cc/chapters/foundation-model/)
   - [English foundation model chapter](https://atlas.z-ai.cc/en/chapters/foundation-model/)
   - [LLM system chapter](https://atlas.z-ai.cc/chapters/llm-system/)
   - [English LLM system chapter](https://atlas.z-ai.cc/en/chapters/llm-system/)
   - [RAG chapter](https://atlas.z-ai.cc/chapters/rag/)
   - [English RAG chapter](https://atlas.z-ai.cc/en/chapters/rag/)
   - [Safety / Eval chapter](https://atlas.z-ai.cc/chapters/safety/)
   - [English Safety / Eval chapter](https://atlas.z-ai.cc/en/chapters/safety/)
   - [Timeline](https://atlas.z-ai.cc/timeline/)
   - [Lineage](https://atlas.z-ai.cc/lineage/)
   - Feedback learning story: [Timeline](https://atlas.z-ai.cc/timeline/?story=feedback-learning#story-feedback-learning) and [Lineage](https://atlas.z-ai.cc/lineage/?story=feedback-learning#story-feedback-learning)
   - Rules to representations story: [Timeline](https://atlas.z-ai.cc/timeline/?story=rules-to-representations#story-rules-to-representations) and [Lineage](https://atlas.z-ai.cc/lineage/?story=rules-to-representations#story-rules-to-representations)
   - Scaled models to reliable systems story: [Timeline](https://atlas.z-ai.cc/timeline/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems) and [Lineage](https://atlas.z-ai.cc/lineage/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems)
   - [Diagram sources](https://atlas.z-ai.cc/diagrams/)
   - [Privacy](https://atlas.z-ai.cc/privacy/)
   - [English privacy](https://atlas.z-ai.cc/en/privacy/)
   - [Sitemap](https://atlas.z-ai.cc/sitemap-index.xml)
   - [Robots policy](https://atlas.z-ai.cc/robots.txt)
5. Open each Guided Story deep link directly, refresh it, and switch languages.
   Confirm that only the selected story detail is visible in JavaScript mode,
   the other two retain native `hidden` behavior and stay out of sequential Tab
   order, and the selected title clears the dynamically sized sticky header on
   desktop and mobile.
6. Verify the production HTML contains the expected canonical, language
   alternates, Open Graph image, and description.
7. Verify HTML responses include `no-transform` in `Cache-Control` and a
   `Content-Security-Policy` with `connect-src 'none'`.
8. In a real browser, complete one concept check and continue to the next
   chapter. Confirm the interaction hydrates and that no request targets
   `static.cloudflareinsights.com` or `/cdn-cgi/rum`.
   Run `pnpm smoke:production:privacy` to cover this check together with all 26
   chapter routes, both timelines, both home and privacy routes, the sitemap,
   and the three Chinese Timeline Guided Story deep links, including their
   English language-switch URL state.
9. Run and document a real VoiceOver or NVDA spot check on the Timeline and
   Lineage story regions. Confirm inactive stories are absent from reading and
   Tab order and that `aria-live` does not announce hidden content. This manual
   check remains pending for v1.6; automated accessibility assertions and the
   production smoke do not close it.
10. Record any teaching simplification, source change, or deployment-layer
    privacy correction in the merged PR.

## v1.6 Release Record

Automated v1.6 release evidence is tied to merge commit
[`adb3927`](https://github.com/FrankCheungDev/ai-time-machine/commit/adb3927809646ba1d00e574ae2a3befb99e36c2f):

- [main CI run 31247555472](https://github.com/FrankCheungDev/ai-time-machine/actions/runs/31247555472) completed successfully with both `Quality and build` and `Chromium integration and visual tests` passing.
- [Cloudflare Pages check 93078586968](https://github.com/FrankCheungDev/ai-time-machine/runs/93078586968) reported `Deployed successfully` for the same `main` commit. Access-protected deployment URLs are intentionally omitted from this record.
- On 2026-08-08, `pnpm smoke:production:privacy` passed against production with 33 checked requests, all 26 bilingual chapter routes, 32 HTML response-policy checks, 27 events in each localized timeline, and all three Chinese Timeline Guided Story deep links restoring their expected 6 / 7 / 7 focused events while preserving English language-switch URL state. `missingNoTransform`, `missingNoConnectPolicy`, and `invalidScriptPolicy` were all zero, while `forbiddenRequests` and `failures` were empty.

These automated checks verify deployment, privacy boundaries, and scripted
interaction behavior. Final v1.6 release closure still requires the documented
real VoiceOver or NVDA spot check described above.

## Rollback

Choose the smallest rollback that restores a known-good state:

1. For an urgent availability problem, use the Cloudflare Pages dashboard to
   roll production back to the most recent healthy deployment.
2. Create a Git revert of the offending merge commit on a new `codex/*`
   branch.
3. Run the complete local gate and open a rollback PR.
4. Merge the rollback PR and confirm the resulting Cloudflare deployment.

Do not force-push `main`, rewrite shared history, or delete the last known-good
deployment.

## Analytics Decision

Client-side learning analytics remain disabled through v1.6. The site exposes a
typed, sanitized in-page event contract for chapter start, journey completion,
concept check completion, explanation opening, and continuation, but no
application listener sends those signals over the network.

On 2026-07-28, the project owner declined Plausible Hosted because the required
learning-metrics features need a paid plan. Draft PR #26 was closed without
merging, so its adapter, network collection, provider-specific exporter, and CSP
changes never entered `main`. No hosted analytics provider is approved or
scheduled. The provider-neutral aggregate analyzer and local `CustomEvent`
contract remain in the repository, but neither collects data or proves real
learner behavior.

Production smoke after PR #20 found that Cloudflare Pages automatically
injected its Web Analytics / RUM beacon even though the repository contained no
analytics script. `apps/site/public/_headers` now applies `no-transform` to all
generated HTML routes and a Content Security Policy that rejects external
scripts and browser-initiated connections. Both controls must remain covered by
tests and a post-deployment browser network check.

Cloudflare still processes HTTP requests as the hosting proxy and may expose
aggregate edge traffic. Those provider-level operational metrics are separate
from the project's learning-signal contract, are not currently readable by the
project, and must not be presented as learner evidence. Simulated exports,
automated checks, smoke traffic, and developer interactions are not substitutes
for genuine learner traffic either.

The privacy review, exact field allowlist, excluded data, provider gate, and
real-usage evidence boundary are recorded in
[`P2_HISTORY_LEARNING_PRIVACY_BRIEF.md`](P2_HISTORY_LEARNING_PRIVACY_BRIEF.md).
The same decision is visible to learners at `/privacy/` and `/en/privacy/`.

No provider enablement is currently planned. If collection is reconsidered, it
must start as a new proposal with explicit cost and privacy approval; prior
provider discussion or configuration does not carry forward. Before enabling
collection in that separate pull request:

- document the provider, data residency, retention, deletion, and access;
- prove no user-entered text, identity, precise timestamp, full URL, device
  fingerprint, or cross-site identifier is collected;
- exclude local, CI, preview, smoke, and developer traffic;
- add network request contract tests and a provider removal path;
- change the `no-transform` and Content Security Policy controls in the same
  reviewed pull request;
- update both public privacy routes;
- prove the project can read genuine aggregate data before claiming a
  data-driven adjustment.

## Incident Checklist

- Confirm whether the issue affects production, preview, or both.
- Check GitHub Actions and the Cloudflare Pages deployment status.
- Reproduce against the exact deployed commit.
- Prefer rollback when the production learning path is broken.
- Follow with a small root-cause fix and a regression test.
- Document the incident and verification in the repair PR.
