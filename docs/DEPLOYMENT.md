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
   - [RAG chapter](https://atlas.z-ai.cc/chapters/rag/)
   - [English RAG chapter](https://atlas.z-ai.cc/en/chapters/rag/)
   - [Timeline](https://atlas.z-ai.cc/timeline/)
   - [Lineage](https://atlas.z-ai.cc/lineage/)
   - [Diagram sources](https://atlas.z-ai.cc/diagrams/)
   - [Sitemap](https://atlas.z-ai.cc/sitemap-index.xml)
   - [Robots policy](https://atlas.z-ai.cc/robots.txt)
5. Verify the production HTML contains the expected canonical, language
   alternates, Open Graph image, and description.
6. Record any teaching simplification or source change in the merged PR.

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

Analytics remain disabled for v1.0.1. P2 may introduce a privacy-reviewed,
anonymous event set limited to chapter start, core interaction completion,
self-check completion, and continuation to the next chapter.

Before enabling analytics:

- document the provider and data residency;
- prove no user-entered text, identity, or cross-site identifier is collected;
- add a visible privacy explanation;
- add tests for the event allowlist;
- make removal possible without changing chapter behavior.

## Incident Checklist

- Confirm whether the issue affects production, preview, or both.
- Check GitHub Actions and the Cloudflare Pages deployment status.
- Reproduce against the exact deployed commit.
- Prefer rollback when the production learning path is broken.
- Follow with a small root-cause fix and a regression test.
- Document the incident and verification in the repair PR.
