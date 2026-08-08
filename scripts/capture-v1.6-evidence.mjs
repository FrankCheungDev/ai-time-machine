import assert from "node:assert/strict";
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
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

try {
  const homePage = await openPage("/", { width: 1280, height: 900 }, "zh-CN");
  const guidedStories = homePage.locator("[data-guided-stories]");
  await guidedStories.waitFor({ state: "visible" });
  assert.deepEqual(
    await guidedStories
      .locator("[data-guided-story-card]")
      .evaluateAll((cards) =>
        cards.map((card) => ({
          id: card.getAttribute("data-story-id"),
          steps: Number(
            card
              .querySelector(".guided-story-step-count")
              ?.textContent?.match(/\d+/)?.[0],
          ),
        })),
      ),
    [
      { id: "feedback-learning", steps: 6 },
      { id: "rules-to-representations", steps: 7 },
      { id: "scaled-models-to-reliable-systems", steps: 7 },
    ],
  );
  await guidedStories.screenshot({
    animations: "disabled",
    path: path.join(outputDir, "v1-6-guided-stories-desktop.png"),
  });
  await homePage.close();

  const storyPage = await openPage(
    "/en/timeline/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems",
    { width: 390, height: 844 },
    "en-US",
  );
  const activeStory = storyPage.locator(
    '[data-causal-story-detail="scaled-models-to-reliable-systems"]',
  );
  await activeStory.waitFor({ state: "visible" });
  const inactiveStories = storyPage.locator(
    "[data-causal-story-detail][hidden]",
  );
  assert.equal(await inactiveStories.count(), 2);
  assert.deepEqual(
    await inactiveStories.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).display),
    ),
    ["none", "none"],
  );
  const storyHeading = activeStory.getByRole("heading", {
    name: "From Scaled Models To Reliable Systems",
  });
  const [headerBox, headingBox] = await Promise.all([
    storyPage.locator(".site-header").boundingBox(),
    storyHeading.boundingBox(),
  ]);
  assert.ok(headerBox && headingBox);
  assert.ok(headingBox.y >= headerBox.y + headerBox.height + 16);
  assert.ok(
    await storyPage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await storyPage.screenshot({
    animations: "disabled",
    fullPage: false,
    path: path.join(outputDir, "v1-6-guided-story-english-mobile.png"),
  });
  await storyPage.close();

  const chapterPage = await openPage(
    "/en/chapters/llm-system/",
    { width: 390, height: 844 },
    "en-US",
  );
  const chapterJourney = chapterPage.getByTestId("chapter-journey");
  await chapterJourney.waitFor({ state: "visible" });
  const contextNavigation = chapterJourney.getByRole("navigation", {
    name: "Chapter history and technology lineage",
  });
  assert.deepEqual(
    await contextNavigation
      .locator("a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    [
      "/en/timeline/?chapter=llm-system#timeline-milestones",
      "/en/lineage/?lineage=llm-system#node-llm-system",
    ],
  );
  await chapterJourney.screenshot({
    animations: "disabled",
    path: path.join(outputDir, "v1-6-chapter-context-english-mobile.png"),
  });
  await chapterPage.close();
} finally {
  await browser.close();
}

console.log(`Captured v1.6 evidence in ${outputDir}.`);
