import { expect, test, type Page } from "@playwright/test";

const learningProgressStorageKey = "ai-history-learning-progress";

const chapterCases = [
  {
    id: "overview",
    route: "/chapters/overview/",
    title: "总览",
  },
  {
    id: "search",
    route: "/chapters/search/",
    title: "搜索树 / A*",
  },
  {
    id: "expert-system",
    route: "/chapters/expert-system/",
    title: "专家系统规则推理",
  },
  {
    id: "bayes",
    route: "/chapters/bayes/",
    title: "贝叶斯更新",
  },
  {
    id: "decision-boundary",
    route: "/chapters/decision-boundary/",
    title: "决策边界",
  },
  {
    id: "cnn",
    route: "/chapters/cnn/",
    title: "CNN 卷积核",
  },
  {
    id: "attention",
    route: "/chapters/attention/",
    title: "注意力机制",
  },
  {
    id: "llm-system",
    route: "/chapters/llm-system/",
    title: "LLM 系统地图",
  },
  {
    id: "rag",
    route: "/chapters/rag/",
    title: "RAG Pipeline",
  },
  {
    id: "agent",
    route: "/chapters/agent/",
    title: "Agent Loop",
  },
] as const;

type ChapterId = (typeof chapterCases)[number]["id"];

async function seedLearningProgress(
  page: Page,
  completedChapterIds: readonly ChapterId[],
): Promise<void> {
  await page.addInitScript(
    ({ key, chapterIds }) => {
      const seededKey = `${key}:playwright-seeded`;
      if (window.sessionStorage.getItem(seededKey) === "true") return;

      if (chapterIds.length === 0) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(
          key,
          JSON.stringify({ version: 1, completedChapterIds: chapterIds }),
        );
      }

      window.sessionStorage.setItem(seededKey, "true");
    },
    { key: learningProgressStorageKey, chapterIds: completedChapterIds },
  );
}

test("home starts the learning path when progress is empty", async ({
  page,
}) => {
  await seedLearningProgress(page, []);
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await expect(
    progress.getByRole("link", { name: "从总览开始" }),
  ).toHaveAttribute("href", "/chapters/overview/");
  await expect(
    progress.getByRole("link", { name: "浏览全部章节" }),
  ).toHaveAttribute("href", "#mvp");
});

test("home continues from the first gap in partial out-of-order progress", async ({
  page,
}) => {
  await seedLearningProgress(page, ["expert-system", "overview"]);
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await expect(progress).toContainText("已完成 2 / 10");
  await expect(
    progress.getByRole("link", { name: "继续学习：搜索树 / A*" }),
  ).toHaveAttribute("href", "/chapters/search/");
});

test("home shows review destinations when the whole path is complete", async ({
  page,
}) => {
  await seedLearningProgress(
    page,
    chapterCases.map(({ id }) => id),
  );
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await expect(progress.getByText("学习主线已完成")).toBeVisible();
  const timelineLink = progress.getByRole("link", { name: "回顾时间线" });
  const lineageLink = progress.getByRole("link", { name: "回顾谱系图" });
  const diagramsLink = progress.getByRole("link", { name: "回顾图源" });
  await expect(timelineLink).toBeVisible();
  await expect(timelineLink).toHaveAttribute("href", "/timeline/");
  await expect(lineageLink).toBeVisible();
  await expect(lineageLink).toHaveAttribute("href", "/lineage/");
  await expect(diagramsLink).toBeVisible();
  await expect(diagramsLink).toHaveAttribute("href", "/diagrams/");
});

test("home reset confirmation can cancel or clear progress", async ({
  page,
}) => {
  await seedLearningProgress(page, ["overview", "expert-system"]);
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await progress.getByRole("button", { name: "重置学习进度" }).click();
  await expect(progress.getByText("确定重置？")).toBeVisible();
  await progress.getByRole("button", { name: "取消" }).click();
  await expect(progress).toContainText("已完成 2 / 10");
  await expect(progress.getByText("确定重置？")).toHaveCount(0);

  await progress.getByRole("button", { name: "重置学习进度" }).click();
  await progress.getByRole("button", { name: "确定重置" }).click();
  await expect(
    progress.getByRole("link", { name: "从总览开始" }),
  ).toHaveAttribute("href", "/chapters/overview/");
  await expect
    .poll(() =>
      page.evaluate(
        (key) => window.localStorage.getItem(key),
        learningProgressStorageKey,
      ),
    )
    .toBeNull();
});

test("overview completion persists across reload and resumes from Search on home", async ({
  page,
}) => {
  await seedLearningProgress(page, []);
  await page.goto("/chapters/overview/");
  await page.getByTestId("complete-and-continue").click();
  await expect(page).toHaveURL(/\/chapters\/search\/$/);

  await page.goto("/");
  await page.reload();
  const progress = page.getByTestId("home-learning-progress");
  await expect(progress).toContainText("已完成 1 / 10");
  await expect(
    progress.getByRole("link", { name: "继续学习：搜索树 / A*" }),
  ).toHaveAttribute("href", "/chapters/search/");
});

