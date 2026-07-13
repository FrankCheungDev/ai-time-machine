import { expect, test } from "@playwright/test";

const chapterRoutes = [
  "/chapters/overview/",
  "/chapters/search/",
  "/chapters/expert-system/",
  "/chapters/bayes/",
  "/chapters/decision-boundary/",
  "/chapters/cnn/",
  "/chapters/attention/",
  "/chapters/llm-system/",
  "/chapters/rag/",
  "/chapters/agent/",
];

const primaryRoutes = [
  "/",
  ...chapterRoutes,
  "/timeline/",
  "/lineage/",
  "/diagrams/",
];

const scrollSceneRoutes = [
  "/chapters/search/",
  "/chapters/decision-boundary/",
  "/chapters/attention/",
  "/chapters/rag/",
  "/chapters/agent/",
  "/lineage/",
];

const svgSceneRoutes = [
  "/chapters/search/",
  "/chapters/decision-boundary/",
  "/chapters/attention/",
  "/chapters/rag/",
  "/chapters/agent/",
];

const stepperDemoRoutes = ["/chapters/rag/", "/chapters/agent/"];

const canonicalChapterLabels = [
  {
    route: "/chapters/overview/",
    homeCard: /00 总览章节/,
    eyebrow: "Chapter 00",
  },
  { route: "/chapters/search/", homeCard: /搜索树 \/ A\*/, eyebrow: "Demo 01" },
  {
    route: "/chapters/expert-system/",
    homeCard: /专家系统规则推理/,
    eyebrow: "Demo 02",
  },
  { route: "/chapters/bayes/", homeCard: /Bayes 更新/, eyebrow: "Demo 03" },
  {
    route: "/chapters/decision-boundary/",
    homeCard: /决策边界/,
    eyebrow: "Demo 04",
  },
  { route: "/chapters/cnn/", homeCard: /CNN 卷积核/, eyebrow: "Demo 05" },
  {
    route: "/chapters/attention/",
    homeCard: /Attention Map/,
    eyebrow: "Demo 06",
  },
  {
    route: "/chapters/llm-system/",
    homeCard: /LLM 系统地图/,
    eyebrow: "Chapter 07",
  },
  { route: "/chapters/rag/", homeCard: /RAG Pipeline/, eyebrow: "Demo 08" },
  { route: "/chapters/agent/", homeCard: /Agent Loop/, eyebrow: "Demo 09" },
];

async function waitForDemoReady(page: import("@playwright/test").Page) {
  await expect(
    page.locator(".demo-shell[data-demo-ready='true']").first(),
  ).toBeVisible();
}

function firstDurationMs(durationList: string) {
  const firstDuration = durationList.split(",")[0]?.trim() ?? "0s";

  if (firstDuration.endsWith("ms")) {
    return Number.parseFloat(firstDuration);
  }

  if (firstDuration.endsWith("s")) {
    return Number.parseFloat(firstDuration) * 1000;
  }

  return Number.parseFloat(firstDuration);
}

