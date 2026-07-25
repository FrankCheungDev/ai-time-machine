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
  await expect(check.getByTestId("concept-check-recorded")).toContainText(
    "2 次尝试",
  );

  const stored = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, progressKey);
  expect(stored).toEqual({
    version: 1,
    results: [
      {
        chapterId: "search",
        firstCorrect: false,
        attempts: 2,
        explanationViewed: true,
      },
    ],
  });

  await page.reload();
  const reloaded = page.getByTestId("concept-check");
  await expect(reloaded.getByTestId("concept-check-recorded")).toContainText(
    "2 次尝试",
  );
  await reloaded.getByRole("button", { name: "清除全部自测记录" }).click();
  await expect(
    reloaded.getByText("确定清除这台设备上的全部自测记录？"),
  ).toBeVisible();
  await reloaded.getByRole("button", { name: "确定清除" }).click();
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
  ).toContainText("无法保存自测记录");
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
