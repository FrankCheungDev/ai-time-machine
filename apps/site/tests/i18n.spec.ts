import { expect, test } from "@playwright/test";

const englishPrimaryRoutes = [
  "/en/",
  "/en/timeline/",
  "/en/lineage/",
  "/en/diagrams/",
  "/en/chapters/overview/",
] as const;

const englishDemoChapterCases = [
  {
    route: "/en/chapters/search/",
    title: "Symbolic AI And Search: Can machines act intelligent by searching?",
    activityTitle: "Search Tree Walkthrough",
    evidence:
      "Why did early AI rely on search, and why did it encounter combinatorial explosion?",
  },
  {
    route: "/en/chapters/expert-system/",
    title: "Expert Systems: Can expert knowledge be written as if-then rules?",
    activityTitle: "Expert System Inference",
    evidence:
      "Can expert knowledge be written as rules, and why do rule systems become brittle?",
  },
  {
    route: "/en/chapters/bayes/",
    title: "Probabilistic Reasoning: How do machines handle uncertainty?",
    activityTitle: "Bayesian Update Lab",
    evidence: "How does evidence change a belief?",
  },
  {
    route: "/en/chapters/decision-boundary/",
    title:
      "Classic Machine Learning: How do machines learn decision boundaries from data?",
    activityTitle: "Decision Boundary Explorer",
    evidence: "How do machines learn classification boundaries from data?",
  },
  {
    route: "/en/chapters/cnn/",
    title:
      "Deep Learning And CNNs: How do machines learn local visual features?",
    activityTitle: "CNN Kernel Explorer",
    evidence: "How do machines identify local features in an image?",
  },
  {
    route: "/en/chapters/attention/",
    title:
      "Attention And Transformers: Why can tokens directly attend to each other?",
    activityTitle: "Attention Map Explorer",
    evidence:
      "Why is Attention better suited than an RNN for modeling long-range dependencies?",
  },
  {
    route: "/en/chapters/rag/",
    title: "RAG: How do large language models connect to external knowledge?",
    activityTitle: "RAG Pipeline Walkthrough",
    evidence:
      "Why are model parameters alone not enough for answering questions?",
  },
  {
    route: "/en/chapters/agent/",
    title: "Agents: How do large language models execute multi-step tasks?",
    activityTitle: "Agent Loop Walkthrough",
    evidence:
      "Why is an agent a looped control system rather than a one-shot answer?",
  },
] as const;

const chineseDemoChapterCases = [
  {
    route: "/chapters/search/",
    title: "符号主义与搜索：机器能否通过搜索表现出智能？",
    activityTitle: "搜索树逐步探索",
  },
  {
    route: "/chapters/expert-system/",
    title: "专家系统：专家知识能否写成 if-then 规则？",
    activityTitle: "专家系统推理演示",
  },
  {
    route: "/chapters/bayes/",
    title: "概率推理：机器如何处理不确定性？",
    activityTitle: "贝叶斯更新实验",
  },
  {
    route: "/chapters/decision-boundary/",
    title: "经典机器学习：机器如何从数据中学习决策边界？",
    activityTitle: "决策边界探索",
  },
  {
    route: "/chapters/cnn/",
    title: "深度学习与 CNN：机器如何从图像中学习局部特征？",
    activityTitle: "CNN 卷积核实验",
  },
  {
    route: "/chapters/attention/",
    title: "Attention 与 Transformer：token 为什么可以直接互相关注？",
    activityTitle: "注意力热图探索",
  },
  {
    route: "/chapters/rag/",
    title: "RAG：大模型如何连接外部知识？",
    activityTitle: "RAG 流程演示",
  },
  {
    route: "/chapters/agent/",
    title: "Agent：大模型如何执行多步任务？",
    activityTitle: "Agent 循环演示",
  },
] as const;

const demoActivityTitleCases = [
  ...chineseDemoChapterCases,
  ...englishDemoChapterCases,
] as const;

const englishLlmSystemChapter = {
  route: "/en/chapters/llm-system/",
  title:
    "LLMs And Modern AI Systems: Why do large models still need external systems?",
  evidence: "Context Window",
} as const;