test("RAG chapter presents an interactive pipeline demo", async ({ page }) => {
  await page.goto("/chapters/rag/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "RAG：大模型如何连接外部知识？",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "RAG 流程演示" }),
  ).toBeVisible();
  await expect(
    page.getByText("为什么只靠模型参数回答问题不够？", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Query", { exact: true })).toBeVisible();
  await expect(page.getByText("Vector DB", { exact: true })).toBeVisible();
  await expect(page.locator("#node-query")).toHaveAttribute(
    "data-role",
    "node",
  );
  await waitForDemoReady(page);

  const nextButton = page.getByRole("button", { name: "下一步" });
  await nextButton.click();
  await expect(
    page.getByRole("heading", { level: 3, name: "把问题转换为向量" }),
  ).toBeVisible();
  await expect(page.locator("#arrow-query-embedding")).toHaveAttribute(
    "data-motion",
    "draw-in",
  );

  await page.getByRole("button", { name: "上一步" }).click();
  await expect(
    page.getByRole("heading", { level: 3, name: "用户提出一个问题" }),
  ).toBeVisible();

  await page.getByLabel("检索场景").selectOption("wrong");
  await expect(
    page.getByRole("heading", { level: 3, name: "错误检索：证据把答案带偏" }),
  ).toBeVisible();
  await expect(page.getByText("错误片段会把模型带向错误答案。")).toBeVisible();
});

test("Attention chapter lets users inspect token relationships", async ({
  page,
}) => {
  await page.goto("/chapters/attention/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Attention 与 Transformer：token 为什么可以直接互相关注？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("为什么 Attention 比 RNN 更适合建模长距离依赖？", {
      exact: true,
    }),
  ).toBeVisible();
  await waitForDemoReady(page);

  await page.getByRole("button", { name: "模型" }).click();
  await expect(
    page.getByRole("heading", { level: 3, name: "“模型”直接关注“外部知识”" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "RNN 模式" }).click();
  await expect(
    page.getByText("链式传递会让远距离关系逐步变弱。"),
  ).toBeVisible();
});

test("LLM system chapter bridges foundation models to RAG and Agent", async ({
  page,
}) => {
  await page.goto("/chapters/llm-system/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "LLM 与现代 AI 系统：为什么大模型还需要外部系统？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("为什么大模型还需要外部知识和工具？", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Context Window", { exact: true })).toBeVisible();
});

test("Agent chapter shows the action loop and repair branch", async ({
  page,
}) => {
  await page.goto("/chapters/agent/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Agent：大模型如何执行多步任务？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("为什么 Agent 不是一次回答，而是一个循环控制系统？", {
      exact: true,
    }),
  ).toBeVisible();
  await waitForDemoReady(page);

  await page.getByRole("button", { name: "下一步" }).click();
  await expect(
    page.getByRole("heading", { level: 3, name: "调用工具获取真实信息" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "模拟工具失败" }).click();
  await expect(
    page.getByRole("heading", { level: 3, name: "观察失败并修正计划" }),
  ).toBeVisible();
});

test("Search chapter shows strategy expansion differences", async ({
  page,
}) => {
  await page.goto("/chapters/search/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "符号主义与搜索：机器能否通过搜索表现出智能？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("早期 AI 为什么依赖搜索？为什么会遭遇组合爆炸？", {
      exact: true,
    }),
  ).toBeVisible();
  await waitForDemoReady(page);

  await page.getByRole("button", { name: "A* 启发式" }).click();
  await expect(
    page.getByRole("heading", { level: 3, name: "A* 用启发式优先靠近目标" }),
  ).toBeVisible();
});

test("Expert-system chapter demonstrates rule conflicts", async ({ page }) => {
  await page.goto("/chapters/expert-system/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "专家系统：专家知识能否写成 if-then 规则？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("专家知识能否写成规则？为什么规则系统会脆弱？", {
      exact: true,
    }),
  ).toBeVisible();
  await waitForDemoReady(page);

  await page.getByRole("checkbox", { name: "加入企鹅例外" }).check();
  await expect(
    page.getByRole("heading", { level: 3, name: "规则冲突：会飞还是不会飞？" }),
  ).toBeVisible();
});

test("Bayes chapter updates belief from evidence", async ({ page }) => {
  await page.goto("/chapters/bayes/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "概率推理：机器如何处理不确定性？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("证据如何改变信念？", { exact: true }),
  ).toBeVisible();
  await waitForDemoReady(page);

  await page.getByLabel("证据强度").fill("80");
  await expect(page.getByText(/后验信念 \d+%/)).toBeVisible();
});

test("Decision-boundary chapter compares learned boundaries", async ({
  page,
}) => {
  await page.goto("/chapters/decision-boundary/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "经典机器学习：机器如何从数据中学习决策边界？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("机器如何从数据中学习分类边界？", { exact: true }),
  ).toBeVisible();
  await waitForDemoReady(page);

  await page.getByRole("button", { name: "过拟合边界" }).click();
  await expect(
    page.getByRole("heading", { level: 3, name: "过拟合会追逐每个样本" }),
  ).toBeVisible();
});

test("CNN chapter shows kernel-driven feature maps", async ({ page }) => {
  await page.goto("/chapters/cnn/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "深度学习与 CNN：机器如何从图像中学习局部特征？",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("机器如何从图像中识别局部特征？", { exact: true }),
  ).toBeVisible();
  await waitForDemoReady(page);

  await page.getByRole("button", { name: "边缘检测" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.getByText("当前窗口响应")).toBeVisible();
});

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

  const recommendedCard = page.getByRole("link", { name: /总览章节/ });
  await expect(recommendedCard.getByText("推荐从这里开始")).toBeVisible();
  await expect(recommendedCard.getByText(/约 5 分钟/)).toBeVisible();
  await expect(recommendedCard.getByText(/阅读主线/)).toBeVisible();
});

test("Overview MDX chapter renders the chapter-zero narrative", async ({
  page,
}) => {
  await page.goto("/chapters/overview/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "总览：AI 为什么不是突然变成大模型的？",
    }),
  ).toBeVisible();
  await expect(page.getByText("MDX 章节可渲染", { exact: true })).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: /00 总览章节/ })).toBeVisible();
});

