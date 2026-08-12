import { chromium } from "@playwright/test";

const baseUrl = new URL(process.env.SITE_URL ?? "https://atlas.z-ai.cc");
const canonicalBaseUrl = new URL(
  process.env.CANONICAL_SITE_URL ?? "https://atlas.z-ai.cc",
);
const chapterIds = [
  "overview",
  "search",
  "expert-system",
  "bayes",
  "decision-boundary",
  "cnn",
  "reinforcement-learning",
  "attention",
  "foundation-model",
  "llm-system",
  "rag",
  "agent",
  "safety",
];
const chapterRoutes = chapterIds.flatMap((chapterId) => [
  `/chapters/${chapterId}/`,
  `/en/chapters/${chapterId}/`,
]);
const failures = [];
const checkedResponses = [];
const headerFailures = {
  noTransform: [],
  noConnectPolicy: [],
  scriptPolicy: [],
};

function checkDocumentHeaders(route, response) {
  const cacheControl = response.headers.get("cache-control") ?? "";
  const contentSecurityPolicy =
    response.headers.get("content-security-policy") ?? "";

  if (!cacheControl.includes("no-transform")) {
    headerFailures.noTransform.push(route);
  }
  if (!contentSecurityPolicy.includes("connect-src 'none'")) {
    headerFailures.noConnectPolicy.push(route);
  }
  if (
    !contentSecurityPolicy.includes("script-src 'self' 'unsafe-inline'") ||
    contentSecurityPolicy.includes("cloudflareinsights")
  ) {
    headerFailures.scriptPolicy.push(route);
  }
}

function summarizeRoutes(routes) {
  const preview = routes.slice(0, 3).join(", ");
  return routes.length > 3
    ? `${preview}, and ${routes.length - 3} more`
    : preview;
}

async function readDocument(route) {
  const response = await fetch(new URL(route, baseUrl), {
    headers: { "user-agent": "ai-time-machine-release-smoke/1.0" },
  });
  const body = await response.text();

  if (!response.ok) failures.push(`${route} returned ${response.status}`);
  checkDocumentHeaders(route, response);
  checkedResponses.push({ route, status: response.status });
  return body;
}

await Promise.all(
  chapterRoutes.map(async (route) => {
    const body = await readDocument(route);
    if (!body.includes('data-testid="concept-check"')) {
      failures.push(`${route} is missing its server-rendered concept check`);
    }
    if (!body.includes('data-testid="complete-and-continue"')) {
      failures.push(`${route} is missing its continuation control`);
    }
  }),
);

const [
  chineseTimeline,
  englishTimeline,
  chinesePrivacy,
  englishPrivacy,
  chineseHome,
  englishHome,
  sitemap,
] = await Promise.all([
  readDocument("/timeline/"),
  readDocument("/en/timeline/"),
  readDocument("/privacy/"),
  readDocument("/en/privacy/"),
  readDocument("/"),
  readDocument("/en/"),
  fetch(new URL("/sitemap-0.xml", baseUrl)).then(async (response) => {
    if (!response.ok)
      failures.push(`/sitemap-0.xml returned ${response.status}`);
    checkedResponses.push({ route: "/sitemap-0.xml", status: response.status });
    return response.text();
  }),
]);

for (const [label, routes] of [
  ["missing Cache-Control no-transform", headerFailures.noTransform],
  ["missing connect-src 'none'", headerFailures.noConnectPolicy],
  ["not restricted to static-site scripts", headerFailures.scriptPolicy],
]) {
  if (routes.length > 0) {
    failures.push(
      `${routes.length} HTML routes are ${label}: ${summarizeRoutes(routes)}`,
    );
  }
}

const timelineEventCounts = {
  zh: (chineseTimeline.match(/data-timeline-event=/g) ?? []).length,
  en: (englishTimeline.match(/data-timeline-event=/g) ?? []).length,
};
if (timelineEventCounts.zh !== 27 || timelineEventCounts.en !== 27) {
  failures.push(
    `timeline event counts are zh=${timelineEventCounts.zh}, en=${timelineEventCounts.en}`,
  );
}

