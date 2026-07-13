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
  const scene = stepper.locator(".step-scene");
  const viewControls = stepper.locator(".svg-scene-controls");
  const previousControl = stepper.locator(".controls button:first-child");
  const nextControl = stepper.locator(".controls button:last-child");

  await expect(scene).toBeVisible();
  await expect(viewControls).toBeVisible();
  await expect(explanation).toBeVisible();
  await expect(previousControl).toBeVisible();
  await expect(nextControl).toBeEnabled();
  await stepper.evaluate((element) => {
    const headerBottom =
      document.querySelector(".site-header")?.getBoundingClientRect().bottom ??
      0;
    const targetTop =
      window.scrollY + element.getBoundingClientRect().top - headerBottom;

    window.scrollTo({ top: targetTop });
  });

  const layout = await stepper.evaluate((element) => {
    const rect = (target: Element | null) => {
      if (!target) return null;

      const { bottom, height, top } = target.getBoundingClientRect();
      return { bottom, height, top };
    };

    return {
      controls: Array.from(element.querySelectorAll(".controls button")).map(
        rect,
      ),
      explanation: rect(element.querySelector(".step-content")),
      header: rect(document.querySelector(".site-header")),
      scene: rect(element.querySelector(".step-scene")),
      viewControls: rect(element.querySelector(".svg-scene-controls")),
      viewportHeight: window.innerHeight,
    };
  });

  expect(layout.header).not.toBeNull();
  expect(layout.scene).not.toBeNull();
  expect(layout.viewControls).not.toBeNull();
  expect(layout.explanation).not.toBeNull();
  expect(layout.controls).toHaveLength(2);
  expect(
    layout.scene!.top,
    "scene clears the sticky header",
  ).toBeGreaterThanOrEqual(layout.header!.bottom);
  expect(
    layout.scene!.bottom,
    "scene is fully inside the viewport",
  ).toBeLessThanOrEqual(layout.viewportHeight);
  expect(
    layout.viewControls!.top,
    "view controls clear the sticky header",
  ).toBeGreaterThanOrEqual(layout.header!.bottom);
  expect(
    layout.viewControls!.bottom,
    "view controls are fully inside the viewport",
  ).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.scene!.bottom, "scene precedes the explanation").toBeLessThan(
    layout.explanation!.top,
  );
  expect(
    layout.explanation!.bottom,
    "explanation is fully inside the viewport",
  ).toBeLessThanOrEqual(layout.viewportHeight);

  for (const [index, control] of layout.controls.entries()) {
    expect(control).not.toBeNull();
    expect(
      control!.top,
      `step control ${index + 1} follows the explanation`,
    ).toBeGreaterThan(layout.explanation!.bottom);
    expect(
      control!.bottom,
      `step control ${index + 1} is fully inside the viewport`,
    ).toBeLessThanOrEqual(layout.viewportHeight);
    expect(
      control!.height,
      `step control ${index + 1} keeps 44px height`,
    ).toBeGreaterThanOrEqual(44);
  }

  await expect(page).toHaveScreenshot("rag-mobile-step.png", {
    animations: "disabled",
  });
});
