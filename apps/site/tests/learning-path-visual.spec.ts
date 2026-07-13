import { expect, test } from "@playwright/test";

const learningProgressStorageKey = "ai-history-learning-progress";

test.use({
  viewport: { width: 390, height: 844 },
});

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("shows partial learning progress in the mobile home hero", async ({
  page,
}) => {
  await page.addInitScript((storageKey) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        completedChapterIds: ["overview", "expert-system"],
      }),
    );
  }, learningProgressStorageKey);

  await page.goto("/");
  await expect(page.getByTestId("home-learning-progress")).toContainText(
    "已完成 2 / 10",
  );

  await expect(page).toHaveScreenshot("home-partial-progress.png", {
    animations: "disabled",
  });
});

test("shows the initial RAG step in the mobile viewport", async ({ page }) => {
  await page.goto("/chapters/rag/");

  const demo = page.locator('.demo-shell[data-demo-ready="true"]');
  await expect(demo).toBeVisible();

  const stepper = demo.locator(".stepper");
  const explanation = stepper.locator(".step-content");
  const nextControl = stepper.locator(".controls button:last-child");

  await expect(explanation).toBeVisible();
  await expect(nextControl).toBeEnabled();
  await stepper.evaluate((element) =>
    element.scrollIntoView({ block: "start" }),
  );
  await expect(stepper.locator(".step-scene")).toBeInViewport();
  await expect(explanation).toBeInViewport();
  await expect(nextControl).toBeInViewport();

  await expect(page).toHaveScreenshot("rag-mobile-step.png", {
    animations: "disabled",
  });
});