function extractStoryIds(body) {
  return [
    ...new Set(
      Array.from(
        body.matchAll(/data-causal-story-detail="([^"]+)"/g),
        (match) => match[1],
      ),
    ),
  ];
}

const timelineStoryIds = {
  zh: extractStoryIds(chineseTimeline),
  en: extractStoryIds(englishTimeline),
};
const expectedStoryFocusCounts = {
  "feedback-learning": 6,
  "rules-to-representations": 7,
  "scaled-models-to-reliable-systems": 7,
};
const expectedStoryIds = Object.keys(expectedStoryFocusCounts);
const homeStoryIds = {
  zh: Array.from(
    chineseHome.matchAll(/data-story-id="([^"]+)"/g),
    (match) => match[1],
  ),
  en: Array.from(
    englishHome.matchAll(/data-story-id="([^"]+)"/g),
    (match) => match[1],
  ),
};
if (timelineStoryIds.zh.length !== 3 || timelineStoryIds.en.length !== 3) {
  failures.push(
    `guided story counts are zh=${timelineStoryIds.zh.length}, en=${timelineStoryIds.en.length}`,
  );
}
if (JSON.stringify(timelineStoryIds.zh) !== JSON.stringify(expectedStoryIds)) {
  failures.push(
    `guided story registry is ${timelineStoryIds.zh.join(",")}; expected ${expectedStoryIds.join(",")}`,
  );
}
if (
  JSON.stringify(timelineStoryIds.zh) !== JSON.stringify(timelineStoryIds.en)
) {
  failures.push(
    `guided story topology differs by locale: zh=${timelineStoryIds.zh.join(",")}, en=${timelineStoryIds.en.join(",")}`,
  );
}
if (
  JSON.stringify(homeStoryIds.zh) !== JSON.stringify(timelineStoryIds.zh) ||
  JSON.stringify(homeStoryIds.en) !== JSON.stringify(timelineStoryIds.en)
) {
  failures.push(
    `home guided stories do not match the timeline manifest: homeZh=${homeStoryIds.zh.join(",")}, homeEn=${homeStoryIds.en.join(",")}`,
  );
}
for (const body of [chineseTimeline, englishTimeline]) {
  if (
    !body.includes('data-timeline-event="q-learning"') ||
    !body.includes('data-timeline-event="dqn-atari"')
  ) {
    failures.push("one or both timelines are missing the v1.5 source events");
    break;
  }
}

const lighthillSource =
  "https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf";
