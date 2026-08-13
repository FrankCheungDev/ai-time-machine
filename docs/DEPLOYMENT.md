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
8. In a fresh browser context, answer one concept check incorrectly, confirm
   the localized home review queue links back to that check, then answer it
   correctly and confirm the suggestion clears without changing chapter
   completion. Inspect the compatible `version: 1` + `reviewVersion: 2` local
   record and verify that no request targets analytics, collection, beacon,
   telemetry, `static.cloudflareinsights.com`, or `/cdn-cgi/rum`.
   Run `pnpm smoke:production:privacy` to cover this check together with all 26
   chapter routes, both timelines, both home and privacy routes, the sitemap,
   and the three Chinese Timeline Guided Story deep links, including their
   English language-switch URL state.
9. Run and document a real VoiceOver or NVDA spot check on the Timeline and
   Lineage story regions, the home review panel and clear confirmation, and a
   chapter concept-check deep link. Confirm inactive stories are absent from
   reading and Tab order, `aria-live` does not announce hidden content, controls
   have understandable names and focus order, and deep links begin at a useful
   reading position. The 2026-08-13 VoiceOver record below closes this gate for
   `main@79daf69`; automated accessibility assertions and the production smoke
   remain supporting, not substitute, evidence.
10. Record any teaching simplification, source change, or deployment-layer
    privacy correction in the merged PR.

## v1.6 Release Record

