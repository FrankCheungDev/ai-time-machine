# Locale Contract And Shared Topology Design

Date: 2026-07-10
Branch: codex/add-i18n

## Goal

Remove the remaining duplication in the bilingual implementation without changing its public API or runtime behavior. Locale values and normalization should have one canonical source, while stable demo topology should be declared once and combined with locale-specific text.

## Scope

In scope:

- Make `packages/data/src/locales.ts` the single source for `supportedLocales`, `Locale`, `defaultLocale`, and `normalizeLocale`.
- Keep the existing `apps/site/src/i18n/locales.ts` import surface by re-exporting the canonical locale contract and retaining site-only route helpers there.
- Move browser preference and detection behavior into a bundled client module that uses the canonical normalizer.
- Remove the unused `SiteCopy.language.currentLabel` field.
- Extract stable topology from the localized Agent loop, decision-boundary, and CNN demo manifests.
- Preserve existing exports, object order, Chinese defaults, localized copy, route behavior, and defensive cloning.

Out of scope:

- Adding another locale.
- Changing route structure, detection precedence, persistence keys, or switcher UI.
- Creating a new workspace package.
- Generalizing all localized manifests in this change.
- Adding new demo behavior or changing diagram geometry.

## Considered Approaches

### Canonical locale contract in `@ai-history/data` (selected)

The site already depends on the data package, so the data package can own the locale union and normalization rules without introducing a dependency cycle. The site re-exports these symbols to preserve its current local import surface. This is the smallest change and keeps the dependency direction natural.

### New `@ai-history/i18n` workspace package

A neutral package would provide a pure ownership boundary, but two locales and two current consumers do not justify another package, build target, and dependency edge.

### Canonical locale contract in the site

This would force reusable data to depend on an application package or leave the data package with an indirect duplicate. The dependency direction is unsuitable, so this approach is rejected.

## Locale Contract

`packages/data/src/locales.ts` will export:

```ts
export const supportedLocales = ["zh-CN", "en"] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = "zh-CN";
export function normalizeLocale(
  value: string | null | undefined,
): Locale | undefined;
```

`packages/data/src/index.ts` will expose all four symbols as public package exports. `apps/site/src/i18n/locales.ts` will import and re-export those symbols, then define only route-oriented helpers such as `getPathLocale` and `toLocalizedPath`.

This preserves existing site imports while ensuring the tuple, type, default, and normalization function are authored in one module.

## Browser Preference Flow

A client-safe site module will import the canonical locale contract through the site facade. It will own the existing browser behavior:

1. Read `localStorage` and accept only exact members of `supportedLocales`.
2. Fall back to the preference cookie when local storage is unavailable or invalid.
3. If no manual preference exists, scan `navigator.languages` in order and pass each value through `normalizeLocale`, using the first supported result.
4. Redirect only `/` to `/en/` when English is selected.
5. Persist a manual switch to local storage and the existing cookie before normal link navigation.

Unsupported values remain `undefined`, so the existing default Chinese behavior is unchanged. Storage failures remain non-fatal, and the language link continues to work without JavaScript.

## Shared Demo Topology

Each affected demo keeps its implementation local and separates two concerns:

- Stable topology: IDs, ordering, active node and edge lists, branch targets, points, paths, matrices, grid values, and scan coordinates.
- Localized copy: titles, labels, descriptions, questions, notes, and learning goals.

The stable arrays define ID unions. Locale copy maps use those unions as keys, for example `Record<Locale, Record<StepId, StepCopy>>`. TypeScript therefore reports a missing translation whenever a topology ID is added without matching copy.

The getter maps stable topology in its declared order, merges copy by ID, assembles the existing public demo shape, and deep-clones the result before returning it. No generic cross-demo assembly framework will be introduced; the three object shapes are different enough that small local builders are clearer.

### Agent Loop

Declare step IDs, active node IDs, active edge IDs, branch IDs, and branch targets once. Store step and branch text by locale and stable ID.

### Decision Boundary

Keep points shared as they are today. Move mode IDs and SVG paths into one shared topology array, with mode text stored by locale and mode ID.

### CNN Kernel

Keep the image grid shared. Move kernel IDs and matrices into one shared topology array, and scan-step IDs and coordinates into another. Store kernel and scan-step text by locale and stable ID.

## Compatibility

The following contracts must remain unchanged:

- Existing getters and their optional `Locale` parameter.
- Existing named exports that return Chinese data by default.
- Every Chinese value and array order represented by the independent baseline fixture.
- English text and stable item ordering.
- Deep mutation isolation between getter calls and default exports.
- Root-only auto-detection, manual preference precedence, cookie fallback, and no-JavaScript navigation.

`SiteCopy.language.currentLabel` is not consumed anywhere and will be removed from the interface and both locale values. The visible switch label and accessible label remain unchanged.

## Testing

Use characterization coverage before and during the refactor:

- Add a locale contract test that compares the site facade exports with the public `@ai-history/data` exports, including function identity for `normalizeLocale`.
- Keep normalization cases for English, Chinese, unsupported values, empty values, and undefined values.
- Keep the Chinese baseline hashes for all existing named exports.
- Keep localized topology parity assertions for Agent, decision-boundary, and CNN data.
- Keep getter mutation-isolation assertions.
- Keep Playwright coverage for browser detection order, lookalike rejection, manual preference precedence, cookie fallback, switch persistence, deep-link stability, and no-JavaScript navigation.

Run the complete verification sequence:

```text
pnpm format
pnpm install --frozen-lockfile
pnpm validate:data
pnpm lint
pnpm test
pnpm build
git diff --check
```

## Acceptance Criteria

- `Locale`, `supportedLocales`, `defaultLocale`, and `normalizeLocale` have one authored source in `@ai-history/data`.
- Site route helpers and browser behavior consume that canonical contract.
- Agent, decision-boundary, and CNN stable topology appears only once per demo module.
- Existing public exports, Chinese baseline hashes, English output, route behavior, and mutation isolation remain unchanged.
- The full verification sequence passes.
