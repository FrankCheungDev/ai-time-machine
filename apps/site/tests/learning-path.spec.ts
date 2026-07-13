import { expect, test } from "@playwright/test";

const chapterCases = [
  {
    route: "/chapters/overview/",
    title: "总览",
  },
  {
    route: "/chapters/search/",
    title: "搜索树 / A*",
  },
  {
    route: "/chapters/expert-system/",
    title: "专家系统规则推理",
  },
  {
    route: "/chapters/bayes/",
    title: "贝叶斯更新",
  },
  {
    route: "/chapters/decision-boundary/",
    title: "决策边界",
  },
  {
    route: "/chapters/cnn/",
    title: "CNN 卷积核",
  },
  {
    route: "/chapters/attention/",
    title: "注意力机制",
  },
  {
    route: "/chapters/llm-system/",
    title: "LLM 系统地图",
  },
  {
    route: "/chapters/rag/",
    title: "RAG Pipeline",
  },
  {
    route: "/chapters/agent/",
    title: "Agent Loop",
  },
] as const;

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
