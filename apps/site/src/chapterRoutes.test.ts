import { chapterRegistry } from "@ai-history/data/chapters";
import { describe, expect, it } from "vitest";

const chineseModules = import.meta.glob("./pages/chapters/*.astro");
const englishModules = import.meta.glob("./pages/en/chapters/*.astro");

function chapterSlugs(modules: Record<string, unknown>): string[] {
  return Object.keys(modules)
    .map((path) =>
      path
        .split("/")
        .at(-1)
        ?.replace(/\.astro$/, ""),
    )
    .filter((slug): slug is string => Boolean(slug))
    .sort();
}

describe("chapter route contract", () => {
  it("keeps Chinese and English route files aligned with the registry", () => {
    const expectedSlugs = chapterRegistry
      .map(({ route }) => route.split("/").filter(Boolean).at(-1))
      .filter((slug): slug is string => Boolean(slug))
      .sort();

    expect(chapterSlugs(chineseModules)).toEqual(expectedSlugs);
    expect(chapterSlugs(englishModules)).toEqual(expectedSlugs);
  });
});
