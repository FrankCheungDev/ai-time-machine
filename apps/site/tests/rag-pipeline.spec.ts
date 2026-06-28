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
