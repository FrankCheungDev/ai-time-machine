import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs/visual-evidence");
const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:4330";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

async function openPage(route, viewport, locale = "zh-CN") {
  const page = await browser.newPage({ locale, viewport });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseUrl}${route}`);
  await page.addStyleTag({
    content: ".site-header { display: none !important; }",
  });
  return page;
}

async function advanceDemo(demo, label, clicks) {
  const next = demo.getByRole("button", { name: label });
  for (let index = 0; index < clicks; index += 1) {
    await next.click();
  }
}

const policyPage = await openPage(
  "/chapters/reinforcement-learning/",
  { width: 1440, height: 1100 },
  "zh-CN",
);
const policyDemo = policyPage.locator(".demo-shell[data-demo-ready='true']");
await policyDemo.waitFor({ state: "visible" });
await advanceDemo(policyDemo, "下一步", 4);
await policyDemo.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "v1-5-feedback-policy-update-desktop.png"),
});
await policyPage.close();

const runtimePage = await openPage(
  "/en/chapters/reinforcement-learning/",
  { width: 390, height: 844 },
  "en-US",
);
const runtimeDemo = runtimePage.locator(".demo-shell[data-demo-ready='true']");
await runtimeDemo.waitFor({ state: "visible" });
await advanceDemo(runtimeDemo, "Next", 5);
await runtimeDemo.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "v1-5-feedback-runtime-english-mobile.png"),
});
await runtimePage.close();

const storyPage = await openPage(
  "/timeline/?story=feedback-learning#story-feedback-learning",
  { width: 1440, height: 1100 },
  "zh-CN",
);
const storyExplorer = storyPage.locator("[data-causal-timeline]");
await storyExplorer.waitFor({ state: "visible" });
await storyPage
  .locator('[data-causal-story-detail="feedback-learning"]')
  .waitFor({ state: "visible" });
await storyPage.locator(".milestone-event.is-story-muted").first().waitFor({
  state: "visible",
});
await storyPage
  .locator('[data-timeline-event="samuel-checkers"]')
  .scrollIntoViewIfNeeded();
await storyPage.screenshot({
  animations: "disabled",
  fullPage: false,
  path: path.join(outputDir, "v1-5-feedback-story-focus-desktop.png"),
});
await storyPage.close();

await browser.close();
console.log(`Captured v1.5 evidence in ${outputDir}.`);
