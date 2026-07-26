import { describe, expect, it, vi } from "vitest";
import {
  createPlausibleLearningPayload,
  createPlausibleLearningRequest,
  plausibleEventsEndpoint,
  sendPlausibleLearningSignal,
} from "./plausibleLearningAdapter";

describe("Plausible learning adapter", () => {
  it.each([
    {
      signal: {
        name: "chapter_started",
        chapterId: "search",
        locale: "zh-CN",
      },
      payload: {
        domain: "atlas.z-ai.cc",
        name: "chapter_started",
        url: "https://atlas.z-ai.cc/chapters/search/",
        props: { chapterId: "search", locale: "zh-CN" },
      },
    },
    {
      signal: {
        name: "core_interaction_completed",
        chapterId: "rag",
        locale: "en",
        completionSource: "chapter-journey",
      },
      payload: {
        domain: "atlas.z-ai.cc",
        name: "core_interaction_completed",
        url: "https://atlas.z-ai.cc/en/chapters/rag/",
        props: {
          chapterId: "rag",
          locale: "en",
          completionSource: "chapter-journey",
        },
      },
    },
    {
      signal: {
        name: "concept_check_completed",
        chapterId: "attention",
        locale: "zh-CN",
        correct: false,
        attempt: "first",
      },
      payload: {
        domain: "atlas.z-ai.cc",
        name: "concept_check_completed",
        url: "https://atlas.z-ai.cc/chapters/attention/",
        props: {
          chapterId: "attention",
          locale: "zh-CN",
          correct: "false",
          attempt: "first",
        },
      },
    },
    {
      signal: {
        name: "concept_explanation_opened",
        chapterId: "safety",
        locale: "en",
      },
      payload: {
        domain: "atlas.z-ai.cc",
        name: "concept_explanation_opened",
        url: "https://atlas.z-ai.cc/en/chapters/safety/",
        props: { chapterId: "safety", locale: "en" },
      },
    },
    {
      signal: {
        name: "next_chapter_continued",
        chapterId: "search",
        locale: "zh-CN",
        nextChapterId: "expert-system",
      },
      payload: {
        domain: "atlas.z-ai.cc",
        name: "next_chapter_continued",
        url: "https://atlas.z-ai.cc/chapters/search/",
        props: {
          chapterId: "search",
          locale: "zh-CN",
          nextChapterId: "expert-system",
        },
      },
    },
  ])(
    "maps $signal.name into the exact reviewed payload",
    ({ signal, payload }) => {
      expect(createPlausibleLearningPayload(signal)).toEqual(payload);
    },
  );

  it("drops injected identifiers, text, timestamps, query and referrer data", () => {
    expect(
      createPlausibleLearningPayload({
        name: "concept_check_completed",
        chapterId: "search",
        locale: "en",
        correct: true,
        attempt: "retry",
        email: "learner@example.com",
        userText: "private answer",
        visitorId: "abc-123",
        timestamp: "2026-07-26T00:00:00Z",
        query: "?token=secret",
        referrer: "https://example.com/private",
      }),
    ).toEqual({
      domain: "atlas.z-ai.cc",
      name: "concept_check_completed",
      url: "https://atlas.z-ai.cc/en/chapters/search/",
      props: {
        chapterId: "search",
        locale: "en",
        correct: "true",
        attempt: "retry",
      },
    });
  });

  it("builds a credential-free, referrer-free, keepalive request", () => {
    const request = createPlausibleLearningRequest({
      name: "chapter_started",
      chapterId: "overview",
      locale: "zh-CN",
    });

    expect(request?.endpoint).toBe(plausibleEventsEndpoint);
    expect(request?.init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      cache: "no-store",
      credentials: "omit",
      keepalive: true,
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
    });
    expect(JSON.parse(String(request?.init.body))).toEqual(request?.payload);
    expect(Object.keys(request?.payload ?? {}).sort()).toEqual([
      "domain",
      "name",
      "props",
      "url",
    ]);
  });

  it("rejects malformed events without calling the transport", async () => {
    const send = vi.fn();
    await expect(
      sendPlausibleLearningSignal(
        { name: "unknown", chapterId: "search", locale: "zh-CN" },
        send,
      ),
    ).resolves.toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("reports accepted delivery without logging or retrying failures", async () => {
    const accepted = vi.fn().mockResolvedValue({ status: 202 });
    const rejected = vi.fn().mockResolvedValue({ status: 400 });
    const unavailable = vi.fn().mockRejectedValue(new Error("offline"));
    const signal = {
      name: "chapter_started",
      chapterId: "search",
      locale: "zh-CN",
    };

    await expect(sendPlausibleLearningSignal(signal, accepted)).resolves.toBe(
      true,
    );
    await expect(sendPlausibleLearningSignal(signal, rejected)).resolves.toBe(
      false,
    );
    await expect(
      sendPlausibleLearningSignal(signal, unavailable),
    ).resolves.toBe(false);
    expect(accepted).toHaveBeenCalledTimes(1);
    expect(rejected).toHaveBeenCalledTimes(1);
    expect(unavailable).toHaveBeenCalledTimes(1);
  });
});
