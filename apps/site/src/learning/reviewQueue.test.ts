import { describe, expect, it } from "vitest";
import type { ConceptCheckProgress } from "./conceptCheckProgress";
import { getReviewQueue } from "./reviewQueue";

describe("review queue", () => {
  it("returns only suggested results in learning-path order", () => {
    const progress: ConceptCheckProgress = {
      version: 1,
      reviewVersion: 2,
      results: [
        {
          chapterId: "rag",
          firstCorrect: false,
          attempts: 2,
          explanationViewed: true,
          reviewSuggested: true,
        },
        {
          chapterId: "overview",
          firstCorrect: true,
          attempts: 1,
          explanationViewed: false,
          reviewSuggested: false,
        },
        {
          chapterId: "search",
          firstCorrect: true,
          attempts: 2,
          explanationViewed: false,
          reviewSuggested: true,
        },
      ],
    };

    expect(getReviewQueue(progress)).toEqual([
      progress.results[2],
      progress.results[0],
    ]);
  });

  it("returns isolated records without mutating progress", () => {
    const progress: ConceptCheckProgress = {
      version: 1,
      reviewVersion: 2,
      results: [
        {
          chapterId: "search",
          firstCorrect: false,
          attempts: 1,
          explanationViewed: false,
          reviewSuggested: true,
        },
      ],
    };

    const queue = getReviewQueue(progress);
    queue[0].attempts = 99;

    expect(progress.results[0].attempts).toBe(1);
  });

  it("returns an empty queue when every result is resolved", () => {
    expect(
      getReviewQueue({
        version: 1,
        reviewVersion: 2,
        results: [
          {
            chapterId: "overview",
            firstCorrect: true,
            attempts: 1,
            explanationViewed: false,
            reviewSuggested: false,
          },
        ],
      }),
    ).toEqual([]);
  });
});
