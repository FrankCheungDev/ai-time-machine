import { describe, expect, it } from "vitest";
import {
  conceptCheckProgressStorageKey,
  createEmptyConceptCheckProgress,
  markConceptExplanationViewed,
  parseConceptCheckProgress,
  readConceptCheckProgress,
  recordConceptCheckAttempt,
  resetConceptCheckProgress,
  type ConceptCheckProgress,
} from "./conceptCheckProgress";
import {
  isLearningChapterId,
  learningPath,
  type LearningChapterId,
} from "./learningPath";
import type { StorageLike } from "./learningProgress";

interface PublishedV1Result {
  chapterId: LearningChapterId;
  firstCorrect: boolean;
  attempts: number;
  explanationViewed: boolean;
}

interface PublishedV1Progress {
  version: 1;
  results: PublishedV1Result[];
}

function parseWithPublishedV1(raw: string): PublishedV1Progress {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("results" in parsed) ||
      !Array.isArray(parsed.results)
    ) {
      return { version: 1, results: [] };
    }

    const byChapterId = new Map<LearningChapterId, PublishedV1Result>();
    for (const candidate of parsed.results) {
      if (
        typeof candidate !== "object" ||
        candidate === null ||
        Array.isArray(candidate) ||
        !("chapterId" in candidate) ||
        !isLearningChapterId(candidate.chapterId) ||
        !("firstCorrect" in candidate) ||
        typeof candidate.firstCorrect !== "boolean" ||
        !("attempts" in candidate) ||
        typeof candidate.attempts !== "number" ||
        !Number.isInteger(candidate.attempts) ||
        candidate.attempts < 1 ||
        !("explanationViewed" in candidate) ||
        typeof candidate.explanationViewed !== "boolean"
      ) {
        continue;
      }

      if (!byChapterId.has(candidate.chapterId)) {
        byChapterId.set(candidate.chapterId, {
          chapterId: candidate.chapterId,
          firstCorrect: candidate.firstCorrect,
          attempts: Math.min(candidate.attempts, 99),
          explanationViewed: candidate.explanationViewed,
        });
      }
    }

    return {
      version: 1,
      results: learningPath.flatMap(({ id }) => {
        const result = byChapterId.get(id);
        return result ? [{ ...result }] : [];
      }),
    };
  } catch {
    return { version: 1, results: [] };
  }
}

class MemoryStorage implements StorageLike {
  value: string | null;
  readonly setCalls: Array<[string, string]> = [];
  readonly removeCalls: string[] = [];
  getCalls = 0;
  readFailuresRemaining = 0;
  failRead = false;
  failWrite = false;
  failRemove = false;

  constructor(value: string | null = null) {
    this.value = value;
  }

  getItem(): string | null {
    this.getCalls += 1;
    if (this.failRead || this.readFailuresRemaining > 0) {
      this.readFailuresRemaining = Math.max(this.readFailuresRemaining - 1, 0);
      throw new Error("read failed");
    }
    return this.value;
  }

  setItem(key: string, value: string): void {
    if (this.failWrite) throw new Error("write failed");
    this.setCalls.push([key, value]);
    this.value = value;
  }

  removeItem(key: string): void {
    if (this.failRemove) throw new Error("remove failed");
    this.removeCalls.push(key);
    this.value = null;
  }
}

