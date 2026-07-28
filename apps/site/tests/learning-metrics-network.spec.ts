import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { plausibleEventsEndpoint } from "../src/analytics/plausibleLearningAdapter";

const productionOrigin = "https://atlas.z-ai.cc";
const testPort = process.env.PLAYWRIGHT_PORT ?? "4325";
const previewOrigin = `http://127.0.0.1:${testPort}`;
const deploymentHeaders = readFileSync(
  new URL("../public/_headers", import.meta.url),
  "utf8",
);
const contentSecurityPolicy = deploymentHeaders.match(
  /^\s*Content-Security-Policy:\s*(.+)$/m,
)?.[1];

if (!contentSecurityPolicy) {
  throw new Error("Missing Content-Security-Policy in public/_headers");
}
const deploymentContentSecurityPolicy = contentSecurityPolicy;

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "wait" });
});

interface CapturedPlausibleRequest {
  body: unknown;
  headers: Record<string, string>;
}

async function serveProductionOriginFromPreview(page: Page): Promise<void> {
  await page.route(`${productionOrigin}/**`, async (route) => {
    const productionUrl = new URL(route.request().url());
    const previewUrl = new URL(
      `${productionUrl.pathname}${productionUrl.search}`,
      previewOrigin,
    );
    const response = await route.fetch({ url: previewUrl.href });
    const headers = { ...response.headers() };

    if (route.request().resourceType() === "document") {
      headers["content-security-policy"] = deploymentContentSecurityPolicy;
    }

    await route.fulfill({ response, headers });
  });
}

async function openProductionSearch(page: Page): Promise<void> {
  await page.goto(`${productionOrigin}/chapters/search/`);
  await page.waitForLoadState("networkidle");
}

async function answerSearchCheck(page: Page): Promise<void> {
  const check = page.getByTestId("concept-check");
  await check
    .getByRole("radio", {
      name: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
    })
    .check();
  await check.getByRole("button", { name: "提交答案" }).click();
  await check.getByRole("button", { name: "查看为什么" }).click();
}

async function completeSearchAndContinue(page: Page): Promise<void> {
  await answerSearchCheck(page);
  await page.getByTestId("complete-chapter").click();
  await page.getByTestId("continue-next-chapter").click();
  await page.waitForURL(`${productionOrigin}/chapters/expert-system/`);
  // The production-origin proxy also fulfills the next chapter's lazy demo
  // chunks. Let those requests settle before the test tears its routes down.
  await page.waitForLoadState("networkidle");
}