const englishChapterReferenceCases = [
  {
    route: "/en/chapters/search/",
    expectedHrefs: [
      "https://aima.cs.berkeley.edu/",
      "https://doi.org/10.1109/TSSC.1968.300136",
    ],
  },
  {
    route: "/en/chapters/expert-system/",
    expectedHrefs: [
      "https://www.shortliffe.net/",
      "https://doi.org/10.1016/0004-3702(93)90068-M",
    ],
  },
  {
    route: "/en/chapters/bayes/",
    expectedHrefs: [
      "https://allendowney.github.io/ThinkBayes2/",
      "https://www.deeplearningbook.org/contents/prob.html",
    ],
  },
  {
    route: "/en/chapters/decision-boundary/",
    expectedHrefs: [
      "https://hastie.su.domains/ElemStatLearn/",
      "https://www.cs.cornell.edu/courses/cs4780/2018fa/lectures/",
    ],
  },
  {
    route: "/en/chapters/cnn/",
    expectedHrefs: [
      "https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
      "https://www.deeplearningbook.org/contents/convnets.html",
    ],
  },
  {
    route: "/en/chapters/attention/",
    expectedHrefs: [
      "https://arxiv.org/abs/1706.03762",
      "https://jalammar.github.io/illustrated-transformer/",
    ],
  },
  {
    route: "/en/chapters/rag/",
    expectedHrefs: [
      "https://arxiv.org/abs/2005.11401",
      "https://arxiv.org/abs/2312.10997",
    ],
  },
  {
    route: "/en/chapters/agent/",
    expectedHrefs: [
      "https://arxiv.org/abs/2210.03629",
      "https://arxiv.org/abs/2302.04761",
    ],
  },
] as const;

const englishRouteLinkCases = [
  {
    label: "home learning links",
    route: "/en/",
    selector: "#mvp a.demo-card",
    expectedHrefs: [
      "/en/chapters/overview/",
      "/en/chapters/search/",
      "/en/chapters/expert-system/",
      "/en/chapters/bayes/",
      "/en/chapters/decision-boundary/",
      "/en/chapters/cnn/",
      "/en/chapters/attention/",
      "/en/chapters/llm-system/",
      "/en/chapters/rag/",
      "/en/chapters/agent/",
    ],
  },
  {
    label: "home overview links",
    route: "/en/",
    selector: 'section[aria-labelledby="overview-title"] a.demo-card',
    expectedHrefs: ["/en/timeline/", "/en/lineage/", "/en/diagrams/"],
  },
  {
    label: "timeline demo links",
    route: "/en/timeline/",
    selector: ".timeline-list a.button",
    expectedHrefs: [
      "/en/chapters/search/",
      "/en/chapters/expert-system/",
      "/en/chapters/bayes/",
      "/en/chapters/cnn/",
      "/en/chapters/attention/",
      "/en/chapters/llm-system/",
      "/en/chapters/rag/",
      "/en/chapters/agent/",
    ],
  },
  {
    label: "lineage node links",
    route: "/en/lineage/",
    selector: '.lineage-panel a[href^="/en/"]',
    expectedHrefs: [
      "/en/chapters/search/",
      "/en/chapters/expert-system/",
      "/en/chapters/bayes/",
      "/en/chapters/cnn/",
      "/en/chapters/attention/",
      "/en/chapters/rag/",
      "/en/chapters/llm-system/",
      "/en/chapters/agent/",
    ],
  },
  {
    label: "diagram core links",
    route: "/en/diagrams/",
    selector: "[data-core-diagram]",
    expectedHrefs: [
      "/en/",
      "/en/timeline/",
      "/en/lineage/",
      "/en/chapters/llm-system/",
      "/en/chapters/search/",
      "/en/chapters/expert-system/",
      "/en/chapters/bayes/",
      "/en/chapters/decision-boundary/",
      "/en/chapters/cnn/",
      "/en/chapters/attention/",
      "/en/chapters/rag/",
      "/en/chapters/agent/",
    ],
  },
  {
    label: "diagram asset download",
    route: "/en/diagrams/",
    selector: "a.demo-card[download]",
    expectedHrefs: ["/diagrams/rag-pipeline.svg"],
  },
  {
    label: "overview external references",
    route: "/en/chapters/overview/",
    selector: 'main a[href^="https://"]',
    expectedHrefs: [
      "https://aima.cs.berkeley.edu/",
      "https://www.deeplearningbook.org/",
      "https://arxiv.org/abs/1706.03762",
    ],
  },
] as const;

