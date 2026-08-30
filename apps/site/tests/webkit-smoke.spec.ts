import { expect, test, type Page } from "@playwright/test";
import { firstDurationMs, waitForDemoReady } from "./fixtures/demo";

const conceptProgressKey = "ai-history-concept-check-progress";

async function seedReviewSuggestion(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        results: [
          {
            chapterId: "search",
            firstCorrect: false,
            attempts: 1,
            explanationViewed: false,
          },
        ],
      }),
    );
  }, conceptProgressKey);
}

test("390px home exposes the device-local review entry without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedReviewSuggestion(page);
  await page.goto("/");

  const reviewQueue = page.getByTestId("home-review-queue");
  const reviewLink = reviewQueue.locator(".home-review-primary");

  await expect(reviewQueue).toContainText("待复习 1 章");
  await expect(reviewLink).toContainText("搜索树 / A*");
  await expect(reviewLink).toHaveAttribute(
    "href",
    "/chapters/search/#concept-check-search",
  );

  const layout = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
});

test("RAG supports keyboard step control and collapses motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/chapters/rag/");
  await waitForDemoReady(page);

  const nextButton = page.getByRole("button", { name: "下一步" });
  await nextButton.focus();
  await expect(nextButton).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { level: 3, name: "把问题转换为向量" }),
  ).toBeVisible();
  const activeArrow = page.locator("#arrow-query-embedding");
  await expect(activeArrow).toHaveAttribute("data-motion", "draw-in");

  const motion = await activeArrow.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      strokeDashoffset: Number.parseFloat(style.strokeDashoffset),
      transitionDuration: style.transitionDuration,
    };
  });
  expect(motion.strokeDashoffset).toBe(0);
  expect(firstDurationMs(motion.transitionDuration)).toBeLessThanOrEqual(1);
});

for (const storySurface of ["timeline", "lineage"] as const) {
  test(`${storySurface} preserves a story deep link across the language switch`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      `/${storySurface}/?story=feedback-learning#story-feedback-learning`,
    );

    const region = page.locator(`[data-${storySurface}-story-region]`);
    const detail = region.locator(
      '[data-causal-story-detail="feedback-learning"]',
    );
    await expect(page.getByLabel("引导式故事")).toHaveValue(
      "feedback-learning",
    );
    await expect(detail).toBeVisible();

    const languageSwitch = page.locator("[data-language-switch]");
    await expect(languageSwitch).toHaveAttribute(
      "href",
      `/en/${storySurface}/?story=feedback-learning#story-feedback-learning`,
    );
    await languageSwitch.click();

    await expect(page).toHaveURL(
      new RegExp(
        `/en/${storySurface}/\\?story=feedback-learning#story-feedback-learning$`,
      ),
    );
    await expect(page.getByLabel("Guided story")).toHaveValue(
      "feedback-learning",
    );
    await expect(detail).toBeVisible();
  });
}

test("concept-check deep link focuses its heading below the sticky header", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/chapters/search/#concept-check-search");

  const check = page.getByTestId("concept-check");
  const heading = check.getByRole("heading", {
    level: 2,
    name: "用一个问题检验核心直觉",
  });
  await expect(heading).toBeFocused();

  const geometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const target = document.querySelector<HTMLElement>("#concept-check-search");

    if (!header || !target) return null;

    return {
      headerBottom: header.getBoundingClientRect().bottom,
      targetTop: target.getBoundingClientRect().top,
      viewportHeight: window.innerHeight,
    };
  });
  expect(geometry).not.toBeNull();
  expect(geometry!.targetTop).toBeGreaterThanOrEqual(
    geometry!.headerBottom - 1,
  );
  expect(geometry!.targetTop).toBeLessThan(geometry!.viewportHeight);
});