Automated v1.6 release evidence is tied to merge commit
[`adb3927`](https://github.com/FrankCheungDev/ai-time-machine/commit/adb3927809646ba1d00e574ae2a3befb99e36c2f):

- [main CI run 31247555472](https://github.com/FrankCheungDev/ai-time-machine/actions/runs/31247555472) completed successfully with both `Quality and build` and `Chromium integration and visual tests` passing.
- [Cloudflare Pages check 93078586968](https://github.com/FrankCheungDev/ai-time-machine/runs/93078586968) reported `Deployed successfully` for the same `main` commit. Access-protected deployment URLs are intentionally omitted from this record.
- On 2026-08-08, `pnpm smoke:production:privacy` passed against production with 33 checked requests, all 26 bilingual chapter routes, 32 HTML response-policy checks, 27 events in each localized timeline, and all three Chinese Timeline Guided Story deep links restoring their expected 6 / 7 / 7 focused events while preserving English language-switch URL state. `missingNoTransform`, `missingNoConnectPolicy`, and `invalidScriptPolicy` were all zero, while `forbiddenRequests` and `failures` were empty.

These automated checks verify deployment, privacy boundaries, and scripted
interaction behavior. At the v1.6 release point, the documented real VoiceOver
or NVDA spot check was still outstanding; that shared v1.6 / v1.7 manual gate
was subsequently closed by the 2026-08-13 production VoiceOver record below.

## v1.7 Release Record

Initial v1.7 feature-release evidence is tied to merge commit
[`ff19b4a`](https://github.com/FrankCheungDev/ai-time-machine/commit/ff19b4accb4a7f8dc709c73d7ab870212ade8fe5):

- [PR #37](https://github.com/FrankCheungDev/ai-time-machine/pull/37) merged the device-local review loop, backward-compatible review-state v2, localized review deep links, independent clearing, and its privacy / browser regressions.
- [main CI run 31569422805](https://github.com/FrankCheungDev/ai-time-machine/actions/runs/31569422805) completed successfully with both `Quality and build` and `Chromium integration and visual tests` passing.
- Cloudflare Pages reported a successful production deployment check for the same commit. Access-protected deployment URLs are intentionally omitted.
- On 2026-08-12, `pnpm smoke:production:privacy` passed against production with 33 checked requests, all 26 bilingual chapter routes, 32 HTML response-policy checks, and the device-local path “incorrect answer → home review queue → concept-check deep link → correct answer → queue exit.” All three Timeline Guided Stories also restored their expected state; `missingNoTransform`, `missingNoConnectPolicy`, and `invalidScriptPolicy` were zero, while `forbiddenRequests` and `failures` were empty.

Real VoiceOver review then found issues that were fixed in five follow-up pull
requests:

- [PR #39](https://github.com/FrankCheungDev/ai-time-machine/pull/39) corrected the clear confirmation and its focus behavior.
- [PR #40](https://github.com/FrankCheungDev/ai-time-machine/pull/40) corrected the hydrated concept-check deep-link focus.
- [PR #41](https://github.com/FrankCheungDev/ai-time-machine/pull/41) preserved the intended VoiceOver navigation sequence.
- [PR #42](https://github.com/FrankCheungDev/ai-time-machine/pull/42) stabilized the final feedback focus.
- [PR #43](https://github.com/FrankCheungDev/ai-time-machine/pull/43) prevented the chapter-completion announcement from overlapping the concept-check feedback and prevented a stale cross-tab announcement.

The closing release baseline is
[`main@79daf69`](https://github.com/FrankCheungDev/ai-time-machine/commit/79daf69):

- Closing PR-head [CI run 31703100783](https://github.com/FrankCheungDev/ai-time-machine/actions/runs/31703100783) completed successfully with both `Quality and build` and `Chromium integration and visual tests` passing.
- [main CI run 31703484976](https://github.com/FrankCheungDev/ai-time-machine/actions/runs/31703484976) completed successfully with the same two jobs passing.
- Cloudflare Pages reported a successful production deployment check, and production served the closing `ChapterJourney.ClIOeOOI.js` asset.

### 2026-08-13 production VoiceOver record

All five planned production spot checks passed after the fixes through PR #43:

| Check | Full tested URL                                                                                                     | Result                                                                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AT-01 | `https://atlas.z-ai.cc/timeline/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems`   | The selected story and its status were announced, while unselected story content stayed out of the reading and sequential Tab order.                                                         |
| AT-02 | `https://atlas.z-ai.cc/en/lineage/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems` | The selected state and return control had understandable announcements, story / RAG URL state was mutually exclusive, and hidden stories stayed out of reading and sequential Tab order.     |
| AT-03 | `https://atlas.z-ai.cc/`                                                                                            | Two UI-created suggestions exposed the Search primary entry; Bayes stayed unavailable while collapsed and became readable after expansion, with summary focus preserved.                     |
| AT-04 | `https://atlas.z-ai.cc/`                                                                                            | Confirmation descriptions and initial focus, Cancel focus return and queue preservation, successful status focus, and independent chapter completion all passed.                             |
| AT-05 | `https://atlas.z-ai.cc/chapters/search/#concept-check-search`                                                       | The deep link began at the concept-check heading, continued to the question group, and placed final focus on the correct-answer heading without a competing chapter-completion announcement. |

AT-01 through AT-04 above are result-level records, not claimed as verbatim
transcripts. For AT-05, the preserved actual VoiceOver announcement excerpts
were:

- Entry link: `第 01 章 搜索树 / A* 前往自测 已访问 链接`
- First key announcement after activation: `标题级别2 用一个问题检验核心直觉`
- Continued question-group announcement after 1.25 seconds: `A* 在本章演示中用什么决定优先展开哪个 frontier 节点？ 组`
- Correct submission: `回答正确 回答正确；本章已从这台设备的复习建议中移出。 查看为什么 再试一次`
- Final focus: `回答正确 标题级别3`

The spot check used macOS 13.4.1 (build `22F770820d`), VoiceOver 10, and
Chrome `151.0.7922.110`. Page interaction was performed only through Chrome;
system automation was limited to Apple Events controlling VoiceOver and
reading `content of last phrase`. Safari, System Events, screen recording, and
the microphone were not used; neither were screenshots, audio recording, or
GitHub CLI. AT-03 and AT-04 used an isolated browser profile / private storage
scope populated through the normal UI, so the checks neither read nor changed
the user's real learning records. The VoiceOver caption-panel command did not
produce usable evidence, so this record does not claim that the caption panel
was opened.

AT-01 through AT-04 are result-level records because their exact single-phrase
transcripts were not retained in this release-closure material; this record
does not reconstruct them from static page copy or automated assertions. The
full URLs, steps, expected and actual results, fixes, and per-check limitations
are recorded in
[`V1_7_LOCAL_REVIEW_LOOP_BRIEF.md`](V1_7_LOCAL_REVIEW_LOOP_BRIEF.md#17-真实-voiceover-验收记录).
VoiceOver `last phrase` is a single-utterance snapshot and cannot prove visual
sticky-header geometry; the existing desktop and 390px browser checks cover
that separate contract.

This evidence closes the shared v1.6 / v1.7 manual assistive-technology release
gate for these five production paths. It proves the behavior of the tested
build and paths within the stated environment and permission boundary. It is
not a complete WCAG certification, does not replace zoom, reflow, keyboard,
automated-rule, or cross-browser testing, and does not demonstrate improved
understanding, retention, completion, or any other learner outcome.

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

Client-side learning analytics remain disabled. Enabling collection in any
future release requires a separate approval. The site exposes a
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
