import { expect, test } from "@playwright/test";

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
