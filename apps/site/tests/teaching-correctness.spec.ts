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

test("CNN feature map preserves each scanned window response", async ({
  page,
}) => {
  await page.goto("/chapters/cnn/");
  await waitForDemoReady(page);

  await page.getByRole("button", { name: "平滑卷积" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "下一步" }).click();

  await expect(page.locator('[aria-label="特征图"] > span')).toHaveText([
    "3",
    "6",
    "9",
  ]);
  await expect(
    page.getByText("当前窗口响应: 9", { exact: true }),
  ).toBeVisible();
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