async function openReadyEnglishDemo(
  page: import("@playwright/test").Page,
  route: string,
) {
  await page.goto(route);
  await expect(
    page.locator(".demo-shell[data-demo-ready='true']"),
    route,
  ).toHaveCount(1);
}

test("Chinese routes expose zh-CN document language and an English switch", async ({
  page,
}) => {
  await page.goto("/chapters/rag/");

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");

  const englishSwitch = page.getByRole("link", { name: "English" });
  await expect(englishSwitch).toBeVisible();
  await expect(englishSwitch).toHaveAttribute("href", "/en/chapters/rag/");

  const chapterNavigation = page.getByRole("link", { name: "章节主线" });
  await expect(chapterNavigation).toHaveAttribute("href", "/#mvp");
});

test("English browser preference redirects a root visit to /en/", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL(/\/en\/$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Interactive Illustrated AI History",
    }),
  ).toBeVisible();

  await context.close();
});

test("manual Chinese preference keeps root visits on Chinese", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  await context.addInitScript(() => {
    localStorage.setItem("ai-history-locale", "zh-CN");
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL((url) => url.pathname === "/");
  await expect(
    page.getByRole("heading", { level: 1, name: "交互式人工智能图解史" }),
  ).toBeVisible();

  await context.close();
});

test("valid cookie preference wins when local storage is invalid", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  await context.addCookies([
    {
      name: "ai-history-locale",
      value: "zh-CN",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await context.addInitScript(() => {
    localStorage.setItem("ai-history-locale", "not-a-locale");
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL((url) => url.pathname === "/");
  await context.close();
});

test("invalid preferences do not suppress English root detection", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  await context.addCookies([
    {
      name: "ai-history-locale",
      value: "not-a-locale",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await context.addInitScript(() => {
    localStorage.setItem("ai-history-locale", "also-not-a-locale");
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL(/\/en\/$/);
  await context.close();
});

test("cookie preference is used when local storage is unavailable", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  await context.addCookies([
    {
      name: "ai-history-locale",
      value: "zh-CN",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("Storage is unavailable");
      },
    });
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL((url) => url.pathname === "/");
  await context.close();
});

test("the first supported browser language keeps root visits Chinese", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      value: ["zh-CN", "en-US"],
    });
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL((url) => url.pathname === "/");
  await context.close();
});

test("unsupported lookalike browser languages keep root visits Chinese", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      value: ["enochian", "zhongwen"],
    });
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL((url) => url.pathname === "/");
  await context.close();
});

test("browser detection skips lookalikes before a supported locale", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      value: ["zhongwen", "en-US"],
    });
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL(/\/en\/$/);
  await context.close();
});

test("English browser preference leaves deep links stable", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();

  await page.goto("/chapters/rag/");

  await expect(page).toHaveURL(/\/chapters\/rag\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await context.close();
});

test("manual switch persists the selected language", async ({ page }) => {
  await page.goto("/chapters/rag/");

  await page.getByRole("link", { name: "English" }).click();

  await expect(page).toHaveURL(/\/en\/chapters\/rag\/$/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("ai-history-locale")))
    .toBe("en");
  await expect
    .poll(() => page.evaluate(() => document.cookie))
    .toContain("ai-history-locale=en");
});

test("manual switch navigation works without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/chapters/rag/");
  await page.getByRole("link", { name: "English" }).click();

  await expect(page).toHaveURL(/\/en\/chapters\/rag\/$/);
  await context.close();
});

test("English primary routes render localized page chrome and content", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Interactive Illustrated AI History",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "中文" })).toHaveAttribute(
    "href",
    "/",
  );

  await page.goto("/en/timeline/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "AI Evolution Timeline",
    }),
  ).toBeVisible();

  await page.goto("/en/lineage/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "AI Technical Lineage",
    }),
  ).toBeVisible();

  await page.goto("/en/diagrams/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Diagram Sources And Exports",
    }),
  ).toBeVisible();

  await page.goto("/en/chapters/overview/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Overview: Why did AI not suddenly become large models?",
    }),
  ).toBeVisible();
});

