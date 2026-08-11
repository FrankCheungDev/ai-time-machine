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
  reviewSuggested: boolean;
}

export interface ConceptCheckProgress {
  version: 1;
  reviewVersion: 2;
  results: ConceptCheckResult[];
}

export interface ConceptCheckProgressSnapshot {
  progress: ConceptCheckProgress;
  storageAvailable: boolean;
  schemaSupported: boolean;
}

export interface ConceptCheckProgressWriteResult extends ConceptCheckProgressSnapshot {
  persisted: boolean;
}

interface DecodedConceptCheckProgress {
  progress: ConceptCheckProgress;
  schemaSupported: boolean;
}

interface ConceptCheckProgressReadContext {
  snapshot: ConceptCheckProgressSnapshot;
  storage: StorageLike | null;
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
  return { version: 1, reviewVersion: 2, results: [] };
}

function parseResult(
  value: unknown,
  reviewVersion: 1 | 2,
): ConceptCheckResult | undefined {
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

  const result = {
    chapterId: value.chapterId,
    firstCorrect: value.firstCorrect,
    attempts: Math.min(value.attempts, 99),
    explanationViewed: value.explanationViewed,
  };

  if (reviewVersion === 1) {
    return {
      ...result,
      reviewSuggested: !result.firstCorrect || result.attempts > 1,
    };
  }

  if (
    !("reviewSuggested" in value) ||
    typeof value.reviewSuggested !== "boolean"
  ) {
    return undefined;
  }

  return { ...result, reviewSuggested: value.reviewSuggested };
}

function decodeConceptCheckProgress(
  raw: string | null,
): DecodedConceptCheckProgress {
  if (raw === null) {
    return {
      progress: createEmptyConceptCheckProgress(),
      schemaSupported: true,
    };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {
        progress: createEmptyConceptCheckProgress(),
        schemaSupported: true,
      };
    }

    if ("version" in parsed && parsed.version !== 1) {
      return {
        progress: createEmptyConceptCheckProgress(),
        schemaSupported: false,
      };
    }

    if (
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("results" in parsed) ||
      !Array.isArray(parsed.results)
    ) {
      return {
        progress: createEmptyConceptCheckProgress(),
        schemaSupported: true,
      };
    }

    if ("reviewVersion" in parsed && parsed.reviewVersion !== 2) {
      return {
        progress: createEmptyConceptCheckProgress(),
        schemaSupported: false,
      };
    }

    const reviewVersion = "reviewVersion" in parsed ? 2 : 1;
    const byChapterId = new Map<LearningChapterId, ConceptCheckResult>();
    for (const candidate of parsed.results) {
      const result = parseResult(candidate, reviewVersion);
      if (result && !byChapterId.has(result.chapterId)) {
        byChapterId.set(result.chapterId, result);
      }
    }

    return {
      progress: {
        version: 1,
        reviewVersion: 2,
        results: learningPath.flatMap(({ id }) => {
          const result = byChapterId.get(id);
          return result ? [{ ...result }] : [];
        }),
      },
      schemaSupported: true,
    };
  } catch {
    return {
      progress: createEmptyConceptCheckProgress(),
      schemaSupported: true,
    };
  }
}

export function parseConceptCheckProgress(
  raw: string | null,
): ConceptCheckProgress {
  return decodeConceptCheckProgress(raw).progress;
}

function readConceptCheckProgressContext(
  storage?: StorageLike | null,
): ConceptCheckProgressReadContext {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return {
      snapshot: {
        progress: createEmptyConceptCheckProgress(),
        storageAvailable: false,
        schemaSupported: false,
      },
      storage: null,
    };
  }

  try {
    const decoded = decodeConceptCheckProgress(
      resolvedStorage.getItem(conceptCheckProgressStorageKey),
    );

    return {
      snapshot: {
        progress: decoded.progress,
        storageAvailable: true,
        schemaSupported: decoded.schemaSupported,
      },
      storage: resolvedStorage,
    };
  } catch {
    return {
      snapshot: {
        progress: createEmptyConceptCheckProgress(),
        storageAvailable: false,
        schemaSupported: false,
      },
      storage: resolvedStorage,
    };
  }
}

export function readConceptCheckProgress(
  storage?: StorageLike | null,
): ConceptCheckProgressSnapshot {
  return readConceptCheckProgressContext(storage).snapshot;
}

function writeConceptCheckProgress(
  progress: ConceptCheckProgress,
  current: ConceptCheckProgressSnapshot,
  storage: StorageLike,
): ConceptCheckProgressWriteResult {
  try {
    storage.setItem(conceptCheckProgressStorageKey, JSON.stringify(progress));
    return {
      progress,
      persisted: true,
      storageAvailable: true,
      schemaSupported: true,
    };
  } catch {
    return { ...current, persisted: false, storageAvailable: false };
  }
}

export function recordConceptCheckAttempt(
  chapterId: LearningChapterId,
  correct: boolean,
  storage?: StorageLike | null,
): ConceptCheckProgressWriteResult {
  const context = readConceptCheckProgressContext(storage);
  const current = context.snapshot;

  if (
    !context.storage ||
    !current.storageAvailable ||
    !current.schemaSupported
  ) {
    return { ...current, persisted: false };
  }

  const existing = current.progress.results.find(
    (result) => result.chapterId === chapterId,
  );
  const nextResult: ConceptCheckResult = existing
    ? {
        ...existing,
        attempts: Math.min(existing.attempts + 1, 99),
        reviewSuggested: !correct,
      }
    : {
        chapterId,
        firstCorrect: correct,
        attempts: 1,
        explanationViewed: false,
        reviewSuggested: !correct,
      };
  const resultsByChapterId = new Map(
    current.progress.results.map((result) => [result.chapterId, result]),
  );
  resultsByChapterId.set(chapterId, nextResult);
  const progress: ConceptCheckProgress = {
    version: 1,
    reviewVersion: 2,
    results: learningPath.flatMap(({ id }) => {
      const result = resultsByChapterId.get(id);
      return result ? [{ ...result }] : [];
    }),
  };

  return writeConceptCheckProgress(progress, current, context.storage);
}

export function markConceptExplanationViewed(
  chapterId: LearningChapterId,
  storage?: StorageLike | null,
): ConceptCheckProgressWriteResult {
  const context = readConceptCheckProgressContext(storage);
  const current = context.snapshot;

  if (
    !context.storage ||
    !current.storageAvailable ||
    !current.schemaSupported
  ) {
    return { ...current, persisted: false };
  }

  const existing = current.progress.results.find(
    (result) => result.chapterId === chapterId,
  );

  if (!existing) {
    return { ...current, persisted: false };
  }

  const progress: ConceptCheckProgress = {
    version: 1,
    reviewVersion: 2,
    results: current.progress.results.map((result) =>
      result.chapterId === chapterId
        ? { ...result, explanationViewed: true }
        : { ...result },
    ),
  };

  return writeConceptCheckProgress(progress, current, context.storage);
}

export function resetConceptCheckProgress(
  storage?: StorageLike | null,
): ConceptCheckProgressWriteResult {
  const context = readConceptCheckProgressContext(storage);
  const current = context.snapshot;

  if (!context.storage || !current.storageAvailable) {
    return { ...current, persisted: false };
  }

  try {
    context.storage.removeItem(conceptCheckProgressStorageKey);
    return {
      progress: createEmptyConceptCheckProgress(),
      persisted: true,
      storageAvailable: true,
      schemaSupported: true,
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
