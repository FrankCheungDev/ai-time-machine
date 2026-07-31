import { expect, test } from "@playwright/test";
import { firstDurationMs, waitForDemoReady } from "./fixtures/demo";

test("Feedback Learning walks two fixed episodes across the training boundary", async ({
  page,
}) => {
  await page.goto("/chapters/reinforcement-learning/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "强化学习与反馈闭环：结果如何改变未来策略？",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "反馈学习闭环实验" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "reward、偏好比较和运行时 observation 分别在什么时候改变什么？",
      { exact: true },
    ),
  ).toBeVisible();
  await waitForDemoReady(page);

  const modeSwitch = page.getByRole("switch", {
    name: "比较训练时与运行时",
  });
  const policy = page.getByTestId("feedback-policy");
  const baseline = page.locator("[data-feedback-episode='baseline']");
  const exploration = page.locator("[data-feedback-episode='exploration']");
  const nextButton = page.getByRole("button", { name: "下一步", exact: true });

  await expect(modeSwitch).not.toBeChecked();
  await expect(page.getByText("步骤 1 / 6", { exact: true })).toBeVisible();
  await expect(policy).toHaveAttribute("data-policy-snapshot", "initial");
  await expect(policy).toContainText("70%");
  await expect(policy).toContainText("30%");
  await expect(baseline).toHaveAttribute("data-episode-status", "pending");
  await expect(exploration).toHaveAttribute("data-episode-status", "pending");

  await nextButton.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 3, name: "运行 baseline episode" }),
  ).toBeVisible();
  await expect(baseline).toHaveAttribute("data-episode-status", "active");
  await expect(baseline).toContainText("+1");
  await expect(baseline).toContainText("return 1");

  await nextButton.click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "运行 exploration episode",
    }),
  ).toBeVisible();
  await expect(baseline).toHaveAttribute("data-episode-status", "complete");
  await expect(exploration).toHaveAttribute("data-episode-status", "active");
  await expect(exploration).toContainText("0 → +3");
  await expect(exploration).toContainText("return 3");

  await nextButton.click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "比较两个 episode 的 return",
    }),
  ).toBeVisible();
  await expect(
    page.locator("[data-feedback-finding='comparison']"),
  ).toContainText("不保证在每一步直接给出标准动作");

  await nextButton.click();
  await expect(policy).toHaveAttribute("data-policy-snapshot", "updated");
  await expect(policy).toContainText("40%");
  await expect(policy).toContainText("60%");

  await nextButton.click();
  await expect(modeSwitch).toBeChecked();
  await expect(
    page.locator("[data-feedback-boundary='runtime']"),
  ).toContainText("模型权重保持不变");
  await expect(page.locator("#feedback-node-return-update")).toHaveClass(
    /node-muted/,
  );
  await expect(page.locator("#feedback-node-observation-reward")).toHaveClass(
    /node-boundary/,
  );

  await page.getByRole("button", { name: "重置", exact: true }).click();
  await expect(page.getByText("步骤 1 / 6", { exact: true })).toBeVisible();
  await expect(modeSwitch).not.toBeChecked();
  await expect(policy).toHaveAttribute("data-policy-snapshot", "initial");

  await expect(
    page.getByRole("table", { name: "这是什么类型的反馈？" }),
  ).toBeVisible();
  await expect(page.locator("[data-feedback-signal]")).toHaveCount(4);
});

test("English Feedback Learning stays usable on a narrow runtime view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/en/chapters/reinforcement-learning/");
  await waitForDemoReady(page);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Reinforcement Learning And Feedback Loops: How do outcomes change a future policy?",
    }),
  ).toBeVisible();

  const modeSwitch = page.getByRole("switch", {
    name: "Compare training time with runtime",
  });
  await modeSwitch.focus();
  await page.keyboard.press("Space");

  await expect(modeSwitch).toBeChecked();
  await expect(page.getByText("Step 6 / 6", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Compare a runtime agent observation",
    }),
  ).toBeVisible();
  await expect(
    page.locator("[data-feedback-boundary='runtime']"),
  ).toContainText("model weights stay fixed");
  await expect(
    page.getByRole("table", { name: "What kind of feedback is this?" }),
  ).toBeVisible();

  const layout = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
});

test("Feedback Learning removes decorative transition time for reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/chapters/reinforcement-learning/");
  await waitForDemoReady(page);

  const durations = await page
    .locator(".feedback-edge, .policy-track i, .mode-switch i")
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).transitionDuration),
    );

  for (const duration of durations) {
    expect(firstDurationMs(duration)).toBeLessThanOrEqual(1);
  }
});
