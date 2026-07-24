import { expect, test } from "@playwright/test";

test("Safety / Eval chapter walks a red-team feedback loop", async ({
  page,
}) => {
  await page.goto("/chapters/safety/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "安全评估：系统如何发现并修复风险？",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "红队闯关" }),
  ).toBeVisible();
  await expect(
    page.getByText("为什么可靠的 AI 系统需要红队、护栏和持续评估？", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("#safety-node-policy")).toHaveClass(/node-active/);
  await expect(
    page.getByText("没有边界，就无法判断一次失败是否真的危险。", {
      exact: true,
    }),
  ).toBeVisible();

  const nextButton = page.getByRole("button", { name: "下一步" });
  await nextButton.click();
  await expect(page.locator("#safety-node-red-team")).toHaveClass(
    /node-active/,
  );
  await expect(
    page.getByText("攻击样本把“可能不安全”变成可重复运行的案例。", {
      exact: true,
    }),
  ).toBeVisible();

  await page.getByLabel("风险场景").selectOption("tool-misuse");
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "模型请求了超出任务范围的工具动作",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/采用最小权限、参数校验、人工确认和可撤销操作/),
  ).toBeVisible();
});

test("English Safety / Eval exposes localized diagram copy", async ({
  page,
}) => {
  await page.goto("/en/chapters/safety/");
  await expect(
    page.getByRole("heading", { level: 2, name: "Red-Team Risk Walkthrough" }),
  ).toBeVisible();
  await expect(page.locator("#safety-node-red-team text").first()).toHaveText(
    "Red Team",
  );
  await expect(
    page.getByText(
      "Why do reliable AI systems need red teams, guardrails, and continuous evaluation?",
      { exact: true },
    ),
  ).toBeVisible();
});
