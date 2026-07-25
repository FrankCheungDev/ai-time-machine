import { isChapterId, type ChapterId } from "@ai-history/data/chapters";
import { supportedLocales, type Locale } from "@ai-history/data/locales";

export const learningSignalEventName = "ai-history:learning-signal";
export const learningSignalCollectionMode = "disabled" as const;

export const learningSignalNames = [
  "chapter_started",
  "core_interaction_completed",
  "concept_check_completed",
  "concept_explanation_opened",
  "next_chapter_continued",
] as const;

export type LearningSignalName = (typeof learningSignalNames)[number];

interface LearningSignalBase {
  name: LearningSignalName;
  chapterId: ChapterId;
  locale: Locale;
}

export type LearningSignal =
  | (LearningSignalBase & {
      name: "chapter_started";
    })
  | (LearningSignalBase & {
      name: "core_interaction_completed";
      completionSource: "chapter-journey";
    })
  | (LearningSignalBase & {
      name: "concept_check_completed";
      correct: boolean;
      attempt: "first" | "retry";
    })
  | (LearningSignalBase & {
      name: "concept_explanation_opened";
    })
  | (LearningSignalBase & {
      name: "next_chapter_continued";
      nextChapterId: ChapterId;
    });

export const learningSignalAllowedFields = {
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
} as const satisfies Record<LearningSignalName, readonly string[]>;

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    supportedLocales.includes(value as (typeof supportedLocales)[number])
  );
}

export function sanitizeLearningSignal(value: unknown): LearningSignal | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.name !== "string" ||
    !learningSignalNames.includes(candidate.name as LearningSignalName) ||
    !isChapterId(candidate.chapterId) ||
    !isLocale(candidate.locale)
  ) {
    return null;
  }

  const base = {
    chapterId: candidate.chapterId,
    locale: candidate.locale,
  };

  switch (candidate.name) {
    case "chapter_started":
      return { name: candidate.name, ...base };
    case "core_interaction_completed":
      return candidate.completionSource === "chapter-journey"
        ? {
            name: candidate.name,
            ...base,
            completionSource: candidate.completionSource,
          }
        : null;
    case "concept_check_completed":
      return typeof candidate.correct === "boolean" &&
        (candidate.attempt === "first" || candidate.attempt === "retry")
        ? {
            name: candidate.name,
            ...base,
            correct: candidate.correct,
            attempt: candidate.attempt,
          }
        : null;
    case "concept_explanation_opened":
      return { name: candidate.name, ...base };
    case "next_chapter_continued":
      return isChapterId(candidate.nextChapterId)
        ? {
            name: candidate.name,
            ...base,
            nextChapterId: candidate.nextChapterId,
          }
        : null;
  }

  return null;
}

export function emitLearningSignal(signal: LearningSignal): boolean {
  const sanitized = sanitizeLearningSignal(signal);
  if (!sanitized || typeof window === "undefined") return false;

  window.dispatchEvent(
    new CustomEvent(learningSignalEventName, { detail: sanitized }),
  );
  return true;
}
