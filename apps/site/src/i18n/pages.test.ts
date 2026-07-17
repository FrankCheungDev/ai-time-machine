import { describe, expect, it } from "vitest";
import { chapterRegistry } from "@ai-history/data/chapters";
import {
  coreDiagrams,
  homeLearningPathCards,
  homeMapNodes,
  homeOverviewCards,
} from "./pages";

const localizedCardCollections = [
  ["home learning cards", homeLearningPathCards],
  ["home overview cards", homeOverviewCards],
  ["diagram core cards", coreDiagrams],
] as const;

describe.each(localizedCardCollections)("%s", (_name, cards) => {
  it("keeps routes, order, and card shape aligned across locales", () => {
    const chineseCards = cards["zh-CN"];
    const englishCards = cards.en;

    expect(englishCards.map((card) => card.route)).toEqual(
      chineseCards.map((card) => card.route),
    );
    expect(englishCards.map((card) => Object.keys(card).sort())).toEqual(
      chineseCards.map((card) => Object.keys(card).sort()),
    );
  });
});

describe("home SVG nodes", () => {
  it.each(["zh-CN", "en"] as const)(
    "keeps exactly four nodes for %s",
    (locale) => {
      expect(homeMapNodes[locale]).toHaveLength(4);
    },
  );

  it("keeps node structure aligned across locales", () => {
    expect(homeMapNodes.en.map((node) => Object.keys(node).sort())).toEqual(
      homeMapNodes["zh-CN"].map((node) => Object.keys(node).sort()),
    );
  });
});

describe("home learning path cards", () => {
  it.each(["zh-CN", "en"] as const)(
    "derives order, routes, labels, and short titles from the registry for %s",
    (locale) => {
      expect(
        homeLearningPathCards[locale].map(({ route, label, title }) => ({
          route,
          label,
          title,
        })),
      ).toEqual(
        chapterRegistry.map((chapter) => ({
          route: chapter.route,
          label: `${chapter.kind === "demo" ? "Demo" : "Chapter"} ${chapter.number}`,
          title: chapter.shortTitle[locale],
        })),
      );
    },
  );
});
