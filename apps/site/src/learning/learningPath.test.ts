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
  ["reinforcement-learning", "/chapters/reinforcement-learning/", "demo"],
  ["attention", "/chapters/attention/", "demo"],
  ["foundation-model", "/chapters/foundation-model/", "demo"],
  ["llm-system", "/chapters/llm-system/", "demo"],
  ["rag", "/chapters/rag/", "demo"],
  ["agent", "/chapters/agent/", "demo"],
  ["safety", "/chapters/safety/", "demo"],
] as const;

describe("learningPath", () => {
  it("keeps the release order as a stable product contract", () => {
    expect(
      learningPath.map(({ id, route, kind }) => [id, route, kind]),
    ).toEqual(expected);
    expect(new Set(learningPath.map(({ id }) => id)).size).toBe(13);
    expect(new Set(learningPath.map(({ route }) => route)).size).toBe(13);
    expect(learningPath).toEqual(
      chapterRegistry.map(({ id, route, kind }) => ({ id, route, kind })),
    );
  });

  it("returns bounded previous and next chapters", () => {
    expect(getLearningPathContext("overview").previous).toBeUndefined();
    expect(getLearningPathContext("overview").next?.id).toBe("search");
    expect(getLearningPathContext("reinforcement-learning").previous?.id).toBe(
      "cnn",
    );
    expect(getLearningPathContext("reinforcement-learning").next?.id).toBe(
      "attention",
    );
    expect(getLearningPathContext("foundation-model").previous?.id).toBe(
      "attention",
    );
    expect(getLearningPathContext("foundation-model").next?.id).toBe(
      "llm-system",
    );
    expect(getLearningPathContext("rag").previous?.id).toBe("llm-system");
    expect(getLearningPathContext("rag").next?.id).toBe("agent");
    expect(getLearningPathContext("agent").next?.id).toBe("safety");
    expect(getLearningPathContext("safety").previous?.id).toBe("agent");
    expect(getLearningPathContext("safety").next).toBeUndefined();
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

  it("keeps v1.4 IDs complete while surfacing the inserted chapter as the first gap", () => {
    const completedBeforeV15 = [
      "overview",
      "search",
      "expert-system",
      "bayes",
      "decision-boundary",
      "cnn",
      "attention",
      "foundation-model",
      "llm-system",
      "rag",
      "agent",
      "safety",
    ] as const;

    expect(getFirstIncompleteChapter(completedBeforeV15)?.id).toBe(
      "reinforcement-learning",
    );
  });

  it("validates only known IDs", () => {
    expect(isLearningChapterId("rag")).toBe(true);
    expect(isLearningChapterId("future-model")).toBe(false);
    expect(isLearningChapterId(9)).toBe(false);
  });
});
