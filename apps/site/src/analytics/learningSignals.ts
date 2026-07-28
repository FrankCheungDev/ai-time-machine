import { isChapterId, type ChapterId } from "@ai-history/data/chapters";
import { supportedLocales, type Locale } from "@ai-history/data/locales";

export const learningSignalEventName = "ai-history:learning-signal";
export const learningSignalCollectionMode = "plausible-production" as const;
export const plausibleProductionOrigin = "https://atlas.z-ai.cc";
export const plausibleIgnoreStorageKey = "plausible_ignore";

export const learningSignalNames = [
  "chapter_started",
  "core_interaction_completed",
  "concept_check_completed",
  "concept_explanation_opened",
  "next_chapter_continued",
] as const;

export type LearningSignalName = (typeof learningSignalNames)[number];

export interface PlausibleCollectionEnvironment {
  origin: string;
  webdriver: boolean;
  ignoreFlag: "true" | "false" | null;
}

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

export function shouldCollectPlausibleLearningSignals(
  environment: PlausibleCollectionEnvironment,
): boolean {
  return (
    environment.origin === plausibleProductionOrigin &&
    !environment.webdriver &&
    environment.ignoreFlag !== "true"
  );
}

function getBrowserCollectionEnvironment(): PlausibleCollectionEnvironment | null {
  if (typeof window === "undefined") return null;

  let ignoreFlag: "true" | "false" | null;
  try {
    const storedFlag = window.localStorage.getItem(plausibleIgnoreStorageKey);
    ignoreFlag =
      storedFlag === "true" || storedFlag === "false" ? storedFlag : null;
  } catch {
    // If the browser will not let us inspect the exclusion flag, prefer not to
    // collect instead of silently overriding a learner or developer choice.
    return null;
  }

  return {
    origin: window.location.origin,
    webdriver: window.navigator.webdriver === true,
    ignoreFlag,
  };
}

type PlausibleSignalSender = (signal: LearningSignal) => Promise<boolean>;

let plausibleSignalSender: PlausibleSignalSender | undefined;
let plausibleAdapterPromise:
  Promise<typeof import("./plausibleLearningAdapter")> | undefined;

function queuePlausibleLearningSignal(signal: LearningSignal): void {
  if (plausibleSignalSender) {
    void plausibleSignalSender(signal);
    return;
  }

  plausibleAdapterPromise ??= import("./plausibleLearningAdapter");
  void plausibleAdapterPromise
    .then(({ sendPlausibleLearningSignal }) => {
      plausibleSignalSender = sendPlausibleLearningSignal;
      // Calling the sender starts the keepalive request synchronously. Do not
      // delay the current signal for a prior response; a continuation action
      // may navigate immediately after its own handler emits.
      void plausibleSignalSender(signal);
    })
    .catch(() => {
      // Metrics are best-effort and must never interrupt the learning path.
    });
}

export function emitLearningSignal(signal: LearningSignal): boolean {
  const sanitized = sanitizeLearningSignal(signal);
  if (!sanitized || typeof window === "undefined") return false;

  window.dispatchEvent(
    new CustomEvent(learningSignalEventName, { detail: sanitized }),
  );

  const environment = getBrowserCollectionEnvironment();
  if (
    learningSignalCollectionMode === "plausible-production" &&
    environment &&
    shouldCollectPlausibleLearningSignals(environment)
  ) {
    queuePlausibleLearningSignal(sanitized);
  }

  return true;
}
