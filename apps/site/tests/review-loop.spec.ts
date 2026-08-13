import { expect, test, type Locator, type Page } from "@playwright/test";

const learningProgressKey = "ai-history-learning-progress";
const conceptProgressKey = "ai-history-concept-check-progress";

const completedProgress = {
  version: 1,
  completedChapterIds: ["overview", "search"],
} as const;

const v1ReviewProgress = {
  version: 1,
  results: [
    {
      chapterId: "search",
      firstCorrect: false,
      attempts: 1,
      explanationViewed: false,
    },
    {
      chapterId: "bayes",
      firstCorrect: true,
      attempts: 2,
      explanationViewed: true,
    },
  ],
} as const;

const resolvedReviewProgress = {
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
} as const;

async function seedLocalReviewState(page: Page): Promise<void> {
  await page.addInitScript(
    ({ conceptKey, conceptProgress, learningKey, learningProgress }) => {
      const seededKey = "ai-history:review-loop-playwright-seeded";
      if (window.sessionStorage.getItem(seededKey) === "true") return;

      window.localStorage.setItem(
        learningKey,
        JSON.stringify(learningProgress),
      );
      window.localStorage.setItem(conceptKey, JSON.stringify(conceptProgress));
      window.sessionStorage.setItem(seededKey, "true");
    },
    {
      conceptKey: conceptProgressKey,
      conceptProgress: v1ReviewProgress,
      learningKey: learningProgressKey,
      learningProgress: completedProgress,
    },
  );
}

async function readStoredJson(page: Page, key: string): Promise<unknown> {
  return page.evaluate((storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    return raw === null ? null : JSON.parse(raw);
  }, key);
}

