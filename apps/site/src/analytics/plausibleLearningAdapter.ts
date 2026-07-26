import { getChapterDefinition } from "@ai-history/data/chapters";
import {
  plausibleProductionOrigin,
  sanitizeLearningSignal,
  type LearningSignal,
} from "./learningSignals";

export const plausibleSiteDomain = "atlas.z-ai.cc";
export const plausibleEventsEndpoint = "https://plausible.io/api/event";

type PlausibleLearningProperties = Record<string, string>;

export interface PlausibleLearningPayload {
  domain: typeof plausibleSiteDomain;
  name: LearningSignal["name"];
  url: string;
  props: PlausibleLearningProperties;
}

export interface PlausibleLearningRequest {
  endpoint: typeof plausibleEventsEndpoint;
  init: RequestInit;
  payload: PlausibleLearningPayload;
}

type FetchResponse = Pick<Response, "status">;
type FetchLearningEvent = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<FetchResponse>;

function getCanonicalChapterUrl(signal: LearningSignal): string {
  const route = getChapterDefinition(signal.chapterId).route;
  const localizedRoute = signal.locale === "en" ? `/en${route}` : route;
  return new URL(localizedRoute, plausibleProductionOrigin).href;
}

function getPlausibleProperties(
  signal: LearningSignal,
): PlausibleLearningProperties {
  const base = {
    chapterId: signal.chapterId,
    locale: signal.locale,
  };

  switch (signal.name) {
    case "chapter_started":
    case "concept_explanation_opened":
      return base;
    case "core_interaction_completed":
      return { ...base, completionSource: signal.completionSource };
    case "concept_check_completed":
      return {
        ...base,
        correct: String(signal.correct),
        attempt: signal.attempt,
      };
    case "next_chapter_continued":
      return { ...base, nextChapterId: signal.nextChapterId };
  }
}

export function createPlausibleLearningPayload(
  value: unknown,
): PlausibleLearningPayload | null {
  const signal = sanitizeLearningSignal(value);
  if (!signal) return null;

  return {
    domain: plausibleSiteDomain,
    name: signal.name,
    url: getCanonicalChapterUrl(signal),
    props: getPlausibleProperties(signal),
  };
}

export function createPlausibleLearningRequest(
  value: unknown,
): PlausibleLearningRequest | null {
  const payload = createPlausibleLearningPayload(value);
  if (!payload) return null;

  return {
    endpoint: plausibleEventsEndpoint,
    payload,
    init: {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "omit",
      keepalive: true,
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
    },
  };
}

export async function sendPlausibleLearningSignal(
  value: unknown,
  send: FetchLearningEvent = globalThis.fetch,
): Promise<boolean> {
  const request = createPlausibleLearningRequest(value);
  if (!request) return false;

  try {
    const response = await send(request.endpoint, request.init);
    return response.status === 202;
  } catch {
    return false;
  }
}