test("English lineage labels fit the preserved diagram geometry", async ({
  page,
}) => {
  await page.goto("/en/lineage/");

  const layout = await page.evaluate(() => {
    const nodeRects = Array.from(
      document.querySelectorAll(".lineage-node rect"),
    ).map((rect) => rect.getBoundingClientRect());
    const overflowingNodeLabels = Array.from(
      document.querySelectorAll(".lineage-node"),
    ).flatMap((node) => {
      const rect = node.querySelector("rect")?.getBoundingClientRect();
      const label = node.querySelector("text")?.getBoundingClientRect();

      if (
        !rect ||
        !label ||
        (label.left >= rect.left && label.right <= rect.right)
      ) {
        return [];
      }

      return [node.id];
    });
    const overlappingEdgeLabels = Array.from(
      document.querySelectorAll(".edge-label"),
    ).flatMap((label) => {
      const box = label.getBoundingClientRect();
      const overlapsNode = nodeRects.some(
        (rect) =>
          box.left < rect.right &&
          box.right > rect.left &&
          box.top < rect.bottom &&
          box.bottom > rect.top,
      );

      return overlapsNode ? [label.textContent] : [];
    });

    return { overflowingNodeLabels, overlappingEdgeLabels };
  });

  expect(layout).toEqual({
    overflowingNodeLabels: [],
    overlappingEdgeLabels: [],
  });
});

test("mobile headers keep brand, language switch, and navigation separated", async ({
  page,
}) => {
  for (const route of ["/", "/en/"]) {
    for (const width of [375, 390]) {
      await page.setViewportSize({ width, height: 667 });
      await page.goto(route);

      const layout = await page.evaluate(() => {
        const brand = document.querySelector(".brand")?.getBoundingClientRect();
        const languageSwitch = document
          .querySelector(".language-switch")
          ?.getBoundingClientRect();
        const navigation = document
          .querySelector(".site-header nav")
          ?.getBoundingClientRect();
        const targetHeights = Array.from(
          document.querySelectorAll(".site-header a"),
        ).map((link) => link.getBoundingClientRect().height);

        if (!brand || !languageSwitch || !navigation) {
          return null;
        }

        return {
          brandAndSwitchShareRow:
            Math.abs(
              (brand.top + brand.bottom) / 2 -
                (languageSwitch.top + languageSwitch.bottom) / 2,
            ) <= 1,
          brandEndsBeforeSwitch: brand.right <= languageSwitch.left,
          navigationStartsBelowFirstRow:
            navigation.top >= Math.max(brand.bottom, languageSwitch.bottom),
          noHorizontalOverflow:
            document.documentElement.scrollWidth <= window.innerWidth,
          targetHeights,
        };
      });

      expect(layout, `${route} at ${width}px`).not.toBeNull();
      expect(layout, `${route} at ${width}px`).toMatchObject({
        brandAndSwitchShareRow: true,
        brandEndsBeforeSwitch: true,
        navigationStartsBelowFirstRow: true,
        noHorizontalOverflow: true,
      });

      for (const height of layout?.targetHeights ?? []) {
        expect(
          height,
          `${route} at ${width}px target height`,
        ).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

test("English primary route bodies contain no Han characters", async ({
  page,
}) => {
  for (const route of englishPrimaryRoutes) {
    await page.goto(route);

    const mainText = await page.locator("main").innerText();
    expect(mainText, route).not.toMatch(/\p{Script=Han}/u);
  }
});

test("English RAG SVG accessibility label uses English punctuation", async ({
  page,
}) => {
  await page.goto("/en/chapters/rag/");

  await expect(page.locator("[data-mobile-scroll-scene]")).toHaveAttribute(
    "aria-label",
    "RAG pipeline flow diagram, can fit the screen or scroll horizontally for the full diagram",
  );
});

test("English demo and LLM-system chapters are fully localized", async ({
  page,
}) => {
  for (const chapter of englishDemoChapterCases) {
    await page.goto(chapter.route);

    await expect(page.locator("html"), chapter.route).toHaveAttribute(
      "lang",
      "en",
    );
    await expect(
      page.getByRole("heading", { level: 1, name: chapter.title }),
      chapter.route,
    ).toBeVisible();
    await expect(
      page.getByText(chapter.evidence, { exact: true }),
      chapter.route,
    ).toBeVisible();
    await expect(
      page.locator(".demo-shell[data-demo-ready='true']"),
      chapter.route,
    ).toHaveCount(1);

    const mainText = await page.locator("main").innerText();
    expect(mainText, chapter.route).not.toMatch(/\p{Script=Han}/u);

    const localizedAttributes = await page
      .locator("main, main *")
      .evaluateAll((elements) =>
        elements.flatMap((element) =>
          ["aria-label", "title"]
            .map((attribute) => element.getAttribute(attribute))
            .filter((value): value is string => value !== null),
        ),
      );
    expect(
      localizedAttributes.length,
      `${chapter.route} localized accessibility attributes`,
    ).toBeGreaterThan(0);
    expect(
      localizedAttributes.join("\n"),
      `${chapter.route} aria-label/title attributes`,
    ).not.toMatch(/\p{Script=Han}/u);
  }

  await page.goto(englishLlmSystemChapter.route);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: englishLlmSystemChapter.title,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(englishLlmSystemChapter.evidence, { exact: true }),
  ).toBeVisible();

  const mainText = await page.locator("main").innerText();
  expect(mainText, englishLlmSystemChapter.route).not.toMatch(
    /\p{Script=Han}/u,
  );
});

test("demo activity titles stay concise while chapter questions remain H1", async ({
  page,
}) => {
  for (const chapter of demoActivityTitleCases) {
    await page.goto(chapter.route);

    await expect(
      page.getByRole("heading", { level: 1, name: chapter.title }),
      `${chapter.route} chapter question`,
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: chapter.activityTitle }),
      `${chapter.route} activity title`,
    ).toBeVisible();
  }
});

test("English route classes keep exact localized and static hrefs", async ({
  page,
}) => {
  for (const linkCase of englishRouteLinkCases) {
    await page.goto(linkCase.route);

    const hrefs = await page
      .locator(linkCase.selector)
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

    expect(hrefs, linkCase.label).toEqual(linkCase.expectedHrefs);
  }
});

test("English standard chapter references keep exact external hrefs", async ({
  page,
}) => {
  for (const referenceCase of englishChapterReferenceCases) {
    await page.goto(referenceCase.route);

    const hrefs = await page
      .locator('main a[href^="https://"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

    expect(hrefs, referenceCase.route).toEqual(referenceCase.expectedHrefs);
  }
});

test("English search interaction changes the active strategy", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/search/");

  await page.getByRole("button", { name: "A* heuristic" }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "A* uses a heuristic to move toward the goal",
    }),
  ).toBeVisible();
});