async function expectMinimumHeight(
  locator: Locator,
  minimum = 44,
): Promise<void> {
  await expect(locator).toBeVisible();
  expect(
    await locator.evaluate((element) => element.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(minimum);
}

test("chapter language switches preserve non-concept section fragments", async ({
  page,
}) => {
  await page.goto("/chapters/overview/#spine");

  await expect(page.locator("[data-language-switch]")).toHaveAttribute(
    "href",
    "/en/chapters/overview/#spine",
  );

  await page.evaluate(() => {
    window.location.hash = "chapter-notes";
  });
  await expect(page.locator("[data-language-switch]")).toHaveAttribute(
    "href",
    "/en/chapters/overview/#chapter-notes",
  );
});

test("migrates v1 suggestions in learning-path order and resolves Search across locales", async ({
  page,
}) => {
  const outboundAnalytics: string[] = [];
  page.on("request", (request) => {
    if (
      /analytics|collect|beacon|telemetry|cloudflareinsights|\/cdn-cgi\/rum/i.test(
        request.url(),
      )
    ) {
      outboundAnalytics.push(request.url());
    }
  });
  await seedLocalReviewState(page);
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  const reviewPanel = page.getByTestId("home-review-queue");
  await expect(progress).toContainText("已完成 2 / 13");
  await expect(
    progress.getByRole("link", { name: "继续学习：专家系统规则推理" }),
  ).toHaveAttribute("href", "/chapters/expert-system/");
  await expect(reviewPanel).toContainText("待复习 2 章");

  const firstReviewLink = reviewPanel.locator(".home-review-primary");
  await expect(firstReviewLink).toContainText("搜索树 / A*");
  await expect(firstReviewLink).toHaveAttribute(
    "href",
    "/chapters/search/#concept-check-search",
  );

  const remainingSummary = reviewPanel.locator(".home-review-more summary");
  const remainingReviewLink = reviewPanel.locator(".home-review-list a");
  await expect(remainingSummary).toHaveText("查看其余 1 章");
  await expect(remainingReviewLink).toContainText("贝叶斯更新");
  await expect(remainingReviewLink).toHaveAttribute(
    "href",
    "/chapters/bayes/#concept-check-bayes",
  );
  await expect(remainingReviewLink).toBeHidden();

  expect(await readStoredJson(page, conceptProgressKey)).toEqual(
    v1ReviewProgress,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await firstReviewLink.click();
  await expect(page).toHaveURL(/\/chapters\/search\/#concept-check-search$/);
  await expect(page.locator("[data-language-switch]")).toHaveAttribute(
    "href",
    "/en/chapters/search/#concept-check-search",
  );

  const conceptCheck = page.getByTestId("concept-check");
  await expect(conceptCheck).toHaveAttribute("id", "concept-check-search");
  await expect(
    conceptCheck.getByRole("heading", {
      level: 2,
      name: "用一个问题检验核心直觉",
    }),
  ).toBeFocused();
  await expect(
    conceptCheck.getByTestId("concept-check-review-note"),
  ).toBeVisible();

  const anchorPosition = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const target = document.querySelector("#concept-check-search");
    if (!header || !target)
      throw new Error("review anchor geometry unavailable");

    return {
      headerBottom: header.getBoundingClientRect().bottom,
      targetTop: target.getBoundingClientRect().top,
      viewportHeight: window.innerHeight,
    };
  });
  expect(anchorPosition.targetTop).toBeGreaterThanOrEqual(
    anchorPosition.headerBottom - 1,
  );
  expect(anchorPosition.targetTop).toBeLessThan(anchorPosition.viewportHeight);

  await conceptCheck
    .getByRole("radio", {
      name: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
    })
    .check();
  await conceptCheck.getByRole("button", { name: "提交答案" }).click();
  await expect(
    conceptCheck.getByRole("heading", { level: 3, name: "回答正确" }),
  ).toBeFocused();
  await expect(
    conceptCheck.getByText("回答正确；本章已从这台设备的复习建议中移出。"),
  ).toBeVisible();

  expect(await readStoredJson(page, conceptProgressKey)).toEqual({
    version: 1,
    reviewVersion: 2,
    results: [
      {
        chapterId: "search",
        firstCorrect: false,
        attempts: 2,
        explanationViewed: false,
        reviewSuggested: false,
      },
      {
        chapterId: "bayes",
        firstCorrect: true,
        attempts: 2,
        explanationViewed: true,
        reviewSuggested: true,
      },
    ],
  });

  await page.reload();
  await expect(
    page.getByTestId("concept-check").getByTestId("concept-check-review-note"),
  ).toHaveCount(0);

  await page.goto("/en/");
  const englishProgress = page.getByTestId("home-learning-progress");
  const englishReviewPanel = page.getByTestId("home-review-queue");
  await expect(englishProgress).toContainText("Completed 2 / 13");
  await expect(englishReviewPanel).toContainText(
    "1 chapter suggested for review",
  );
  await expect(
    englishReviewPanel.getByText("Search Trees / A*", { exact: true }),
  ).toHaveCount(0);

  const englishReviewLink = englishReviewPanel.locator(".home-review-primary");
  await expect(englishReviewLink).toContainText("Bayesian Updating");
  await expect(englishReviewLink).toHaveAttribute(
    "href",
    "/en/chapters/bayes/#concept-check-bayes",
  );
  expect(outboundAnalytics).toEqual([]);
});

test("clearing self-check and review records preserves learning completion", async ({
  page,
}) => {
  const outboundAnalytics: string[] = [];
  page.on("request", (request) => {
    if (
      /analytics|collect|beacon|telemetry|cloudflareinsights|\/cdn-cgi\/rum/i.test(
        request.url(),
      )
    ) {
      outboundAnalytics.push(request.url());
    }
  });
  await seedLocalReviewState(page);
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  const reviewPanel = page.getByTestId("home-review-queue");
  await reviewPanel
    .getByRole("button", { name: "清除自测与复习记录", exact: true })
    .click();
  await expect(
    reviewPanel.getByText(
      "确定删除这台设备上的全部自测与复习记录？章节完成进度会保留。",
    ),
  ).toBeVisible();
  const confirmClear = reviewPanel.getByRole("button", {
    name: "确定清除",
    exact: true,
  });
  const clearDescription =
    "确定删除这台设备上的全部自测与复习记录？章节完成进度会保留。";
  await expect(confirmClear).toHaveAccessibleDescription(clearDescription);
  await expect(
    reviewPanel.getByRole("button", { name: "取消", exact: true }),
  ).toHaveAccessibleDescription(clearDescription);
  await expect(confirmClear).toBeFocused();
  await reviewPanel.getByRole("button", { name: "取消", exact: true }).click();
  const clearTrigger = reviewPanel.getByRole("button", {
    name: "清除自测与复习记录",
    exact: true,
  });
  await expect(clearTrigger).toBeFocused();
  await clearTrigger.click();
  await confirmClear.click();

  const clearedStatus = reviewPanel.getByTestId("home-review-empty");
  await expect(clearedStatus).toHaveText(
    "本机自测与复习记录已清除，章节完成进度未改变。",
  );
  await expect(clearedStatus).toBeFocused();
  expect(await readStoredJson(page, conceptProgressKey)).toBeNull();
  expect(await readStoredJson(page, learningProgressKey)).toEqual(
    completedProgress,
  );
  await expect(progress).toContainText("已完成 2 / 13");
  expect(outboundAnalytics).toEqual([]);
});

test("resetting learning progress preserves concept-check and review records", async ({
  page,
}) => {
  await seedLocalReviewState(page);
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await progress
    .getByRole("button", { name: "重置学习进度", exact: true })
    .click();
  await progress.getByRole("button", { name: "确定重置", exact: true }).click();

  expect(await readStoredJson(page, learningProgressKey)).toBeNull();
  expect(await readStoredJson(page, conceptProgressKey)).toEqual(
    v1ReviewProgress,
  );
  await expect(
    progress.getByRole("link", { name: "从总览开始", exact: true }),
  ).toHaveAttribute("href", "/chapters/overview/");
  await expect(page.getByTestId("home-review-queue")).toContainText(
    "待复习 2 章",
  );
});

test("a later incorrect answer reopens a resolved review suggestion", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, progress }) => {
      const seededKey = "ai-history:resolved-review-playwright-seeded";
      if (sessionStorage.getItem(seededKey) === "true") return;
      localStorage.setItem(key, JSON.stringify(progress));
      sessionStorage.setItem(seededKey, "true");
    },
    { key: conceptProgressKey, progress: resolvedReviewProgress },
  );
  await page.goto("/chapters/search/");
  const conceptCheck = page.getByTestId("concept-check");
  await expect(
    conceptCheck.getByTestId("concept-check-review-note"),
  ).toHaveCount(0);

  await conceptCheck
    .getByRole("radio", { name: "只看离目标的估计距离 h" })
    .check();
  await conceptCheck.getByRole("button", { name: "提交答案" }).click();
  await expect(
    conceptCheck.getByText(/已加入这台设备的复习建议/),
  ).toBeVisible();

  await page.goto("/");
  await expect(page.getByTestId("home-review-queue")).toContainText(
    "待复习 1 章",
  );
  expect(await readStoredJson(page, conceptProgressKey)).toEqual({
    version: 1,
    reviewVersion: 2,
    results: [
      {
        chapterId: "search",
        firstCorrect: false,
        attempts: 3,
        explanationViewed: true,
        reviewSuggested: true,
      },
    ],
  });
});

