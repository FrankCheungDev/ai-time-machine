import { expect, test, type Page } from "@playwright/test";
import { getConceptCheck } from "@ai-history/data";
import { chapterCases, localizedChapterRoute } from "./fixtures/chapters";

const progressKey = "ai-history-concept-check-progress";

async function resetSelfChecks(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    const seededKey = `${key}:playwright-reset`;
    if (window.sessionStorage.getItem(seededKey) === "true") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.setItem(seededKey, "true");
  }, progressKey);
}

for (const locale of ["zh-CN", "en"] as const) {
  test(`${locale} routes expose one non-blocking concept check per chapter`, async ({
    page,
  }) => {
    await resetSelfChecks(page);

    for (const chapter of chapterCases) {
      await page.goto(localizedChapterRoute(chapter.id, locale));
      const check = page.getByTestId("concept-check");
      const expected = getConceptCheck(chapter.id, locale);

      await expect(check).toHaveAttribute("data-concept-check-id", expected.id);
      await expect(check.getByRole("radio")).toHaveCount(3);
      await expect(
        check.getByText(expected.prompt, { exact: true }),
      ).toBeVisible();
      await expect(
        check.getByRole("button", {
          name: locale === "zh-CN" ? "提交答案" : "Submit answer",
        }),
      ).toBeDisabled();
      await expect(page.getByTestId("complete-and-continue")).toBeVisible();
    }
  });
}

