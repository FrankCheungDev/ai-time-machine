import {
  chapterRegistry,
  getChapterDefinition,
  type ChapterId,
  type DemoChapterId,
} from "@ai-history/data/chapters";
import type { Locale } from "@ai-history/data/locales";
import { toLocalizedPath } from "../../src/i18n/locales";

export interface TestChapter {
  id: ChapterId;
  kind: "chapter" | "demo";
  label: string;
  number: string;
  route: string;
  title: string;
}

export function localizedChapterRoute(
  id: ChapterId,
  locale: Locale = "zh-CN",
): string {
  return toLocalizedPath(getChapterDefinition(id).route, locale);
}

export const chapterCases: readonly TestChapter[] = chapterRegistry.map(
  (chapter) => ({
    id: chapter.id,
    kind: chapter.kind,
    label: `${chapter.kind === "demo" ? "Demo" : "Chapter"} ${chapter.number}`,
    number: chapter.number,
    route: chapter.route,
    title: chapter.shortTitle["zh-CN"],
  }),
);

export const demoChapterIds: readonly DemoChapterId[] = chapterRegistry
  .filter((chapter) => chapter.kind === "demo")
  .map((chapter) => chapter.id as DemoChapterId);

export const chapterRoutes = chapterCases.map(({ route }) => route);
export const nonOverviewChapterRoutes = chapterCases
  .filter(({ id }) => id !== "overview")
  .map(({ route }) => route);
export const englishChapterRoutes = chapterCases.map(({ id }) =>
  localizedChapterRoute(id, "en"),
);
export const englishNonOverviewChapterRoutes = chapterCases
  .filter(({ id }) => id !== "overview")
  .map(({ id }) => localizedChapterRoute(id, "en"));

export const canonicalChapterLabels = chapterCases.map((chapter) => ({
  route: chapter.route,
  homeCard: chapter.title,
  eyebrow: chapter.label,
}));

export const primaryRoutes = [
  "/",
  ...chapterRoutes,
  "/timeline/",
  "/lineage/",
  "/diagrams/",
] as const;