test("failed review-record removal keeps the queue and confirmation available", async ({
  page,
}) => {
  await seedLocalReviewState(page);
  await page.addInitScript((blockedKey) => {
    const originalRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key: string): void {
      if (key === blockedKey) throw new Error("remove unavailable");
      originalRemoveItem.call(this, key);
    };
  }, conceptProgressKey);
  await page.goto("/");

  const reviewPanel = page.getByTestId("home-review-queue");
  await reviewPanel
    .getByRole("button", { name: "清除自测与复习记录", exact: true })
    .click();
  const confirmClear = reviewPanel.getByRole("button", {
    name: "确定清除",
    exact: true,
  });
  await confirmClear.click();

  await expect(reviewPanel).toContainText("待复习 2 章");
  await expect(reviewPanel.getByTestId("review-storage-warning")).toContainText(
    "无法读取或更新这台设备上的自测记录",
  );
  await expect(confirmClear).toBeFocused();
  expect(await readStoredJson(page, conceptProgressKey)).toEqual(
    v1ReviewProgress,
  );
});

test("390px review controls remain usable and collapsed links stay out of Tab order", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedLocalReviewState(page);
  await page.goto("/");

  const reviewPanel = page.getByTestId("home-review-queue");
  const firstReviewLink = reviewPanel.locator(".home-review-primary");
  const summary = reviewPanel.locator(".home-review-more summary");
  const remainingReviewLink = reviewPanel.locator(".home-review-list a");
  const clearControl = reviewPanel.getByRole("button", {
    name: "清除自测与复习记录",
    exact: true,
  });

  await expectMinimumHeight(firstReviewLink);
  await expectMinimumHeight(summary);
  await expectMinimumHeight(clearControl);
  await expect(remainingReviewLink).toBeHidden();

  await summary.click();
  await expectMinimumHeight(remainingReviewLink);

  const expandedLayout = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(expandedLayout.bodyWidth).toBeLessThanOrEqual(expandedLayout.viewport);
  expect(expandedLayout.documentWidth).toBeLessThanOrEqual(
    expandedLayout.viewport,
  );

  await summary.click();
  await expect(remainingReviewLink).toBeHidden();
  await summary.focus();
  await page.keyboard.press("Tab");
  await expect(clearControl).toBeFocused();
});