test("locale shares Chinese progress with the English home continuation", async ({
  page,
}) => {
  await seedLearningProgress(page, []);
  await page.goto("/chapters/overview/");
  await page.getByTestId("complete-and-continue").click();

  await page.goto("/en/");
  const progress = page.getByTestId("home-learning-progress");
  await expect(progress).toContainText("Completed 1 / 10");
  await expect(
    progress.getByRole("link", { name: "Continue: Search Trees / A*" }),
  ).toHaveAttribute("href", "/en/chapters/search/");
});

test("home with only Agent complete resumes at Overview", async ({ page }) => {
  await seedLearningProgress(page, ["agent"]);
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await expect(progress).toContainText("已完成 1 / 10");
  await expect(progress.getByText("学习主线已完成")).toHaveCount(0);
  await expect(
    progress.getByRole("link", { name: "继续学习：总览" }),
  ).toHaveAttribute("href", "/chapters/overview/");
});

test("home keeps chapter navigation available when storage reads fail", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("storage unavailable");
    };
  });
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await expect(progress.getByTestId("storage-warning")).toContainText(
    "本设备无法保存学习进度",
  );
  await expect(
    progress.getByRole("link", { name: "从总览开始" }),
  ).toHaveAttribute("href", "/chapters/overview/");
});

test("home start and browse links remain available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");

  const progress = page.getByTestId("home-learning-progress");
  await expect(
    progress.getByRole("link", { name: "从总览开始" }),
  ).toHaveAttribute("href", "/chapters/overview/");
  await expect(
    progress.getByRole("link", { name: "浏览全部章节" }),
  ).toHaveAttribute("href", "#mvp");
  await context.close();
});

for (const [index, chapter] of chapterCases.entries()) {
  test(`${chapter.title} exposes its learning-path position and closure`, async ({
    page,
  }) => {
    await page.goto(chapter.route);

    const position = index + 1;
    const progress = page.getByTestId("chapter-progress");
    await expect(progress).toContainText(`第 ${position} / 10 章`);
    const progressbar = progress.getByRole("progressbar", {
      name: `当前位于第 ${position} 章，共 10 章`,
    });
    await expect(progressbar).toHaveAttribute("value", String(position));
    await expect(progressbar).toHaveAttribute("max", "10");

    const journey = page.getByTestId("chapter-journey");
    const previousChapter = chapterCases[index - 1];
    if (previousChapter) {
      await expect(
        journey.getByRole("link", {
          name: `上一章：${previousChapter.title}`,
        }),
      ).toHaveAttribute("href", previousChapter.route);
    } else {
      await expect(
        journey.getByRole("link", { name: /^上一章：/ }),
      ).toHaveCount(0);
    }

    const nextChapter = chapterCases[index + 1];
    const completionControl = journey.getByTestId("complete-and-continue");
    if (nextChapter) {
      await expect(completionControl).toHaveRole("link");
      await expect(completionControl).toHaveAttribute(
        "href",
        nextChapter.route,
      );
      await expect(completionControl).toContainText(nextChapter.title);
    } else {
      await expect(completionControl).toHaveRole("button");
      await expect(
        journey.getByRole("link", { name: "回顾时间线" }),
      ).toHaveAttribute("href", "/timeline/");
      await expect(
        journey.getByRole("link", { name: "回顾谱系图" }),
      ).toHaveAttribute("href", "/lineage/");
      await expect(
        journey.getByRole("link", { name: "回顾图源" }),
      ).toHaveAttribute("href", "/diagrams/");
    }
  });
}

test("keeps chapter navigation usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/chapters/rag/");
  await expect(
    page.getByTestId("chapter-journey").getByRole("link", {
      name: /Agent/,
    }),
  ).toHaveAttribute("href", "/chapters/agent/");
  await context.close();
});

test("falls back to no-save navigation after a storage write fails", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("storage unavailable");
    };
  });
  await page.goto("/chapters/rag/");

  const journey = page.getByTestId("chapter-journey");
  const completionLink = journey.getByTestId("complete-and-continue");
  await expect(completionLink).toHaveAttribute("href", "/chapters/agent/");
  await completionLink.click();

  await expect(page).toHaveURL(/\/chapters\/rag\/$/);
  await expect(journey.getByTestId("storage-warning")).toContainText(
    "本设备无法保存学习进度",
  );
  await expect(completionLink).toContainText("继续下一章（不保存进度）");

  await completionLink.click();
  await expect(page).toHaveURL(/\/chapters\/agent\/$/);
});

test("completing Agent alone returns to the first incomplete chapter", async ({
  page,
}) => {
  await page.goto("/chapters/agent/");
  await page.getByTestId("complete-and-continue").click();

  const journey = page.getByTestId("chapter-journey");
  const completionHeading = journey.getByRole("heading", {
    name: "本章已完成",
  });
  await expect(completionHeading).toBeFocused();
  await expect(journey.getByText("学习主线已完成")).toHaveCount(0);
  await expect(
    journey.getByRole("link", { name: "继续未完成章节：总览" }),
  ).toHaveAttribute("href", "/chapters/overview/");
});
