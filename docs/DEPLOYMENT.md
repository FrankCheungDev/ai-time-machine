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

The Plausible Stats API key is an operator-only read credential for aggregate
exports after an observation window. It is not a site runtime or build secret
and must remain in an OS keychain or equivalent controlled store; see
[`P2_PLAUSIBLE_RUNBOOK.md`](P2_PLAUSIBLE_RUNBOOK.md).

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
   - [RAG chapter](https://atlas.z-ai.cc/chapters/rag/)
   - [English RAG chapter](https://atlas.z-ai.cc/en/chapters/rag/)
   - [Safety / Eval chapter](https://atlas.z-ai.cc/chapters/safety/)
   - [English Safety / Eval chapter](https://atlas.z-ai.cc/en/chapters/safety/)
   - [Timeline](https://atlas.z-ai.cc/timeline/)
   - [Lineage](https://atlas.z-ai.cc/lineage/)
   - [Diagram sources](https://atlas.z-ai.cc/diagrams/)
   - [Privacy](https://atlas.z-ai.cc/privacy/)
   - [English privacy](https://atlas.z-ai.cc/en/privacy/)
   - [Sitemap](https://atlas.z-ai.cc/sitemap-index.xml)
   - [Robots policy](https://atlas.z-ai.cc/robots.txt)
5. Verify the production HTML contains the expected canonical, language
   alternates, Open Graph image, and description.
6. Verify HTML responses include `no-transform` in `Cache-Control` and a
   `Content-Security-Policy` whose only external connection is
   `connect-src https://plausible.io/api/event`; external scripts remain
   blocked.
7. Before using a release browser on production, set
   `localStorage.plausible_ignore=true`. Complete one concept check and continue
   to the next chapter. Confirm the interaction hydrates and that no request
   targets Plausible, `static.cloudflareinsights.com`, or `/cdn-cgi/rum` from
   this excluded smoke session.
   Run `pnpm smoke:production:privacy` to cover this check together with all 22
   chapter routes, both timelines, both privacy routes, and the sitemap.
8. Record any teaching simplification, source change, or deployment-layer
   privacy correction in the merged PR.

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

Plausible Hosted Business was approved by the project owner on 2026-07-26 for
the five typed learning events. Only a non-automated browser on the exact
`https://atlas.z-ai.cc` origin can dynamically load the strict Events API
adapter. Local development, pull-request previews, WebDriver, production smoke,
and browsers with `localStorage.plausible_ignore=true` stop before sending.

The adapter does not load an external Plausible script or automatically track
pageviews, links, forms, downloads, or 404s. It reconstructs canonical chapter
URLs, sends only the reviewed event properties, omits credentials and
referrers, and never sends user text, identity, project visitor/session IDs,
precise timestamps, query strings, or hashes. The browser connection still
carries IP and User-Agent; the approved provider temporarily uses them for bot
filtering, daily anonymous visitor calculation, and coarse device/location
derivation as disclosed on both privacy routes.

Production smoke after PR #20 found that Cloudflare Pages automatically
injected its Web Analytics / RUM beacon even though the repository contained no
analytics script. `apps/site/public/_headers` applies `no-transform` to all
generated HTML routes, continues to reject external scripts, and allows only
the approved Plausible event endpoint. These controls remain covered by tests
and a post-deployment browser network check.

Cloudflare still processes HTTP requests as the hosting proxy and may expose
aggregate edge traffic. Those provider-level operational metrics are separate
from the project's learning-signal contract, are not currently readable by the
project, and must not be presented as learner evidence.

The privacy review, exact field allowlist, excluded data, provider decision,
and real-usage evidence boundary are recorded in
[`P2_HISTORY_LEARNING_PRIVACY_BRIEF.md`](P2_HISTORY_LEARNING_PRIVACY_BRIEF.md).
The same decision is visible to learners at `/privacy/` and `/en/privacy/`.

Before merging the enablement pull request and starting observation:

- configure the Hosted Business site, exact hostname allowlist, five goals and
  two sequential funnels;
- designate the dashboard / Stats API operator and safe key storage;
- pass the payload, origin, WebDriver, ignore-flag, preview, CSP, and production
  smoke contracts;
- verify both public privacy routes and the provider removal path;
- confirm a genuine learner-traffic source, then record the observation start
  without using developer or automated events as dashboard evidence.

Follow the exact provider setup, exclusion, observation, export, and removal
steps in [`P2_PLAUSIBLE_RUNBOOK.md`](P2_PLAUSIBLE_RUNBOOK.md). Collection
enablement is not a data-driven product adjustment: P2-05 still requires at
least 14 complete days, sufficient aggregate samples, and a separate one-point
chapter change.

## Incident Checklist

- Confirm whether the issue affects production, preview, or both.
- Check GitHub Actions and the Cloudflare Pages deployment status.
- Reproduce against the exact deployed commit.
- Prefer rollback when the production learning path is broken.
- Follow with a small root-cause fix and a regression test.
- Document the incident and verification in the repair PR.
