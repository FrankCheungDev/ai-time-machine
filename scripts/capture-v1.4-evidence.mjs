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

const foundationPage = await openPage(
  "/chapters/foundation-model/",
  { width: 1440, height: 1100 },
  "zh-CN",
);
const foundationDemo = foundationPage.locator(
  ".demo-shell[data-demo-ready='true']",
);
await foundationDemo.waitFor({ state: "visible" });
const next = foundationDemo.getByRole("button", { name: "下一步" });
for (let index = 0; index < 5; index += 1) {
  await next.click();
}
await foundationDemo.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "v1-4-foundation-runtime-desktop.png"),
});
await foundationPage.close();

const foundationMobilePage = await openPage(
  "/en/chapters/foundation-model/",
  { width: 390, height: 844 },
  "en-US",
);
const foundationMobileDemo = foundationMobilePage.locator(
  ".demo-shell[data-demo-ready='true']",
);
await foundationMobileDemo.waitFor({ state: "visible" });
const mobileNext = foundationMobileDemo.getByRole("button", { name: "Next" });
for (let index = 0; index < 3; index += 1) {
  await mobileNext.click();
}
await foundationMobileDemo.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "v1-4-foundation-preference-english-mobile.png"),
});
await foundationMobilePage.close();

const lineagePage = await openPage(
  "/lineage/?lineage=foundation-model#node-foundation-model",
  { width: 1440, height: 1100 },
  "zh-CN",
);
const lineagePanel = lineagePage.locator(".lineage-panel");
await lineagePanel.waitFor({ state: "visible" });
await lineagePanel.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "v1-4-lineage-foundation-focus-desktop.png"),
});
await lineagePage.close();

await browser.close();
console.log(`Captured v1.4 evidence in ${outputDir}.`);