test("Timeline page shows the AI evolution overview", async ({ page }) => {
  await page.goto("/timeline/");

  await expect(
    page.getByRole("heading", { level: 1, name: "AI 技术演化总览时间线" }),
  ).toBeVisible();
  await expect(page.getByText("Transformer", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "查看 Demo 06：Attention" }),
  ).toBeVisible();
});

test("Lineage page shows the technical paradigm map", async ({ page }) => {
  await page.goto("/lineage/");

  await expect(
    page.getByRole("heading", { level: 1, name: "AI 技术谱系图" }),
  ).toBeVisible();
  await expect(page.getByText("符号主义", { exact: true })).toBeVisible();
  await expect(page.getByText("RAG", { exact: true })).toBeVisible();
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

test("Lineage routes Agent to Safety around LLM System", async ({ page }) => {
  await page.goto("/lineage/");

  const agentSafetyPath = await page
    .locator("#arrow-agent-safety")
    .getAttribute("d");

  expect(agentSafetyPath).toBe("M 1036 337 L 1036 416 L 747 416");
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
  await expect(
    page.getByRole("link", { name: "下载 RAG Pipeline SVG" }),
  ).toHaveAttribute("href", "/diagrams/rag-pipeline.svg");

  const response = await request.get("/diagrams/rag-pipeline.svg");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain('id="node-query"');
});

test("Diagrams page catalogs the 12 MVP core diagrams", async ({ page }) => {
  await page.goto("/diagrams/");

  await expect(page.locator("[data-core-diagram]")).toHaveCount(12);
  await expect(
    page.getByText("AI 技术演化主线图", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Agent Loop 行动循环图", { exact: true }),
  ).toBeVisible();
});

test("Chapter pages expose references and simplification notes", async ({
  page,
}) => {
  for (const route of chapterRoutes) {
    await page.goto(route);
    await expect(page.getByText("参考资料", { exact: true })).toBeVisible();
    await expect(page.getByText("简化说明", { exact: true })).toBeVisible();
    await expect(page.getByText("参考资料建议后续补充")).toHaveCount(0);
    await expect(
      page.locator("main a[href^='https://']").first(),
    ).toBeVisible();
  }
});

test("RAG step changes keep the explanation and diagram visible together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/chapters/rag/");
  await waitForDemoReady(page);

  await page
    .locator(".demo-shell")
    .first()
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.getByRole("button", { name: "下一步" }).click();

  await expect(
    page.getByRole("heading", { level: 3, name: "把问题转换为向量" }),
  ).toBeVisible();
  await expect(page.locator("#arrow-query-embedding")).toHaveAttribute(
    "data-motion",
    "draw-in",
  );

  const layout = await page.evaluate(() => {
    const scene = document.querySelector(".demo-shell .svg-scene");
    const content = document.querySelector(".demo-shell .step-content");

    const rect = (element: Element | null) => {
      const box = element?.getBoundingClientRect();

      return box
        ? { bottom: box.bottom, top: box.top }
        : { bottom: 0, top: Number.POSITIVE_INFINITY };
    };

    return {
      content: rect(content),
      scene: rect(scene),
      viewportHeight: window.innerHeight,
    };
  });

  expect(layout.content.top).toBeLessThan(layout.viewportHeight);
  expect(layout.content.bottom).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.scene.top).toBeLessThan(layout.viewportHeight);
  expect(layout.scene.bottom).toBeGreaterThan(0);
});

test("Reduced motion preference collapses decorative transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const transitionDuration = await page
    .locator(".demo-card")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);

  expect(firstDurationMs(transitionDuration)).toBeLessThanOrEqual(1);
});

