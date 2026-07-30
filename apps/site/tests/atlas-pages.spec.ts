import { expect, test } from "@playwright/test";
import { getDiagramAssets } from "@ai-history/data";
import { canonicalChapterLabels, chapterRoutes } from "./fixtures/chapters";

test("Home page links to the LLM system chapter in the MVP spine", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /LLM 系统地图/ })).toBeVisible();
});

test("Home page hero map does not overlay standalone marker dots on labels", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator(".system-map > svg > circle")).toHaveCount(0);
});

test("Home page hero map keeps the Agent card attached to the connector", async ({
  page,
}) => {
  await page.goto("/");

  const mapGeometry = await page
    .locator(".system-map > svg")
    .evaluate((svg) => {
      const connector = svg.querySelector(":scope > path");
      const rects = Array.from(svg.querySelectorAll(":scope > g rect"));
      const agentCard = rects.at(3);
      const connectorD = connector?.getAttribute("d") ?? "";
      const coordinates = Array.from(
        connectorD.matchAll(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g),
        (match) => ({
          x: Number.parseFloat(match[1]),
          y: Number.parseFloat(match[2]),
        }),
      );
      const connectorEnd = coordinates.at(-1);

      if (!agentCard || !connectorEnd) {
        return null;
      }

      return {
        agentCenterY:
          Number.parseFloat(agentCard.getAttribute("y") ?? "0") +
          Number.parseFloat(agentCard.getAttribute("height") ?? "0") / 2,
        connectorEndY: connectorEnd.y,
      };
    });

  expect(mapGeometry).not.toBeNull();
  expect(
    Math.abs(mapGeometry!.agentCenterY - mapGeometry!.connectorEndY),
  ).toBeLessThanOrEqual(80);
});

test("Home page hero map centers each label inside its card", async ({
  page,
}) => {
  await page.goto("/");

  const labelOffsets = await page
    .locator(".system-map > svg")
    .evaluate((svg) => {
      const groups = Array.from(svg.querySelectorAll(":scope > g"));
      const rects = Array.from(groups[0]?.querySelectorAll("rect") ?? []);
      const titles = Array.from(groups[1]?.querySelectorAll("text") ?? []);
      const subtitles = Array.from(groups[2]?.querySelectorAll("text") ?? []);

      return rects.flatMap((rect, index) => {
        const rectBox = rect.getBoundingClientRect();
        const cardCenterX = rectBox.left + rectBox.width / 2;

        return [titles[index], subtitles[index]].map((label) => {
          const labelBox = label.getBoundingClientRect();

          return {
            offsetX: Math.abs(labelBox.left + labelBox.width / 2 - cardCenterX),
            text: label.textContent,
          };
        });
      });
    });

  for (const label of labelOffsets) {
    expect(
      label.offsetX,
      `${label.text} should be centered`,
    ).toBeLessThanOrEqual(2);
  }
});

test("Home cards and chapter pages use one canonical learning order", async ({
  page,
}) => {
  await page.goto("/");

  for (const chapter of canonicalChapterLabels) {
    const card = page.getByRole("link", { name: chapter.homeCard });
    await expect(card.locator("span").first()).toHaveText(chapter.eyebrow);

    await page.goto(chapter.route);
    await expect(page.locator("main > .eyebrow").first()).toHaveText(
      chapter.eyebrow,
    );
    await expect(page.getByText(/MVP Demo/)).toHaveCount(0);
    await page.goto("/");
  }
});

test("Home page highlights the recommended first-time learning path", async ({
  page,
}) => {
  await page.goto("/");

  const recommendedCard = page.getByRole("link", { name: /总览/ });
  await expect(recommendedCard.getByText("推荐从这里开始")).toBeVisible();
  await expect(recommendedCard.getByText(/约 5 分钟/)).toBeVisible();
  await expect(recommendedCard.getByText(/阅读主线/)).toBeVisible();
});