for (const deepLinkCase of [
  {
    locale: "zh-CN",
    path: "/chapters/search/#concept-check-search",
    heading: "用一个问题检验核心直觉",
  },
  {
    locale: "en",
    path: "/en/chapters/search/#concept-check-search",
    heading: "Test The Core Intuition With One Question",
  },
] as const) {
  test(`${deepLinkCase.locale} concept-check deep links focus the heading without adding it to the Tab order`, async ({
    page,
  }) => {
    await resetSelfChecks(page);
    await page.goto(deepLinkCase.path);

    const check = page.getByTestId("concept-check");
    const heading = check.getByRole("heading", {
      level: 2,
      name: deepLinkCase.heading,
    });
    const firstRadio = check.getByRole("radio").first();

    await expect(heading).toHaveAttribute("tabindex", "-1");
    await expect(heading).toBeFocused();

    await page
      .getByRole("link", {
        name: "A Formal Basis for the Heuristic Determination of Minimum Cost Paths",
      })
      .focus();
    await page.keyboard.press("Tab");
    await expect(firstRadio).toBeFocused();

    await firstRadio.focus();
    await page.evaluate(() => {
      window.location.hash = "#away-from-concept-check";
    });
    await expect(page).toHaveURL(/#away-from-concept-check$/);
    await expect(firstRadio).toBeFocused();

    await page.evaluate(() => {
      window.location.hash = "#concept-check-search";
    });
    await expect(heading).toBeFocused();
  });
}

test("initial hydration preserves focus that a user already moved", async ({
  page,
}) => {
  await resetSelfChecks(page);
  let markConceptCheckModuleRequested!: () => void;
  const conceptCheckModuleRequested = new Promise<void>((resolve) => {
    markConceptCheckModuleRequested = resolve;
  });
  let releaseConceptCheckModule!: () => void;
  const conceptCheckModuleReleased = new Promise<void>((resolve) => {
    releaseConceptCheckModule = resolve;
  });
  await page.route("**/_astro/ConceptCheck.*.js", async (route) => {
    markConceptCheckModuleRequested();
    await conceptCheckModuleReleased;
    await route.continue();
  });
  await page.goto("/chapters/search/#concept-check-search");
  await conceptCheckModuleRequested;

  const check = page.getByTestId("concept-check");
  const island = check.locator("xpath=ancestor::astro-island");
  const firstRadio = check.getByRole("radio").first();
  await expect(island).toHaveAttribute("ssr", "");
  await firstRadio.focus();
  releaseConceptCheckModule();
  await expect(island).not.toHaveAttribute("ssr", "");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  await expect(firstRadio).toBeFocused();
  await expect(
    check.getByRole("heading", {
      level: 2,
      name: "用一个问题检验核心直觉",
    }),
  ).not.toBeFocused();
});

for (const path of [
  "/chapters/search/",
  "/chapters/search/#away-from-concept-check",
] as const) {
  test(`concept-check heading does not take focus for ${path}`, async ({
    page,
  }) => {
    await resetSelfChecks(page);
    await page.goto(path);

    await expect(
      page.getByTestId("concept-check").getByRole("heading", {
        level: 2,
        name: "用一个问题检验核心直觉",
      }),
    ).not.toBeFocused();
  });
}

test("an incorrect answer can reveal why, retry, persist, and clear", async ({
  page,
}) => {
  await resetSelfChecks(page);
  await page.goto("/chapters/search/");
  const check = page.getByTestId("concept-check");

  await check.getByRole("radio", { name: "只看离目标的估计距离 h" }).check();
  await check.getByRole("button", { name: "提交答案" }).click();
  const incorrectHeading = check.getByRole("heading", {
    level: 3,
    name: "还差一步",
  });
  await expect(incorrectHeading).toBeFocused();
  await expect(check).toHaveAttribute(
    "data-concept-check-id",
    "search-astar-priority",
  );
  await expect(
    check.locator('[data-concept-check-result="incorrect"]'),
  ).toBeVisible();
  await expect(check.getByText(/已加入这台设备的复习建议/)).toBeVisible();

  await check.getByRole("button", { name: "查看为什么" }).click();
  await expect(
    check.getByText(/A\* 同时考虑已经付出的路径成本 g/),
  ).toBeVisible();

  await check.getByRole("button", { name: "再试一次" }).click();
  await check
    .getByRole("radio", { name: "比较已走成本 g 与剩余估计 h 的和 f = g + h" })
    .check();
  await check.getByRole("button", { name: "提交答案" }).click();
  await expect(
    check.getByRole("heading", { level: 3, name: "回答正确" }),
  ).toBeFocused();
  await expect(check.getByText(/已从这台设备的复习建议中移出/)).toBeVisible();
  await expect(check.getByTestId("concept-check-recorded")).toContainText(
    "2 次尝试",
  );

  const stored = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, progressKey);
  expect(stored).toEqual({
    version: 1,
    reviewVersion: 2,
    results: [
      {
        chapterId: "search",
        firstCorrect: false,
        attempts: 2,
        explanationViewed: true,
        reviewSuggested: false,
      },
    ],
  });

  await page.reload();
  const reloaded = page.getByTestId("concept-check");
  await expect(reloaded.getByTestId("concept-check-recorded")).toContainText(
    "2 次尝试",
  );
  await reloaded
    .getByRole("button", { name: "清除全部自测与复习记录" })
    .click();
  await expect(
    reloaded.getByText("确定清除这台设备上的全部自测与复习记录？"),
  ).toBeVisible();
  const confirmClear = reloaded.getByRole("button", { name: "确定清除" });
  const cancelClear = reloaded.getByRole("button", { name: "取消" });
  await expect(confirmClear).toBeFocused();
  await expect(confirmClear).toHaveAccessibleDescription(
    "确定清除这台设备上的全部自测与复习记录？",
  );
  await expect(cancelClear).toHaveAccessibleDescription(
    "确定清除这台设备上的全部自测与复习记录？",
  );
  await cancelClear.click();
  const clearTrigger = reloaded.getByRole("button", {
    name: "清除全部自测与复习记录",
  });
  await expect(clearTrigger).toBeFocused();
  await clearTrigger.click();
  await confirmClear.click();
  await expect(reloaded.getByTestId("concept-check-recorded")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), progressKey))
    .toBeNull();
});

