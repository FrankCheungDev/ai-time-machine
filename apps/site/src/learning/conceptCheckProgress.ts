import {
  isLearningChapterId,
  learningPath,
  type LearningChapterId,
} from "./learningPath";
import type { StorageLike } from "./learningProgress";

export const conceptCheckProgressStorageKey =
  "ai-history-concept-check-progress";
export const conceptCheckProgressChangedEventName =
  "ai-history:concept-check-progress-changed";

export interface ConceptCheckResult {
  chapterId: LearningChapterId;
  firstCorrect: boolean;
  attempts: number;
  explanationViewed: boolean;
}

export interface ConceptCheckProgress {
  version: 1;
  results: ConceptCheckResult[];
}

export interface ConceptCheckProgressSnapshot {
  progress: ConceptCheckProgress;
  storageAvailable: boolean;
}

export interface ConceptCheckProgressWriteResult extends ConceptCheckProgressSnapshot {
  persisted: boolean;
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

export function createEmptyConceptCheckProgress(): ConceptCheckProgress {
  return { version: 1, results: [] };
}

function parseResult(value: unknown): ConceptCheckResult | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("chapterId" in value) ||
    !isLearningChapterId(value.chapterId) ||
    !("firstCorrect" in value) ||
    typeof value.firstCorrect !== "boolean" ||
    !("attempts" in value) ||
    typeof value.attempts !== "number" ||
    !Number.isInteger(value.attempts) ||
    value.attempts < 1 ||
    !("explanationViewed" in value) ||
    typeof value.explanationViewed !== "boolean"
  ) {
    return undefined;
  }

  return {
    chapterId: value.chapterId,
    firstCorrect: value.firstCorrect,
    attempts: Math.min(value.attempts, 99),
    explanationViewed: value.explanationViewed,
  };
}

export function parseConceptCheckProgress(
  raw: string | null,
): ConceptCheckProgress {
  if (raw === null) return createEmptyConceptCheckProgress();

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
      return createEmptyConceptCheckProgress();
    }

    const byChapterId = new Map<LearningChapterId, ConceptCheckResult>();
    for (const candidate of parsed.results) {
      const result = parseResult(candidate);
      if (result && !byChapterId.has(result.chapterId)) {
        byChapterId.set(result.chapterId, result);
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
    return createEmptyConceptCheckProgress();
  }
}

export function readConceptCheckProgress(
  storage?: StorageLike | null,
): ConceptCheckProgressSnapshot {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return {
      progress: createEmptyConceptCheckProgress(),
      storageAvailable: false,
    };
  }

  try {
    return {
      progress: parseConceptCheckProgress(
        resolvedStorage.getItem(conceptCheckProgressStorageKey),
      ),
      storageAvailable: true,
    };
  } catch {
    return {
      progress: createEmptyConceptCheckProgress(),
      storageAvailable: false,
    };
  }
}

function writeConceptCheckProgress(
  progress: ConceptCheckProgress,
  storage?: StorageLike | null,
): ConceptCheckProgressWriteResult {
  const resolvedStorage = resolveStorage(storage);
  const current = readConceptCheckProgress(resolvedStorage);

  if (!resolvedStorage || !current.storageAvailable) {
    return { ...current, persisted: false };
  }

  try {
    resolvedStorage.setItem(
      conceptCheckProgressStorageKey,
      JSON.stringify(progress),
    );
    return { progress, persisted: true, storageAvailable: true };
  } catch {
    return { ...current, persisted: false, storageAvailable: false };
  }
}

export function recordConceptCheckAttempt(
  chapterId: LearningChapterId,
  correct: boolean,
  storage?: StorageLike | null,
): ConceptCheckProgressWriteResult {
  const current = readConceptCheckProgress(storage);
  const existing = current.progress.results.find(
    (result) => result.chapterId === chapterId,
  );
  const nextResult: ConceptCheckResult = existing
    ? {
        ...existing,
        attempts: Math.min(existing.attempts + 1, 99),
      }
    : {
        chapterId,
        firstCorrect: correct,
        attempts: 1,
        explanationViewed: false,
      };
  const resultsByChapterId = new Map(
    current.progress.results.map((result) => [result.chapterId, result]),
  );
  resultsByChapterId.set(chapterId, nextResult);
  const progress: ConceptCheckProgress = {
    version: 1,
    results: learningPath.flatMap(({ id }) => {
      const result = resultsByChapterId.get(id);
      return result ? [{ ...result }] : [];
    }),
  };

  return writeConceptCheckProgress(progress, storage);
}

export function markConceptExplanationViewed(
  chapterId: LearningChapterId,
  storage?: StorageLike | null,
): ConceptCheckProgressWriteResult {
  const current = readConceptCheckProgress(storage);
  const existing = current.progress.results.find(
    (result) => result.chapterId === chapterId,
  );

  if (!existing) {
    return { ...current, persisted: false };
  }

  const progress: ConceptCheckProgress = {
    version: 1,
    results: current.progress.results.map((result) =>
      result.chapterId === chapterId
        ? { ...result, explanationViewed: true }
        : { ...result },
    ),
  };

  return writeConceptCheckProgress(progress, storage);
}

export function resetConceptCheckProgress(
  storage?: StorageLike | null,
): ConceptCheckProgressWriteResult {
  const resolvedStorage = resolveStorage(storage);
  const current = readConceptCheckProgress(resolvedStorage);

  if (!resolvedStorage || !current.storageAvailable) {
    return { ...current, persisted: false };
  }

  try {
    resolvedStorage.removeItem(conceptCheckProgressStorageKey);
    return {
      progress: createEmptyConceptCheckProgress(),
      persisted: true,
      storageAvailable: true,
    };
  } catch {
    return { ...current, persisted: false, storageAvailable: false };
  }
}

export function dispatchConceptCheckProgressChanged(
  progress: ConceptCheckProgress,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(conceptCheckProgressChangedEventName, { detail: progress }),
  );
}