if (
  !chineseTimeline.includes(lighthillSource) ||
  !englishTimeline.includes(lighthillSource)
) {
  failures.push(
    "one or both timelines are missing the audited Lighthill source",
  );
}
if (!chinesePrivacy.includes("客户端学习分析当前保持禁用")) {
  failures.push("the Chinese privacy decision is missing");
}
if (
  !englishPrivacy.includes("Client-side Learning Analytics Remain Disabled")
) {
  failures.push("the English privacy decision is missing");
}
if (!chineseHome.includes("沿着 13 个章节理解 AI 如何一步步演化")) {
  failures.push("the Chinese derived chapter count is missing");
}
if (
  !englishHome.includes("Follow 13 chapters to see how AI evolved step by step")
) {
  failures.push("the English derived chapter count is missing");
}
for (const path of [...chapterRoutes, "/privacy/", "/en/privacy/"]) {
  const expectedLocation = `<loc>${new URL(path, canonicalBaseUrl)}</loc>`;
  if (!sitemap.includes(expectedLocation)) {
    failures.push(`the sitemap is missing ${path}`);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({
  locale: "zh-CN",
  viewport: { width: 390, height: 844 },
});
await context.addInitScript(() => {
  const storageKey = "release-smoke-signals";
  window.addEventListener("ai-history:learning-signal", (event) => {
    const prior = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
    prior.push(event.detail);
    sessionStorage.setItem(storageKey, JSON.stringify(prior));
  });
});

const page = await context.newPage();
const forbiddenRequests = [];
page.on("request", (request) => {
  const url = request.url();
  if (url.includes("static.cloudflareinsights.com")) {
    forbiddenRequests.push("cloudflare-beacon-script");
  } else if (url.includes("/cdn-cgi/rum")) {
    forbiddenRequests.push("cloudflare-rum");
  } else if (/analytics|collect|beacon|telemetry/i.test(url)) {
    forbiddenRequests.push(url);
  }
});

try {
  await page.goto(new URL("/chapters/search/", baseUrl).href, {
    waitUntil: "networkidle",
  });
  const conceptCheck = page.getByTestId("concept-check");
  await conceptCheck
    .getByRole("radio", {
      name: "只看离目标的估计距离 h",
    })
    .check();
  await conceptCheck.getByRole("button", { name: "提交答案" }).click();
  await conceptCheck.getByText(/已加入这台设备的复习建议/).waitFor();

  await page.goto(new URL("/", baseUrl).href, { waitUntil: "networkidle" });
  const reviewQueue = page.getByTestId("home-review-queue");
  await reviewQueue.getByText("待复习 1 章", { exact: true }).waitFor();
  const reviewLink = reviewQueue.locator(".home-review-primary");
  if (
    (await reviewLink.getAttribute("href")) !==
    "/chapters/search/#concept-check-search"
  ) {
    failures.push("the production review queue did not deep-link to Search");
  }
  await reviewLink.click();
  await page.waitForURL("**/chapters/search/#concept-check-search");

  await conceptCheck
    .getByRole("radio", {
      name: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
    })
    .check();
  await conceptCheck.getByRole("button", { name: "提交答案" }).click();
  await conceptCheck.getByText(/已从这台设备的复习建议中移出/).waitFor();
  await conceptCheck.getByRole("button", { name: "查看为什么" }).click();
  await conceptCheck.getByText(/A\* 同时考虑已经付出的路径成本 g/).waitFor();

  const storedConceptProgress = await page.evaluate(() => {
    const raw = localStorage.getItem("ai-history-concept-check-progress");
    return raw ? JSON.parse(raw) : null;
  });
  const storedSearchResult = storedConceptProgress?.results?.find(
    (result) => result.chapterId === "search",
  );
  if (
    storedConceptProgress?.version !== 1 ||
    storedConceptProgress?.reviewVersion !== 2 ||
    Object.keys(storedConceptProgress ?? {})
      .sort()
      .join(",") !== "results,reviewVersion,version" ||
    storedConceptProgress?.results?.length !== 1 ||
    storedSearchResult?.firstCorrect !== false ||
    storedSearchResult?.attempts !== 2 ||
    storedSearchResult?.explanationViewed !== true ||
    storedSearchResult?.reviewSuggested !== false ||
    Object.keys(storedSearchResult ?? {})
      .sort()
      .join(",") !==
      "attempts,chapterId,explanationViewed,firstCorrect,reviewSuggested"
  ) {
    failures.push("the production review result did not persist safe v2 data");
  }

  await page.getByTestId("complete-and-continue").click();
  await page.waitForURL("**/chapters/expert-system/");
  await page.waitForLoadState("networkidle");

  await page.goto(new URL("/", baseUrl).href, { waitUntil: "networkidle" });
  const resolvedQueue = page.getByTestId("home-review-queue");
  await resolvedQueue.getByTestId("home-review-empty").waitFor();
  if ((await resolvedQueue.locator(".home-review-primary").count()) !== 0) {
    failures.push(
      "the production review queue kept Search after a correct retry",
    );
  }

  const injectedBeaconCount = await page
    .locator('script[src*="cloudflareinsights"], script[data-cf-beacon]')
    .count();
  if (injectedBeaconCount > 0) {
    failures.push(
      "the production HTML still contains an injected analytics beacon",
    );
  }

  const signals = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("release-smoke-signals") ?? "[]"),
  );
  const signalNames = signals.map((signal) => signal.name);
  for (const name of [
    "chapter_started",
    "concept_check_completed",
    "concept_explanation_opened",
    "core_interaction_completed",
    "next_chapter_continued",
  ]) {
    if (!signalNames.includes(name)) {
      failures.push(`the production interaction did not emit ${name}`);
    }
  }

  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (
    layout.documentWidth > layout.viewport ||
    layout.bodyWidth > layout.viewport
  ) {
    failures.push("the 390px production review home overflows horizontally");
  }

  await page.goto(new URL("/chapters/reinforcement-learning/", baseUrl).href, {
    waitUntil: "networkidle",
  });
  const feedbackDemo = page.locator(".demo-shell[data-demo-ready='true']");
  await feedbackDemo.waitFor();
  const nextFeedbackStep = feedbackDemo.getByRole("button", {
    name: "下一步",
    exact: true,
  });
  for (let index = 0; index < 5; index += 1) {
    await nextFeedbackStep.click();
  }
  const feedbackPolicyState = await feedbackDemo
    .getByTestId("feedback-policy")
    .getAttribute("data-policy-snapshot");
  const feedbackBoundaryText =
    (await feedbackDemo
      .locator('[data-feedback-boundary="runtime"]')
      .textContent()) ?? "";
  if (feedbackPolicyState !== "updated") {
    failures.push(
      "the feedback-learning demo did not reach the updated policy",
    );
  }
  if (!feedbackBoundaryText.includes("模型权重保持不变")) {
    failures.push(
      "the feedback-learning demo did not preserve the runtime boundary",
    );
  }

  const storyStates = [];
  for (const storyId of timelineStoryIds.zh) {
    await page.goto(
      new URL(`/timeline/?story=${storyId}#story-${storyId}`, baseUrl).href,
      { waitUntil: "networkidle" },
    );
    const storySelect = page.locator("[data-timeline-story-filter]");
    await storySelect.waitFor();
    const storyState = {
      id: await storySelect.inputValue(),
      visibleEvents: await page
        .locator("[data-timeline-event]:visible")
        .count(),
      focusedEvents: await page
        .locator(".milestone-event.is-story-focus")
        .count(),
      mutedEvents: await page
        .locator(".milestone-event.is-story-muted")
        .count(),
      languageHref: await page
        .locator("[data-language-switch]")
        .getAttribute("href"),
    };
    storyStates.push(storyState);
    const expectedFocusedEvents = expectedStoryFocusCounts[storyId];

    if (!expectedFocusedEvents) {
      failures.push(`unexpected guided story ${storyId} reached the browser`);
    } else if (storyState.id !== storyId) {
      failures.push(
        `the production timeline did not restore guided story ${storyId}`,
      );
    }
    if (
      storyState.visibleEvents !== 27 ||
      storyState.focusedEvents !== expectedFocusedEvents ||
      storyState.mutedEvents !== 27 - storyState.focusedEvents
    ) {
      failures.push(
        `${storyId} rendered visible=${storyState.visibleEvents}, focused=${storyState.focusedEvents}, muted=${storyState.mutedEvents}`,
      );
    }
    if (
      storyState.languageHref !==
      `/en/timeline/?story=${storyId}#story-${storyId}`
    ) {
      failures.push(`${storyId} language link lost its URL state`);
    }
  }

  if (forbiddenRequests.length > 0) {
    failures.push(
      `the browser made forbidden requests: ${[...new Set(forbiddenRequests)].join(", ")}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        baseUrl: baseUrl.href,
        checkedRequests: checkedResponses.length,
        chapterRoutes: chapterRoutes.length,
        timelineEventCounts,
        guidedStoryIds: timelineStoryIds,
        responsePolicy: {
          documentsChecked: checkedResponses.length - 1,
          missingNoTransform: headerFailures.noTransform.length,
          missingNoConnectPolicy: headerFailures.noConnectPolicy.length,
          invalidScriptPolicy: headerFailures.scriptPolicy.length,
        },
        browserInteraction:
          "local review entry/exit, concept explanation, continuation, feedback update/runtime boundary, all guided stories",
        feedbackLearning: {
          policyState: feedbackPolicyState,
          runtimeBoundary: feedbackBoundaryText.trim(),
        },
        storyStates,
        observedSignalNames: signalNames,
        forbiddenRequests: [...new Set(forbiddenRequests)],
        failures,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}

if (failures.length > 0) process.exit(1);