test("English feedback explains the chapter intuition without blocking navigation", async ({
  page,
}) => {
  await resetSelfChecks(page);
  await page.goto("/en/chapters/safety/");
  const check = page.getByTestId("concept-check");

  await check
    .getByRole("radio", {
      name: "This known failure now has repeatable evidence, while other risks still need ongoing discovery and evaluation",
    })
    .check();
  await check.getByRole("button", { name: "Submit answer" }).click();
  await expect(
    check.getByRole("heading", { level: 3, name: "Correct" }),
  ).toBeVisible();
  await check.getByRole("button", { name: "See why" }).click();
  await expect(check.getByText(/does not cover unknown cases/)).toBeVisible();
  await expect(page.getByTestId("complete-and-continue")).toBeVisible();
});

test("concept checks remain keyboard-operable and mobile-safe", async ({
  page,
}) => {
  await resetSelfChecks(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/chapters/cnn/");
  const check = page.getByTestId("concept-check");
  const radios = check.getByRole("radio");

  await radios.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(1)).toBeFocused();
  await expect(radios.nth(1)).toBeChecked();

  const optionHeights = await check
    .locator(".concept-check-options label")
    .evaluateAll((options) =>
      options.map((option) => option.getBoundingClientRect().height),
    );
  expect(optionHeights.every((height) => height >= 48)).toBe(true);

  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport);
});

test("storage failure keeps feedback and continuation available", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("storage unavailable");
    };
  });
  await page.goto("/chapters/bayes/");
  const check = page.getByTestId("concept-check");

  await check
    .getByRole("radio", {
      name: "证据没有偏向任一方向，后验保持在先验附近",
    })
    .check();
  await check.getByRole("button", { name: "提交答案" }).click();

  await expect(
    check.getByRole("heading", { level: 3, name: "回答正确" }),
  ).toBeVisible();
  await expect(
    check.getByTestId("concept-check-storage-warning"),
  ).toContainText("无法保存自测与复习记录");
  await expect(page.getByTestId("complete-and-continue")).toBeVisible();
});

test("reviewed signals stay in-page and send no analytics request", async ({
  page,
}) => {
  await resetSelfChecks(page);
  await page.addInitScript(() => {
    const signals: unknown[] = [];
    Object.defineProperty(window, "__capturedLearningSignals", {
      value: signals,
      configurable: true,
    });
    window.addEventListener("ai-history:learning-signal", (event) => {
      signals.push((event as CustomEvent).detail);
    });
  });
  const outboundAnalytics: string[] = [];
  page.on("request", (request) => {
    if (/analytics|collect|beacon|telemetry/i.test(request.url())) {
      outboundAnalytics.push(request.url());
    }
  });

  await page.goto("/chapters/search/");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          (window as Window & { __capturedLearningSignals?: unknown[] })
            .__capturedLearningSignals ?? []
        ).some(
          (signal) =>
            typeof signal === "object" &&
            signal !== null &&
            "name" in signal &&
            signal.name === "chapter_started",
        ),
      ),
    )
    .toBe(true);
  const check = page.getByTestId("concept-check");
  await check
    .getByRole("radio", {
      name: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
    })
    .check();
  await check.getByRole("button", { name: "提交答案" }).click();
  await check.getByRole("button", { name: "查看为什么" }).click();

  const signals = await page.evaluate(
    () =>
      (window as Window & { __capturedLearningSignals?: unknown[] })
        .__capturedLearningSignals ?? [],
  );
  expect(signals).toEqual([
    { name: "chapter_started", chapterId: "search", locale: "zh-CN" },
    {
      name: "concept_check_completed",
      chapterId: "search",
      locale: "zh-CN",
      correct: true,
      attempt: "first",
    },
    {
      name: "concept_explanation_opened",
      chapterId: "search",
      locale: "zh-CN",
    },
  ]);
  expect(outboundAnalytics).toEqual([]);
});
