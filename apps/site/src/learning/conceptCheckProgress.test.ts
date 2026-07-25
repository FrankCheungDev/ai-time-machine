import { describe, expect, it } from "vitest";
import {
  conceptCheckProgressStorageKey,
  createEmptyConceptCheckProgress,
  markConceptExplanationViewed,
  parseConceptCheckProgress,
  readConceptCheckProgress,
  recordConceptCheckAttempt,
  resetConceptCheckProgress,
} from "./conceptCheckProgress";
import type { StorageLike } from "./learningProgress";

class MemoryStorage implements StorageLike {
  value: string | null;
  readonly setCalls: Array<[string, string]> = [];
  readonly removeCalls: string[] = [];
  failRead = false;
  failWrite = false;
  failRemove = false;

  constructor(value: string | null = null) {
    this.value = value;
  }

  getItem(): string | null {
    if (this.failRead) throw new Error("read failed");
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
    JSON.stringify({ version: 2, results: [] }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, results: "search" }),
  ])("returns empty v1 progress for invalid input %#", (raw) => {
    expect(parseConceptCheckProgress(raw)).toEqual(
      createEmptyConceptCheckProgress(),
    );
  });

  it("filters malformed results, deduplicates, caps attempts, and sorts", () => {
    const raw = JSON.stringify({
      version: 1,
      results: [
        {
          chapterId: "rag",
          firstCorrect: false,
          attempts: 120,
          explanationViewed: true,
        },
        {
          chapterId: "overview",
          firstCorrect: true,
          attempts: 1,
          explanationViewed: false,
        },
        {
          chapterId: "rag",
          firstCorrect: true,
          attempts: 2,
          explanationViewed: false,
        },
        {
          chapterId: "missing",
          firstCorrect: true,
          attempts: 1,
          explanationViewed: false,
        },
        {
          chapterId: "search",
          firstCorrect: "yes",
          attempts: 1,
          explanationViewed: false,
        },
      ],
    });

    expect(parseConceptCheckProgress(raw)).toEqual({
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
          attempts: 99,
          explanationViewed: true,
        },
      ],
    });
  });
});

describe("concept check progress storage", () => {
  it("records first correctness and preserves it across retries", () => {
    const storage = new MemoryStorage();

    const first = recordConceptCheckAttempt("search", false, storage);
    expect(first).toEqual({
      progress: {
        version: 1,
        results: [
          {
            chapterId: "search",
            firstCorrect: false,
            attempts: 1,
            explanationViewed: false,
          },
        ],
      },
      persisted: true,
      storageAvailable: true,
    });

    const retry = recordConceptCheckAttempt("search", true, storage);
    expect(retry.progress.results[0]).toEqual({
      chapterId: "search",
      firstCorrect: false,
      attempts: 2,
      explanationViewed: false,
    });
    expect(storage.setCalls.at(-1)).toEqual([
      conceptCheckProgressStorageKey,
      JSON.stringify(retry.progress),
    ]);
  });

  it("marks an explanation viewed only after a result exists", () => {
    const storage = new MemoryStorage();

    expect(markConceptExplanationViewed("search", storage).persisted).toBe(
      false,
    );
    recordConceptCheckAttempt("search", true, storage);

    const viewed = markConceptExplanationViewed("search", storage);
    expect(viewed.persisted).toBe(true);
    expect(viewed.progress.results[0].explanationViewed).toBe(true);
  });

  it("returns unavailable progress when storage reads or writes fail", () => {
    const storage = new MemoryStorage();
    storage.failRead = true;
    expect(readConceptCheckProgress(storage)).toEqual({
      progress: createEmptyConceptCheckProgress(),
      storageAvailable: false,
    });

    storage.failRead = false;
    storage.failWrite = true;
    expect(recordConceptCheckAttempt("search", true, storage).persisted).toBe(
      false,
    );
  });

  it("clears all self-check progress", () => {
    const storage = new MemoryStorage(
      JSON.stringify({
        version: 1,
        results: [
          {
            chapterId: "search",
            firstCorrect: true,
            attempts: 1,
            explanationViewed: true,
          },
        ],
      }),
    );

    expect(resetConceptCheckProgress(storage)).toEqual({
      progress: createEmptyConceptCheckProgress(),
      persisted: true,
      storageAvailable: true,
    });
    expect(storage.removeCalls).toEqual([conceptCheckProgressStorageKey]);
  });
});
