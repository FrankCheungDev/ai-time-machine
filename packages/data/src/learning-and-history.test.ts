import { describe, expect, it } from "vitest";
import {
  chapterRegistry,
  getAiLineageNodes,
  getAiTimelineEvents,
  getConceptCheck,
  getConceptChecks,
} from "./index";

describe("source-backed timeline milestones", () => {
  it("keeps a chronological, unique, source-backed event set", () => {
    const events = getAiTimelineEvents();

    expect(events).toHaveLength(22);
    expect(new Set(events.map(({ id }) => id)).size).toBe(events.length);

    for (const [index, event] of events.entries()) {
      expect(event.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(event.year.trim()).not.toBe("");
      expect(event.title.trim()).not.toBe("");
      expect(event.summary.trim()).not.toBe("");
      expect(event.impact.trim()).not.toBe("");
      expect(event.chapterIds.length).toBeGreaterThan(0);
      expect(event.lineageNodeIds.length).toBeGreaterThan(0);
      expect(event.sources.length).toBeGreaterThan(0);
      expect(new Set(event.chapterIds).size).toBe(event.chapterIds.length);
      expect(new Set(event.lineageNodeIds).size).toBe(
        event.lineageNodeIds.length,
      );

      for (const source of event.sources) {
        expect(source.label.trim()).not.toBe("");
        expect(source.href).toMatch(/^https:\/\//);
        expect([
          "primary-paper",
          "book",
          "official-record",
          "standard",
        ]).toContain(source.kind);
      }

      if (index > 0) {
        expect(event.sortYear).toBeGreaterThanOrEqual(
          events[index - 1].sortYear,
        );
      }
    }
  });

  it("connects every chapter and only known lineage nodes", () => {
    const events = getAiTimelineEvents();
    const coveredChapterIds = new Set(
      events.flatMap(({ chapterIds }) => chapterIds),
    );
    const lineageNodeIds = new Set(getAiLineageNodes().map(({ id }) => id));

    expect([...coveredChapterIds]).toEqual(
      expect.arrayContaining(chapterRegistry.map(({ id }) => id)),
    );

    for (const event of events) {
      for (const lineageNodeId of event.lineageNodeIds) {
        expect(lineageNodeIds, `${event.id}:${lineageNodeId}`).toContain(
          lineageNodeId,
        );
      }
    }
  });

  it("localizes copy without changing historical identity or sources", () => {
    const project = (locale: "zh-CN" | "en") =>
      getAiTimelineEvents(locale).map(
        ({
          id,
          sortYear,
          year,
          type,
          chapterIds,
          lineageNodeIds,
          sources,
        }) => ({
          id,
          sortYear,
          year,
          type,
          chapterIds,
          lineageNodeIds,
          sources,
        }),
      );

    expect(project("en")).toEqual(project("zh-CN"));
    expect(getAiTimelineEvents("en")[0].title).not.toBe(
      getAiTimelineEvents("zh-CN")[0].title,
    );
  });

  it("labels books separately from papers", () => {
    const events = getAiTimelineEvents();
    const mycin = events.find(({ id }) => id === "mycin-consultation");
    const bayes = events.find(({ id }) => id === "bayesian-networks");

    expect(mycin?.sources[0].kind).toBe("book");
    expect(bayes?.type).toBe("book");
    expect(bayes?.sources[0].kind).toBe("book");
  });

  it("returns isolated event data", () => {
    const returned = getAiTimelineEvents();
    returned[0].chapterIds.push("safety");
    returned[0].lineageNodeIds.push("safety");
    returned[0].sources[0].label = "mutated";

    const fresh = getAiTimelineEvents();
    expect(fresh[0].chapterIds).not.toContain("safety");
    expect(fresh[0].lineageNodeIds).not.toContain("safety");
    expect(fresh[0].sources[0].label).toBe(
      "Computing Machinery and Intelligence",
    );
  });
});

describe("chapter concept checks", () => {
  it("covers every chapter once in canonical order", () => {
    const checks = getConceptChecks();

    expect(checks).toHaveLength(chapterRegistry.length);
    expect(checks.map(({ chapterId }) => chapterId)).toEqual(
      chapterRegistry.map(({ id }) => id),
    );
    expect(new Set(checks.map(({ id }) => id)).size).toBe(checks.length);
  });

  it("offers one unambiguous answer and explanatory feedback", () => {
    for (const check of getConceptChecks()) {
      expect(check.prompt.trim()).not.toBe("");
      expect(check.explanation.trim().length).toBeGreaterThan(40);
      expect(check.options).toHaveLength(3);
      expect(new Set(check.options.map(({ id }) => id)).size).toBe(3);
      expect(
        check.options.some(({ id }) => id === check.correctOptionId),
        check.id,
      ).toBe(true);
      expect(check.options.every(({ label }) => label.trim().length > 0)).toBe(
        true,
      );
    }
  });

  it("keeps option and answer contracts stable across locales", () => {
    for (const chapter of chapterRegistry) {
      const zh = getConceptCheck(chapter.id, "zh-CN");
      const en = getConceptCheck(chapter.id, "en");

      expect(en.id).toBe(zh.id);
      expect(en.chapterId).toBe(zh.chapterId);
      expect(en.correctOptionId).toBe(zh.correctOptionId);
      expect(en.options.map(({ id }) => id)).toEqual(
        zh.options.map(({ id }) => id),
      );
      expect(en.prompt).not.toBe(zh.prompt);
    }
  });

  it("returns isolated option data", () => {
    const returned = getConceptCheck("search");
    returned.options[0].label = "mutated";

    expect(getConceptCheck("search").options[0].label).not.toBe("mutated");
  });
});
