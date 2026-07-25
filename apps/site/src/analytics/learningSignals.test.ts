import { describe, expect, it } from "vitest";
import {
  learningSignalAllowedFields,
  learningSignalCollectionMode,
  learningSignalNames,
  sanitizeLearningSignal,
} from "./learningSignals";

describe("learning signal privacy boundary", () => {
  it("keeps production collection disabled until a provider is approved", () => {
    expect(learningSignalCollectionMode).toBe("disabled");
  });

  it("uses the reviewed event allowlist", () => {
    expect(learningSignalNames).toEqual([
      "chapter_started",
      "core_interaction_completed",
      "concept_check_completed",
      "concept_explanation_opened",
      "next_chapter_continued",
    ]);
    expect(learningSignalAllowedFields).toEqual({
      chapter_started: ["name", "chapterId", "locale"],
      core_interaction_completed: [
        "name",
        "chapterId",
        "locale",
        "completionSource",
      ],
      concept_check_completed: [
        "name",
        "chapterId",
        "locale",
        "correct",
        "attempt",
      ],
      concept_explanation_opened: ["name", "chapterId", "locale"],
      next_chapter_continued: ["name", "chapterId", "locale", "nextChapterId"],
    });
  });

  it("copies only allowlisted fields and drops injected text or identifiers", () => {
    expect(
      sanitizeLearningSignal({
        name: "concept_check_completed",
        chapterId: "search",
        locale: "zh-CN",
        correct: false,
        attempt: "first",
        userText: "private answer",
        email: "learner@example.com",
        visitorId: "abc-123",
        timestamp: "2026-07-25T00:00:00Z",
      }),
    ).toEqual({
      name: "concept_check_completed",
      chapterId: "search",
      locale: "zh-CN",
      correct: false,
      attempt: "first",
    });
  });

  it.each([
    null,
    "chapter_started",
    { name: "unknown", chapterId: "search", locale: "zh-CN" },
    { name: "chapter_started", chapterId: "missing", locale: "zh-CN" },
    { name: "chapter_started", chapterId: "search", locale: "fr" },
    {
      name: "concept_check_completed",
      chapterId: "search",
      locale: "en",
      correct: "yes",
      attempt: "first",
    },
    {
      name: "next_chapter_continued",
      chapterId: "search",
      locale: "en",
      nextChapterId: "missing",
    },
  ])("rejects malformed signals %#", (value) => {
    expect(sanitizeLearningSignal(value)).toBeNull();
  });
});