test("320px English review card wraps the longest chapter title without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        reviewVersion: 2,
        results: [
          {
            chapterId: "reinforcement-learning",
            firstCorrect: false,
            attempts: 1,
            explanationViewed: false,
            reviewSuggested: true,
          },
        ],
      }),
    );
  }, conceptProgressKey);
  await page.goto("/en/");

  const reviewPanel = page.getByTestId("home-review-queue");
  const reviewLink = reviewPanel.locator(".home-review-primary");
  await expect(reviewLink).toContainText("Reinforcement Learning And Feedback");
  await expectMinimumHeight(reviewLink);
  const layout = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
});

test("concept storage read failure avoids a false empty conclusion and keeps learning available", async ({
  page,
}) => {
  await page.addInitScript(
    ({ blockedKey, learningKey }) => {
      window.localStorage.setItem(
        learningKey,
        JSON.stringify({ version: 1, completedChapterIds: ["overview"] }),
      );
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key: string): string | null {
        if (key === blockedKey) throw new Error("concept storage unavailable");
        return originalGetItem.call(this, key);
      };
    },
    { blockedKey: conceptProgressKey, learningKey: learningProgressKey },
  );
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  const reviewPanel = page.getByTestId("home-review-queue");
  await expect(reviewPanel.getByTestId("review-storage-warning")).toContainText(
    "无法读取或更新这台设备上的自测记录",
  );
  await expect(reviewPanel.getByTestId("home-review-empty")).toHaveCount(0);
  await expect(
    reviewPanel.getByText("当前没有待处理的复习建议。", { exact: true }),
  ).toHaveCount(0);
  await expect(
    progress.getByRole("link", { name: "继续学习：搜索树 / A*" }),
  ).toHaveAttribute("href", "/chapters/search/");
  await expect(
    progress.getByRole("link", { name: "浏览全部章节", exact: true }),
  ).toHaveAttribute("href", "#learning-path");
});

test("an unsupported review schema warns without overwriting its records", async ({
  page,
}) => {
  const futureProgress = {
    version: 1,
    reviewVersion: 3,
    results: [{ chapterId: "search", futureState: "keep" }],
  };
  await page.addInitScript(
    ({ key, progress }) => {
      localStorage.setItem(key, JSON.stringify(progress));
    },
    { key: conceptProgressKey, progress: futureProgress },
  );
  await page.goto("/");

  const reviewPanel = page.getByTestId("home-review-queue");
  await expect(reviewPanel.getByTestId("review-storage-warning")).toBeVisible();
  await expect(reviewPanel.getByTestId("home-review-empty")).toHaveCount(0);

  await page.goto("/chapters/search/");
  const conceptCheck = page.getByTestId("concept-check");
  await conceptCheck
    .getByRole("radio", {
      name: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
    })
    .check();
  await conceptCheck.getByRole("button", { name: "提交答案" }).click();
  await expect(
    conceptCheck.getByTestId("concept-check-storage-warning"),
  ).toBeVisible();
  expect(await readStoredJson(page, conceptProgressKey)).toEqual(
    futureProgress,
  );
});

test("review suggestions synchronize after another tab updates the concept store", async ({
  context,
  page,
}) => {
  await context.addInitScript(
    ({ key, progress }) => {
      localStorage.setItem(key, JSON.stringify(progress));
    },
    {
      key: conceptProgressKey,
      progress: {
        version: 1,
        reviewVersion: 2,
        results: [
          {
            chapterId: "search",
            firstCorrect: false,
            attempts: 1,
            explanationViewed: false,
            reviewSuggested: true,
          },
        ],
      },
    },
  );

  await page.goto("/");
  const secondPage = await context.newPage();
  await secondPage.goto("/");
  await expect(page.getByTestId("home-review-queue")).toContainText(
    "待复习 1 章",
  );

  await secondPage.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        reviewVersion: 2,
        results: [
          {
            chapterId: "search",
            firstCorrect: false,
            attempts: 2,
            explanationViewed: false,
            reviewSuggested: false,
          },
        ],
      }),
    );
  }, conceptProgressKey);

  await expect(
    page.getByTestId("home-review-queue").getByTestId("home-review-empty"),
  ).toHaveText("当前没有待处理的复习建议。");

  await secondPage.evaluate(
    (key) => localStorage.removeItem(key),
    conceptProgressKey,
  );
  await expect(page.getByTestId("home-review-queue")).toHaveCount(0);
  await secondPage.close();
});
