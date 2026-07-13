import {
  isLearningChapterId,
  learningPath,
  type LearningChapterId,
} from "./learningPath";

export const learningProgressStorageKey = "ai-history-learning-progress";
export const learningProgressChangedEventName =
  "ai-history:learning-progress-changed";

export interface LearningProgress {
  version: 1;
  completedChapterIds: LearningChapterId[];
}

export interface LearningProgressSnapshot {
  progress: LearningProgress;
  storageAvailable: boolean;
}

export interface LearningProgressWriteResult extends LearningProgressSnapshot {
  persisted: boolean;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) return storage;
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createEmptyLearningProgress(): LearningProgress {
  return { version: 1, completedChapterIds: [] };
}

export function parseLearningProgress(raw: string | null): LearningProgress {
  if (raw === null) return createEmptyLearningProgress();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("completedChapterIds" in parsed) ||
      !Array.isArray(parsed.completedChapterIds)
    ) {
      return createEmptyLearningProgress();
    }

    const completed = new Set(
      parsed.completedChapterIds.filter(isLearningChapterId),
    );

    return {
      version: 1,
      completedChapterIds: learningPath
        .filter(({ id }) => completed.has(id))
        .map(({ id }) => id),
    };
  } catch {
    return createEmptyLearningProgress();
  }
}

export function readLearningProgress(
  storage?: StorageLike | null,
): LearningProgressSnapshot {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return {
      progress: createEmptyLearningProgress(),
      storageAvailable: false,
    };
  }

  try {
    return {
      progress: parseLearningProgress(
        resolvedStorage.getItem(learningProgressStorageKey),
      ),
      storageAvailable: true,
    };
  } catch {
    return {
      progress: createEmptyLearningProgress(),
      storageAvailable: false,
    };
  }
}

export function completeLearningChapter(
  id: LearningChapterId,
  storage?: StorageLike | null,
): LearningProgressWriteResult {
  const resolvedStorage = resolveStorage(storage);
  const current = readLearningProgress(resolvedStorage);

  if (!resolvedStorage || !current.storageAvailable) {
    return { ...current, persisted: false };
  }

  const completed = new Set([...current.progress.completedChapterIds, id]);
  const progress: LearningProgress = {
    version: 1,
    completedChapterIds: learningPath
      .filter(({ id: chapterId }) => completed.has(chapterId))
      .map(({ id: chapterId }) => chapterId),
  };

  try {
    resolvedStorage.setItem(
      learningProgressStorageKey,
      JSON.stringify(progress),
    );
    return { progress, persisted: true, storageAvailable: true };
  } catch {
    return { ...current, persisted: false, storageAvailable: false };
  }
}

export function resetLearningProgress(
  storage?: StorageLike | null,
): LearningProgressWriteResult {
  const resolvedStorage = resolveStorage(storage);
  const current = readLearningProgress(resolvedStorage);

  if (!resolvedStorage || !current.storageAvailable) {
    return { ...current, persisted: false };
  }

  try {
    resolvedStorage.removeItem(learningProgressStorageKey);
    return {
      progress: createEmptyLearningProgress(),
      persisted: true,
      storageAvailable: true,
    };
  } catch {
    return { ...current, persisted: false, storageAvailable: false };
  }
}

export function dispatchLearningProgressChanged(
  progress: LearningProgress,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(learningProgressChangedEventName, { detail: progress }),
  );
}
