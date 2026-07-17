import { expect, test } from "@playwright/test";

async function waitForDemoReady(page: import("@playwright/test").Page) {
  await expect(
    page.locator(".demo-shell[data-demo-ready='true']").first(),
  ).toBeVisible();
}

test("expert system reports when no rule matches", async ({ page }) => {
  await page.goto("/chapters/expert-system/");
  await waitForDemoReady(page);

  await page.getByRole("checkbox", { name: "有翅膀" }).uncheck();

  await expect(
    page.getByRole("heading", { level: 3, name: "没有规则命中" }),
  ).toBeVisible();
  await expect(page.locator(".rule-grid article.matched")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 3, name: "规则链正常触发" }),
  ).toHaveCount(0);
});

test("expert system explains an exception-only match", async ({ page }) => {
  await page.goto("/chapters/expert-system/");
  await waitForDemoReady(page);

  await page.getByRole("checkbox", { name: "加入企鹅例外" }).check();
  await page.getByRole("checkbox", { name: "有翅膀" }).uncheck();

  await expect(
    page.getByRole("heading", { level: 3, name: "规则链正常触发" }),
  ).toBeVisible();
  await expect(page.locator(".rule-grid article.matched")).toHaveCount(1);
  await expect(page.locator(".result p")).toContainText(
    "例外：企鹅是鸟，但不会飞",
  );
  await expect(page.locator(".result p")).not.toContainText(
    "鸟类、有翅膀、状态正常",
  );
});

test("Search exposes deterministic expansion and A* scores", async ({
  page,
}) => {
  await page.goto("/chapters/search/");
  await waitForDemoReady(page);

  const expansionLine = page
    .locator(".state-line")
    .filter({ hasText: "展开序列" });
  const frontierPeak = page
    .locator(".status-metrics > div")
    .filter({ hasText: "frontier 峰值" });

  await expect(expansionLine).toContainText("Start");
  await expect(page.getByText("步骤 1 / 8", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.locator("#search-node-a").locator("..")).toHaveAttribute(
    "data-search-state",
    "current",
  );
  await expect(
    page.locator("#search-node-start").locator(".."),
  ).toHaveAttribute("data-search-state", "expanded");
  await expect(page.locator("g[data-search-state='frontier']")).toHaveCount(4);

  for (let index = 0; index < 6; index += 1) {
    await page.getByRole("button", { name: "下一步" }).click();
  }

  await expect(expansionLine).toContainText(
    "Start → A → B → C → A1 → A2 → B1 → Goal",
  );
  await expect(frontierPeak).toContainText("4");
  const resultNote = page.locator(".result-note.found");
  await expect(resultNote).toContainText("最终路径: Start → C → Goal");
  await expect(resultNote).toContainText("路径成本: 2");

  await page.getByRole("button", { name: "DFS 深度优先" }).click();
  await expect(page.getByText("步骤 1 / 8", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "上一步" })).toBeDisabled();

  await page.getByRole("button", { name: "A* 启发式" }).click();
  await expect(
    page.getByText("g=0 h=2 f=2", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.locator(".state-line").filter({ hasText: "frontier 顺序" }),
  ).toContainText("C (g=1 h=1 f=2) → B (g=1 h=3 f=4) → A (g=1 h=4 f=5)");

  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(expansionLine).toContainText("Start → C → Goal");
  await expect(page.getByText("步骤 3 / 3", { exact: true })).toBeVisible();
  await expect(page.locator("g[data-search-path='true']")).toHaveCount(3);
  await expect(page.locator("g[data-search-state='frontier']")).toHaveCount(2);
  await expect(page.locator("#search-node-goal").locator("..")).toHaveAttribute(
    "data-search-state",
    "current",
  );
});

test("CNN scans and normalizes the complete feature map", async ({ page }) => {
  await page.goto("/chapters/cnn/");
  await waitForDemoReady(page);

  await page.getByRole("button", { name: "平滑卷积" }).click();
  const featureMap = page.getByRole("table", { name: /特征图/ });
  const featureCells = featureMap.getByRole("cell");

  await expect(page.getByText("1/9 ×", { exact: true })).toBeVisible();
  await expect(featureCells).toHaveText([
    "0.33",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  await expect(
    page.getByText("加权和 3 ÷ 9 = 0.33", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "下一步" }).click();
  await expect(
    page.getByText("加权和 6 ÷ 9 = 0.67", { exact: true }),
  ).toBeVisible();

  for (let index = 0; index < 7; index += 1) {
    await page.getByRole("button", { name: "下一步" }).click();
  }

  await expect(featureCells).toHaveText([
    "0.33",
    "0.67",
    "1",
    "0.33",
    "0.67",
    "1",
    "0.33",
    "0.67",
    "1",
  ]);
  await expect(
    page.getByText("当前窗口响应: 1", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "上一步" }).click();
  await expect(featureCells.nth(8)).toHaveText("");
  await expect(page.getByRole("button", { name: "下一步" })).toBeEnabled();

  await page.getByRole("button", { name: "边缘检测" }).click();
  await expect(featureCells).toHaveText(["3", "", "", "", "", "", "", "", ""]);
  await expect(page.getByRole("button", { name: "上一步" })).toBeDisabled();
});

test("decision boundary reacts when the outlier moves", async ({ page }) => {
  await page.goto("/chapters/decision-boundary/");
  await waitForDemoReady(page);

  const boundary = page.locator("#boundary-linear");
  const initialPath = await boundary.getAttribute("d");

  await page
    .getByRole("slider", { name: "可拖动的负类异常点", exact: true })
    .fill("260");

  await expect.poll(() => boundary.getAttribute("d")).not.toBe(initialPath);
  await expect(page.getByText(/移动异常点会改变当前边界/)).toBeVisible();
});

test("Bayes treats 50 percent evidence support as neutral", async ({
  page,
}) => {
  await page.goto("/chapters/bayes/");
  await waitForDemoReady(page);

  await page
    .getByRole("slider", { name: "证据支持度", exact: true })
    .fill("50");

  await expect(page.getByText("后验信念 30%", { exact: true })).toBeVisible();
  await expect(page.getByText(/50% · 中性证据/)).toBeVisible();
});
