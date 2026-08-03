import { describe, expect, it } from "vitest";
import { learningPath } from "../learning/learningPath";
import {
  getLocalizedChapterContextLinks,
  getLocalizedLearningChapter,
  learningUiCopy,
} from "./learning";

describe("learning i18n", () => {
  it("localizes every chapter without changing stable IDs", () => {
    for (const chapter of learningPath) {
      const zh = getLocalizedLearningChapter(chapter.id, "zh-CN");
      const en = getLocalizedLearningChapter(chapter.id, "en");
      expect(zh.id).toBe(chapter.id);
      expect(en.id).toBe(chapter.id);
      expect(zh.title.length).toBeGreaterThan(0);
      expect(en.title.length).toBeGreaterThan(0);
      expect(zh.number).toMatch(/^\d{2}$/);
      expect(en.number).toBe(zh.number);
      expect(zh.label).toMatch(/^(Chapter|Demo) \d{2}$/);
      expect(en.label).toBe(zh.label);
      expect(zh.href).toBe(chapter.route);
      expect(en.href).toBe(`/en${chapter.route}`);
    }
  });

  it("provides short activity titles only for demo chapters", () => {
    for (const chapter of learningPath) {
      const localized = getLocalizedLearningChapter(chapter.id, "en");
      expect(Boolean(localized.activityTitle)).toBe(chapter.kind === "demo");
    }
    expect(getLocalizedLearningChapter("rag", "zh-CN").activityTitle).toBe(
      "RAG 流程演示",
    );
    expect(getLocalizedLearningChapter("rag", "en").activityTitle).toBe(
      "RAG Pipeline Walkthrough",
    );
  });

  it("formats dynamic progress copy", () => {
    expect(learningUiCopy["zh-CN"].completedCount(3, 10)).toBe("已完成 3 / 10");
    expect(learningUiCopy.en.continueLearning("Search Trees")).toBe(
      "Continue: Search Trees",
    );
  });

  it("localizes chapter context links from the chapter registry", () => {
    expect(getLocalizedChapterContextLinks("overview", "zh-CN")).toEqual([]);
    expect(getLocalizedChapterContextLinks("rag", "zh-CN")).toEqual([
      {
        kind: "timeline",
        href: "/timeline/?chapter=rag#timeline-milestones",
        label: "在时间线中查看本章",
      },
      {
        kind: "lineage",
        href: "/lineage/?lineage=rag#node-rag",
        label: "在技术谱系中查看本章",
      },
    ]);
    expect(getLocalizedChapterContextLinks("llm-system", "en")).toEqual([
      {
        kind: "timeline",
        href: "/en/timeline/?chapter=llm-system#timeline-milestones",
        label: "View this chapter in the timeline",
      },
      {
        kind: "lineage",
        href: "/en/lineage/?lineage=llm-system#node-llm-system",
        label: "View this chapter in the technology lineage",
      },
    ]);
  });
});