test("Overview MDX chapter renders the chapter-zero narrative", async ({
  page,
}) => {
  const overviewPages = [
    {
      route: "/chapters/overview/",
      heading: "总览：AI 为什么不是突然变成大模型的？",
      description:
        "沿着规则搜索、知识工程、概率统计、深度学习、Transformer、基础模型训练、RAG 与 Agent，理解现代 AI 系统如何逐步形成。",
      spine: "从规则到系统",
      reading: "每章看四件事",
      simplification: "这是一张学习地图，不是完整 AI 百科",
      references: "参考资料",
    },
    {
      route: "/en/chapters/overview/",
      heading: "Overview: Why did AI not suddenly become large models?",
      description:
        "Follow rules and search, knowledge engineering, probability, deep learning, Transformers, foundation-model training, RAG, and agents to see how modern AI systems emerged.",
      spine: "From Rules To Systems",
      reading: "Four Things To Notice In Every Chapter",
      simplification: "This Is A Learning Map, Not A Complete AI Encyclopedia",
      references: "References",
    },
  ];
  const internalProofCopy = [
    "Technical Closure",
    "MDX 章节可渲染",
    "The MDX Chapter Renders",
    "这个页面验证 Astro + MDX 章节闭环：贡献者可以用 Markdown/MDX 写解释文本，同时复用站点布局、设计 token 和 Astro 路由。",
    "This page verifies the Astro + MDX chapter loop: contributors can write explanations in Markdown/MDX while reusing the site layout, design tokens, and Astro routing.",
  ];

  for (const overview of overviewPages) {
    await page.goto(overview.route);

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      overview.description,
    );

    await expect(
      page.getByRole("heading", { level: 1, name: overview.heading }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: overview.spine }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: overview.reading }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: overview.simplification }),
    ).toBeVisible();
    await expect(
      page.getByText(overview.references, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Artificial Intelligence: A Modern Approach",
      }),
    ).toBeVisible();

    for (const proofCopy of internalProofCopy) {
      await expect(page.getByText(proofCopy, { exact: true })).toHaveCount(0);
    }
  }

  await page.goto("/");
  await expect(
    page.locator("#mvp").getByRole("link", { name: /Chapter 00 总览/ }),
  ).toBeVisible();
});

test("Timeline page shows the AI evolution overview", async ({ page }) => {
  await page.goto("/timeline/");

  await expect(
    page.getByRole("heading", { level: 1, name: "AI 技术演化总览时间线" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Transformer",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "查看 Demo 06：注意力机制" }),
  ).toBeVisible();
});

test("Lineage page shows the technical paradigm map", async ({ page }) => {
  await page.goto("/lineage/");

  await expect(
    page.getByRole("heading", { level: 1, name: "AI 技术谱系图" }),
  ).toBeVisible();
  const lineagePanel = page.locator(".lineage-panel");
  await expect(
    lineagePanel.getByText("符号主义", { exact: true }),
  ).toBeVisible();
  await expect(
    lineagePanel.getByText("经典机器学习", { exact: true }),
  ).toBeVisible();
  await expect(lineagePanel.getByText("RAG", { exact: true })).toBeVisible();
});

test("Lineage SVG keeps paradigm nodes inside the canvas without overlap", async ({
  page,
}) => {
  await page.goto("/lineage/");

  const layout = await page.evaluate(() => {
    const svg = document.querySelector(".lineage-panel svg");

    if (!(svg instanceof SVGSVGElement)) {
      return { clipped: ["missing-svg"], overlaps: ["missing-svg"] };
    }

    const viewBox = svg.viewBox.baseVal;
    const nodes = Array.from(svg.querySelectorAll(".lineage-node")).map(
      (node) => {
        const rect = node.querySelector("rect");
        const box = rect instanceof SVGGraphicsElement ? rect.getBBox() : null;

        return {
          id: node.id,
          x: box?.x ?? 0,
          y: box?.y ?? 0,
          width: box?.width ?? 0,
          height: box?.height ?? 0,
        };
      },
    );

    const clipped = nodes
      .filter(
        (node) =>
          node.x < viewBox.x ||
          node.y < viewBox.y ||
          node.x + node.width > viewBox.x + viewBox.width ||
          node.y + node.height > viewBox.y + viewBox.height,
      )
      .map((node) => node.id);

    const overlaps: string[] = [];
    const gap = 8;

    for (let index = 0; index < nodes.length; index += 1) {
      for (
        let nextIndex = index + 1;
        nextIndex < nodes.length;
        nextIndex += 1
      ) {
        const a = nodes[index];
        const b = nodes[nextIndex];
        const separated =
          a.x + a.width + gap <= b.x ||
          b.x + b.width + gap <= a.x ||
          a.y + a.height + gap <= b.y ||
          b.y + b.height + gap <= a.y;

        if (!separated) {
          overlaps.push(`${a.id}:${b.id}`);
        }
      }
    }

    return { clipped, overlaps };
  });

  expect(layout.clipped).toEqual([]);
  expect(layout.overlaps).toEqual([]);
});

test("Lineage routes Agent to Safety around the foundation-model branch", async ({
  page,
}) => {
  await page.goto("/lineage/");

  const agentSafetyPath = await page
    .locator("#arrow-agent-safety")
    .getAttribute("d");

  expect(agentSafetyPath).toBe("M 1336 352 L 1336 466 L 1062 466");
});

test("Lineage focus restores a deep link and exposes causal evidence", async ({
  page,
}) => {
  await page.goto("/lineage/?lineage=foundation-model#node-foundation-model");

  const focus = page.getByLabel("聚焦一个谱系节点");
  const summary = page.locator("[data-lineage-focus-summary]");

  await expect(focus).toHaveValue("foundation-model");
  await expect(page.locator("#node-foundation-model")).toHaveClass(
    /is-causal-focus/,
  );
  await expect(page.locator("#node-symbolic")).toHaveClass(/is-causal-muted/);
  await expect(page.locator("#arrow-transformer-foundation-model")).toHaveClass(
    /is-causal-focus/,
  );
  await expect(
    page.locator(
      '[data-lineage-edge-label][data-from="transformer"][data-to="foundation-model"]',
    ),
  ).toHaveClass(/is-causal-focus/);
  await expect(
    page.locator(
      '[data-lineage-edge-label][data-from="symbolic"][data-to="statistical"]',
    ),
  ).toHaveClass(/is-causal-muted/);
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("5 个直接关联事件");
  await expect(
    summary.getByRole("link", { name: /FLAN 展示跨任务/ }),
  ).toHaveAttribute(
    "href",
    "/timeline/?lineage=foundation-model#milestone-flan-instruction-tuning",
  );
  await expect(
    summary.getByRole("link", { name: "进入对应章节" }),
  ).toHaveAttribute("href", "/chapters/foundation-model/");
  await expect(page.locator("[data-language-switch]")).toHaveAttribute(
    "href",
    "/en/lineage/?lineage=foundation-model#node-foundation-model",
  );

  await focus.selectOption("rag");
  await expect(page.locator("#node-rag")).toHaveClass(/is-causal-focus/);
  await expect(page).toHaveURL(/lineage=rag#node-rag$/);
});

test("Lineage links the Safety / Eval node to its chapter", async ({
  page,
}) => {
  await page.goto("/lineage/");

  await expect(page.locator('.lineage-panel a[href="#"]')).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Safety \/ Eval：/ }),
  ).toHaveAttribute("href", "/chapters/safety/");
});