test("production maps the reviewed learning flow into strict Plausible requests", async ({
  page,
}) => {
  const requests: CapturedPlausibleRequest[] = [];

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      get: () => false,
    });
    localStorage.removeItem("plausible_ignore");
  });
  await serveProductionOriginFromPreview(page);
  await page.route(plausibleEventsEndpoint, async (route) => {
    const request = route.request();
    requests.push({
      body: JSON.parse(request.postData() ?? "null"),
      headers: request.headers(),
    });
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      headers: { "access-control-allow-origin": productionOrigin },
      body: "{}",
    });
  });

  await openProductionSearch(page);
  await expect(page.locator("html")).toHaveAttribute(
    "data-learning-signal-collection",
    "plausible-production",
  );
  await expect.poll(() => requests.length).toBeGreaterThanOrEqual(1);

  await answerSearchCheck(page);
  await expect.poll(() => requests.length).toBeGreaterThanOrEqual(3);

  await page.getByTestId("complete-chapter").click();
  await expect(page).toHaveURL(`${productionOrigin}/chapters/search/`);
  await expect.poll(() => requests.length).toBe(4);
  expect(requests.slice(0, 4).map(({ body }) => body)).toEqual([
    {
      domain: "atlas.z-ai.cc",
      name: "chapter_started",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: { chapterId: "search", locale: "zh-CN" },
    },
    {
      domain: "atlas.z-ai.cc",
      name: "concept_check_completed",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: {
        chapterId: "search",
        locale: "zh-CN",
        correct: "true",
        attempt: "first",
      },
    },
    {
      domain: "atlas.z-ai.cc",
      name: "concept_explanation_opened",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: { chapterId: "search", locale: "zh-CN" },
    },
    {
      domain: "atlas.z-ai.cc",
      name: "core_interaction_completed",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: {
        chapterId: "search",
        locale: "zh-CN",
        completionSource: "chapter-journey",
      },
    },
  ]);
  expect(
    requests.some(
      ({ body }) =>
        (body as { name?: string }).name === "next_chapter_continued",
    ),
  ).toBe(false);

  await page.getByTestId("continue-next-chapter").click();
  await page.waitForURL(`${productionOrigin}/chapters/expert-system/`);
  await page.waitForLoadState("networkidle");
  await expect.poll(() => requests.length).toBeGreaterThanOrEqual(5);

  expect(requests.slice(0, 5).map(({ body }) => body)).toEqual([
    {
      domain: "atlas.z-ai.cc",
      name: "chapter_started",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: { chapterId: "search", locale: "zh-CN" },
    },
    {
      domain: "atlas.z-ai.cc",
      name: "concept_check_completed",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: {
        chapterId: "search",
        locale: "zh-CN",
        correct: "true",
        attempt: "first",
      },
    },
    {
      domain: "atlas.z-ai.cc",
      name: "concept_explanation_opened",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: { chapterId: "search", locale: "zh-CN" },
    },
    {
      domain: "atlas.z-ai.cc",
      name: "core_interaction_completed",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: {
        chapterId: "search",
        locale: "zh-CN",
        completionSource: "chapter-journey",
      },
    },
    {
      domain: "atlas.z-ai.cc",
      name: "next_chapter_continued",
      url: "https://atlas.z-ai.cc/chapters/search/",
      props: {
        chapterId: "search",
        locale: "zh-CN",
        nextChapterId: "expert-system",
      },
    },
  ]);
  expect(
    requests
      .map(
        ({ body }) => body as { name?: string; props?: { chapterId?: string } },
      )
      .filter(({ props }) => props?.chapterId === "search")
      .map(({ name }) => name),
  ).toEqual([
    "chapter_started",
    "concept_check_completed",
    "concept_explanation_opened",
    "core_interaction_completed",
    "next_chapter_continued",
  ]);

  for (const { headers } of requests.slice(0, 5)) {
    expect(headers["content-type"]).toBe("text/plain");
    expect(headers.origin).toBe(productionOrigin);
    expect(headers.referer).toBeUndefined();
    expect(headers.cookie).toBeUndefined();
    expect(headers["user-agent"]).toBeTruthy();
  }
});

test("the official production ignore flag sends zero events", async ({
  page,
}) => {
  const requests: string[] = [];

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      get: () => false,
    });
    localStorage.setItem("plausible_ignore", "true");
  });
  await serveProductionOriginFromPreview(page);
  await page.route(plausibleEventsEndpoint, async (route) => {
    requests.push(route.request().url());
    await route.abort();
  });

  await openProductionSearch(page);
  await completeSearchAndContinue(page);
  await expect.poll(() => requests).toEqual([]);
});

test("a completed chapter revisit continues without emitting core again", async ({
  page,
}) => {
  const requests: CapturedPlausibleRequest[] = [];

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      get: () => false,
    });
    localStorage.removeItem("plausible_ignore");
    localStorage.setItem(
      "ai-history-learning-progress",
      JSON.stringify({ version: 1, completedChapterIds: ["search"] }),
    );
  });
  await serveProductionOriginFromPreview(page);
  await page.route(plausibleEventsEndpoint, async (route) => {
    const request = route.request();
    requests.push({
      body: JSON.parse(request.postData() ?? "null"),
      headers: request.headers(),
    });
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      headers: { "access-control-allow-origin": productionOrigin },
      body: "{}",
    });
  });

  await openProductionSearch(page);
  await expect(page.getByTestId("complete-chapter")).toHaveCount(0);
  await expect(page.getByTestId("continue-next-chapter")).toBeVisible();
  await page.getByTestId("continue-next-chapter").click();
  await page.waitForURL(`${productionOrigin}/chapters/expert-system/`);
  await page.waitForLoadState("networkidle");

  await expect
    .poll(() =>
      requests
        .map(
          ({ body }) =>
            body as { name?: string; props?: { chapterId?: string } },
        )
        .filter(({ props }) => props?.chapterId === "search")
        .map(({ name }) => name),
    )
    .toEqual(["chapter_started", "next_chapter_continued"]);
});

