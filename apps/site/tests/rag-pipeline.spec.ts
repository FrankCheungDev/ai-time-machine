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
  "/chapters/agent/"
];

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

  await expect(page.getByRole("heading", { level: 1, name: "RAG：大模型如何连接外部知识？" })).toBeVisible();
  await expect(page.getByText("为什么只靠模型参数回答问题不够？", { exact: true })).toBeVisible();
  await expect(page.getByText("Query", { exact: true })).toBeVisible();
  await expect(page.getByText("Vector DB", { exact: true })).toBeVisible();
  await expect(page.locator("#node-query")).toHaveAttribute("data-role", "node");

  const nextButton = page.getByRole("button", { name: "下一步" });
  await nextButton.click();
  await expect(page.getByRole("heading", { level: 3, name: "把问题转换为向量" })).toBeVisible();
  await expect(page.locator("#arrow-query-embedding")).toHaveAttribute("data-motion", "draw-in");

  await page.getByRole("button", { name: "上一步" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "用户提出一个问题" })).toBeVisible();

  await page.getByLabel("检索场景").selectOption("wrong");
  await expect(page.getByRole("heading", { level: 3, name: "错误检索：证据把答案带偏" })).toBeVisible();
  await expect(page.getByText("错误片段会把模型带向错误答案。")).toBeVisible();
});

test("Attention chapter lets users inspect token relationships", async ({ page }) => {
  await page.goto("/chapters/attention/");

  await expect(page.getByRole("heading", { level: 1, name: "Attention 与 Transformer：token 为什么可以直接互相关注？" })).toBeVisible();
  await expect(page.getByText("为什么 Attention 比 RNN 更适合建模长距离依赖？", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "模型" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "“模型”直接关注“外部知识”" })).toBeVisible();

  await page.getByRole("button", { name: "RNN 模式" }).click();
  await expect(page.getByText("链式传递会让远距离关系逐步变弱。")).toBeVisible();
});

test("LLM system chapter bridges foundation models to RAG and Agent", async ({ page }) => {
  await page.goto("/chapters/llm-system/");

  await expect(page.getByRole("heading", { level: 1, name: "LLM 与现代 AI 系统：为什么大模型还需要外部系统？" })).toBeVisible();
  await expect(page.getByText("为什么大模型还需要外部知识和工具？", { exact: true })).toBeVisible();
  await expect(page.getByText("Context Window", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "继续看 RAG Pipeline" })).toBeVisible();
});

test("Agent chapter shows the action loop and repair branch", async ({ page }) => {
  await page.goto("/chapters/agent/");

  await expect(page.getByRole("heading", { level: 1, name: "Agent：大模型如何执行多步任务？" })).toBeVisible();
  await expect(page.getByText("为什么 Agent 不是一次回答，而是一个循环控制系统？", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "调用工具获取真实信息" })).toBeVisible();

  await page.getByRole("button", { name: "模拟工具失败" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "观察失败并修正计划" })).toBeVisible();
});

test("Search chapter shows strategy expansion differences", async ({ page }) => {
  await page.goto("/chapters/search/");

  await expect(page.getByRole("heading", { level: 1, name: "符号主义与搜索：机器能否通过搜索表现出智能？" })).toBeVisible();
  await expect(page.getByText("早期 AI 为什么依赖搜索？为什么会遭遇组合爆炸？", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "A* 启发式" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "A* 用启发式优先靠近目标" })).toBeVisible();
});

test("Expert-system chapter demonstrates rule conflicts", async ({ page }) => {
  await page.goto("/chapters/expert-system/");

  await expect(page.getByRole("heading", { level: 1, name: "专家系统：专家知识能否写成 if-then 规则？" })).toBeVisible();
  await expect(page.getByText("专家知识能否写成规则？为什么规则系统会脆弱？", { exact: true })).toBeVisible();

  await page.getByRole("checkbox", { name: "加入企鹅例外" }).check();
  await expect(page.getByRole("heading", { level: 3, name: "规则冲突：会飞还是不会飞？" })).toBeVisible();
});

test("Bayes chapter updates belief from evidence", async ({ page }) => {
  await page.goto("/chapters/bayes/");

  await expect(page.getByRole("heading", { level: 1, name: "概率推理：机器如何处理不确定性？" })).toBeVisible();
  await expect(page.getByText("证据如何改变信念？", { exact: true })).toBeVisible();

  await page.getByLabel("证据强度").fill("80");
  await expect(page.getByText(/后验信念 \d+%/)).toBeVisible();
});

test("Decision-boundary chapter compares learned boundaries", async ({ page }) => {
  await page.goto("/chapters/decision-boundary/");

  await expect(page.getByRole("heading", { level: 1, name: "经典机器学习：机器如何从数据中学习决策边界？" })).toBeVisible();
  await expect(page.getByText("机器如何从数据中学习分类边界？", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "过拟合边界" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "过拟合会追逐每个样本" })).toBeVisible();
});

test("CNN chapter shows kernel-driven feature maps", async ({ page }) => {
  await page.goto("/chapters/cnn/");

  await expect(page.getByRole("heading", { level: 1, name: "深度学习与 CNN：机器如何从图像中学习局部特征？" })).toBeVisible();
  await expect(page.getByText("机器如何从图像中识别局部特征？", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "边缘检测" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.getByText("当前窗口响应")).toBeVisible();
});

test("Home page links to the LLM system chapter in the MVP spine", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /LLM 系统地图/ })).toBeVisible();
});

test("Overview MDX chapter renders the chapter-zero narrative", async ({ page }) => {
  await page.goto("/chapters/overview/");

  await expect(page.getByRole("heading", { level: 1, name: "总览：AI 为什么不是突然变成大模型的？" })).toBeVisible();
  await expect(page.getByText("MDX 章节可渲染", { exact: true })).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: /00 总览章节/ })).toBeVisible();
});

test("Timeline page shows the AI evolution overview", async ({ page }) => {
  await page.goto("/timeline/");

  await expect(page.getByRole("heading", { level: 1, name: "AI 技术演化总览时间线" })).toBeVisible();
  await expect(page.getByText("Transformer", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "查看 Attention demo" })).toBeVisible();
});

test("Lineage page shows the technical paradigm map", async ({ page }) => {
  await page.goto("/lineage/");

  await expect(page.getByRole("heading", { level: 1, name: "AI 技术谱系图" })).toBeVisible();
  await expect(page.getByText("符号主义", { exact: true })).toBeVisible();
  await expect(page.getByText("RAG", { exact: true })).toBeVisible();
});

test("Diagrams page explains export and SVG naming conventions", async ({ page, request }) => {
  await page.goto("/diagrams/");

  await expect(page.getByRole("heading", { level: 1, name: "图源与导出说明" })).toBeVisible();
  await expect(page.getByText("node-*", { exact: true })).toBeVisible();
  await expect(page.getByText("截图友好", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "下载 RAG Pipeline SVG" })).toHaveAttribute("href", "/diagrams/rag-pipeline.svg");

  const response = await request.get("/diagrams/rag-pipeline.svg");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain('id="node-query"');
});

test("Chapter pages expose references and simplification notes", async ({ page }) => {
  for (const route of chapterRoutes) {
    await page.goto(route);
    await expect(page.getByText("参考资料", { exact: true })).toBeVisible();
    await expect(page.getByText("简化说明", { exact: true })).toBeVisible();
  }
});

test("Reduced motion preference collapses decorative transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const transitionDuration = await page
    .locator(".demo-card")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);

  expect(firstDurationMs(transitionDuration)).toBeLessThanOrEqual(1);
});