test("Lineage view controls are visible and focusable on desktop", async ({
  page,
}) => {
  await page.goto("/lineage/");

  const controls = page.locator("[data-lineage-view]");
  await expect(controls).toHaveCount(2);

  const boxes = await controls.evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();

      return {
        height: rect.height,
        width: rect.width,
      };
    }),
  );

  for (const box of boxes) {
    expect(box.height).toBeGreaterThan(0);
    expect(box.width).toBeGreaterThan(0);
  }

  const fitButton = page.getByRole("button", { name: "适配屏幕" });
  await expect(fitButton).toBeVisible();
  await fitButton.focus();
  await expect(fitButton).toBeFocused();
});

test("Lineage node captions explain groups bilingually", async ({ page }) => {
  await page.goto("/lineage/");

  await expect(
    page
      .locator(".node-caption")
      .filter({ hasText: "符号 / symbolic" })
      .first(),
  ).toBeVisible();
  await expect(
    page
      .locator(".node-caption")
      .filter({ hasText: "基础模型 / foundation" })
      .first(),
  ).toBeVisible();
});

test("Current section is announced in the main navigation", async ({
  page,
}) => {
  await page.goto("/lineage/");
  await expect(page.getByRole("link", { name: "谱系图" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.goto("/chapters/search/");
  await expect(page.getByRole("link", { name: "章节主线" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("Diagrams page explains export and SVG naming conventions", async ({
  page,
  request,
}) => {
  await page.goto("/diagrams/");

  await expect(
    page.getByRole("heading", { level: 1, name: "图源与导出说明" }),
  ).toBeVisible();
  await expect(page.getByText("node-*", { exact: true })).toBeVisible();
  await expect(page.getByText("截图友好", { exact: true })).toBeVisible();
  const assets = getDiagramAssets("zh-CN");
  await expect(page.locator("[data-diagram-asset]")).toHaveCount(assets.length);

  for (const asset of assets) {
    const card = page
      .locator("[data-diagram-asset]")
      .filter({ hasText: asset.title });
    await expect(card).toBeVisible();
    await expect(
      card.getByRole("link", { name: `下载 SVG: ${asset.title}` }),
    ).toHaveAttribute("href", asset.svgPath);
    await expect(
      card.getByRole("link", { name: `下载 PNG: ${asset.title}` }),
    ).toHaveAttribute("href", asset.pngPath);

    const svgResponse = await request.get(asset.svgPath);
    const pngResponse = await request.get(asset.pngPath);
    expect(svgResponse.ok(), asset.id).toBeTruthy();
    expect(pngResponse.ok(), asset.id).toBeTruthy();
    expect(await svgResponse.text(), asset.id).toContain(
      `id="diagram-${asset.id}"`,
    );
  }
});

test("Diagrams page catalogs the complete core diagram set", async ({
  page,
}) => {
  await page.goto("/diagrams/");

  await expect(page.locator("[data-core-diagram]")).toHaveCount(
    chapterRoutes.length + 2,
  );
  await expect(
    page.getByText("AI 技术演化主线图", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Agent Loop 行动循环图", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Safety / Eval 发布反馈图", { exact: true }),
  ).toBeVisible();
});

test("Chapter pages expose references and simplification notes", async ({
  page,
}) => {
  for (const route of chapterRoutes) {
    await page.goto(route);
    await expect(page.getByText("参考资料", { exact: true })).toBeVisible();
    await expect(
      page.getByText("简化说明", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("参考资料建议后续补充")).toHaveCount(0);
    await expect(
      page.locator("main a[href^='https://']").first(),
    ).toBeVisible();
  }
});