test("English expert-system interaction reveals a rule conflict", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/expert-system/");

  await page
    .getByRole("checkbox", { name: "Add the penguin exception" })
    .check();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Rule conflict: can it fly or not?",
    }),
  ).toBeVisible();
});

test("English Bayes interaction updates the posterior belief", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/bayes/");

  await page.getByRole("slider", { name: "Evidence support" }).fill("50");
  await expect(
    page.getByText("Posterior belief 30%", { exact: true }),
  ).toBeVisible();
});

test("English decision-boundary interaction changes the model mode", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/decision-boundary/");

  await page.getByRole("button", { name: "Overfit boundary" }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Overfitting chases every example",
    }),
  ).toBeVisible();
});

test("English CNN interaction changes the kernel and scan step", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/cnn/");

  await page.getByRole("button", { name: "Smoothing convolution" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Slide toward the boundary",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Smoothing convolution summarizes a local region. The window covers the brightness transition, so the edge response begins to grow.",
      { exact: true },
    ),
  ).toBeVisible();
});

test("English Attention interaction changes the token and mode", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/attention/");

  await page.getByRole("button", { name: "external knowledge" }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: '"external knowledge" is the distant key',
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "RNN mode" }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "An RNN can only pass information along the sequence",
    }),
  ).toBeVisible();
});

test("English Agent interaction selects the localized failure branch", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/agent/");

  await page.getByRole("button", { name: "Simulate a tool failure" }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Observe failure and revise the plan",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "The tool returns no result or outdated information, so the agent must inspect the failure and revise its plan.",
      { exact: true },
    ),
  ).toBeVisible();
});

test("English RAG chapter renders localized demo controls and scenarios", async ({
  page,
}) => {
  await openReadyEnglishDemo(page, "/en/chapters/rag/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "RAG: How do large language models connect to external knowledge?",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "RAG Pipeline Walkthrough",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Why are model parameters alone not enough for answering questions?",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("Learning goals", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Convert the question into a vector",
    }),
  ).toBeVisible();

  await page.getByLabel("Retrieval scenario").selectOption("wrong");
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Wrong retrieval: evidence leads the answer astray",
    }),
  ).toBeVisible();
});
