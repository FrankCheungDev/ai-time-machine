import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("keeps a source-backed milestone card visually stable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/timeline/");

  const event = page.locator('[data-timeline-event="lighthill-report"]');
  await expect(event).toBeVisible();
  await expect(event).toHaveScreenshot("timeline-event-card.png", {
    animations: "disabled",
    // The story controls shift the card's page position without changing its
    // geometry. Allow sub-pixel CJK rasterization noise below 0.11% of the card.
    maxDiffPixels: 300,
  });
});

test("keeps mobile concept-check feedback visually stable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/chapters/search/");
  await page.addStyleTag({
    content: ".site-header { display: none !important; }",
  });

  const check = page.getByTestId("concept-check");
  await check.getByRole("radio", { name: "只看离目标的估计距离 h" }).check();
  await check.getByRole("button", { name: "提交答案" }).click();
  await check.getByRole("button", { name: "查看为什么" }).click();

  await expect(check).toHaveScreenshot("concept-check-feedback.png", {
    animations: "disabled",
  });
});
