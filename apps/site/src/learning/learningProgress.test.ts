import { describe, expect, it } from "vitest";
import {
  completeLearningChapter,
  createEmptyLearningProgress,
  learningProgressStorageKey,
  parseLearningProgress,
  readLearningProgress,
  resetLearningProgress,
  type StorageLike,
} from "./learningProgress";

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

describe("learning progress parsing", () => {
  it.each([
    null,
    "{",
    "[]",
    JSON.stringify({ version: 2, completedChapterIds: ["overview"] }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, completedChapterIds: "overview" }),
    JSON.stringify({ version: "1", completedChapterIds: ["overview"] }),
  ])("returns empty v1 progress for invalid input %#", (raw) => {
    expect(parseLearningProgress(raw)).toEqual(createEmptyLearningProgress());
  });

  it("filters invalid entries and preserves learning-path order", () => {
    const raw = JSON.stringify({
      version: 1,
      completedChapterIds: [
        "rag",
        3,
        "search",
        "rag",
        "future-model",
        "overview",
      ],
    });

    expect(parseLearningProgress(raw)).toEqual({
      version: 1,
      completedChapterIds: ["overview", "search", "rag"],
    });
  });
});

describe("learning progress storage", () => {
  it("returns unavailable empty progress when reading fails without writing", () => {
    const storage = new MemoryStorage();
    storage.failRead = true;

    expect(readLearningProgress(storage)).toEqual({
      progress: createEmptyLearningProgress(),
      storageAvailable: false,
    });
    expect(storage.setCalls).toEqual([]);
    expect(storage.removeCalls).toEqual([]);
  });

  it("returns unavailable empty progress when browser storage is absent", () => {
    expect(readLearningProgress(null)).toEqual({
      progress: createEmptyLearningProgress(),
      storageAvailable: false,
    });
  });

  it("completes chapters idempotently and writes normalized v1 JSON", () => {
    const storage = new MemoryStorage(
      JSON.stringify({
        version: 1,
        completedChapterIds: ["rag", "overview", "rag", "future-model"],
      }),
    );
    const expectedProgress = {
      version: 1 as const,
      completedChapterIds: ["overview", "rag"] as const,
    };

    expect(completeLearningChapter("rag", storage)).toEqual({
      progress: expectedProgress,
      persisted: true,
      storageAvailable: true,
    });
    expect(completeLearningChapter("rag", storage)).toEqual({
      progress: expectedProgress,
      persisted: true,
      storageAvailable: true,
    });
    expect(storage.setCalls).toEqual([
      [learningProgressStorageKey, JSON.stringify(expectedProgress)],
      [learningProgressStorageKey, JSON.stringify(expectedProgress)],
    ]);
  });

  it("preserves the prior snapshot when writing fails", () => {
    const initialValue = JSON.stringify({
      version: 1,
      completedChapterIds: ["overview"],
    });
    const storage = new MemoryStorage(initialValue);
    storage.failWrite = true;

    expect(completeLearningChapter("search", storage)).toEqual({
      progress: { version: 1, completedChapterIds: ["overview"] },
      persisted: false,
      storageAvailable: false,
    });
    expect(storage.value).toBe(initialValue);
  });

  it("resets progress with removeItem", () => {
    const storage = new MemoryStorage(
      JSON.stringify({ version: 1, completedChapterIds: ["overview"] }),
    );

    expect(resetLearningProgress(storage)).toEqual({
      progress: createEmptyLearningProgress(),
      persisted: true,
      storageAvailable: true,
    });
    expect(storage.removeCalls).toEqual([learningProgressStorageKey]);
    expect(storage.setCalls).toEqual([]);
  });

  it("preserves the prior snapshot when reset fails", () => {
    const initialValue = JSON.stringify({
      version: 1,
      completedChapterIds: ["overview", "search"],
    });
    const storage = new MemoryStorage(initialValue);
    storage.failRemove = true;

    expect(resetLearningProgress(storage)).toEqual({
      progress: {
        version: 1,
        completedChapterIds: ["overview", "search"],
      },
      persisted: false,
      storageAvailable: false,
    });
    expect(storage.value).toBe(initialValue);
  });
});
