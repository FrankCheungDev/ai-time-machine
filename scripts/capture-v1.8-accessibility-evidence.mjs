import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs/visual-evidence");
const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:4330";

const evidenceCases = [
  {
    fileName: "v1-8-skip-link-chinese-desktop.png",
    label: "跳到主要内容",
    locale: "zh-CN",
    route: "/",
    viewport: { width: 1280, height: 720 },
  },
  {
    fileName: "v1-8-skip-link-english-mobile.png",
    label: "Skip to main content",
    locale: "en-US",
    route: "/en/",
    viewport: { width: 390, height: 844 },
  },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

try {
  for (const evidenceCase of evidenceCases) {
    const page = await browser.newPage({
      locale: evidenceCase.locale,
      viewport: evidenceCase.viewport,
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${baseUrl}${evidenceCase.route}`, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", {
      exact: true,
      name: evidenceCase.label,
    });
    await skipLink.waitFor({ state: "visible" });
    assert.equal(
      await skipLink.evaluate((element) => element === document.activeElement),
      true,
    );
    await page.waitForFunction(() => {
      const element = document.querySelector(".skip-link");
      return element && element.getBoundingClientRect().top >= 0;
    });

    await page.screenshot({
      animations: "disabled",
      path: path.join(outputDir, evidenceCase.fileName),
    });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Captured v1.8 accessibility evidence in ${outputDir}.`);