describe("concept check progress parsing", () => {
  it.each([
    null,
    "{",
    "[]",
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, results: "search" }),
    JSON.stringify({ version: 2 }),
    JSON.stringify({ version: 2, results: "search" }),
    JSON.stringify({ results: [] }),
  ])("returns empty normalized progress for invalid input %#", (raw) => {
    expect(parseConceptCheckProgress(raw)).toEqual(
      createEmptyConceptCheckProgress(),
    );
  });

  it("migrates v1 review suggestions in memory without writing", () => {
    const storage = new MemoryStorage(
      JSON.stringify({
        version: 1,
        results: [
          {
            chapterId: "overview",
            firstCorrect: true,
            attempts: 1,
            explanationViewed: false,
          },
          {
            chapterId: "search",
            firstCorrect: true,
            attempts: 2,
            explanationViewed: true,
          },
          {
            chapterId: "rag",
            firstCorrect: false,
            attempts: 1,
            explanationViewed: false,
          },
        ],
      }),
    );

    expect(readConceptCheckProgress(storage)).toEqual({
      progress: {
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
          {
            chapterId: "search",
            firstCorrect: true,
            attempts: 2,
            explanationViewed: true,
            reviewSuggested: true,
          },
          {
            chapterId: "rag",
            firstCorrect: false,
            attempts: 1,
            explanationViewed: false,
            reviewSuggested: true,
          },
        ],
      },
      storageAvailable: true,
      schemaSupported: true,
    });
    expect(storage.setCalls).toEqual([]);
    expect(storage.value).toContain('"version":1');
  });

  it("filters malformed review-v2 results, deduplicates, caps attempts, and sorts", () => {
    const raw = JSON.stringify({
      version: 1,
      reviewVersion: 2,
      results: [
        {
          chapterId: "rag",
          firstCorrect: false,
          attempts: 120,
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
          chapterId: "rag",
          firstCorrect: true,
          attempts: 2,
          explanationViewed: false,
          reviewSuggested: false,
        },
        {
          chapterId: "missing",
          firstCorrect: true,
          attempts: 1,
          explanationViewed: false,
          reviewSuggested: false,
        },
        {
          chapterId: "search",
          firstCorrect: true,
          attempts: 1,
          explanationViewed: false,
        },
      ],
    });

    expect(parseConceptCheckProgress(raw)).toEqual({
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
        {
          chapterId: "rag",
          firstCorrect: false,
          attempts: 99,
          explanationViewed: true,
          reviewSuggested: true,
        },
      ],
    });
  });

  it("keeps every chapter when published v1 code rewrites review-v2 progress", () => {
    const current: ConceptCheckProgress = {
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
        {
          chapterId: "search",
          firstCorrect: false,
          attempts: 1,
          explanationViewed: false,
          reviewSuggested: true,
        },
        {
          chapterId: "rag",
          firstCorrect: true,
          attempts: 2,
          explanationViewed: true,
          reviewSuggested: false,
        },
      ],
    };

    const publishedV1Progress = parseWithPublishedV1(JSON.stringify(current));
    expect(publishedV1Progress).toEqual({
      version: 1,
      results: current.results.map(
        ({ reviewSuggested: _reviewSuggested, ...result }) => result,
      ),
    });

    const rewrittenByPublishedV1: PublishedV1Progress = {
      version: 1,
      results: publishedV1Progress.results.map((result) =>
        result.chapterId === "search"
          ? { ...result, attempts: result.attempts + 1 }
          : { ...result },
      ),
    };
    const rewrittenRaw = JSON.stringify(rewrittenByPublishedV1);

    expect(
      rewrittenByPublishedV1.results.map(({ chapterId }) => chapterId),
    ).toEqual(["overview", "search", "rag"]);
    expect(rewrittenRaw).not.toContain("reviewVersion");
    expect(rewrittenRaw).not.toContain("reviewSuggested");
    expect(parseConceptCheckProgress(rewrittenRaw)).toEqual({
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
        {
          chapterId: "search",
          firstCorrect: false,
          attempts: 2,
          explanationViewed: false,
          reviewSuggested: true,
        },
        {
          chapterId: "rag",
          firstCorrect: true,
          attempts: 2,
          explanationViewed: true,
          reviewSuggested: true,
        },
      ],
    });
  });
});

