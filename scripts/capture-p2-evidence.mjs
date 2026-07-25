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

const timelinePage = await openPage("/timeline/", {
  width: 1440,
  height: 1100,
});
const timelineEvent = timelinePage.locator(
  '[data-timeline-event="lighthill-report"]',
);
await timelineEvent.waitFor({ state: "visible" });
await timelineEvent.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-timeline-event-desktop.png"),
});
await timelinePage.close();

const mobileCheckPage = await openPage("/chapters/search/", {
  width: 390,
  height: 844,
});
const mobileCheck = mobileCheckPage.getByTestId("concept-check");
await mobileCheck.waitFor({ state: "visible" });
await mobileCheck
  .getByRole("radio", { name: "只看离目标的估计距离 h" })
  .check();
await mobileCheck.getByRole("button", { name: "提交答案" }).click();
await mobileCheck.getByRole("button", { name: "查看为什么" }).click();
await mobileCheck.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-concept-check-mobile.png"),
});
await mobileCheckPage.close();

const englishCheckPage = await openPage(
  "/en/chapters/safety/",
  { width: 1440, height: 1100 },
  "en-US",
);
const englishCheck = englishCheckPage.getByTestId("concept-check");
await englishCheck.waitFor({ state: "visible" });
await englishCheck
  .getByRole("radio", {
    name: "This known failure now has repeatable evidence, while other risks still need ongoing discovery and evaluation",
  })
  .check();
await englishCheck.getByRole("button", { name: "Submit answer" }).click();
await englishCheck.getByRole("button", { name: "See why" }).click();
await englishCheck.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-concept-check-english.png"),
});
await englishCheckPage.close();

await browser.close();
console.log(`Captured P2 evidence in ${outputDir}.`);