test("rapid duplicate activations emit core and next exactly once", async ({
  page,
}) => {
  const requests: CapturedPlausibleRequest[] = [];

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      get: () => false,
    });
    localStorage.removeItem("plausible_ignore");
  });
  await serveProductionOriginFromPreview(page);
  await page.route(plausibleEventsEndpoint, async (route) => {
    const request = route.request();
    requests.push({
      body: JSON.parse(request.postData() ?? "null"),
      headers: request.headers(),
    });
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      headers: { "access-control-allow-origin": productionOrigin },
      body: "{}",
    });
  });

  await openProductionSearch(page);
  await page.getByTestId("complete-chapter").evaluate((button) => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(page).toHaveURL(`${productionOrigin}/chapters/search/`);
  await expect(page.getByTestId("continue-next-chapter")).toBeVisible();
  await expect
    .poll(
      () =>
        requests.filter(
          ({ body }) =>
            (body as { name?: string }).name === "core_interaction_completed",
        ).length,
    )
    .toBe(1);

  await page.getByTestId("continue-next-chapter").evaluate((link) => {
    const preventNavigation = (event: Event): void => event.preventDefault();
    link.addEventListener("click", preventNavigation);
    (link as HTMLAnchorElement).click();
    (link as HTMLAnchorElement).click();
    link.removeEventListener("click", preventNavigation);
  });
  await expect
    .poll(
      () =>
        requests.filter(
          ({ body }) =>
            (body as { name?: string }).name === "next_chapter_continued",
        ).length,
    )
    .toBe(1);
  await page.getByTestId("continue-next-chapter").click();
  await page.waitForURL(`${productionOrigin}/chapters/expert-system/`);
  await page.waitForLoadState("networkidle");

  const sourceNames = requests
    .map(
      ({ body }) => body as { name?: string; props?: { chapterId?: string } },
    )
    .filter(({ props }) => props?.chapterId === "search")
    .map(({ name }) => name);
  expect(
    sourceNames.filter((name) => name === "core_interaction_completed"),
  ).toHaveLength(1);
  expect(
    sourceNames.filter((name) => name === "next_chapter_continued"),
  ).toHaveLength(1);
});

test("production WebDriver automation sends zero events", async ({ page }) => {
  const requests: string[] = [];

  await page.addInitScript(() => {
    const signals: unknown[] = [];
    Object.defineProperty(window, "__capturedLearningSignals", {
      configurable: true,
      value: signals,
    });
    window.addEventListener("ai-history:learning-signal", (event) => {
      signals.push((event as CustomEvent).detail);
    });
    localStorage.removeItem("plausible_ignore");
  });
  await serveProductionOriginFromPreview(page);
  await page.route(plausibleEventsEndpoint, async (route) => {
    requests.push(route.request().url());
    await route.abort();
  });

  await openProductionSearch(page);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __capturedLearningSignals?: unknown[] })
            .__capturedLearningSignals?.length ?? 0,
      ),
    )
    .toBeGreaterThanOrEqual(1);
  await page.waitForTimeout(50);
  expect(requests).toEqual([]);
});

test("pull-request preview emits signals but never contacts Plausible", async ({
  page,
}) => {
  const requests: string[] = [];
  await page.addInitScript(() => {
    const signals: unknown[] = [];
    Object.defineProperty(window, "__capturedLearningSignals", {
      configurable: true,
      value: signals,
    });
    window.addEventListener("ai-history:learning-signal", (event) => {
      signals.push((event as CustomEvent).detail);
    });
  });
  await page.route(plausibleEventsEndpoint, async (route) => {
    requests.push(route.request().url());
    await route.abort();
  });

  await page.goto("/chapters/search/");
  const check = page.getByTestId("concept-check");
  await check
    .getByRole("radio", {
      name: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
    })
    .check();
  await check.getByRole("button", { name: "提交答案" }).click();
  await check.getByRole("button", { name: "查看为什么" }).click();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __capturedLearningSignals?: unknown[] })
            .__capturedLearningSignals?.length ?? 0,
      ),
    )
    .toBe(3);
  await page.waitForTimeout(50);
  expect(requests).toEqual([]);
});
