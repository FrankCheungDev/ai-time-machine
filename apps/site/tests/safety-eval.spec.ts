import { expect, test, type Page } from "@playwright/test";

async function openSafetyDemo(page: Page, route = "/chapters/safety/") {
  await page.goto(route);
  const demo = page.locator(".demo-shell[data-demo-ready='true']");
  await expect(demo).toHaveCount(1);
  return demo;
}

test("Safety / Eval turns a risk failure into a repaired release regression", async ({
  page,
}) => {
  const demo = await openSafetyDemo(page);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Safety / Eval：系统如何发现、阻断并修复风险？",
    }),
  ).toBeVisible();

  const requestGroup = demo.getByRole("group", { name: "请求类型" });
  const normalButton = requestGroup.getByRole("button", {
    name: "正常请求",
  });
  const riskButton = requestGroup.getByRole("button", { name: "风险请求" });
  const status = demo.locator("[data-safety-status]");
  const stepContent = demo.locator(".step-content");
  const nextButton = demo.locator(".stepper .controls button").last();

  await expect(normalButton).toHaveAttribute("aria-pressed", "true");
  await expect(stepContent).toContainText("先运行一个正常控制样本");
  await expect(status).toHaveAttribute("data-safety-status", "pass");

  await riskButton.click();
  await expect(riskButton).toHaveAttribute("aria-pressed", "true");
  await expect(stepContent).toContainText("红队复现一次间接提示注入");
  await expect(status).toHaveAttribute("data-safety-status", "risk");
  await expect(demo.locator("#safety-node-red-team")).toHaveClass(
    /node-active/,
  );

  const trace = [
    ["护栏把检索文档标记为不可信数据", "blocked", "guardrail"],
    ["权限边界独立阻断 mail.send", "blocked", "permission"],
    ["人工复核确认风险与影响", "review", "review"],
    ["把失败固化为 RT-017 回归用例", "fixed", "regression"],
    ["发布门拒绝旧版本，只放行修复版", "pass", "release"],
  ] as const;

  for (const [title, tone, nodeId] of trace) {
    await nextButton.click();
    await expect(stepContent).toContainText(title);
    await expect(status).toHaveAttribute("data-safety-status", tone);
    await expect(demo.locator(`#safety-node-${nodeId}`)).toHaveClass(
      /node-active/,
    );
  }

  await expect(stepContent).toContainText("旧版本在 RT-017 上失败");
  await expect(status).toContainText(
    "Safety / Eval 是持续反馈回路，而不是上线前的一次勾选",
  );
  await expect(nextButton).toBeDisabled();

  await normalButton.click();
  await expect(stepContent).toContainText("先运行一个正常控制样本");
  await expect(demo.locator(".step-content > span")).toHaveText("1 / 6");
});

test("Safety / Eval controls remain keyboard-operable and mobile-safe", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const demo = await openSafetyDemo(page);
  const requestGroup = demo.getByRole("group", { name: "请求类型" });
  const normalButton = requestGroup.getByRole("button", {
    name: "正常请求",
  });
  const riskButton = requestGroup.getByRole("button", { name: "风险请求" });

  await normalButton.focus();
  await page.keyboard.press("Tab");
  await expect(riskButton).toBeFocused();
  await page.keyboard.press("Space");
  await expect(riskButton).toHaveAttribute("aria-pressed", "true");

  const targetHeights = await requestGroup
    .getByRole("button")
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getBoundingClientRect().height),
    );
  expect(targetHeights.every((height) => height >= 44)).toBe(true);

  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(layout.document).toBeLessThanOrEqual(layout.viewport);
  expect(layout.body).toBeLessThanOrEqual(layout.viewport);

  const scene = demo.locator("[data-mobile-scroll-scene]");
  const explanation = demo.locator(".step-content");
  const sceneBox = await scene.boundingBox();
  const explanationBox = await explanation.boundingBox();
  expect(sceneBox).not.toBeNull();
  expect(explanationBox).not.toBeNull();
  expect(sceneBox!.y).toBeLessThan(explanationBox!.y);
});

test("English Safety / Eval keeps evidence and teaching boundaries visible", async ({
  page,
}) => {
  const demo = await openSafetyDemo(page, "/en/chapters/safety/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Safety / Eval: How do systems find, block, and fix risk?",
    }),
  ).toBeVisible();
  await demo.getByRole("button", { name: "Risk request" }).click();

  const nextButton = demo.locator(".stepper .controls button").last();
  for (let index = 0; index < 4; index += 1) {
    await nextButton.click();
  }
  await expect(demo.locator(".step-content")).toContainText(
    "The failure becomes regression case RT-017",
  );
  await expect(demo.locator("[data-safety-status]")).toHaveAttribute(
    "data-safety-status",
    "fixed",
  );

  await expect(
    page.getByText(/passing one suite never proves that all risk is gone/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "NIST AI 600-1: Generative Artificial Intelligence Profile",
    }),
  ).toHaveAttribute("href", "https://doi.org/10.6028/NIST.AI.600-1");
  await expect(
    page.getByRole("link", { name: "OWASP LLM01:2025 Prompt Injection" }),
  ).toHaveAttribute(
    "href",
    "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
  );
});
