import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs/visual-evidence");
const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:4330";

const learningProgress = {
  version: 1,
  completedChapterIds: ["overview", "search", "expert-system"],
};
const conceptProgress = {
  version: 1,
  reviewVersion: 2,
  results: [
    {
      chapterId: "search",
      firstCorrect: false,
      attempts: 2,
      explanationViewed: true,
      reviewSuggested: true,
    },
    {
      chapterId: "reinforcement-learning",
      firstCorrect: true,
      attempts: 2,
      explanationViewed: false,
      reviewSuggested: true,
    },
    {
      chapterId: "rag",
      firstCorrect: false,
      attempts: 1,
      explanationViewed: false,
      reviewSuggested: true,
    },
  ],
};

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

async function openSeededPage(route, viewport, locale) {
  const page = await browser.newPage({ locale, viewport });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    ({ concept, learning }) => {
      localStorage.setItem(
        "ai-history-learning-progress",
        JSON.stringify(learning),
      );
      localStorage.setItem(
        "ai-history-concept-check-progress",
        JSON.stringify(concept),
      );
    },
    { concept: conceptProgress, learning: learningProgress },
  );
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

try {
  const desktopHome = await openSeededPage(
    "/",
    { width: 1280, height: 1000 },
    "zh-CN",
  );
  const desktopPanel = desktopHome.getByTestId("home-review-queue");
  await desktopPanel.waitFor({ state: "visible" });
  assert.match((await desktopPanel.textContent()) ?? "", /待复习 3 章/);
  assert.equal(
    await desktopPanel.locator(".home-review-primary").getAttribute("href"),
    "/chapters/search/#concept-check-search",
  );
  await desktopPanel.screenshot({
    animations: "disabled",
    path: path.join(outputDir, "v1-7-local-review-home-desktop.png"),
  });
  await desktopHome.close();

  const mobileHome = await openSeededPage(
    "/en/",
    { width: 390, height: 844 },
    "en-US",
  );
  const mobilePanel = mobileHome.getByTestId("home-review-queue");
  await mobilePanel.waitFor({ state: "visible" });
  await mobilePanel.locator(".home-review-more summary").click();
  assert.equal(
    await mobilePanel.locator(".home-review-list a").count(),
    conceptProgress.results.length - 1,
  );
  assert.ok(
    await mobileHome.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  // The panel is taller than the mobile viewport. Keep the sticky header from
  // covering its heading while Playwright stitches the element screenshot.
  await mobileHome.addStyleTag({
    content: ".site-header { position: static !important; }",
  });
  await mobilePanel.screenshot({
    animations: "disabled",
    path: path.join(outputDir, "v1-7-local-review-english-mobile.png"),
  });
  await mobileHome.close();

  const deepLink = await openSeededPage(
    "/en/chapters/search/#concept-check-search",
    { width: 390, height: 844 },
    "en-US",
  );
  const conceptCheck = deepLink.getByTestId("concept-check");
  const reviewNote = conceptCheck.getByTestId("concept-check-review-note");
  await reviewNote.waitFor({ state: "visible" });
  const [headerBox, conceptBox] = await Promise.all([
    deepLink.locator(".site-header").boundingBox(),
    conceptCheck.boundingBox(),
  ]);
  assert.ok(headerBox && conceptBox);
  assert.ok(conceptBox.y >= headerBox.y + headerBox.height);
  assert.ok(
    await deepLink.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await deepLink.screenshot({
    animations: "disabled",
    fullPage: false,
    path: path.join(outputDir, "v1-7-review-deep-link-english-mobile.png"),
  });
  await deepLink.close();
} finally {
  await browser.close();
}

console.log(`Captured v1.7 evidence in ${outputDir}.`);