describe("concept check progress storage", () => {
  it("returns an unsupported unavailable snapshot without storage", () => {
    expect(readConceptCheckProgress(null)).toEqual({
      progress: createEmptyConceptCheckProgress(),
      storageAvailable: false,
      schemaSupported: false,
    });
  });

  it("does not suggest review after a correct first answer", () => {
    const result = recordConceptCheckAttempt(
      "overview",
      true,
      new MemoryStorage(),
    );

    expect(result.progress.results[0]).toEqual({
      chapterId: "overview",
      firstCorrect: true,
      attempts: 1,
      explanationViewed: false,
      reviewSuggested: false,
    });
  });

  it("records review transitions while preserving first correctness", () => {
    const storage = new MemoryStorage();

    const first = recordConceptCheckAttempt("search", false, storage);
    expect(first).toEqual({
      progress: {
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
      },
      persisted: true,
      storageAvailable: true,
      schemaSupported: true,
    });

    const correctRetry = recordConceptCheckAttempt("search", true, storage);
    expect(correctRetry.progress.results[0]).toEqual({
      chapterId: "search",
      firstCorrect: false,
      attempts: 2,
      explanationViewed: false,
      reviewSuggested: false,
    });

    const incorrectRetry = recordConceptCheckAttempt("search", false, storage);
    expect(incorrectRetry.progress.results[0]).toEqual({
      chapterId: "search",
      firstCorrect: false,
      attempts: 3,
      explanationViewed: false,
      reviewSuggested: true,
    });
    expect(storage.setCalls.at(-1)).toEqual([
      conceptCheckProgressStorageKey,
      JSON.stringify(incorrectRetry.progress),
    ]);
  });

  it("writes normalized review-v2 only after mutating migrated v1 progress", () => {
    const storage = new MemoryStorage(
      JSON.stringify({
        version: 1,
        results: [
          {
            chapterId: "overview",
            firstCorrect: true,
            attempts: 1,
            explanationViewed: false,
          },
          {
            chapterId: "rag",
            firstCorrect: false,
            attempts: 1,
            explanationViewed: true,
          },
        ],
      }),
    );

    const result = recordConceptCheckAttempt("rag", true, storage);

    expect(result.progress).toEqual({
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
        {
          chapterId: "rag",
          firstCorrect: false,
          attempts: 2,
          explanationViewed: true,
          reviewSuggested: false,
        },
      ],
    });
    expect(storage.setCalls).toEqual([
      [conceptCheckProgressStorageKey, JSON.stringify(result.progress)],
    ]);
    expect(storage.getCalls).toBe(1);
  });

  it("marks an explanation viewed without changing its review suggestion", () => {
    const storage = new MemoryStorage();

    expect(markConceptExplanationViewed("search", storage).persisted).toBe(
      false,
    );
    recordConceptCheckAttempt("search", false, storage);

    const viewed = markConceptExplanationViewed("search", storage);
    expect(viewed.persisted).toBe(true);
    expect(viewed.progress.results[0]).toMatchObject({
      explanationViewed: true,
      reviewSuggested: true,
    });
  });

  it("returns unavailable progress when storage reads or writes fail", () => {
    const storage = new MemoryStorage();
    storage.failRead = true;
    expect(readConceptCheckProgress(storage)).toEqual({
      progress: createEmptyConceptCheckProgress(),
      storageAvailable: false,
      schemaSupported: false,
    });

    storage.failRead = false;
    recordConceptCheckAttempt("overview", true, storage);
    const priorValue = storage.value;
    storage.failWrite = true;

    expect(recordConceptCheckAttempt("search", true, storage)).toEqual({
      progress: {
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
      },
      persisted: false,
      storageAvailable: false,
      schemaSupported: true,
    });
    expect(storage.value).toBe(priorValue);
  });

  it("does not retry or overwrite after a transient read failure", () => {
    const initialValue = JSON.stringify({
      version: 1,
      reviewVersion: 2,
      results: [
        {
          chapterId: "overview",
          firstCorrect: false,
          attempts: 1,
          explanationViewed: true,
          reviewSuggested: true,
        },
      ],
    });
    const storage = new MemoryStorage(initialValue);
    storage.readFailuresRemaining = 1;

    expect(recordConceptCheckAttempt("search", true, storage)).toEqual({
      progress: createEmptyConceptCheckProgress(),
      persisted: false,
      storageAvailable: false,
      schemaSupported: false,
    });
    expect(storage.getCalls).toBe(1);
    expect(storage.setCalls).toEqual([]);
    expect(storage.value).toBe(initialValue);

    expect(readConceptCheckProgress(storage).progress.results).toHaveLength(1);
  });

  it.each([
    {
      schema: "root version",
      value: {
        version: 3,
        results: [{ chapterId: "overview", futureState: "keep" }],
      },
    },
    {
      schema: "review version",
      value: {
        version: 1,
        reviewVersion: 3,
        results: [{ chapterId: "overview", futureState: "keep" }],
      },
    },
  ])(
    "keeps an unknown $schema visible and does not overwrite it",
    ({ value }) => {
      const futureValue = JSON.stringify(value);
      const readStorage = new MemoryStorage(futureValue);
      const attemptStorage = new MemoryStorage(futureValue);
      const explanationStorage = new MemoryStorage(futureValue);
      const unsupportedSnapshot = {
        progress: createEmptyConceptCheckProgress(),
        storageAvailable: true,
        schemaSupported: false,
      };

      expect(readConceptCheckProgress(readStorage)).toEqual(
        unsupportedSnapshot,
      );
      expect(
        recordConceptCheckAttempt("search", false, attemptStorage),
      ).toEqual({ ...unsupportedSnapshot, persisted: false });
      expect(
        markConceptExplanationViewed("overview", explanationStorage),
      ).toEqual({ ...unsupportedSnapshot, persisted: false });
      expect(attemptStorage.setCalls).toEqual([]);
      expect(explanationStorage.setCalls).toEqual([]);
      expect(attemptStorage.value).toBe(futureValue);
      expect(explanationStorage.value).toBe(futureValue);
    },
  );

  it("clears all self-check progress", () => {
    const storage = new MemoryStorage(
      JSON.stringify({
        version: 1,
        reviewVersion: 2,
        results: [
          {
            chapterId: "search",
            firstCorrect: true,
            attempts: 1,
            explanationViewed: true,
            reviewSuggested: false,
          },
        ],
      }),
    );

    expect(resetConceptCheckProgress(storage)).toEqual({
      progress: createEmptyConceptCheckProgress(),
      persisted: true,
      storageAvailable: true,
      schemaSupported: true,
    });
    expect(storage.removeCalls).toEqual([conceptCheckProgressStorageKey]);
  });

  it("preserves progress when clearing fails", () => {
    const initialValue = JSON.stringify({
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
    });
    const storage = new MemoryStorage(initialValue);
    storage.failRemove = true;

    expect(resetConceptCheckProgress(storage)).toEqual({
      progress: parseConceptCheckProgress(initialValue),
      persisted: false,
      storageAvailable: false,
      schemaSupported: true,
    });
    expect(storage.value).toBe(initialValue);
  });
});
