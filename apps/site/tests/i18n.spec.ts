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
    evidence:
      "Why did early AI rely on search, and why did it encounter combinatorial explosion?",
  },
  {
    route: "/en/chapters/expert-system/",
    title: "Expert Systems: Can expert knowledge be written as if-then rules?",
    evidence:
      "Can expert knowledge be written as rules, and why do rule systems become brittle?",
  },
  {
    route: "/en/chapters/bayes/",
    title: "Probabilistic Reasoning: How do machines handle uncertainty?",
    evidence: "How does evidence change a belief?",
  },
  {
    route: "/en/chapters/decision-boundary/",
    title:
      "Classic Machine Learning: How do machines learn decision boundaries from data?",
    evidence: "How do machines learn classification boundaries from data?",
  },
  {
    route: "/en/chapters/cnn/",
    title:
      "Deep Learning And CNNs: How do machines learn local visual features?",
    evidence: "How do machines identify local features in an image?",
  },
  {
    route: "/en/chapters/attention/",
    title:
      "Attention And Transformers: Why can tokens directly attend to each other?",
    evidence:
      "Why is Attention better suited than an RNN for modeling long-range dependencies?",
  },
  {
    route: "/en/chapters/rag/",
    title: "RAG: How do large language models connect to external knowledge?",
    evidence:
      "Why are model parameters alone not enough for answering questions?",
  },
  {
    route: "/en/chapters/agent/",
    title: "Agents: How do large language models execute multi-step tasks?",
    evidence:
      "Why is an agent a looped control system rather than a one-shot answer?",
  },
] as const;

const englishLlmSystemChapter = {
  route: "/en/chapters/llm-system/",
  title:
    "LLMs And Modern AI Systems: Why do large models still need external systems?",
  evidence: "Context Window",
} as const;

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
    label: "overview actions",
    route: "/en/chapters/overview/",
    selector: ".actions a",
    expectedHrefs: ["/en/timeline/", "/en/chapters/search/"],
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
  {
    label: "LLM system follow-on links",
    route: "/en/chapters/llm-system/",
    selector: ".actions a",
    expectedHrefs: ["/en/chapters/rag/", "/en/chapters/agent/"],
  },
] as const;

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
    ).toBeVisible();

    const mainText = await page.locator("main").innerText();
    expect(mainText, chapter.route).not.toMatch(/\p{Script=Han}/u);
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

test("English RAG chapter renders localized demo controls and scenarios", async ({
  page,
}) => {
  await page.goto("/en/chapters/rag/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "RAG: How do large language models connect to external knowledge?",
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
