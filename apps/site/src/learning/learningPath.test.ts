import { describe, expect, it } from "vitest";
import { chapterRegistry } from "@ai-history/data/chapters";
import {
  getFirstIncompleteChapter,
  getLearningPathContext,
  isLearningChapterId,
  learningPath,
} from "./learningPath";

const expected = [
  ["overview", "/chapters/overview/", "chapter"],
  ["search", "/chapters/search/", "demo"],
  ["expert-system", "/chapters/expert-system/", "demo"],
  ["bayes", "/chapters/bayes/", "demo"],
  ["decision-boundary", "/chapters/decision-boundary/", "demo"],
  ["cnn", "/chapters/cnn/", "demo"],
  ["attention", "/chapters/attention/", "demo"],
  ["llm-system", "/chapters/llm-system/", "chapter"],
  ["rag", "/chapters/rag/", "demo"],
  ["agent", "/chapters/agent/", "demo"],
] as const;

describe("learningPath", () => {
  it("keeps the release order as a stable product contract", () => {
    expect(
      learningPath.map(({ id, route, kind }) => [id, route, kind]),
    ).toEqual(expected);
    expect(new Set(learningPath.map(({ id }) => id)).size).toBe(10);
    expect(new Set(learningPath.map(({ route }) => route)).size).toBe(10);
    expect(learningPath).toEqual(
      chapterRegistry.map(({ id, route, kind }) => ({ id, route, kind })),
    );
  });

  it("returns bounded previous and next chapters", () => {
    expect(getLearningPathContext("overview").previous).toBeUndefined();
    expect(getLearningPathContext("overview").next?.id).toBe("search");
    expect(getLearningPathContext("rag").previous?.id).toBe("llm-system");
    expect(getLearningPathContext("rag").next?.id).toBe("agent");
    expect(getLearningPathContext("agent").next).toBeUndefined();
  });

  it("finds the earliest gap regardless of completion order", () => {
    expect(getFirstIncompleteChapter([])?.id).toBe("overview");
    expect(getFirstIncompleteChapter(["overview", "expert-system"])?.id).toBe(
      "search",
    );
    expect(
      getFirstIncompleteChapter(learningPath.map(({ id }) => id)),
    ).toBeUndefined();
  });

  it("validates only known IDs", () => {
    expect(isLearningChapterId("rag")).toBe(true);
    expect(isLearningChapterId("future-model")).toBe(false);
    expect(isLearningChapterId(9)).toBe(false);
  });
});