test("Demo controls keep mobile-safe touch target height", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });

  const demoRoutes = chapterRoutes.filter(
    (route) =>
      route !== "/chapters/overview/" && route !== "/chapters/llm-system/",
  );

  for (const route of demoRoutes) {
    await page.goto(route);

    const controlHeights = await page
      .locator("main button, main .svg-scene-controls label")
      .evaluateAll((controls) =>
        controls.map((control) => control.getBoundingClientRect().height),
      );

    for (const height of controlHeights) {
      expect(height, `${route} control height`).toBeGreaterThanOrEqual(44);
    }
  }
});

test.describe("Mobile responsive foundation", () => {
  for (const width of [375, 390, 768]) {
    test(`keeps primary routes within the ${width}px viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const route of primaryRoutes) {
        await page.goto(route);

        const layout = await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
        }));

        expect(
          layout.scrollWidth,
          `${route} document width`,
        ).toBeLessThanOrEqual(layout.viewportWidth);
        expect(
          layout.bodyScrollWidth,
          `${route} body width`,
        ).toBeLessThanOrEqual(layout.viewportWidth);
      }
    });
  }

  test("keeps header navigation targets comfortable on phones", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/");

    const navTargetHeights = await page
      .locator(".site-header a")
      .evaluateAll((links) =>
        links.map((link) => link.getBoundingClientRect().height),
      );

    for (const height of navTargetHeights) {
      expect(height, "header link height").toBeGreaterThanOrEqual(44);
    }
  });

  test("keeps long chapter titles compact on phones", async ({ page }) => {
    for (const width of [375, 390]) {
      await page.setViewportSize({ width, height: 667 });
      await page.goto("/chapters/search/");

      const titleMetrics = await page
        .locator(".page-title")
        .evaluate((title) => {
          const rect = title.getBoundingClientRect();
          const style = getComputedStyle(title);

          return {
            fontSize: Number.parseFloat(style.fontSize),
            height: rect.height,
          };
        });

      expect(titleMetrics.fontSize, `${width}px font size`).toBeLessThanOrEqual(
        42,
      );
      expect(titleMetrics.height, `${width}px title height`).toBeLessThan(150);
    }
  });

  test("marks scrollable diagrams as mobile scroll scenes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });

    for (const route of scrollSceneRoutes) {
      await page.goto(route);

      const scene = page.locator("[data-mobile-scroll-scene]").first();
      await expect(scene, `${route} scroll scene`).toBeVisible();
      await expect(scene, `${route} scroll scene`).toHaveAttribute(
        "tabindex",
        "0",
      );
      await expect(scene, `${route} scroll scene`).toHaveAttribute(
        "aria-label",
        /横向滚动/,
      );
    }
  });

  test("fits the lineage map first and keeps detail zoom available", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/lineage/");

    const fitButton = page.getByRole("button", { name: "适配屏幕" });
    const detailButton = page.getByRole("button", { name: "放大查看" });

    await expect(fitButton).toBeVisible();
    await expect(detailButton).toBeVisible();

    const fitLayout = await page.evaluate(() => {
      const panel = document.querySelector("[data-lineage-panel]");
      const svg = panel?.querySelector("svg");

      return {
        panelClientWidth: panel?.clientWidth ?? 0,
        panelScrollWidth: panel?.scrollWidth ?? 0,
        svgWidth: svg?.getBoundingClientRect().width ?? 0,
        view: panel instanceof HTMLElement ? panel.dataset.view : "",
      };
    });

    expect(fitLayout.view).toBe("fit");
    expect(fitLayout.panelScrollWidth).toBeLessThanOrEqual(
      fitLayout.panelClientWidth + 1,
    );
    expect(fitLayout.svgWidth).toBeLessThanOrEqual(fitLayout.panelClientWidth);

    await detailButton.click();

    const detailLayout = await page.evaluate(() => {
      const panel = document.querySelector("[data-lineage-panel]");

      return {
        panelClientWidth: panel?.clientWidth ?? 0,
        panelScrollWidth: panel?.scrollWidth ?? 0,
        view: panel instanceof HTMLElement ? panel.dataset.view : "",
      };
    });

    await expect(detailButton).toHaveAttribute("aria-pressed", "true");
    expect(detailLayout.view).toBe("detail");
    expect(detailLayout.panelScrollWidth).toBeGreaterThan(
      detailLayout.panelClientWidth,
    );
  });

  test("fits SVG demo scenes first and keeps detail zoom available", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    for (const route of svgSceneRoutes) {
      await page.goto(route);

      const fitOption = page.getByRole("radio", { name: "适配屏幕" });
      const detailOption = page.getByRole("radio", { name: "放大查看" });

      await expect(fitOption, `${route} fit option`).toBeChecked();
      await expect(detailOption, `${route} detail option`).not.toBeChecked();

      const fitLayout = await page.evaluate(() => {
        const scene = document.querySelector(
          ".demo-shell [data-mobile-scroll-scene]",
        );
        const svg = scene?.querySelector("svg");

        return {
          sceneClientWidth: scene?.clientWidth ?? 0,
          sceneScrollWidth: scene?.scrollWidth ?? 0,
          svgWidth: svg?.getBoundingClientRect().width ?? 0,
        };
      });

      expect(
        fitLayout.sceneScrollWidth,
        `${route} fit scene width`,
      ).toBeLessThanOrEqual(fitLayout.sceneClientWidth + 1);
      expect(fitLayout.svgWidth, `${route} fit svg width`).toBeLessThanOrEqual(
        fitLayout.sceneClientWidth,
      );

      await page.getByText("放大查看", { exact: true }).click();

      const detailLayout = await page.evaluate(() => {
        const scene = document.querySelector(
          ".demo-shell [data-mobile-scroll-scene]",
        );

        return {
          sceneClientWidth: scene?.clientWidth ?? 0,
          sceneScrollWidth: scene?.scrollWidth ?? 0,
        };
      });

      await expect(detailOption, `${route} detail checked`).toBeChecked();
      expect(
        detailLayout.sceneScrollWidth,
        `${route} detail scene width`,
      ).toBeGreaterThan(detailLayout.sceneClientWidth);
    }
  });

  test("keeps stacked mobile demo controls separated", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chapters/search/");

    const spacing = await page.evaluate(() => {
      const strategyControls = document.querySelector(".strategy-buttons");
      const sceneControls = document.querySelector(".svg-scene-controls");
      const strategyRect = strategyControls?.getBoundingClientRect();
      const sceneRect = sceneControls?.getBoundingClientRect();

      return strategyRect && sceneRect
        ? sceneRect.top - strategyRect.bottom
        : 0;
    });

    expect(spacing).toBeGreaterThanOrEqual(12);
  });

  test("shows the mobile diagram before its explanation and controls", async ({
    page,
  }) => {
    for (const viewport of [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);

      for (const route of stepperDemoRoutes) {
        await page.goto(route);

        const stepper = page.locator(".stepper").first();
        await stepper.evaluate((element) =>
          element.scrollIntoView({ block: "start" }),
        );

        const layout = await stepper.evaluate((element) => {
          const rect = (selector: string) => {
            const target = element.querySelector(selector);
            if (!target) {
              return null;
            }

            const { bottom, top } = target.getBoundingClientRect();
            return { bottom, top };
          };

          return {
            scene: rect(".step-scene"),
            heading: rect(".step-content h3"),
            control: rect(".controls button:last-child:not(:disabled)"),
            viewportHeight: window.innerHeight,
          };
        });

        expect(
          layout.scene,
          `${route} scene at ${viewport.width}px`,
        ).not.toBeNull();
        expect(
          layout.heading,
          `${route} heading at ${viewport.width}px`,
        ).not.toBeNull();
        expect(
          layout.control,
          `${route} next control at ${viewport.width}px`,
        ).not.toBeNull();
        expect(
          layout.scene!.top,
          `${route} scene before heading at ${viewport.width}px`,
        ).toBeLessThan(layout.heading!.top);
        expect(
          layout.heading!.top,
          `${route} heading before controls at ${viewport.width}px`,
        ).toBeLessThan(layout.control!.top);

        if (viewport.width === 390) {
          for (const [label, box] of [
            ["scene", layout.scene],
            ["heading", layout.heading],
            ["next control", layout.control],
          ] as const) {
            expect(
              box!.bottom,
              `${route} ${label} below viewport top`,
            ).toBeGreaterThan(0);
            expect(
              box!.top,
              `${route} ${label} above viewport bottom`,
            ).toBeLessThan(layout.viewportHeight);
          }
        }
      }
    }
  });
});
