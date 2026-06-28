import { expect, test } from "@playwright/test";

test("RAG chapter presents an interactive pipeline demo", async ({ page }) => {
  await page.goto("/chapters/rag/");

  await expect(page.getByRole("heading", { level: 1, name: "RAG：大模型如何连接外部知识？" })).toBeVisible();
  await expect(page.getByText("为什么只靠模型参数回答问题不够？", { exact: true })).toBeVisible();
  await expect(page.getByText("Query", { exact: true })).toBeVisible();
  await expect(page.getByText("Vector DB", { exact: true })).toBeVisible();

  const nextButton = page.getByRole("button", { name: "下一步" });
  await nextButton.click();
  await expect(page.getByRole("heading", { level: 3, name: "把问题转换为向量" })).toBeVisible();

  await page.getByRole("button", { name: "上一步" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "用户提出一个问题" })).toBeVisible();
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

test("Agent chapter shows the action loop and repair branch", async ({ page }) => {
  await page.goto("/chapters/agent/");

  await expect(page.getByRole("heading", { level: 1, name: "Agent：大模型如何执行多步任务？" })).toBeVisible();
  await expect(page.getByText("为什么 Agent 不是一次回答，而是一个循环控制系统？", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "调用工具获取真实信息" })).toBeVisible();

  await page.getByRole("button", { name: "模拟工具失败" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "观察失败并修正计划" })).toBeVisible();
});
